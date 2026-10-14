"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Bookmark, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Quest Log", href: "/quest-log", icon: Bookmark },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];

export const BottomPillNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden"
    >
      <div className="flex items-center gap-1.5 px-3 py-2 bg-ink/95 backdrop-blur-md border-2 border-ink shadow-solid-lg rounded-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/discover" && (pathname === "/" || pathname?.startsWith("/h/")));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 select-none",
                isActive
                  ? "bg-lime text-ink shadow-[1px_1px_0px_#0B1033] scale-105"
                  : "text-white/70 hover:text-white hover:bg-white/10 active:scale-95"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "stroke-[2.5]" : "stroke-2")} />
              {isActive && <span className="tracking-tight">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomPillNav;
