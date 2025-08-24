import { useGetCmsQuery } from "@/redux/api/cmsApi";
import { AiFillTikTok } from "react-icons/ai";
import { FaWhatsapp } from "react-icons/fa6";
import { FiMail, FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiPhone } from "react-icons/fi";

export default function ContactInformation() {
  const {data:aboutUs} = useGetCmsQuery('contactUs')
  const socialIcons = [
    { icon: <FiFacebook className="w-5 h-5" />, href: aboutUs?.data?.content?.facebook || '#', label: "Facebook" },
    {
      icon: <FiInstagram className="w-5 h-5" />,
      href: aboutUs?.data?.content?.instagram || "#",
      label: "Instagram",
    },
    { icon: <FiTwitter className="w-5 h-5" />, href: aboutUs?.data?.content?.twitter || "#", label: "Twitter" },
    { icon: <FiYoutube className="w-5 h-5" />, href: aboutUs?.data?.content?.youtube || "#", label: "Youtube" },
    { icon: <AiFillTikTok className="w-5 h-5" />, href: aboutUs?.data?.content?.tiktok || "#", label: "Tiktok" },
  ];

  return (
    <div className="relative bg-primary rounded-3xl p-8 lg:p-10 text-white overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        {/* Heading */}
        <h3 className="text-2xl lg:text-4xl font-bold mb-4 leading-tight">
          Contact information
        </h3>

        {/* Subtitle */}
        <p className="mb-8 text-base lg:text-lg leading-relaxed">
          Let us know about any site issues here
        </p>

        {/* Email */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-6 h-6 flex-shrink-0">
            <FiMail className="w-6 h-6" />
          </div>
          <span className="text-base lg:text-lg">{aboutUs?.data?.content?.email || 'info@simpleroomsng.com'}</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-6 h-6 flex-shrink-0">
            <FiPhone className="w-6 h-6" />
          </div>
          <span className="text-base lg:text-lg">{aboutUs?.data?.content?.phone || '+234 (0) 91 621 36000'}</span>
        </div>
        <div className="flex items-center gap-4 mb-12 ">
          <div className="w-6 h-6 flex-shrink-0">
            <FaWhatsapp className="w-6 h-6" />
          </div>
          <span className="text-base lg:text-lg">{aboutUs?.data?.content?.phone || '+234 (0) 91 621 36000'}</span>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-start space-x-4 w-full md:w-auto">
          {socialIcons.map((item, idx) => (
            <a
              target="_blank"
              key={idx}
              href={item.href}
              className="flex items-center justify-center hover:primary/50 transition-colors duration-200"
              aria-label={item.label}
            >
              {item.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}