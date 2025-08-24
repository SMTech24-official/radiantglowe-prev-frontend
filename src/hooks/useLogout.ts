/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLogoutMutation } from "@/redux/api/authApi";
import { toast } from "sonner";
import { logout } from "@/redux/features/authSlice";
import Cookies from "js-cookie";

export const useLogout = () => {
  const [logoutMutation, { isLoading }] = useLogoutMutation();
  const logoutHandler = async () => {
    try {
      await logoutMutation({}).unwrap();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("registerData");
      localStorage.removeItem("userData");
      Cookies.remove("accessToken");
      logout()
      toast.success("Logout successful!");
      window.location.replace("/")
    } catch (err: any) {
      toast.error(err?.data?.message || "Logout failed. Please try again.");
    }
  };

  return { logoutHandler, isLoading };
};
