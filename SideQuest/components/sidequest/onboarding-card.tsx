"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Sparkles,
  X,
  MapPin,
  Send,
  ArrowRight,
  ArrowLeft,
  Terminal,
  Cpu,
  Layers,
  Globe2,
  BellRing,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEMES, CITIES } from "@/lib/hackathons";
import { toast } from "sonner";

interface OnboardingCardProps {
  savedCount?: number;
  hasActiveFilters?: boolean;
  onFilterPreset?: (tag: string) => void;
  onComplete?: (skills: string[], city: string) => void;
}

const PRESET_TRACKS = [
  {
    name: "AI & ML",
    icon: Cpu,
    tags: ["AI / ML", "Python", "Data"],
  },
  {
    name: "Full Stack",
    icon: Layers,
    tags: ["Web development", "React", "TypeScript"],
  },
  {
    name: "Web3 & Crypto",
    icon: Terminal,
    tags: ["Blockchain", "Web3", "Rust"],
  },
  {
    name: "Open Innovation",
    icon: Globe2,
    tags: ["Open innovation", "Fintech", "Healthtech"],
  },
];

const EXTENDED_SKILLS = [
  ...THEMES,
  "Python",
  "React",
  "TypeScript",
  "Rust",
  "Solidity",
  "Flutter",
];

