import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SuccessStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function SuccessState({
  title = "Success!",
  message = "Your action has been completed and verified successfully.",
  actionText = "Continue",
  actionHref,
  onAction,
}: SuccessStateProps) {
  return (
    <div
      role="status"
      style={{
        border: "3px solid #0B1033",
        borderRadius: "24px",
        background: "#FFFBE8",
        padding: "36px 24px",
        boxShadow: "5px 5px 0px #0B1033",
        textAlign: "center",
        maxWidth: "460px",
        margin: "24px auto",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#B6F500",
          border: "2px solid #0B1033",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: "3px 3px 0px #0B1033",
        }}
      >
        <Check size={32} color="#0B1033" strokeWidth={3} />
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display, sans-serif)",
          fontSize: "22px",
          fontWeight: 800,
          color: "#0B1033",
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>

      <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.5, marginBottom: "24px" }}>
        {message}
      </p>

      {actionHref ? (
        <Button
          asChild
          style={{
            background: "#0B1033",
            color: "#ffffff",
            border: "2px solid #0B1033",
            boxShadow: "3px 3px 0px #0B1033",
            fontWeight: 700,
          }}
        >
          <Link href={actionHref}>
            {actionText} <ArrowRight size={15} />
          </Link>
        </Button>
      ) : onAction ? (
        <Button
          onClick={onAction}
          style={{
            background: "#0B1033",
            color: "#ffffff",
            border: "2px solid #0B1033",
            boxShadow: "3px 3px 0px #0B1033",
            fontWeight: 700,
          }}
        >
          {actionText} <ArrowRight size={15} />
        </Button>
      ) : null}
    </div>
  );
}

export default SuccessState;
