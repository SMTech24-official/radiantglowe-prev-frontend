"use client";

import { FiX, FiMinus, FiCopy, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const pathname = usePathname();
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(`${window.location.origin}${pathname}`);
    }
  }, [pathname]);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Check out this link!");
    const body = encodeURIComponent(`Hey! Check this out: ${fullUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Check this out: ${fullUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Share your referral
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiMinus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Top Row - Copy Link and Email */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="cursor-pointer flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiCopy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-gray-700">Copy Link</span>
            </button>
            <button
              onClick={handleEmail}
              className="cursor-pointer flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiMail className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-gray-700">Email</span>
            </button>
          </div>

          {/* Bottom Row - WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="cursor-pointer w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaWhatsapp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700">WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
