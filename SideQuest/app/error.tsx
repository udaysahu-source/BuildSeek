"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error telemetry
    console.error("[BuildSeek Client Error]", error);
  }, [error]);

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
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "16px",
            background: "rgba(198, 47, 58, 0.12)",
            color: "#C62F3A",
            border: "2px solid #C62F3A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <div className="sq-eyebrow" style={{ color: "#C62F3A", display: "inline-flex", gap: "6px", alignItems: "center" }}>
          500 • Critical Hit
        </div>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Something went sideways on this quest.
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
          An unexpected error occurred while rendering this view. Your saved data is intact.
        </p>

        {error.digest && (
          <code
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              background: "var(--muted)",
              borderRadius: "6px",
              color: "var(--muted-foreground)",
            }}
          >
            Digest: {error.digest}
          </code>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "12px",
          }}
        >
          <Button onClick={() => reset()} size="lg" style={{ fontWeight: 700 }}>
            <RotateCcw size={16} className="mr-1" /> Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home size={16} className="mr-1" /> Return Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
