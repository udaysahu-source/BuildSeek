import React, { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface FormFieldProps {
  label: string;
  name?: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  success?: boolean;
  children: ReactNode;
}

export function FormField({
  label,
  name,
  required = false,
  error,
  hint,
  success = false,
  children,
}: FormFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      <label
        htmlFor={name}
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: error ? "#C62F3A" : "var(--ink, #0B1033)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>
          {label} {required && <span style={{ color: "#C62F3A" }}>*</span>}
        </span>
        {success && !error && (
          <span style={{ fontSize: "11px", color: "#1F6B00", display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle2 size={12} /> Valid
          </span>
        )}
      </label>

      <div
        style={{
          position: "relative",
          width: "100%",
        }}
        className={error ? "sq-input-error" : success ? "sq-input-valid" : ""}
      >
        {children}
      </div>

      {error ? (
        <p
          role="alert"
          style={{
            margin: "2px 0 0",
            fontSize: "12px",
            color: "#C62F3A",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <AlertCircle size={13} className="flex-shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default FormField;
