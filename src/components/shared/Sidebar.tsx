/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import logo from "@/assets/logo.svg";
import { useLogout } from "@/hooks/useLogout";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaMoneyBill } from "react-icons/fa6";
import { IoMdCalendar } from "react-icons/io";
import {
  IoChatbox,
  IoChatboxOutline,
  IoLogOutOutline,
  IoMagnetOutline,
  IoPricetagsOutline,
} from "react-icons/io5";
import { MdOutlineDashboard, MdPages, MdReviews } from "react-icons/md";
import { PiBuildingLight, PiUsersLight, PiUsersThreeBold } from "react-icons/pi";
import { TbHomePlus } from "react-icons/tb";
import { ModalPortal } from "./ModalPortal";
import NavLink from "./NavLink";

const navLinks = [
  { icon: <MdOutlineDashboard />, href: "/admin-dashboard", label: "Dashboard" },
  {
    icon: <PiUsersThreeBold />,
    href: "/admin-dashboard/all-landlords",
    label: "All Landlords",
  },
  {
    icon: <PiUsersLight />,
    href: "/admin-dashboard/all-tenants",
    label: "All Tenants",
  },
  {
    icon: <TbHomePlus />,
    href: "/admin-dashboard/property-type",
    label: "Property Type",
  },
  {
    icon: <PiBuildingLight />,
    href: "/admin-dashboard/all-properties",
    label: "All Properties",
  },
  { icon: <IoPricetagsOutline />, href: "/admin-dashboard/pricing", label: "Pricing" },
  {
    icon: <IoChatboxOutline />,
    href: "/admin-dashboard/all-chats",
    label: "All Chats",
  },
  {
    icon: <IoMagnetOutline />,
    href: "/admin-dashboard/hire-request",
    label: "Hire Request",
  },
  {
    icon: <FaMoneyBill />,
    href: "/admin-dashboard/subscriptions",
    label: "Subscriptions",
  },
  {
    icon: <IoChatbox />,
    href: "/admin-dashboard/ticket-support",
    label: "Ticket Support",
  },
  {
    icon: <MdReviews />,
    href: "/admin-dashboard/review-management",
    label: "Review Management",
  },
  {
    icon: <MdPages />,
    href: "/admin-dashboard/tenancy-agreement",
    label: "Tenancy Agreement",
  },
  { icon: <IoMdCalendar />, href: "/admin-dashboard/cms", label: "CMS" },
];

interface SidebarProps {
  setOpen?: (open: boolean) => void; // Optional prop for mobile sidebar control
}

function Sidebar({ setOpen }: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logoutHandler, isLoading } = useLogout();

  const handleLogout = async () => {
    try {
      logoutHandler();
    } catch (error) {}
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
      <nav className="flex mb-10 flex-col overflow-y-auto overflow-x-hidden">
        <div className="flex-1 h-full flex flex-col gap-4 pb-8">
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
            className="flex items-center justify-start text-[#D00E11] w-[216px] p-[14px_16px] gap-2 rounded-[8px] cursor-pointer !pt-6"
          >
            <IoLogOutOutline />
            <p className="text-[#D00E11]">Logout</p>
          </button>
        </div>
      </nav>
      {isModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[9999]">
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
        </ModalPortal>
      )}
    </div>
  );
}

export default Sidebar;