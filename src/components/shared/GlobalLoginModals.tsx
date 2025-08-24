"use client";

import { useLoginModal } from "@/context/LoginModalProvider";
import LoginModal from "../auth/LoginModal";


export default function GlobalModals() {
  const { isOpen, closeModal } = useLoginModal();

  return (
    <>
      <LoginModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
}
