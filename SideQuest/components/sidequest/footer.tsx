import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { Logo } from "./navigation";

export function Footer() {
  return (
    <footer className="sq-footer">
      <div className="sq-container">
        <div className="sq-footer-main">
          <div>
            <Logo footer />
            <p>Less searching. More building. Your next quest starts here.</p>
          </div>
          <nav className="sq-footer-links" aria-label="Footer navigation">
            <Link href="/discover">
              Discover <ArrowUpRight size={13} />
            </Link>
            <Link href="/submit">Submit an event</Link>
            <Link href="/alerts">Stay in the loop</Link>
            <Link href="/contact">Contact</Link>
            <a
              href="https://t.me/SideQuestAlertsBot"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "var(--brand)" }}
            >
              Telegram Bot <ArrowUpRight size={13} />
            </a>
          </nav>
        </div>
        <div className="sq-footer-bottom">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span>© 2026 SideQuest. Built for the builders.</span>
            <span className="text-muted-foreground">•</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/refunds" className="hover:underline">Refunds</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs">
            Made with <Heart size={13} className="inline fill-rose-500 text-rose-500" /> for India’s student community.
          </span>
        </div>
      </div>
    </footer>
  );
}
