"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, ArrowUpRight, Bookmark, UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-state";

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
      <span className="sq-logo-icon">
        <Zap size={21} fill="currentColor" />
      </span>
      buildseek<span className="sq-logo-dot">.</span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname() || "/";
  const { user } = useAuth();
  const activePath = pathname.startsWith("/h/") ? "/discover" : pathname;

  return (
    <>
      <header className="sq-nav">
        <Logo />
        <nav aria-label="Main navigation" className="sq-nav-links">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sq-nav-item ${activePath === href || (activePath === "/" && href === "/discover")
                  ? "is-active"
                  : ""
                }`}
            >
              <Icon size={17} />
              <span>{href === "/profile" ? (user ? "Account" : "Log in") : label}</span>
            </Link>
          ))}
        </nav>
        <Button asChild size="sm" className="sq-submit-nav">
          <Link href="/submit">
            Submit event <ArrowUpRight size={16} />
          </Link>
        </Button>
      </header>

      <nav aria-label="Mobile navigation" className="sq-bottom-nav">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={href === "/profile" ? (user ? "Account" : "Log in") : label}
            className={`sq-mobile-item ${activePath === href || (activePath === "/" && href === "/discover")
                ? "is-active"
                : ""
              }`}
          >
            <Icon size={21} />
            <span>{href === "/profile" ? (user ? "Account" : "Log in") : label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
