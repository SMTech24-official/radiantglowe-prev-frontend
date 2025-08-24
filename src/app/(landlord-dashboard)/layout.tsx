// LandlordDashboardLayout.tsx
"use client";
import type React from "react";
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import LandlordSidebar from "@/components/shared/LandlordSidebar";
import NotificationBubble from "@/components/shared/NotificationBubble";

export default function LandlordDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // 🛑 Prevent body scrolling completely
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <NotificationBubble />
      {/* Sidebar (Desktop) */}
      <div className="hidden lg:block w-64 bg-white">
        <LandlordSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden fixed left-4 top-4 z-50">
          <Button className="bg-white border" size="icon">
            <Menu className="h-6 w-6 text-black" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-white">
          <LandlordSidebar setOpen={setOpen} /> {/* Pass setOpen here */}
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0">
          <Header />
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-4 border rounded-tl-xl">
          {children}
        </div>
      </div>
    </div>
  );
}