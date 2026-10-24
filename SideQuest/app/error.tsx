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
    <main className="sq-container sq-error-container">
      <div className="sq-error-card">
        <div className="sq-error-icon-box">
          <AlertTriangle size={30} />
        </div>

        <div className="sq-eyebrow" style={{ color: "#b91c1c" }}>
          500 • Critical Hit
        </div>

        <h1 style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
          Something went sideways on this quest.
        </h1>

        <p style={{ fontSize: "15px", color: "var(--muted-foreground)", lineHeight: 1.6, maxWidth: "420px", margin: 0 }}>
          An unexpected error occurred while rendering this view. Your saved data is intact.
        </p>

        {error.digest && (
          <code
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              background: "var(--mint)",
              borderRadius: "6px",
              color: "var(--ink)",
              border: "1px solid var(--ink)",
            }}
          >
            Digest: {error.digest}
          </code>
        )}

        <div className="sq-error-actions">
          <Button onClick={() => reset()} size="lg">
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
