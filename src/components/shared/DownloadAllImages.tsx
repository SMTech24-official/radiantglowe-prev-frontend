"use client";

import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FiDownload } from "react-icons/fi";
import { Loader2 } from "lucide-react"; // spinner icon

const DownloadAllFiles = ({ images, filename }: { images: string[]; filename: string }) => {
  const [loading, setLoading] = useState(false);

  // detect extension from content-type or url
  const getFileExtension = (url: string, response: Response) => {
    const contentType = response.headers.get("content-type");

    if (contentType) {
      if (contentType.includes("pdf")) return "pdf";
      if (contentType.includes("wordprocessingml")) return "docx";
      if (contentType.includes("msword")) return "doc";
      if (contentType.startsWith("image/")) {
        // e.g. image/png → png
        return contentType.split("/")[1];
      }
    }

    // fallback: try to detect from URL
    const match = url.split("?")[0].match(/\.(\w+)$/);
    return match ? match[1] : "file";
  };

  const handleDownloadAll = async () => {
    try {
      setLoading(true);
      const zip = new JSZip();

      const promises = images.map(async (url, index) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const ext = getFileExtension(url, response);
        zip.file(`file-${index + 1}.${ext}`, blob);
      });

      await Promise.all(promises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${filename}-all-files.zip`);
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadAll}
      disabled={loading}
      className={`text-sm flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
        loading
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-primary text-white hover:bg-primary/90"
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <FiDownload className="w-5 h-5" />
          Download All
        </>
      )}
    </button>
  );
};

export default DownloadAllFiles;
