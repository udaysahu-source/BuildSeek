import React from "react";
import Link from "next/link";
import Mascot from "@/components/ui/Mascot";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Sparkles, ArrowRight, Compass, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl w-full text-center space-y-6">
        {/* Radar Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-urgent-light border-2 border-urgent text-urgent text-xs font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-urgent" />
          <span>LIVE RADAR: Closing soon hackathons tracked</span>
        </div>

        {/* Mascot Header */}
        <div className="flex justify-center my-2">
          <div className="relative">
            <Mascot size={130} expression="excited" />
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-ink tracking-tight leading-tight">
          Every Indian College Hackathon.{" "}
          <span className="underline decoration-lime decoration-4 underline-offset-4">
            Zero Missed Deadlines.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-ink-700 max-w-xl mx-auto leading-relaxed">
          SideQuest scans Unstop, Devfolio, MLH, and campus clubs so you never have to check 5 different platforms. Instant deadline alerts, zero spam.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/discover">
            <Button variant="lime" size="lg" icon={<Compass className="w-5 h-5" />}>
              Explore Hackathons
            </Button>
          </Link>
          <Link href="/styleguide">
            <Button variant="outline" size="lg" icon={<Sparkles className="w-5 h-5" />}>
              View Design System
            </Button>
          </Link>
        </div>

        {/* Value Props Pill Row */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="retro-card p-4 flex items-start gap-3 bg-white">
            <div className="w-8 h-8 rounded-full bg-lime border border-ink flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-ink" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-ink">Deadline Radar</h4>
              <p className="text-xs text-ink-500 mt-0.5">Live countdown chips. 48h and 24h reminders before closing.</p>
            </div>
          </div>

          <div className="retro-card p-4 flex items-start gap-3 bg-white">
            <div className="w-8 h-8 rounded-full bg-accentBlue-soft border border-ink flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-ink" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-ink">Multi-Source</h4>
              <p className="text-xs text-ink-500 mt-0.5">Unstop + Devfolio + MLH + student submissions in one place.</p>
            </div>
          </div>

          <div className="retro-card p-4 flex items-start gap-3 bg-white">
            <div className="w-8 h-8 rounded-full bg-lime-light border border-ink flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-ink" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-ink">Rs 0 Budget</h4>
              <p className="text-xs text-ink-500 mt-0.5">Free tiers only. Fast, open, no login required to browse.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
