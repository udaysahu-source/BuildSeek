import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/sidequest/mascot";

export default function NotFound() {
  return (
    <main
      className="sq-container"
      style={{
        padding: "80px 16px 120px",
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "540px",
          width: "100%",
          textAlign: "center",
          background: "var(--card)",
          border: "2.5px solid var(--border)",
          boxShadow: "6px 6px 0 var(--border)",
          borderRadius: "24px",
          padding: "48px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div style={{ transform: "scale(1.2)", marginBottom: "8px" }}>
          <Mascot />
        </div>

        <div className="sq-eyebrow" style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
          <Compass size={14} /> 404 • Lost in the Dungeon
        </div>

        <h1
          style={{
            fontSize: "36px",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          This quest path <span className="sq-highlight">doesn’t exist.</span>
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "var(--muted-foreground)",
            lineHeight: 1.6,
            maxWidth: "420px",
            margin: 0,
          }}
        >
          The hackathon or page you’re searching for may have concluded, relocated to a new realm, or vanished into the void.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "12px",
          }}
        >
          <Button asChild size="lg" style={{ fontWeight: 700 }}>
            <Link href="/discover">
              <Search size={16} className="mr-1" /> Browse Quests
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <ArrowLeft size={16} className="mr-1" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
