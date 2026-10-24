import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  Filter,
  Globe2,
  Heart,
  Layers3,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/sidequest/mascot";
import { PhonePreview } from "@/components/sidequest/phone-preview";
import { SEED_HACKATHONS } from "@/seed/hackathons";

export default function HomePage() {
  const totalHackathons = SEED_HACKATHONS.length;
  const platformCount = new Set(SEED_HACKATHONS.map((h) => h.source)).size;
  const cityCount = new Set(SEED_HACKATHONS.map((h) => h.city).filter(Boolean)).size;
  return (
    <main>
      <section className="sq-hero">
        <div className="sq-container sq-hero-content">
          <div className="sq-hero-copy">
            <div className="sq-eyebrow sq-hero-eyebrow">
              <Zap size={12} fill="currentColor" /> Big ideas. Zero missed deadlines.
            </div>
            <h1>
              Every hackathon.
              <br />
              One place.
              <br />
              <span className="sq-highlight">
                Never miss
                <br />a deadline.
              </span>
            </h1>
            <p className="sq-hero-description">
              Your next big idea deserves a shot. Find hackathons across platforms and
              colleges, save your favourites, and show up before the clock runs out.
            </p>
            <div className="sq-hero-actions">
              <Button asChild size="lg">
                <Link href="/discover">
                  Browse hackathons <ArrowUpRight size={17} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/alerts">
                  <Send size={15} /> Get Telegram alerts
                </Link>
              </Button>
            </div>
            <div className="sq-social-proof">
              <div className="sq-avatars" aria-hidden="true">
                <span className="sq-avatar">A</span>
                <span className="sq-avatar">R</span>
                <span className="sq-avatar">S</span>
                <span className="sq-avatar">K</span>
              </div>
              <p>
                <strong>For the late-night idea people.</strong>
                <br />
                The campus builders. The “what if?” crowd.
              </p>
            </div>
          </div>
          <PhonePreview />
        </div>
      </section>

      <div className="sq-container sq-trust-strip">
        <span>
          <Globe2 /> All platforms. One feed.
        </span>
        <span>
          <ShieldCheck /> Free for students. Always.
        </span>
        <span>
          <Heart /> Built for India’s builders.
        </span>
      </div>

      {/* Live Data Pipeline Banner */}
      <div className="sq-container" style={{ margin: "20px auto 0" }}>
        <div className="sq-live-radar-strip">
          <span className="sq-radar-badge">
            <span className="sq-radar-live-dot" aria-hidden="true" />
            <strong>Live Multi-Platform Radar:</strong> Ingesting &amp; deduplicating daily from Devfolio, Unstop, Devpost &amp; Hack2skill.
          </span>
          <span className="sq-radar-subtext">
            Verified links • Canonical deduplication • Zero missed deadlines
          </span>
        </div>
      </div>

      <section className="sq-container sq-section">
        <SectionHeading
          eyebrow="Sound familiar?"
          title={<>Great ideas. Missed opportunities.</>}
          description="The hard part should be building something cool. Not finding where to build it."
        />
        <div className="sq-problem-grid">
          {[
            {
              icon: Layers3,
              title: "Too many tabs. Not enough time.",
              body: "One on Unstop. One on a college website. Another buried in a WhatsApp group. Finding a hackathon shouldn’t be a hackathon.",
            },
            {
              icon: Clock3,
              title: "“Wait, registration closed?”",
              body: "You find the perfect event. Promise to register later. Later turns into too late. We’ve all been there.",
            },
            {
              icon: Target,
              title: "Cool event. But is it for you?",
              body: "Online or on campus? Solo or squad? AI or open innovation? Cut through the noise and find your kind of challenge.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <article key={title} className="sq-problem-card">
              <div className="sq-icon-box">
                <Icon size={23} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sq-container sq-steps-section">
        <SectionHeading
          eyebrow="Less scrolling. More shipping."
          title="Your next quest, in three steps."
        />
        <div className="sq-steps-grid">
          {[
            {
              title: "Discover",
              description: "Find the hackathon that feels like your thing.",
              icon: Compass,
            },
            {
              title: "Save",
              description: "Keep your next big opportunities in one place.",
              icon: Bookmark,
            },
            {
              title: "Get reminded",
              description: "A little nudge before your window closes.",
              icon: Bell,
            },
          ].map(({ title, description, icon: Icon }, i) => (
            <article key={title} className="sq-step">
              <span className="sq-step-number">0{i + 1}</span>
              <Icon />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sq-features-section">
        <div className="sq-container">
          <SectionHeading
            eyebrow="Small superpowers. Big possibilities."
            title="Your unfair advantage."
            description="All the good stuff that gets you from “maybe I’ll join” to “we actually built that.”"
          />
          <div className="sq-bento">
            <article className="sq-feature">
              <div>
                <h3>Deadline Radar</h3>
                <p>
                  No mental maths. No missed moments. Live countdowns keep every deadline on
                  your radar.
                </p>
                <div className="sq-match-score">
                  <Clock3 size={12} /> 11d : 14h : 38m left · Next deadline
                </div>
              </div>
              <div className="sq-radar" aria-hidden="true">
                <Clock3 />
                <span className="sq-radar-dot" />
              </div>
            </article>
            <article className="sq-feature">
              <Filter />
              <h3>Your kind of hackathon.</h3>
              <p>
                Smart filters for your city, interests, team, and budget. Less noise. More
                “this is the one.”
              </p>
              <div className="sq-feature-filters">
                <span>Online</span>
                <span>AI / ML</span>
                <span>Students only</span>
              </div>
            </article>
            <article className="sq-feature">
              <Sparkles />
              <h3>Meet your match.</h3>
              <p>
                Challenges that line up with your skills and interests. A little less
                guesswork.
              </p>
              <div className="sq-match-score">
                <Check size={13} /> 94% match · Smart Skills Filter
              </div>
            </article>
            <article className="sq-feature">
              <CalendarDays />
              <h3>Make room for big ideas.</h3>
              <p>
                Your saved deadlines, right in your calendar. Keep the date. Build something
                great.
              </p>
            </article>
            <article className="sq-feature">
              <Send />
              <h3>A nudge, not noise.</h3>
              <p>
                New opportunities and timely reminders, straight to Telegram. Just the stuff
                you care about.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="sq-container" aria-label="Community counts">
        <div className="sq-counts">
          {[
            [`${totalHackathons}+`, "Active hackathons on radar"],
            [`${platformCount}`, "Ingestion sources aggregated"],
            [`${cityCount}+`, "Campus hubs & cities"],
            ["100%", "Free for students"],
          ].map(([number, label]) => (
            <div key={label}>
              <strong>{number}</strong>
              <p>{label}</p>
            </div>
          ))}
        </div>
        <p className="sq-sample-note">
          Real data aggregated from Devpost, Devfolio, Unstop, Hack2skill and student submissions.
        </p>
      </section>

      <section className="sq-container sq-organizer">
        <div>
          <span className="sq-eyebrow">Calling all campus organisers</span>
          <h2>
            Organising a hackathon?
            <br />
            Put it on the board.
          </h2>
          <p>The next great team might be one BuildSeek away.</p>
          <Button asChild>
            <Link href="/submit">
              Submit your hackathon <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
        <Mascot className="sq-organizer-mascot" />
      </section>

      {/* GEO & Search Engine Optimized FAQ Section */}
      <section className="sq-container" style={{ padding: "64px 16px", maxWidth: "860px" }}>
        <SectionHeading
          eyebrow="Frequently Asked Questions"
          title="Everything you need to know about BuildSeek."
          description="Clear answers for student hackers, campus leads, and tech organizers."
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "32px" }}>
          {[
            {
              q: "What is BuildSeek and how does it help Indian student builders?",
              a: "BuildSeek is an unified aggregator for Indian collegiate hackathons and builder competitions across Devfolio, Unstop, Devpost, Hack2skill, and premier campus festivals (IITs, NITs, BITS, IIITs). It equips builders with live deadline countdowns, skill-matching radar, calendar export, and direct Telegram reminders.",
            },
            {
              q: "Is BuildSeek free for students and participants?",
              a: "Yes. BuildSeek is 100% free for students and independent developers. You can discover hackathons, save events to your Quest Log, download iCal calendar feeds, and receive Telegram deadline pings with zero cost.",
            },
            {
              q: "How does the Telegram Deadline Radar work?",
              a: "By starting @BuildSeekAlertsBot on Telegram, you receive timely high-priority notifications 24 hours and 3 hours before registration closes for your bookmarked quests—completely free of promotional noise or spam.",
            },
            {
              q: "Can college organizers submit their hackathons to BuildSeek?",
              a: "Yes! Student clubs, IEEE student branches, and university tech societies can submit their events through our public submission portal at /submit. Events are verified and normalized into our live directory.",
            },
            {
              q: "How does BuildSeek protect user privacy and data security?",
              a: "BuildSeek complies with India's Digital Personal Data Protection (DPDP) Act 2023 and the GDPR. We enforce strict database Row-Level Security (RLS), avoid invasive behavioral cookies, and provide instant one-click cascading account erasure at /profile.",
            },
          ].map((item, idx) => (
            <details
              key={idx}
              style={{
                background: "var(--card)",
                border: "2px solid var(--border)",
                borderRadius: "16px",
                padding: "20px 24px",
              }}
            >
              <summary
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "var(--foreground)",
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{item.q}</span>
                <span style={{ fontSize: "20px", color: "var(--brand)" }}>+</span>
              </summary>
              <p style={{ marginTop: "14px", fontSize: "15px", color: "var(--muted-foreground)", lineHeight: 1.65 }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is BuildSeek and how does it help Indian student builders?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "BuildSeek is an unified aggregator for Indian collegiate hackathons and builder competitions across Devfolio, Unstop, Devpost, Hack2skill, and premier campus festivals (IITs, NITs, BITS, IIITs). It equips builders with live deadline countdowns, skill-matching radar, calendar export, and direct Telegram reminders.",
                },
              },
              {
                "@type": "Question",
                name: "Is BuildSeek free for students and participants?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. BuildSeek is 100% free for students and independent developers. You can discover hackathons, save events to your Quest Log, download iCal calendar feeds, and receive Telegram deadline pings with zero cost.",
                },
              },
              {
                "@type": "Question",
                name: "How does the Telegram Deadline Radar work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "By starting @BuildSeekAlertsBot on Telegram, you receive timely high-priority notifications 24 hours and 3 hours before registration closes for your bookmarked quests—completely free of promotional noise or spam.",
                },
              },
              {
                "@type": "Question",
                name: "Can college organizers submit their hackathons to BuildSeek?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Student clubs, IEEE student branches, and university tech societies can submit their events through our public submission portal at /submit. Events are verified and normalized into our live directory.",
                },
              },
              {
                "@type": "Question",
                name: "How does BuildSeek protect user privacy and data security?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "BuildSeek complies with India's Digital Personal Data Protection (DPDP) Act 2023 and the GDPR. We enforce strict database Row-Level Security (RLS), avoid invasive behavioral cookies, and provide instant one-click cascading account erasure at /profile.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="sq-section-header">
      <span className="sq-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
