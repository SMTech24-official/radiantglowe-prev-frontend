// LandlordSidebar.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import logo from "@/assets/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AiOutlineLoading3Quarters,
  AiOutlineShake,
  AiOutlineUser,
} from "react-icons/ai";
import { BiSupport } from "react-icons/bi";
import {
  IoChatbox,
  IoLogOutOutline,
  IoPricetagsOutline,
} from "react-icons/io5";
import { MdOutlineDashboard } from "react-icons/md";
import { PiBuildingLight } from "react-icons/pi";
import NavLink from "./NavLink";
import { IoIosPaper } from "react-icons/io";

const navLinks = [
  { icon: <MdOutlineDashboard />, href: "/landlord-dashboard", label: "Dashboard" },
  { icon: <PiBuildingLight />, href: "/all-properties", label: "All Properties" },
  { icon: <AiOutlineUser />, href: "/all-tenants", label: "All Tenants" },
  { icon: <AiOutlineShake />, href: "/permissions", label: "Permissions" },
  { icon: <IoPricetagsOutline />, href: "/landlord-pricing", label: "Pricing" },
  { icon: <IoChatbox />, href: "/landlord-live-chat", label: "Live Chat" },
  {
    icon: <IoIosPaper />,
    href: "/subscriptions-history",
    label: "Subscriptions History",
  },
  {
    icon: <IoIosPaper />,
    href: "/landlord-tenancy-agreement",
    label: "Tenancy Agreement",
  },
  { icon: <BiSupport />, href: "/landlord-help", label: "Help/Support" },
];

interface LandlordSidebarProps {
  setOpen?: (open: boolean) => void; // Optional prop for mobile sidebar control
}

function LandlordSidebar({ setOpen }: LandlordSidebarProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Simulate a slight delay for logout processing (e.g., API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove accessToken from localStorage
      localStorage.removeItem("accessToken");

      // Remove accessToken from cookies
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

      // Redirect to homepage
      router.push("/");
    } catch (error) {
      setIsLoading(false);
    }
  };

  // Function to handle NavLink click and close sidebar
  const handleNavLinkClick = () => {
    if (setOpen) {
      setOpen(false); // Close the mobile sidebar
    }
  };

  return (
    <div className="flex px-5 flex-col h-full bg-white">
      <div className="px-6 pb-6 pt-4">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image height={100} width={100} src={logo} alt="Logo" className="" />
        </Link>
      </div>
      <nav className="flex mb-10 flex-col">
        <div className="flex-1 h-full flex flex-col gap-4 pb-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                icon={link.icon}
                href={link.href}
                onClick={handleNavLinkClick} // Pass the click handler
              >
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
        <div>
          {/* logout */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-start text-[#D00E11] w-[216px] p-[14px_16px] gap-2 rounded-[8px] cursor-pointer"
          >
            <IoLogOutOutline />
            <p className="text-[#D00E11]">Logout</p>
          </button>
        </div>
      </nav>
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

export default LandlordSidebar;