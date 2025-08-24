"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ href, children, icon, onClick }: NavLinkProps) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-r-lg px-3 py-2 text-sm transition-colors duration-300 ease-linear text-[16px] font-normal leading-[24px] "
 ${
   pathname === href
     ? "bg-background-secondary text-primary border-l-4 border-primary"
     : "text-muted-foreground text-[##817F9B] hover:bg-accent hover:text-accent-foreground"
 }`}
    >
      {" "}
      {icon}
      {children}
    </Link>
  );
}

export default NavLink;
