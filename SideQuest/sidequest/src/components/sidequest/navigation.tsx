import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Compass, ArrowUpRight, Bookmark, UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from './auth-state';

const items = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/quest-log", label: "Quest Log", icon: Bookmark },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function Logo({ footer = false }: { footer?: boolean }) {
  return <Link to="/" className={`sq-logo ${footer ? "sq-logo-footer" : ""}`} aria-label="SideQuest home"><span className="sq-logo-icon"><Zap size={21} fill="currentColor" /></span>sidequest<span className="sq-logo-dot">.</span></Link>;
}

export function Navigation() {
  const { pathname } = useLocation();
  const {user}=useAuth();
  const activePath = pathname.startsWith('/h/') ? '/discover' : pathname;
  return <><header className="sq-nav"><Logo /><nav aria-label="Main navigation" className="sq-nav-links">{items.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={`sq-nav-item ${(activePath === to || (activePath === "/" && to === "/discover")) ? "is-active" : ""}`}><Icon size={17} /><span>{to==='/profile'?(user?'Account':'Log in'):label}</span></Link>)}</nav><Button asChild size="sm" className="sq-submit-nav"><Link to="/submit">Submit event <ArrowUpRight size={16} /></Link></Button></header><nav aria-label="Mobile navigation" className="sq-bottom-nav">{items.map(({ to, label, icon: Icon }) => <Link key={to} to={to} aria-label={to==='/profile'?(user?'Account':'Log in'):label} className={`sq-mobile-item ${(activePath === to || (activePath === "/" && to === "/discover")) ? "is-active" : ""}`}><Icon size={21} /><span>{to==='/profile'?(user?'Account':'Log in'):label}</span></Link>)}</nav></>;
}