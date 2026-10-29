"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  MapPin,
  Trophy,
  Users,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SubmitPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    organizer: "",
    organizer_type: "college",
    mode: "online",
    city: "",
    venue: "",
    start_date: "",
    end_date: "",
    reg_deadline: "",
    eligibility: "Open to all students",
    team_min: 1,
    team_max: 4,
    prize_amount_inr: 50000,
    prize_text: "₹50,000 cash pool + certificates",
    apply_url: "",
    contact_email: "",
  });

  const validateStep = (currentStep: number) => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.title.trim() || form.title.trim().length < 3) {
        errs.title = "Event name must be at least 3 characters";
      }
      if (!form.organizer.trim() || form.organizer.trim().length < 2) {
        errs.organizer = "Organiser name is required";
      }
    }

    if (currentStep === 2) {
      if (!form.reg_deadline) {
        errs.reg_deadline = "Registration deadline is required for countdown clocks";
      }
      if (form.mode !== "online" && !form.city.trim()) {
        errs.city = "City is required for on-campus / offline events";
      }
    }

    if (currentStep === 3) {
      if (!form.apply_url.trim()) {
        errs.apply_url = "Official registration or portal link is required";
      } else {
        try {
          new URL(form.apply_url);
        } catch {
          errs.apply_url = "Please enter a valid URL (starting with http:// or https://)";
        }
      }
      if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
        errs.contact_email = "Please enter a valid email address";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(3, prev + 1) as any);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/hackathons/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit hackathon");
      }

      setSubmitted(true);
      toast.success("Event submitted successfully for review!");
    } catch (err: any) {
      toast.error(err?.message || "Could not submit event. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="sq-departure-board-container" style={{ maxWidth: "640px" }}>
        <div className="sq-departure-row p-8 text-center" style={{ borderRadius: "12px" }}>
          <div className="w-12 h-12 bg-emerald-100 text-boardGreen rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="font-condensed font-extrabold text-2xl uppercase tracking-wide text-navy mb-2">
            Event Submitted for Verification
          </h1>
          <p className="text-sm text-mutedText leading-relaxed mb-6">
            Thank you! <strong>{form.title}</strong> has entered our verification queue. Our team reviews all student and community submissions within 12 hours to verify official dates and registration links before listing them on the live departure board.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-navy text-signal-yellow">
              <Link href="/discover">Back to Departures</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="sq-departure-board-container" style={{ maxWidth: "760px" }}>
      {/* Header Banner */}
      <section className="sq-board-header-banner" aria-label="Submit Hackathon Banner">
        <div className="sq-board-header-top">
          <span className="sq-board-station-tag">
            <PlusCircle size={15} /> Organiser Submission
          </span>
          <span className="sq-board-live-indicator">
            <span className="sq-live-pulse-green" aria-hidden="true" />
            Verified within 12h
          </span>
        </div>

        <h1 className="sq-board-title">Submit a Hackathon</h1>
        <p className="sq-board-subtitle">
          Hosting a campus or community hackathon? List it on the departure board for thousands of student builders across India.
        </p>

        {/* Progress Stepper */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-navy-border">
          {[
            { num: 1, label: "Event Basics" },
            { num: 2, label: "Schedule & Mode" },
            { num: 3, label: "Prizes & Links" },
          ].map((s) => (
            <div key={s.num} className="flex-1 flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-condensed font-bold text-xs ${
                  step === s.num
                    ? "bg-signal-yellow text-navy"
                    : step > s.num
                    ? "bg-boardGreen text-white"
                    : "bg-[#1E3156] text-gray-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span className="text-xs font-medium text-gray-300 hidden sm:inline">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Guarantee Strip */}
      <div className="p-4 bg-sky-50 border-l-4 border-sky-600 rounded mb-6 text-xs text-sky-950 flex items-start gap-2.5">
        <ShieldCheck size={18} className="text-sky-600 shrink-0 mt-0.5" />
        <div>
          <strong>Quality &amp; Authenticity Guarantee:</strong> Every event is checked against official university notifications or organizer portals before appearing on the public feed to protect students from ghost competitions.
        </div>
      </div>

      {/* Multi-Step Form */}
      <form onSubmit={handleSubmit} className="sq-departure-row p-6">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display font-extrabold text-xl text-navy mb-4">
              Step 1: Event Identity &amp; Host
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-navy mb-1">
                Event Name *
              </label>
              <input
                type="text"
                placeholder="e.g. HackSprint 2026"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`w-full p-2.5 bg-gray-50 border rounded text-sm text-navy focus:outline-navy min-h-[44px] ${
                  errors.title ? "border-coral" : "border-gray-300"
                }`}
              />
              {errors.title && <p className="text-xs text-coral mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy mb-1">
                Organiser / University Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Department of Computer Science, PES University"
                value={form.organizer}
                onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                className={`w-full p-2.5 bg-gray-50 border rounded text-sm text-navy focus:outline-navy min-h-[44px] ${
                  errors.organizer ? "border-coral" : "border-gray-300"
                }`}
              />
              {errors.organizer && <p className="text-xs text-coral mt-1">{errors.organizer}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1">
                  Organiser Type
                </label>
                <select
                  value={form.organizer_type}
                  onChange={(e) => setForm({ ...form, organizer_type: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-navy min-h-[44px]"
                >
                  <option value="college">College / University</option>
                  <option value="company">Company / Enterprise</option>
                  <option value="community">Developer Community</option>
                  <option value="government">Government Department</option>
                  <option value="nonprofit">Non-Profit Foundation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1">
                  Eligibility Criteria
                </label>
                <input
                  type="text"
                  placeholder="e.g. All undergraduate & engineering students"
                  value={form.eligibility}
                  onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-navy min-h-[44px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Mode */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-condensed font-extrabold text-xl uppercase tracking-wide text-navy mb-4">
              Step 2: Dates, Deadline &amp; Location
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-navy mb-1">
                Registration Deadline (Crucial for live countdown) *
              </label>
              <input
                type="datetime-local"
                value={form.reg_deadline}
                onChange={(e) => setForm({ ...form, reg_deadline: e.target.value })}
                className={`w-full p-2.5 bg-gray-50 border rounded text-sm text-navy focus:outline-navy min-h-[44px] ${
                  errors.reg_deadline ? "border-coral" : "border-gray-300"
                }`}
              />
              {errors.reg_deadline && (
                <p className="text-xs text-coral mt-1">{errors.reg_deadline}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1">
                  Hackathon Start Date
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-navy min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1">
                  Hackathon End Date
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-navy min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1">
                  Format / Mode
                </label>
                <select
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-navy min-h-[44px]"
                >
                  <option value="online">Online / Virtual</option>
                  <option value="offline">On-Campus / In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {form.mode !== "online" && (
                <div>
                  <label className="block text-xs font-bold uppercase text-navy mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Delhi, Mumbai"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={`w-full p-2.5 bg-gray-50 border rounded text-sm text-navy focus:outline-navy min-h-[44px] ${
                      errors.city ? "border-coral" : "border-gray-300"
                    }`}
                  />
                  {errors.city && <p className="text-xs text-coral mt-1">{errors.city}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Prizes & Links */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-condensed font-extrabold text-xl uppercase tracking-wide text-navy mb-4">
              Step 3: Prizes, Team Size &amp; Official URL
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1">
                  Prize Pool (INR)
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={form.prize_amount_inr}
                  onChange={(e) => setForm({ ...form, prize_amount_inr: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-navy min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1">
                  Prize Summary Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹50,000 cash pool + credits"
                  value={form.prize_text}
                  onChange={(e) => setForm({ ...form, prize_text: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-navy min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1">
                  Min Team Size
                </label>
                <input
                  type="number"
                  value={form.team_min}
                  onChange={(e) => setForm({ ...form, team_min: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-navy min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1">
                  Max Team Size
                </label>
                <input
                  type="number"
                  value={form.team_max}
                  onChange={(e) => setForm({ ...form, team_max: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-navy min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy mb-1">
                Registration / Apply URL *
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={form.apply_url}
                onChange={(e) => setForm({ ...form, apply_url: e.target.value })}
                className={`w-full p-2.5 bg-gray-50 border rounded text-sm text-navy focus:outline-navy min-h-[44px] ${
                  errors.apply_url ? "border-coral" : "border-gray-300"
                }`}
              />
              {errors.apply_url && (
                <p className="text-xs text-coral mt-1">{errors.apply_url}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy mb-1">
                Organiser Contact Email (For verification query)
              </label>
              <input
                type="email"
                placeholder="contact@college.edu"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className={`w-full p-2.5 bg-gray-50 border rounded text-sm text-navy focus:outline-navy min-h-[44px] ${
                  errors.contact_email ? "border-coral" : "border-gray-300"
                }`}
              />
              {errors.contact_email && (
                <p className="text-xs text-coral mt-1">{errors.contact_email}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-200">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="border-2 border-navy text-navy font-bold rounded-full shadow-[2px_2px_0_#0F1B33] min-h-[44px]"
            >
              <ArrowLeft size={16} /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-navy text-white hover:text-brand font-bold rounded-full border-2 border-navy shadow-[3px_3px_0_#0F1B33] min-h-[44px] px-6"
            >
              Next Step <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              className="bg-navy text-white hover:text-brand font-bold rounded-full border-2 border-navy shadow-[3px_3px_0_#0F1B33] min-h-[44px] px-6"
            >
              {loading ? "Submitting for verification…" : "Submit Event for Verification"}
            </Button>
          )}
        </div>
      </form>
    </main>
  );
}
