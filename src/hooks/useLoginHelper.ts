/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLoginModal } from "@/context/LoginModalProvider";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

interface IProps {
    email: string;
    password: string;
}
export const useLoginHelper = () => {
    const { requireAuth } = useLoginModal();
    const pathName = usePathname();


    const loginHelper = async (data: IProps, mutation: any) => {
        return mutation(data).unwrap().then((res: any) => {
            if (res?.data) {
                const { accessToken } = res?.data;
                localStorage.setItem("accessToken", accessToken);
                Cookies.set("accessToken", accessToken);

                const decoded = jwtDecode<{ role: "admin" | "landlord" | "tenant" }>(accessToken);
                const role = decoded.role;

                if (!requireAuth) {
                    if (role === 'admin') {
                        window.location.href = '/admin-dashboard';
                    } else if (role === 'tenant') {
                        window.location.href = '/tenants/profile';
                    } else if (role === 'landlord') {
                        window.location.href = '/landlord/profile';
                    }
                } else {
                    window.location.href = pathName;
                }
                toast.success("Login successful!");
            } else if (res?.message) {
                toast.error("Login failed. Please try again.");
            }
        }).catch((err: any) => {
            toast.error(err?.data?.message || "Login failed. Please try again.");
        });
    };

    return { loginHelper, requireAuth };
}





