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
          </nav>
        </div>
        <div className="sq-footer-bottom">
          <span>© 2026 SideQuest. Built for the builders.</span>
          <span className="inline-flex items-center gap-1">
            Made with <Heart size={11} /> for India’s student community.
          </span>
        </div>
      </div>
    </footer>
  );
}
