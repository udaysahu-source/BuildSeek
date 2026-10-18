import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  description,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  const displayMessage =
    description ||
    message ||
    "We couldn't load this information. Please check your connection and try again.";
  if (compact) {
    return (
      <div
        role="alert"
        style={{
          background: "rgba(198, 47, 58, 0.08)",
          border: "1.5px solid #C62F3A",
          borderRadius: "14px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          margin: "12px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} color="#C62F3A" />
          <span style={{ fontSize: "13px", color: "#C62F3A", fontWeight: 600 }}>{displayMessage}</span>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            style={{
              borderColor: "#C62F3A",
              color: "#C62F3A",
              height: "30px",
              padding: "0 10px",
              fontSize: "12px",
            }}
          >
            <RotateCcw size={12} className="mr-1" /> Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      style={{
        border: "3px solid #0B1033",
        borderRadius: "24px",
        background: "#FFFBE8",
        padding: "36px 24px",
        boxShadow: "5px 5px 0px #0B1033",
        textAlign: "center",
        maxWidth: "480px",
        margin: "32px auto",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "rgba(198, 47, 58, 0.15)",
          border: "2px solid #C62F3A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <AlertCircle size={28} color="#C62F3A" />
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display, sans-serif)",
          fontSize: "20px",
          fontWeight: 800,
          color: "#0B1033",
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>

      <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.5, marginBottom: "20px" }}>
        {displayMessage}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          style={{
            background: "#B6F500",
            color: "#0B1033",
            border: "2px solid #0B1033",
            boxShadow: "3px 3px 0px #0B1033",
            fontWeight: 700,
          }}
        >
          <RotateCcw size={15} /> Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
