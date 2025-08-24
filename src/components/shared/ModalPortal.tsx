import { ReactNode } from "react";
import { createPortal } from "react-dom";

export const ModalPortal = ({ children }: { children: ReactNode }) => {
  if (typeof window === "undefined") return null;
  const modalRoot = document.getElementById("modal-root");
  return modalRoot ? createPortal(children, modalRoot) : null;
};
