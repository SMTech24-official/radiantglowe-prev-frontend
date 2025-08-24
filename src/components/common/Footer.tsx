"use client";

import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/assets/logo.svg";
import { useLoginModal } from "@/context/LoginModalProvider";
import RegistrationModal from "../auth/RegistrationModal";
import { useState } from "react";
import { useGetCmsQuery } from "@/redux/api/cmsApi";
import { FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa6";


const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us" },
  { name: "Properties", href: "/properties" },
  // { name: "Add Properties", href: "/add-properties" },
  { name: "Hire a Professional", href: "/hire-professional" },
];

const policies = [
  { name: "Privacy Policy / Cookies", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms&conditions" },
  { name: "FAQ", href: "/faq" },
];

const quickLinks = [
  { name: "Properties", href: "/properties" },
  // { name: "Become a Tenants", href: "/register" },
  // { name: "Register your Interest", href: "/register" },
  { name: "Contact us", href: "/contact-us" },
  // { name: "FAQ", href: "/faq" },
];

// const legalLinks = [
//   { name: "Terms", href: "/terms&conditions" },
//   { name: "Privacy", href: "/privacy-policy" },
//   { name: "Cookies", href: "/terms&conditions" },
// ];

export default function Footer() {
  const { data: aboutUs } = useGetCmsQuery('contactUs')

  const { openModal } = useLoginModal();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const linkClass =
    "text-gray-600 text-sm hover:text-gray-900 transition-colors";
  const iconWrapperClass =
    "w-8 h-8 flex items-center justify-center hover:shadow-md transition-shadow text-gray-600";

  const router = useRouter();

  const socialLinks = [
    { icon: FaFacebookF, href: aboutUs?.data?.content?.facebook || "#" },
    { icon: FaInstagram, href: aboutUs?.data?.content?.instagram || "#" },
    { icon: FaTwitter, href: aboutUs?.data?.content?.twitter || "#" },
    { icon: FaYoutube, href: aboutUs?.data?.content?.youtube || "#" },
    { icon: FaTiktok, href: aboutUs?.data?.content?.tiktok || "#" },
  ];

  const handleLogo = () => {
    router.push("/");
  };

  return (
    <footer className="bg-background-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <div
              onClick={handleLogo}
              className="cursor-pointer flex-shrink-0 pb-3"
            >
              <Image src={logo} alt="logo" width={80} height={80} />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Simple Rooms offers top-tier management services and personalized
              support, ensuring a hassle-free experience for your 0% commission
              rental needs.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href }, idx) => (
                <Link key={idx} href={href} className={iconWrapperClass}>
                  <Icon className="w-6 h-6 text-gray-600" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-gray-900 font-medium text-base mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {navigationLinks.map(({ name, href }, idx) => (
                <li key={idx} className="flex items-center">
                  <IoIosArrowForward className="text-slate-500" />
                  <Link href={href} className={linkClass}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-medium text-base mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li onClick={() => openModal(false)} className="flex items-center cursor-pointer">
                <IoIosArrowForward className="text-slate-500" />
                <span className={linkClass}>Become a Tenant</span>
              </li>
              <li onClick={() => setIsRegistrationOpen(true)} className="flex items-center cursor-pointer">
                <IoIosArrowForward className="text-slate-500" />
                <span className={linkClass}>Register your Interest</span>
              </li>
              {quickLinks.map(({ name, href }, idx) => (
                <li key={idx} className="flex items-center">
                  <IoIosArrowForward className="text-slate-500" />
                  <Link href={href} className={linkClass}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-gray-900 font-medium text-base mb-4">
              Policies
            </h3>
            <ul className="space-y-3">
              {policies.map(({ name, href }, idx) => (
                <li key={idx} className="flex items-center">
                  <IoIosArrowForward className="text-slate-500" />
                  <Link href={href} className={linkClass}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 font-medium text-base mb-4">
              Get In Touch
            </h3>
            <div className="space-y-3 text-gray-600 text-sm">
              <div className="flex items-center space-x-3">
                <FiPhone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span>
                  {aboutUs?.data?.content?.phone || "+234 (0)9162136000"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FaWhatsapp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <Link
                  href={`https://wa.me/${(aboutUs?.data?.content?.phone || "+2349162136000").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-600"
                >
                  {aboutUs?.data?.content?.phone || "+234 (0)9162136000"}
                </Link>
              </div>


              <div className="flex items-center space-x-3">
                <FiMail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <a
                  href={`mailto:${aboutUs?.data?.content?.email || "info@simpleroomsng.com"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:underline"
                >
                  {aboutUs?.data?.content?.email || "info@simpleroomsng.com"}
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <FiMapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {aboutUs?.data?.content?.address || "60B Ogudu Rd, Ogudu GRA, Ikeja, Lagos,  Nigeria"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-stone-200 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-600 text-sm">
              Copyright © {new Date().getFullYear()} Simple Rooms. All rights reserved.
            </p>
            {/* <div className="flex space-x-6">
              {legalLinks.map(({ name, href }, idx) => (
                <Link key={idx} href={href} className={linkClass}>
                  {name}
                </Link>
              ))}
            </div> */}
          </div>
        </div>
      </div>
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </footer>
  );
}