export function OnboardingCard({
  savedCount = 0,
  hasActiveFilters = false,
  onFilterPreset,
  onComplete,
}: OnboardingCardProps) {
  const [dismissed, setDismissed] = useState(true);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "AI / ML",
    "Web development",
  ]);
  const [selectedCity, setSelectedCity] = useState<string>("Pan India");
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("buildseek_onboarding_v2_dismissed");
      if (!isDismissed) {
        setDismissed(false);
      }
      const savedSkills = localStorage.getItem("buildseek_user_skills");
      if (savedSkills) {
        try {
          const parsed = JSON.parse(savedSkills);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedInterests(parsed);
          }
        } catch {}
      }
      const savedCity = localStorage.getItem("buildseek_user_city");
      if (savedCity) {
        setSelectedCity(savedCity);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("buildseek_onboarding_v2_dismissed", "true");
    }
  };

  const toggleInterest = (theme: string) => {
    setSelectedInterests((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const applyTrackPreset = (tags: string[]) => {
    setSelectedInterests((prev) => {
      const combined = Array.from(new Set([...prev, ...tags]));
      return combined;
    });
    toast.success(`Added ${tags.join(", ")} to your builder stack`);
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("buildseek_user_skills", JSON.stringify(selectedInterests));
      localStorage.setItem("buildseek_user_interests", JSON.stringify(selectedInterests));
      localStorage.setItem("buildseek_user_city", selectedCity);
      localStorage.setItem("buildseek_onboarding_v2_dismissed", "true");

      const existingXp = Number(localStorage.getItem("buildseek_builder_xp") || "0");
      localStorage.setItem("buildseek_builder_xp", String(existingXp + 100));
    }

    if (onComplete) {
      onComplete(selectedInterests, selectedCity);
    } else if (onFilterPreset && selectedInterests[0]) {
      onFilterPreset(selectedInterests[0]);
    }

    setShowCelebration(true);
    toast.success("Boarding pass activated! +100 Builder XP earned.", {
      description: "Live departure board is now tuned to your stack & city.",
    });

    setTimeout(() => {
      setDismissed(true);
    }, 2800);
  };

  if (dismissed) return null;

  return (
    <aside
      className="sq-onboarding-pass"
      aria-label="Builder onboarding boarding pass"
    >
      {/* Station Pass Header */}
      <div className="sq-onboarding-pass-header">
        <div className="flex items-center gap-3">
          <span className="sq-board-station-tag font-mono text-[11px] tracking-wider uppercase bg-[#0B1033] text-[#D4F933] border border-[#D4F933]/30 px-2.5 py-0.5 rounded">
            STATION CLEARANCE &bull; STEP {currentStep} OF 3
          </span>
          <div className="sq-onboarding-pass-steps hidden sm:flex">
            <div
              className={`sq-onboarding-step-indicator ${
                currentStep >= 1 ? "is-active" : ""
              } ${currentStep > 1 ? "is-done" : ""}`}
            />
            <div
              className={`sq-onboarding-step-indicator ${
                currentStep >= 2 ? "is-active" : ""
              } ${currentStep > 2 ? "is-done" : ""}`}
            />
            <div
              className={`sq-onboarding-step-indicator ${
                currentStep === 3 ? "is-active" : ""
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-300 font-mono hidden md:inline">
            REWARD: +100 XP
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-gray-300 hover:text-white inline-flex items-center gap-1 p-1 rounded transition-colors"
            aria-label="Skip onboarding"
          >
            <span>Skip</span>
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="sq-onboarding-pass-body">
        {showCelebration ? (
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#D4F933] text-[#0B1033] border-2 border-[#0B1033] shadow-[2px_2px_0_#0B1033] mx-auto animate-bounce">
              <Award size={30} />
            </div>
            <h2 className="font-condensed font-extrabold text-2xl uppercase tracking-wide text-navy">
              Boarding Pass Activated! +100 XP
            </h2>
            <p className="text-xs text-mutedText max-w-md mx-auto">
              Your departures are now customized for{" "}
              <strong>{selectedCity}</strong> and matched against{" "}
              <strong>{selectedInterests.slice(0, 3).join(", ")}</strong>.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => setDismissed(true)}
                className="bg-navy text-[#D4F933] font-condensed font-bold uppercase tracking-wider border-2 border-navy"
              >
                Explore Live Departures <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Pick Tech Stack */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-condensed font-extrabold text-2xl uppercase tracking-wide text-navy flex items-center gap-2">
                    <Terminal size={22} className="text-[#0B1033]" />
                    1. Tune Your Tech Radar
                  </h2>
                  <p className="text-xs text-mutedText mt-1">
                    Select your primary skills and domains. We score every departure on the board against these so you never miss relevant prizes.
                  </p>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-mutedText block mb-1.5 font-mono">
                    Quick Track Presets:
                  </span>
                  <div className="sq-onboarding-quick-presets">
                    {PRESET_TRACKS.map((track) => {
                      const Icon = track.icon;
                      return (
                        <button
                          key={track.name}
                          type="button"
                          onClick={() => applyTrackPreset(track.tags)}
                          className="sq-onboarding-preset-pill"
                          title={`Select ${track.tags.join(", ")}`}
                        >
                          <Icon size={13} />
                          <span>+ {track.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Skill Pills */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-mutedText font-mono">
                      All Technologies &amp; Themes ({selectedInterests.length} selected):
                    </span>
                    {selectedInterests.length > 0 && (
                      <span className="sq-onboarding-completed-badge text-[11px]">
                        <Check size={11} /> Ready to match
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {EXTENDED_SKILLS.map((theme) => {
                      const isSelected = selectedInterests.includes(theme);
                      return (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => toggleInterest(theme)}
                          className={`sq-chip-btn ${isSelected ? "is-selected" : ""}`}
                          style={{
                            fontSize: "12px",
                            padding: "6px 13px",
                            minHeight: "36px",
                          }}
                        >
                          {isSelected && <Check size={13} />}
                          <span>{theme}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="text-xs text-mutedText hover:underline"
                  >
                    Skip setup
                  </button>
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="bg-navy text-[#D4F933] font-condensed font-bold uppercase tracking-wider border-2 border-navy hover:bg-navy/90"
                  >
                    <span>Next: Set Campus City</span>
                    <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Choose City */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-condensed font-extrabold text-2xl uppercase tracking-wide text-navy flex items-center gap-2">
                    <MapPin size={22} className="text-[#0B1033]" />
                    2. Select Your Campus Hub
                  </h2>
                  <p className="text-xs text-mutedText mt-1">
                    Spotlight nearby college hackathons with free travel or lodging, alongside national remote departures.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {CITIES.map((city) => {
                    const isSelected = selectedCity === city;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedCity(city)}
                        className={`sq-chip-btn ${isSelected ? "is-selected" : ""}`}
                        style={{
                          fontSize: "12px",
                          padding: "8px 15px",
                          minHeight: "40px",
                        }}
                      >
                        {isSelected && <Check size={13} />}
                        <span>{city}</span>
                        {city === "Pan India" && (
                          <span className="text-[10px] opacity-70 ml-1">(Online)</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600 shrink-0" />
                  <span>
                    Selected: <strong>{selectedCity}</strong> &bull; Hackathons in this city will get boosted relevance on your departure schedule.
                  </span>
                </div>

                {/* Navigation actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-navy font-bold inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="bg-navy text-[#D4F933] font-condensed font-bold uppercase tracking-wider border-2 border-navy hover:bg-navy/90"
                  >
                    <span>Next: Live Radar Alerts</span>
                    <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Connect Telegram Alerts */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-condensed font-extrabold text-2xl uppercase tracking-wide text-navy flex items-center gap-2">
                    <BellRing size={22} className="text-[#0B1033]" />
                    3. Connect Deadline Radar (@BuildSeekAlertsBot)
                  </h2>
                  <p className="text-xs text-mutedText mt-1">
                    Never lose registration spots to midnight deadline confusion. Get 24h &amp; 3h countdown pings directly on Telegram.
                  </p>
                </div>

                <div className="p-4 bg-sky-50 rounded-xl border-2 border-sky-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-950 font-mono">
                      <Send size={15} className="text-[#229ED9]" />
                      <span>@BuildSeekAlertsBot</span>
                      <span className="bg-sky-200 text-sky-800 text-[10px] px-1.5 py-0.2 rounded font-mono">
                        INSTANT
                      </span>
                    </div>
                    <p className="text-xs text-sky-800">
                      Syncs bookmarks and sends reminders before Devfolio, Unstop, and Devpost forms close.
                    </p>
                  </div>

                  <a
                    href="https://t.me/BuildSeekAlertsBot?start=onboarding"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTelegramConnected(true)}
                    className="bg-[#229ED9] hover:bg-[#1E88C7] text-white text-xs font-bold px-4 py-2.5 rounded-lg inline-flex items-center justify-center gap-1.5 shadow-[2px_2px_0_#0F1B33] border border-[#0F1B33] shrink-0"
                  >
                    <Send size={13} />
                    <span>{telegramConnected ? "Connected" : "Open Telegram Bot"}</span>
                    <ArrowRight size={13} />
                  </a>
                </div>

                {/* Navigation actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-navy font-bold inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleFinish}
                    className="bg-navy text-[#D4F933] font-condensed font-extrabold uppercase tracking-wider border-2 border-navy hover:bg-navy/90 text-sm px-4 py-2 shadow-[2px_2px_0_#0B1033]"
                  >
                    <span>Activate Passport &amp; View Departures (+100 XP)</span>
                    <ArrowRight size={15} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
