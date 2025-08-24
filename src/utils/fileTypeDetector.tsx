// Type definitions
export type FileType =
    | 'image'
    | 'pdf'
    | 'doc'
    | 'docx'
    | 'xls'
    | 'xlsx'
    | 'ppt'
    | 'pptx'
    | 'text'
    | 'zip'
    | 'rar'
    | 'unknown';

export interface FileTypeResult {
    url: string;
    type: FileType;
}

export interface FileTypeMappings {
    [mimeType: string]: FileType;
}

export interface ExtensionMappings {
    [fileType: string]: string[];
}

// Constants with strict typing
const FILE_TYPE_MAPPINGS: FileTypeMappings = {
    // Images
    'image/': 'image',

    // Documents
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',

    // Spreadsheets
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',

    // Presentations
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',

    // Text files
    'text/': 'text',

    // Archives
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/vnd.rar': 'rar'
} as const;

const EXTENSION_MAPPINGS: ExtensionMappings = {
    // Images
    image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
    // Documents
    pdf: ['.pdf'],
    doc: ['.doc'],
    docx: ['.docx'],
    // Spreadsheets
    xls: ['.xls'],
    xlsx: ['.xlsx'],
    // Presentations
    ppt: ['.ppt'],
    pptx: ['.pptx'],
    // Text
    text: ['.txt', '.rtf'],
    // Archives
    zip: ['.zip'],
    rar: ['.rar']
} as const;

/**
 * Check file type from URL using HTTP HEAD request
 * @param url - File URL
 * @returns Promise resolving to file type
 * @throws Will not throw, returns 'unknown' on error
 */
export async function checkFileType(url: string): Promise<FileType> {
    if (!url || typeof url !== 'string') {
        console.error('Invalid URL provided to checkFileType');
        return 'unknown';
    }

    try {
        const response: Response = await fetch(url, { method: 'HEAD' });
        const contentType: string | null = response.headers.get('content-type');

        if (!contentType) {
            return getFileTypeFromUrl(url);
        }

        // Check exact matches first
        for (const [mimeType, fileType] of Object.entries(FILE_TYPE_MAPPINGS)) {
            if (mimeType.endsWith('/')) {
                // For types like 'image/', 'text/'
                if (contentType.startsWith(mimeType)) {
                    return fileType;
                }
            } else {
                // For exact matches
                if (contentType === mimeType) {
                    return fileType;
                }
            }
        }

        return 'unknown';

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error checking file type:', errorMessage);
        return getFileTypeFromUrl(url);
    }
}

/**
 * Get file type from URL extension (fallback method)
 * @param url - File URL
 * @returns File type based on extension
 */
export function getFileTypeFromUrl(url: string): FileType {
    if (!url || typeof url !== 'string') {
        return 'unknown';
    }

    const lowerUrl: string = url.toLowerCase();

    for (const [type, extensions] of Object.entries(EXTENSION_MAPPINGS)) {
        const hasExtension: boolean = extensions.some((ext: string) => lowerUrl.includes(ext));
        if (hasExtension) {
            return type as FileType;
        }
    }

    return 'unknown';
}

/**
 * Check if file is an image
 * @param url - File URL
 * @returns Promise resolving to boolean indicating if file is an image
 */
export async function isImage(url: string): Promise<boolean> {
    const type: FileType = await checkFileType(url);
    return type === 'image';
}

/**
 * Check if file is a document (pdf, doc, docx)
 * @param url - File URL
 * @returns Promise resolving to boolean indicating if file is a document
 */
export async function isDocument(url: string): Promise<boolean> {
    const type: FileType = await checkFileType(url);
    const documentTypes: readonly FileType[] = ['pdf', 'doc', 'docx'] as const;
    return documentTypes.includes(type);
}

/**
 * Check if file is a spreadsheet (xls, xlsx)
 * @param url - File URL
 * @returns Promise resolving to boolean indicating if file is a spreadsheet
 */
export async function isSpreadsheet(url: string): Promise<boolean> {
    const type: FileType = await checkFileType(url);
    const spreadsheetTypes: readonly FileType[] = ['xls', 'xlsx'] as const;
    return spreadsheetTypes.includes(type);
}

/**
 * Check if file is a presentation (ppt, pptx)
 * @param url - File URL
 * @returns Promise resolving to boolean indicating if file is a presentation
 */
export async function isPresentation(url: string): Promise<boolean> {
    const type: FileType = await checkFileType(url);
    const presentationTypes: readonly FileType[] = ['ppt', 'pptx'] as const;
    return presentationTypes.includes(type);
}

/**
 * Check if file is an archive (zip, rar)
 * @param url - File URL
 * @returns Promise resolving to boolean indicating if file is an archive
 */
export async function isArchive(url: string): Promise<boolean> {
    const type: FileType = await checkFileType(url);
    const archiveTypes: readonly FileType[] = ['zip', 'rar'] as const;
    return archiveTypes.includes(type);
}

/**
 * Get file icon/emoji based on type
 * @param fileType - File type returned by checkFileType
 * @returns Emoji representing the file type
 */
export function getFileIcon(fileType: FileType): string {
    const iconMap: Record<FileType, string> = {
        image: '🖼️',
        pdf: '📄',
        doc: '📝',
        docx: '📝',
        xls: '📊',
        xlsx: '📊',
        ppt: '📊',
        pptx: '📊',
        text: '📋',
        zip: '🗜️',
        rar: '🗜️',
        unknown: '📁'
    } as const;

    return iconMap[fileType] ?? iconMap.unknown;
}

