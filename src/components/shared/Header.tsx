/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Image from "next/image";
import GetHeaderTitle from "./GetHeaderTitle";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useChangePasswordMutation } from "@/redux/api/authApi";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { IoLogOutOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { ModalPortal } from "./ModalPortal";
import { useLogout } from "@/hooks/useLogout";
import { useRouter } from "next/navigation";
import { useGetAllTicketQuery } from "@/redux/api/supportApi";

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

function Header() {
  const user = useSelector((state: RootState) => ({
    email: state.auth.email,
    role: state.auth.role,
    userId: state.auth.userId,
    image: state.auth.image,
  }));

  const { data: ticketData } = useGetAllTicketQuery(
    {},
    { pollingInterval: 300000 }
  );

  const openTicketCount = ticketData?.data?.tickets?.reduce((acc: number, t: any) => {
    return t.status === "open" ? acc + 1 : acc;
  }, 0) || 0;

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logoutHandler, isLoading } = useLogout()
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutHandler()
    } catch (error) {
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<PasswordForm>();

  const onSubmit: SubmitHandler<PasswordForm> = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success("Password changed successfully!");
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error((error as any)?.data?.message || "Failed to change password. Please try again.");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#ffffff] px-4 h-24 sm:h-20 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 pl-12 lg:pl-0">
          <h1 className="text-lg font-semibold">
            <GetHeaderTitle />
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {
            user?.role === "landlord" && (
              <button onClick={() => router.push("/add-properties")} type="button" className="font-medium text-white cursor-pointer bg-primary px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm">
                + Add Property
              </button>
            )}
          {user?.role === "admin" && (
            <div className="flex items-center gap-1 md:gap-5 flex-wrap">
              <div onClick={()=>router.push("/admin-dashboard/ticket-support")} className="px-4 bg-primary rounded-xl py-1 cursor-pointer">
                <p className="text-xs text-white">Open Tickets: <span className="text-yellow-50">{openTicketCount}</span></p>
              </div>
              <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center justify-start text-[#D00E11] cursor-pointer">
                <IoLogOutOutline />
                <p className="text-[#D00E11]">Logout</p>
              </button>
              <p
                className="font-medium text-primary underline cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                Change Password
              </p>
            </div>
          )}
          <div className="flex gap-5 items-center">
            <Image
              height={40}
              width={40}
              src={user?.image || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Super%20Admin-czj6ar9X0anuBDtJzwPc2tK6yWKJcE.png"}
              alt=""
              className="h-8 w-8 rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                  Old Password
                </label>
                <input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  {...register("oldPassword", { required: "Old password is required" })}
                  className="mt-1 block w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-8 text-gray-500"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showOldPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8s3.582-8 8-8c1.683 0 3.254.524 4.575 1.425M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 4.418-3.582 8-8 8"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm0 0c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm4 0h.01"
                      />
                    )}
                  </svg>
                </button>
                {errors.oldPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.oldPassword.message}</p>
                )}
              </div>
              <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                  className="mt-1 block w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-8 text-gray-500"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showNewPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8s3.582-8 8-8c1.683 0 3.254.524 4.575 1.425M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 4.418-3.582 8-8 8"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm0 0c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm4 0h.01"
                      />
                    )}
                  </svg>
                </button>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="relative">
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmNewPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === watch("newPassword") || "Passwords do not match",
                  })}
                  className="mt-1 block w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-8 text-gray-500"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showConfirmPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8s3.582-8 8-8c1.683 0 3.254.524 4.575 1.425M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 4.418-3.582 8-8 8"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm0 0c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm4 0h.01"
                      />
                    )}
                  </svg>
                </button>
                {errors.confirmNewPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* logout */}
      {isLogoutModalOpen && (
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
                  onClick={() => setIsLogoutModalOpen(false)}
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
    </>
  );
}

export default Header;