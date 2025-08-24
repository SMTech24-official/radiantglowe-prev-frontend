"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import logo from "@/assets/logo.svg";
import Link from "next/link";
import { FaBars, FaChevronDown } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { usePathname, useRouter } from "next/navigation";
import RegistrationModal from "../auth/RegistrationModal";
import { useDecodedToken } from "@/hooks/useDecodedToken";
import { useLoginModal } from "@/context/LoginModalProvider";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { openModal } = useLoginModal();
  const user = useDecodedToken(localStorage.getItem("accessToken"));

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const router = useRouter();

  const handleLogo = () => {
    router.push("/");
  };

  const navlinks = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" },
    { label: "About Us", href: "/about-us" },
    { label: "Add Properties", href: "/add-properties", hasDropdown: true },
    { label: "Pricing", href: "/packages" },
  ];

  const dropdownItems = [
    { label: "Hire a Professional", href: "/hire-professional" },
  ];

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const navbarVariants: Variants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.2,
      },
    },
  };

  const sidebarVariants: Variants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
    closed: {
      y: "100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.2,
      },
    },
  };

  return (
    <div>
      {/* Navbar */}
      <motion.div
        className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 w-[95%] max-w-7xl px-4 sm:px-8 py-1 flex justify-between items-center bg-white rounded-lg shadow-md"
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <div onClick={handleLogo} className="cursor-pointer flex-shrink-0">
          <Image src={logo} alt="logo" width={80} height={80} unoptimized/>
        </div>

        {/* Nav Links - Desktop */}
        <ul className="hidden lg:flex items-center gap-6 text-gray-800 font-medium">
          {navlinks.map((navlink) => (
            <motion.li
              key={navlink.label}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {navlink.hasDropdown ? (
                <div className="flex items-center">
                  <Link
                    href={navlink.href}
                    className={`hover:text-primary transition-colors ${pathname === navlink.href ? "text-primary" : ""}`}
                  >
                    {navlink.label}
                  </Link>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="ml-2"
                  >
                    <FaChevronDown className="text-sm" />
                  </button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.ul
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="absolute top-full left-0 mt-2 bg-white shadow-md rounded-lg py-2 w-48"
                      >
                        {dropdownItems.map((item) => (
                          <motion.li
                            key={item.label}
                            variants={itemVariants}
                            className="px-4 py-2 hover:bg-gray-100"
                          >
                            <Link
                              href={item.href}
                              className={`hover:text-primary transition-colors ${pathname === item.href ? "text-primary" : ""}`}
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={navlink.href}
                  className={`hover:text-primary transition-colors ${pathname === navlink.href ? "text-primary" : ""}`}
                >
                  {navlink.label}
                </Link>
              )}
            </motion.li>
          ))}
        </ul>

        {/* Auth Buttons - Desktop */}
        <div className="hidden lg:flex gap-4">
          {user ? (
            <motion.button
              onClick={() => {
                if (user) {
                  if (user.role === "admin") {
                    router.push("/admin-dashboard");
                  } else if (user.role === "landlord") {
                    router.push("/landlord/profile");
                  } else if (user.role === "tenant") {
                    router.push("/tenants/profile");
                  }
                }
              }}
              className="cursor-pointer bg-white border border-primary hover:bg-primary hover:text-white text-primary px-6 py-2 rounded-lg font-medium text-sm transition-colors"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              {user.role === "admin" ? "Admin Dashboard" : "Profile"}
            </motion.button>
          ) : (
            <>
              <motion.button
                onClick={() => openModal(false)}
                className="cursor-pointer bg-white border border-primary hover:bg-primary hover:text-white text-primary px-6 py-2 rounded-lg font-medium text-sm transition-colors"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => setIsRegistrationOpen(true)}
                className="cursor-pointer bg-primary text-white hover:bg-primary/60 px-6 py-2 rounded-lg font-medium text-sm shadow transition-colors"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                Register
              </motion.button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <motion.button
            onClick={() => setIsSidebarOpen(true)}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <FaBars className="text-2xl text-gray-800" />
          </motion.button>
        </div>
      </motion.div>

      {/* Sidebar for Mobile/Tablet */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-30 flex justify-center items-end lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-full bg-white p-6"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Close button */}
              <div className="flex justify-end mb-4">
                <motion.button
                  onClick={handleCloseSidebar}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <IoMdClose className="text-2xl text-gray-700" />
                </motion.button>
              </div>

              {/* Nav Links */}
              <ul className="flex flex-col gap-4 text-gray-800 font-medium text-lg text-center">
                {navlinks.map((navlink, index) => (
                  <motion.li
                    key={navlink.label}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 * index }}
                  >
                    {navlink.hasDropdown ? (
                      <div>
                        <div className="flex justify-center items-center">
                          <Link
                            href={navlink.href}
                            onClick={handleCloseSidebar}
                            className={`hover:text-primary transition-colors ${pathname === navlink.href ? "text-primary" : ""}`}
                          >
                            {navlink.label}
                          </Link>
                          <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="ml-2"
                          >
                            <FaChevronDown className="text-sm" />
                          </button>
                        </div>
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.ul
                              variants={dropdownVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="mt-2"
                            >
                              {dropdownItems.map((item) => (
                                <motion.li
                                  key={item.label}
                                  variants={itemVariants}
                                  className="py-2"
                                >
                                  <Link
                                    href={item.href}
                                    onClick={handleCloseSidebar}
                                    className={`hover:text-primary transition-colors ${pathname === item.href ? "text-primary" : ""}`}
                                  >
                                    {item.label}
                                  </Link>
                                </motion.li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={navlink.href}
                        onClick={handleCloseSidebar}
                        className={`hover:text-primary transition-colors ${pathname === navlink.href ? "text-primary" : ""}`}
                      >
                        {navlink.label}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>

              {/* Auth Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                {user ? (
                  <motion.button
                    onClick={() => {
                      handleCloseSidebar();
                      if (user) {
                        if (user.role === "admin") {
                          router.push("/admin-dashboard");
                        } else if (user.role === "landlord") {
                          router.push("/landlord/profile");
                        } else if (user.role === "tenant") {
                          router.push("/tenants/profile");
                        }
                      }
                    }}
                    className="w-full bg-primary text-white hover:bg-primary/60 px-6 py-3 rounded-lg font-medium text-base transition-colors"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 * (navlinks.length + 1) }}
                  >
                    {user.role === "admin" ? "Dashboard" : "Profile"}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      onClick={() => {
                        handleCloseSidebar();
                        openModal(false);
                      }}
                      className="w-full bg-white border border-gray-300 hover:bg-primary hover:text-white text-gray-900 px-6 py-3 rounded-lg font-medium text-base transition-colors"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 * navlinks.length }}
                    >
                      Login
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        handleCloseSidebar();
                        setIsRegistrationOpen(true);
                      }}
                      className="w-full bg-primary text-white hover:bg-primary/60 px-6 py-3 rounded-lg font-medium text-base transition-colors"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 * (navlinks.length + 1) }}
                    >
                      Register
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </div>
  );
}