/**
 * Get file display name based on type
 * @param fileType - File type returned by checkFileType
 * @returns Human-readable display name for the file type
 */
export function getFileDisplayName(fileType: FileType): string {
    const displayMap: Record<FileType, string> = {
        image: 'Image',
        pdf: 'PDF Document',
        doc: 'Word Document',
        docx: 'Word Document',
        xls: 'Excel Spreadsheet',
        xlsx: 'Excel Spreadsheet',
        ppt: 'PowerPoint Presentation',
        pptx: 'PowerPoint Presentation',
        text: 'Text File',
        zip: 'ZIP Archive',
        rar: 'RAR Archive',
        unknown: 'File'
    } as const;

    return displayMap[fileType] ?? displayMap.unknown;
}

/**
 * Get file extension for a given file type
 * @param fileType - File type
 * @returns Most common extension for the file type
 */
export function getFileExtension(fileType: FileType): string {
    const extensionMap: Record<FileType, string> = {
        image: '.jpg',
        pdf: '.pdf',
        doc: '.doc',
        docx: '.docx',
        xls: '.xls',
        xlsx: '.xlsx',
        ppt: '.ppt',
        pptx: '.pptx',
        text: '.txt',
        zip: '.zip',
        rar: '.rar',
        unknown: ''
    } as const;

    return extensionMap[fileType] ?? '';
}

/**
 * Batch check multiple file URLs
 * @param urls - Array of file URLs
 * @returns Promise resolving to array of file type results
 */
export async function checkMultipleFiles(urls: string[]): Promise<FileTypeResult[]> {
    if (!Array.isArray(urls)) {
        throw new Error('URLs must be provided as an array');
    }

    const validUrls: string[] = urls.filter((url): url is string =>
        typeof url === 'string' && url.length > 0
    );

    const results: FileTypeResult[] = await Promise.all(
        validUrls.map(async (url: string): Promise<FileTypeResult> => ({
            url,
            type: await checkFileType(url)
        }))
    );

    return results;
}

/**
 * Group files by type
 * @param results - Array of file type results
 * @returns Object with files grouped by type
 */
export function groupFilesByType(results: FileTypeResult[]): Record<FileType, FileTypeResult[]> {
    const grouped: Partial<Record<FileType, FileTypeResult[]>> = {};

    for (const result of results) {
        if (!grouped[result.type]) {
            grouped[result.type] = [];
        }
        grouped[result.type]!.push(result);
    }

    return grouped as Record<FileType, FileTypeResult[]>;
}

/**
 * Filter files by type
 * @param results - Array of file type results
 * @param allowedTypes - Array of allowed file types
 * @returns Filtered array of file type results
 */
export function filterFilesByType(
    results: FileTypeResult[],
    allowedTypes: FileType[]
): FileTypeResult[] {
    return results.filter((result: FileTypeResult) =>
        allowedTypes.includes(result.type)
    );
}

/**
 * Validate if file type is supported
 * @param fileType - File type to validate
 * @returns Boolean indicating if file type is supported
 */
export function isSupportedFileType(fileType: string): fileType is FileType {
    const supportedTypes: readonly string[] = [
        'image', 'pdf', 'doc', 'docx', 'xls', 'xlsx',
        'ppt', 'pptx', 'text', 'zip', 'rar', 'unknown'
    ] as const;

    return supportedTypes.includes(fileType);
}

// Class-based implementation for OOP approach
export class FileTypeDetector {
    private readonly fileMappings: FileTypeMappings;
    private readonly extensionMappings: ExtensionMappings;

    constructor(
        customMappings?: Partial<FileTypeMappings>,
        customExtensions?: Partial<ExtensionMappings>
    ) {
        this.fileMappings = {
            ...FILE_TYPE_MAPPINGS,
            ...(customMappings
                ? Object.fromEntries(
                    Object.entries(customMappings).filter(
                        ([, v]) => v !== undefined
                    ) as [string, FileType][]
                )
                : {})
        };
        this.extensionMappings = {
            ...EXTENSION_MAPPINGS,
            ...(customExtensions
                ? Object.fromEntries(
                    Object.entries(customExtensions).filter(
                        ([, v]) => Array.isArray(v)
                    ) as [string, string[]][]
                )
                : {})
        };
    }

    public async checkType(url: string): Promise<FileType> {
        return checkFileType(url);
    }

    public getTypeFromUrl(url: string): FileType {
        return getFileTypeFromUrl(url);
    }

    public async checkMultiple(urls: string[]): Promise<FileTypeResult[]> {
        return checkMultipleFiles(urls);
    }

    public getIcon(fileType: FileType): string {
        return getFileIcon(fileType);
    }

    public getDisplayName(fileType: FileType): string {
        return getFileDisplayName(fileType);
    }
}

// Default export object with all functions
const FileTypeDetectorModule = {
    checkFileType,
    getFileTypeFromUrl,
    isImage,
    isDocument,
    isSpreadsheet,
    isPresentation,
    isArchive,
    getFileIcon,
    getFileDisplayName,
    getFileExtension,
    checkMultipleFiles,
    groupFilesByType,
    filterFilesByType,
    isSupportedFileType,
    FileTypeDetector,
    FILE_TYPE_MAPPINGS,
    EXTENSION_MAPPINGS
} as const;

export default FileTypeDetectorModule;

// Export constants for external use
export { EXTENSION_MAPPINGS, FILE_TYPE_MAPPINGS };
