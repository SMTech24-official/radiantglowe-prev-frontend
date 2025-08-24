"use client"

import { IoCheckmark, IoClose } from "react-icons/io5"

interface CustomToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function CustomToggle({ label, checked, onChange }: CustomToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-800 text-base font-medium capitalize">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`
          cursor-pointer relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
          ${checked ? "bg-[#008000] focus:ring-[#008000]" : "bg-[#B05050] focus:ring-[#B05050]"}
        `}
      >
        <span
          className={`
            h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ease-in-out flex items-center justify-center
            ${checked ? "translate-x-7" : "translate-x-1"}
          `}
        >
          {checked ? <IoCheckmark className="h-4 w-4 text-green-600" /> : <IoClose className="h-4 w-4 text-red-500" />}
        </span>
      </button>
    </div>
  )
}
