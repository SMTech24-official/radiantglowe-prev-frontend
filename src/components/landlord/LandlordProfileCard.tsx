/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useLogout } from "@/hooks/useLogout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { TbLogout } from "react-icons/tb";

const menuItems = [
  { label: "Landlord Profile", href: "/landlord/profile" },
    { label: "Profile Verification", href: "/landlord/profile-verification" },
  { label: "Dashboard", href: "/landlord-dashboard" },
];

export default function LandlordProfileCard() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logoutHandler, isLoading } = useLogout()

  const handleLogout = async () => {
    try {
      logoutHandler()
    } catch (error) {
    }
  };

  return (
    <div className="w-full h-72 max-w-xs bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center">
      <div className="w-full flex flex-col gap-3 mb-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full text-center rounded-md py-2 transition-colors font-medium ${isActive
                ? "bg-primary text-white text-lg"
                : "text-gray-800 text-base hover:text-primary"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <button
        className="w-full text-[#A71E3C] text-base font-medium flex items-center justify-center hover:text-[#A71E3C]/80 transition-colors cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <span>Log Out</span>
        <TbLogout className="ml-2" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    <span>Logging Out...</span>
                  </>
                ) : (
                  <span>Log Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
