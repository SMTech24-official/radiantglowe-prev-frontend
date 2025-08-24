
import { Button } from "@/components/ui/button";
import { Camera, Loader, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface UploadedFile {
    id: string;
    file?: File;
    preview: string;
    name: string;
    size: string;
    isExisting?: boolean;
    fileType?: string;
    isLoadingFileType?: boolean;
}

interface FileUploaderProps {
    files: UploadedFile[];
    setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
    existingFiles?: string[];
    maxFileSize?: number;
    maxFiles?: number;
    accept?: string;
    isDisabled?: boolean;
    onUpload?: (files: File[]) => Promise<string[]>;
}

const FILE_TYPE_MAPPINGS: Record<string, string> = {
    "image/": "IMAGE",
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOC",
    "text/": "TEXT",
};

const getFileTypeFromUrl = (url: string): string => {
    const extension = url.split(".").pop()?.toUpperCase();
    if (extension === "PDF") return "PDF";
    if (extension === "DOC" || extension === "DOCX") return "DOC";
    if (["JPG", "JPEG", "PNG", "GIF", "BMP"].includes(extension || "")) return "IMAGE";
    return "FILE";
};

async function checkFileType(url: string): Promise<string> {
    if (!url || typeof url !== "string") {
        console.error("Invalid URL provided to checkFileType");
        return "unknown";
    }

    try {
        const response: Response = await fetch(url, { method: "HEAD" });
        const contentType: string | null = response.headers.get("content-type");

        if (!contentType) {
            return getFileTypeFromUrl(url);
        }

        for (const [mimeType, fileType] of Object.entries(FILE_TYPE_MAPPINGS)) {
            if (mimeType.endsWith("/")) {
                if (contentType.startsWith(mimeType)) {
                    return fileType;
                }
            } else {
                if (contentType === mimeType) {
                    return fileType;
                }
            }
        }

        return getFileTypeFromUrl(url);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error checking file type:", errorMessage);
        return getFileTypeFromUrl(url);
    }
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function FileUploader({
    files,
    setFiles,
    existingFiles = [],
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 10,
    accept = "image/*,.pdf,.doc,.docx",
    isDisabled = false,
    onUpload,
}: FileUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        if (existingFiles.length > 0) {
            const fetchFileTypes = async () => {
                const initialFiles: UploadedFile[] = existingFiles.map((url, index) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    preview: url,
                    name: `Document ${index + 1}`,
                    size: "Unknown",
                    isExisting: true,
                    isLoadingFileType: true,
                }));
                setFiles(initialFiles);

                const updatedFiles: UploadedFile[] = await Promise.all(
                    existingFiles.map(async (url, index) => {
                        const fileType = await checkFileType(url);
                        return {
                            id: Math.random().toString(36).substr(2, 9),
                            preview: url,
                            name: `Document ${index + 1}`,
                            size: "Unknown",
                            isExisting: true,
                            fileType,
                            isLoadingFileType: false,
                        };
                    })
                );
                setFiles(updatedFiles);
            };
            fetchFileTypes();
        }
    }, [existingFiles, setFiles]);

    const handleFileUpload = useCallback(
        (fileList: FileList | null) => {
            if (!fileList || fileList.length === 0) {
                toast.error("No files selected.");
                return;
            }

            const newFiles: UploadedFile[] = [];
            let fileCounter = files.length + 1;

            Array.from(fileList).forEach((file) => {
                if (file.size > maxFileSize) {
                    toast.error(`File ${file.name} is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
                    return;
                }

                if (files.length + newFiles.length >= maxFiles) {
                    toast.error(`Maximum number of files is ${maxFiles}.`);
                    return;
                }

                const id = Math.random().toString(36).substr(2, 9);
                const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
                const newFileName = file.type.startsWith("image/") ? `Image ${fileCounter}` : file.name;
                fileCounter++;
                const renamedFile = new File([file], newFileName, { type: file.type });
                const fileType = file.type.startsWith("image/")
                    ? "IMAGE"
                    : file.type === "application/pdf"
                        ? "PDF"
                        : file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            ? "DOC"
                            : "FILE";

                newFiles.push({
                    id,
                    file: renamedFile,
                    preview,
                    name: newFileName,
                    size: formatFileSize(file.size),
                    fileType,
                    isLoadingFileType: false,
                });
            });

            if (newFiles.length > 0) {
                setFiles((prev) => [...prev, ...newFiles]);
                toast.success(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} selected successfully.`);
                if (onUpload) {
                    onUpload(newFiles.map((f) => f.file).filter((file): file is File => file instanceof File));
                }
            }
        },
        [files.length, maxFileSize, maxFiles, setFiles, onUpload]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileUpload(e.dataTransfer.files);
        },
        [handleFileUpload]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileUpload(e.target.files);
        e.target.value = "";
    };

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const fileToRemove = prev.find((f) => f.id === id);
            if (fileToRemove && !fileToRemove.isExisting && fileToRemove.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter((f) => f.id !== id);
        });
    };

    const handleDownload = (file: UploadedFile) => {
        if (file.preview && file.isExisting) {
            const link = document.createElement("a");
            link.href = file.preview;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (file.file && file.preview) {
            const link = document.createElement("a");
            link.href = file.preview;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const getFileType = (file: UploadedFile): string => {
        if (file.fileType) {
            return file.fileType;
        }
        if (file.file?.type) {
            const type = file.file.type.split("/").pop()?.toUpperCase();
            if (type === "PDF") return "PDF";
            if (type === "MSWORD" || type === "VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT") return "DOC";
            if (file.file.type.startsWith("image/")) return "IMAGE";
        }
        if (file.name) {
            const extension = file.name.split(".").pop()?.toUpperCase();
            if (extension === "PDF") return "PDF";
            if (extension === "DOC" || extension === "DOCX") return "DOC";
            if (["JPG", "JPEG", "PNG", "GIF", "BMP"].includes(extension || "")) return "IMAGE";
        }
        return "FILE";
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div
                    className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragOver && !isDisabled ? "border-primary" : "border-primary"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onDrop={!isDisabled ? handleDrop : undefined}
                    onDragOver={!isDisabled ? handleDragOver : undefined}
                    onDragLeave={!isDisabled ? handleDragLeave : undefined}
                >
                    <input
                        type="file"
                        multiple
                        accept={accept}
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="file-upload"
                        disabled={isDisabled}
                    />
                    <div className="space-y-4 py-16">
                        <div className="w-24 h-24 mx-auto border border-primary rounded-lg flex items-center justify-center">
                            <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary"
                                onClick={() => document.getElementById("file-upload")?.click()}
                                disabled={isDisabled}
                            >
                                Add photos/files
                            </Button>
                        </div>
                        <p className="text-gray-500">or drop multiple files here (optional)</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                    Maximum size per file is {maxFileSize / (1024 * 1024)}MB & Number of Files {maxFiles}
                </p>
            </div>
            <div className="space-y-4">
                {files?.length > 0 ? (
                    files?.map((file) => (
                        <div key={file.id} className="flex items-center gap-4 p-4 rounded-lg border border-primary">
                            <div
                                className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
                                onClick={() => handleDownload(file)}
                            >
                                {file.isLoadingFileType ? (
                                    <Loader className="w-6 h-6 text-blue-500 animate-spin" />
                                ) : file.preview && file.fileType === "IMAGE" ? (
                                    <Image
                                        src={file.preview}
                                        alt={file.name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-cover rounded-lg"
                                    />
                                ) : file.isExisting && file.preview.startsWith("http") && file.fileType === "IMAGE" ? (
                                    <Image
                                        src={file.preview}
                                        alt={file.name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-cover rounded-lg"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
                                        <span className="text-white text-xs font-bold text-center">{getFileType(file)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate line-clamp-1">{file.name}</p>
                                <p className="text-sm text-gray-500">{file.size}</p>
                            </div>
                            {!isDisabled && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(file.id)}
                                    className="text-primary hover:text-primary/80 cursor-pointer flex-shrink-0"
                                    disabled={isDisabled}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No files uploaded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}