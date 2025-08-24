/* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";

import { useLoginModal } from "@/context/LoginModalProvider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// import { useLoginModal } from "@/context/LoginModalProvider";
// import { usePathname } from "next/navigation";
// import { useEffect } from "react";

// export const useAuthCheck = () => {
//   const pathname = usePathname();
//   const { openModal } = useLoginModal();

//   useEffect(() => {
//     // Fetch HEAD (not full HTML) to reduce payload
//     fetch(pathname, { method: "GET", credentials: "include" }).then((res) => {
//       const requireAuth = res.headers.get("x-require-auth");
//       const unauthorized = res.headers.get("x-unauthorized-role");

//       if (requireAuth === "true") {
//         openModal(true);
//       } if (unauthorized === "true") {
//         // toast.error("You do not have permission to access this page.");
//         openModal(true);
//       }
//     });
//   }, [pathname]);
// };

export const useAuthCheck = () => {
  const pathname = usePathname();
  const { openModal } = useLoginModal();

  useEffect(() => {
    fetch("/api/auth-check", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.requireAuth) {
          openModal(true);
        }
      });
  }, [pathname]);
};
