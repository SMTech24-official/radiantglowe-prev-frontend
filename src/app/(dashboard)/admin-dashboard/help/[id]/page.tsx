import Image from "next/image"
import { PiMapPinLine, PiUserBold } from "react-icons/pi"

// Dummy data for the message details
const messageData = {
  id: 1,
  name: "Robert Allen",
  profileImage: "https://images.pexels.com/photos/343717/pexels-photo-343717.jpeg",
  address: "3891 Ranchview Dr. Richardson, California",
  fullName: "Robert Allen",
  email: "robertallen@42386.com",
  number: "+7413654256",
  messageType: "Technical",
  message:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
}

export default function AdminHelpDetailsPage() {
  return (
    <div className="w-full max-w-4xl bg-white mb-12">
      {/* Header Section */}
      <div className="flex items-start gap-6 lg:p-6 pb-8">
        {/* Profile Image */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={messageData.profileImage || "/placeholder.svg"}
            alt={messageData.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Name and Location */}
        <div className="flex-1 pt-2">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">{messageData.name}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <PiMapPinLine className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{messageData.address}</span>
          </div>
        </div>
      </div>

      {/* Message Information Section */}
      <div className="lg:px-6 pb-6">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-primary">
          <PiUserBold className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium text-primary">Message Information</h2>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Full Name</label>
            <p className="text-gray-900 font-medium">{messageData.fullName}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <p className="text-gray-900 font-medium">{messageData.email}</p>
          </div>

          {/* Number */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Number</label>
            <p className="text-gray-900 font-medium">{messageData.number}</p>
          </div>

          {/* Message Type */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Message Type</label>
            <p className="text-gray-900 font-medium">{messageData.messageType}</p>
          </div>

          {/* Message */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">Message</label>
            <p className="text-gray-900 font-medium leading-relaxed">{messageData.message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
