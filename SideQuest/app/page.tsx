import React from "react";
import Link from "next/link";
import Mascot from "@/components/ui/Mascot";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import HackathonCard from "@/components/hackathon/HackathonCard";
import { getHackathons } from "@/lib/db/hackathons";
import {
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  Bell,
  CheckCircle2,
  Share2,
} from "lucide-react";

export default async function HomePage() {
  // Fetch closing soon hackathons for the live radar section
  const { hackathons: closingSoonList } = await getHackathons({
    status: "closing_soon",
    limit: 3,
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b-2 border-ink bg-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Column: Headlines & Search */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              {/* Radar Live Chip */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-urgent-light border-2 border-urgent text-urgent text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-urgent" />
                <span>LIVE RADAR: Closing soon hackathons tracked</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-6.5xl text-ink tracking-tight leading-[1.08]">
                Every college hackathon.{" "}
                <br className="hidden sm:inline" />
                One place.{" "}
                <span className="relative inline-block text-ink underline decoration-lime decoration-4 underline-offset-4">
                  Zero missed deadlines.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-ink-700 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                SideQuest gathers hackathons from Unstop, Devfolio, MLH, and campus clubs into one searchable list with live countdowns and Telegram alerts. Built for Indian college students.
              </p>

              {/* Quick Search Box */}
              <form
                action="/discover"
                method="GET"
                className="max-w-md mx-auto lg:mx-0 flex items-center gap-2 p-1.5 bg-white border-2 border-ink rounded-full shadow-solid-md"
              >
                <div className="pl-3.5 text-ink-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="q"
                  placeholder="Search by skill, topic, or city..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-ink placeholder:text-ink-500 focus:outline-none"
                />
                <Button variant="lime" size="sm" type="submit" className="shrink-0">
                  Find
                </Button>
              </form>

              {/* Source Platform Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-bold text-ink-500">
                <span>Aggregating:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-parchment-border text-ink">
                  Unstop
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-parchment-border text-ink">
                  Devfolio
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-parchment-border text-ink">
                  MLH
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-parchment-border text-ink">
                  College Clubs
                </span>
              </div>
            </div>

            {/* Right Column: Mascot Showcase */}
            <div className="lg:w-96 flex flex-col items-center justify-center relative">
              <div className="relative">
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-lime/30 border-4 border-ink flex items-center justify-center shadow-solid-xl">
                  <Mascot size={220} expression="excited" />
                </div>

                {/* Floating deadline speech bubble */}
                <div className="absolute -top-3 -right-2 sm:-right-4 bg-white border-2 border-ink shadow-solid-md px-3 py-1.5 rounded-2xl text-xs font-extrabold text-urgent flex items-center gap-1.5 animate-bounce">
                  <Clock className="w-4 h-4" />
                  <span>3 close within 48h!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Radar Section (Closing Soon) */}
      <section className="py-14 border-b-2 border-ink bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-urgent animate-ping" />
                <span className="text-xs font-extrabold text-urgent uppercase tracking-wider">
                  Deadline Radar
                </span>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink mt-1">
                Closing in the Next 72 Hours
              </h2>
              <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
                These registration windows are about to shut. Register before time runs out.
              </p>
            </div>

            <Link href="/discover?status=closing_soon">
              <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                View All Closing Soon
              </Button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {closingSoonList.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Three Pillars (Why SideQuest) */}
      <section className="py-16 bg-parchment border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-lime text-ink border border-ink rounded">
              Built for Student Hackers
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink">
              Everything you need to never miss an opportunity
            </h2>
            <p className="text-sm text-ink-500">
              No sponsored junk, no login walls to browse, zero spam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="retro-card p-6 bg-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-urgent-light border-2 border-ink flex items-center justify-center">
                <Clock className="w-6 h-6 text-urgent" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink">
                Deadline-First Radar
              </h3>
              <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
                Most hackathon sites hide deadlines deep inside tabs. SideQuest puts live countdown chips right on every card and alerts you at 48h and 24h.
              </p>
            </div>

            <div className="retro-card p-6 bg-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-lime border-2 border-ink flex items-center justify-center">
                <Compass className="w-6 h-6 text-ink" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink">
                Unified Multi-Source
              </h3>
              <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
                We crawl Unstop, Devfolio, MLH, and community club submissions every 6 hours. One place, deduplicated and normalised.
              </p>
            </div>

            <div className="retro-card p-6 bg-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-accentBlue-soft border-2 border-ink flex items-center justify-center">
                <Bell className="w-6 h-6 text-ink" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink">
                Private Calendar & Telegram
              </h3>
              <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
                Subscribe your bookmarks directly into Google Calendar via private .ics link, or receive instant Telegram alerts when a match appears.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Banner CTA */}
      <section className="py-14 bg-ink text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Ready to find your next winning hackathon?
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto">
            100% free, no login needed to search. Filter by online/offline, city, prize, and themes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/discover">
              <Button variant="lime" size="lg" icon={<Compass className="w-5 h-5" />}>
                Explore Hackathons Now
              </Button>
            </Link>
            <Link href="/submit">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent text-white border-white hover:bg-white/10"
              >
                Submit College Hackathon
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
