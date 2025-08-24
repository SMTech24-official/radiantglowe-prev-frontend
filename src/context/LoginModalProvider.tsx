"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface LoginModalContextType {
  isOpen: boolean;
  requireAuth: boolean;
  openModal: (requireAuth?: boolean) => void;
  closeModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export const LoginModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);

  const openModal = (authRequired = false) => {
    setIsOpen(true);
    setRequireAuth(authRequired);
  };

  const closeModal = () => {
    setIsOpen(false);
    // if (requireAuth) {
    //   // Redirect to home if modal was opened due to missing auth
    //   window.location.href = "/";
    // }
  };

  return (
    <LoginModalContext.Provider value={{ isOpen, requireAuth, openModal, closeModal }}>
      {children}
    </LoginModalContext.Provider>
  );
};

export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error("useLoginModal must be used within a LoginModalProvider");
  }
  return context;
};
