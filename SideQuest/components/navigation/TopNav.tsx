"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Bookmark, PlusCircle, Bell, User } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const TopNav: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "Quest Log", href: "/quest-log", icon: Bookmark },
    { label: "Submit", href: "/submit", icon: PlusCircle },
    { label: "Alerts", href: "/alerts", icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-parchment/90 backdrop-blur-md border-b-2 border-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-lime border-2 border-ink shadow-[1.5px_1.5px_0px_#0B1033] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <Mascot size={28} showFlag={false} className="translate-y-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl text-ink tracking-tight flex items-center gap-1">
              SideQuest
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-lime rounded border border-ink text-ink ml-1">
                Beta
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href === "/discover" && pathname?.startsWith("/h/"));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                  isActive
                    ? "bg-ink text-white shadow-solid-sm"
                    : "text-ink hover:bg-parchment-subtle"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="outline" size="sm" icon={<User className="w-4 h-4" />}>
              Sign In
            </Button>
          </Link>
          <Link href="/submit" className="hidden sm:inline-flex">
            <Button variant="lime" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              Post Hackathon
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
