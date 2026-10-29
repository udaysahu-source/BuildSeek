"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Compass,
  ArrowUpRight,
  Bookmark,
  UserRound,
  Zap,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-state";
import { useBookmarks } from "./discovery-state";
import { NextDeadlineStrip } from "./next-deadline-strip";

const items = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/quest-log", label: "Quest Log", icon: Bookmark },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

export function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      className={`sq-logo ${footer ? "sq-logo-footer" : ""}`}
      aria-label="BuildSeek home"
    >
      <span className="sq-logo-icon" aria-hidden="true">
        <Zap size={21} fill="currentColor" />
      </span>
      <span>
        buildseek<span className="sq-logo-dot">.</span>
      </span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname() || "/";
  const { user } = useAuth();
  const { saved } = useBookmarks();
  const activePath = pathname.startsWith("/h/") ? "/discover" : pathname;

  return (
    <>
      <header className="sq-nav" role="banner">
        <Logo />
        <nav aria-label="Main navigation" className="sq-nav-links">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sq-nav-item ${
                activePath === href || (activePath === "/" && href === "/discover")
                  ? "is-active"
                  : ""
              }`}
            >
              <Icon size={17} />
              <span>
                {href === "/profile"
                  ? user
                    ? user.email
                      ? user.email.split("@")[0]
                      : "Account"
                    : "Log in"
                  : label}
              </span>
              {href === "/quest-log" && saved.length > 0 && (
                <span className="sq-nav-badge">{saved.length}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sq-nav-actions flex items-center gap-2">
          <Button asChild size="sm" className="sq-submit-nav">
            <Link href="/submit">
              Submit event <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
      </header>

      {/* Persistent Next Deadline Strip across all screens when an event is saved */}
      <NextDeadlineStrip />

      {/* Mobile Bottom Floating Pill Bar */}
      <nav aria-label="Mobile navigation" className="sq-bottom-nav">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={href === "/profile" ? (user ? "Account" : "Log in") : label}
            className={`sq-mobile-item ${
              activePath === href || (activePath === "/" && href === "/discover")
                ? "is-active"
                : ""
            }`}
          >
            <div className="relative inline-flex items-center justify-center">
              <Icon size={20} />
              {href === "/quest-log" && saved.length > 0 && (
                <span className="sq-mobile-badge">{saved.length}</span>
              )}
            </div>
            <span>{href === "/profile" ? (user ? "Account" : "Log in") : label}</span>
          </Link>
        ))}
        <Link
          href="/submit"
          aria-label="Submit event"
          className={`sq-mobile-item ${activePath === "/submit" ? "is-active" : ""}`}
        >
          <div className="relative inline-flex items-center justify-center">
            <PlusCircle size={20} />
          </div>
          <span>Submit</span>
        </Link>
      </nav>
    </>
  );
}
