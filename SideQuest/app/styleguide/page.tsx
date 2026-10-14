import React from "react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/Badge";
import Mascot from "@/components/ui/Mascot";
import HackathonCard, { HackathonCardData } from "@/components/hackathon/HackathonCard";
import { Sparkles, ArrowRight, Bell, Bookmark, Compass } from "lucide-react";

const sampleCards: HackathonCardData[] = [
  {
    id: "sample-1",
    title: "Bengaluru Web3 Buildathon 2026",
    organizer: "Devfolio Community",
    source: "devfolio",
    source_url: "https://devfolio.co",
    mode: "hybrid",
    city: "Bengaluru",
    reg_deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours left
    start_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    prize_text: "₹5,00,000 Pool",
    prize_amount_inr: 500000,
    team_min: 2,
    team_max: 4,
    tags: ["ai", "web3", "bengaluru"],
    is_bookmarked: true,
  },
  {
    id: "sample-2",
    title: "Delhi Tech Innovate Summit",
    organizer: "DTU Coding Club",
    source: "unstop",
    source_url: "https://unstop.com",
    mode: "offline",
    city: "New Delhi",
    reg_deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days
    start_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    prize_text: "₹2,00,000",
    prize_amount_inr: 200000,
    team_min: 1,
    team_max: 3,
    tags: ["open-innovation", "hardware"],
    is_bookmarked: false,
  },
  {
    id: "sample-3",
    title: "Global AI Agent Sprint",
    organizer: "Google Developers Group",
    source: "community",
    source_url: "https://developers.google.com",
    mode: "online",
    reg_deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // closed
    start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    prize_text: "$10,000 Credits & Swag",
    prize_amount_inr: 800000,
    team_min: 1,
    team_max: 4,
    tags: ["gemini", "agents", "python"],
    is_bookmarked: false,
  },
];

