"use client";

import React from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Mascot from "@/components/ui/Mascot";
import { User, Calendar, RefreshCw, Check, Copy, Save } from "lucide-react";

export default function ProfilePage() {
  const [skills, setSkills] = React.useState<string[]>([
    "ai",
    "python",
    "web",
    "react",
  ]);
  const [skillInput, setSkillInput] = React.useState("");
  const [city, setCity] = React.useState("Bengaluru");
  const [year, setYear] = React.useState("3");
  const [token, setToken] = React.useState("sq-usr-" + Math.random().toString(36).substring(2, 10));
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = skillInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const regenerateToken = () => {
    const newToken = "sq-usr-" + Math.random().toString(36).substring(2, 10);
    setToken(newToken);
  };

  const calendarUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/calendar/${token}`
      : `/api/calendar/${token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(calendarUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center gap-4 border-b-2 border-ink pb-6">
        <div className="w-14 h-14 rounded-full bg-lime border-2 border-ink shadow-solid-sm flex items-center justify-center shrink-0">
          <Mascot size={42} showFlag={false} expression="happy" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink">
            Hacker Profile
          </h1>
          <p className="text-xs sm:text-sm text-ink-500">
            Personalize your match score and manage your private calendar feed.
          </p>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="retro-card p-6 bg-white space-y-6">
        <h2 className="font-display font-bold text-lg text-ink">
          Student Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-ink-700 block mb-1">
              Current College Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 bg-parchment/60 border border-ink rounded-xl text-xs sm:text-sm font-semibold text-ink focus:ring-2 focus:ring-lime"
            >
              <option value="1">1st Year (Fresher)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Junior)</option>
              <option value="4">4th Year (Senior)</option>
              <option value="pg">Postgraduate / Masters</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-700 block mb-1">
              Primary City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bengaluru, Delhi, Pune"
              className="w-full px-3 py-2 bg-parchment/60 border border-ink rounded-xl text-xs sm:text-sm font-semibold text-ink focus:ring-2 focus:ring-lime"
            />
          </div>
        </div>

        {/* Skills Tag Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-ink-700 block">
            Skills & Tech Interests (Used for Match Scoring)
          </label>
          <div className="flex flex-wrap gap-1.5 min-h-8 mb-2">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-parchment-subtle text-ink border border-ink shadow-[1px_1px_0px_#0B1033]"
              >
                <span>#{s}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="hover:text-urgent"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={addSkill} className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add skill (e.g. flutter, rust, ml)..."
              className="flex-1 px-3 py-1.5 bg-parchment/60 border border-ink rounded-xl text-xs font-semibold focus:ring-2 focus:ring-lime"
            />
            <Button variant="outline" size="sm" type="submit">
              Add
            </Button>
          </form>
        </div>

        <div className="pt-2">
          <Button
            variant="lime"
            size="md"
            onClick={handleSave}
            icon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          >
            {saved ? "Profile Saved!" : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* Private Calendar Feed Subscription Card */}
      <div className="retro-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-parchment-border pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ink" />
            <h2 className="font-display font-bold text-lg text-ink">
              Private Calendar Feed (.ics)
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={regenerateToken}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Regenerate Token
          </Button>
        </div>

        <p className="text-xs text-ink-600">
          Subscribe to this URL in Google Calendar, Apple Calendar, or Outlook to automatically sync deadlines for your bookmarked hackathons.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            readOnly
            value={calendarUrl}
            className="w-full px-3 py-2 bg-parchment/60 border border-ink rounded-xl text-xs font-mono select-all"
          />
          <Button
            variant="lime"
            size="md"
            onClick={handleCopy}
            className="w-full sm:w-auto shrink-0"
            icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? "Copied!" : "Copy URL"}
          </Button>
        </div>
      </div>
    </div>
  );
}