export default function StyleguidePage() {
  const colorSwatches = [
    { name: "Parchment (Canvas)", hex: "#FFFBE8", bg: "bg-parchment", border: "border-ink" },
    { name: "Parchment Subtle", hex: "#F2F0E2", bg: "bg-parchment-subtle", border: "border-parchment-border" },
    { name: "Ink 950 (Primary)", hex: "#0B1033", bg: "bg-ink", text: "text-white" },
    { name: "Ink 900", hex: "#1C2350", bg: "bg-ink-900", text: "text-white" },
    { name: "Ink 500 (Muted)", hex: "#6A6F94", bg: "bg-ink-500", text: "text-white" },
    { name: "Lime (Accent & Mascot)", hex: "#B6F500", bg: "bg-lime", border: "border-ink" },
    { name: "Soft Lime", hex: "#EAF8C8", bg: "bg-lime-light", border: "border-ink" },
    { name: "Urgent Red", hex: "#C62F3A", bg: "bg-urgent", text: "text-white" },
    { name: "Warning Amber", hex: "#FFB020", bg: "bg-warning", border: "border-ink" },
    { name: "Accent Blue Soft", hex: "#DDE2FF", bg: "bg-accentBlue-soft", border: "border-ink" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Page Header */}
      <div className="border-b-2 border-ink pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-lime text-ink border border-ink rounded">
            Design System
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mt-2">
            SideQuest Design Tokens & Primitives
          </h1>
          <p className="text-ink-500 mt-1 text-sm max-w-2xl">
            Clean retro-neobrutalist tokens extracted from approved design mockups.
            Built for Indian college students: high contrast, fast loading, mobile-first.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Mascot size={54} expression="excited" />
        </div>
      </div>

      {/* 1. Color Palette */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-ink flex items-center gap-2">
          <span>1. Color Palette</span>
          <span className="text-xs font-mono font-normal text-ink-500">10 tokens</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {colorSwatches.map((swatch) => (
            <div
              key={swatch.name}
              className="retro-card p-3 flex flex-col justify-between h-28"
            >
              <div
                className={`w-full h-10 rounded-lg border ${swatch.bg} ${swatch.border || "border-black/10"}`}
              />
              <div className="mt-2">
                <p className="text-xs font-bold text-ink truncate">{swatch.name}</p>
                <p className="text-[11px] font-mono text-ink-500">{swatch.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-ink">
          2. Typography
        </h2>
        <div className="retro-card p-6 space-y-6">
          <div className="space-y-2 border-b border-parchment-border pb-4">
            <span className="text-xs font-mono text-ink-500">
              Font Display: Bricolage Grotesque (Headings)
            </span>
            <h1 className="font-display text-4xl font-extrabold text-ink">
              Never miss a hackathon deadline again.
            </h1>
            <h2 className="font-display text-2xl font-bold text-ink">
              Discover curated tech sprints across colleges in India.
            </h2>
            <h3 className="font-display text-xl font-bold text-ink">
              Closing soon: 18 hours remaining in registration.
            </h3>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-ink-500">
              Font Body: Inter (UI & Text)
            </span>
            <p className="text-sm text-ink-700 leading-relaxed max-w-2xl">
              SideQuest collects hackathons from Unstop, Devfolio, MLH, and college clubs into one
              searchable, filterable list with live deadline countdowns and alerts. Free tier
              forever, Rs 0 hosting budget.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Mascot */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-ink">
          3. Mascot Slime ("Sidey")
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="retro-card p-4 flex flex-col items-center justify-center text-center gap-2">
            <Mascot size={90} expression="happy" />
            <span className="text-xs font-bold text-ink">Happy (Default)</span>
          </div>
          <div className="retro-card p-4 flex flex-col items-center justify-center text-center gap-2">
            <Mascot size={90} expression="excited" />
            <span className="text-xs font-bold text-ink">Excited (Winner / CTA)</span>
          </div>
          <div className="retro-card p-4 flex flex-col items-center justify-center text-center gap-2">
            <Mascot size={90} expression="sleeping" />
            <span className="text-xs font-bold text-ink">Sleeping (Empty State)</span>
          </div>
          <div className="retro-card p-4 flex flex-col items-center justify-center text-center gap-2">
            <Mascot size={90} showFlag={false} expression="happy" />
            <span className="text-xs font-bold text-ink">Compact (Avatar / Icon)</span>
          </div>
        </div>
      </section>

      {/* 4. Buttons */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-ink">
          4. Buttons & Actions
        </h2>
        <div className="retro-card p-6 flex flex-wrap items-center gap-3">
          <Button variant="lime" icon={<Sparkles className="w-4 h-4" />}>
            Explore Hackathons
          </Button>
          <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
            Create Alert
          </Button>
          <Button variant="outline" icon={<Bookmark className="w-4 h-4" />}>
            Bookmark
          </Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete Alert</Button>

          <div className="w-full pt-4 border-t border-parchment-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-ink-500 mr-2">Sizes:</span>
            <Button variant="lime" size="sm">Small (32px)</Button>
            <Button variant="lime" size="md">Medium (40px)</Button>
            <Button variant="lime" size="lg">Large (48px)</Button>
          </div>
        </div>
      </section>

      {/* 5. Badges & Chips */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-ink">
          5. Chips & Countdown Badges
        </h2>
        <div className="retro-card p-6 flex flex-wrap items-center gap-2.5">
          <Badge variant="status-closing">Ends in 14h 22m</Badge>
          <Badge variant="status-open">Open for 12 days</Badge>
          <Badge variant="status-upcoming">Starts next week</Badge>
          <Badge variant="status-closed">Registration Closed</Badge>
          <Badge variant="mode-online">Online</Badge>
          <Badge variant="mode-offline">Bengaluru</Badge>
          <Badge variant="mode-hybrid">Hybrid</Badge>
          <Badge variant="prize">₹5,00,000 Pool</Badge>
          <Badge variant="tag">#ai</Badge>
          <Badge variant="tag">#web3</Badge>
          <Badge variant="tag">#beginners</Badge>
        </div>
      </section>

      {/* 6. Hackathon Cards */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-ink">
          6. Hackathon Cards (Desktop & Mobile Grid)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sampleCards.map((card) => (
            <HackathonCard key={card.id} hackathon={card} />
          ))}
        </div>
      </section>

      {/* 7. Mobile Pill Navigation Preview */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-ink">
          7. Floating Bottom Pill Nav (Mobile Preview)
        </h2>
        <div className="retro-card p-6 max-w-md mx-auto text-center space-y-4">
          <p className="text-xs text-ink-500">
            Rendered fixed at the bottom on viewports below 768px (tested at 390px).
            Below is a live inline replica:
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-ink border-2 border-ink shadow-solid-lg rounded-full">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-lime text-ink shadow-[1px_1px_0px_#0B1033]">
              <Compass className="w-4 h-4 stroke-[2.5]" />
              <span>Discover</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white/70">
              <Bookmark className="w-4 h-4 stroke-2" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white/70">
              <Bell className="w-4 h-4 stroke-2" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
