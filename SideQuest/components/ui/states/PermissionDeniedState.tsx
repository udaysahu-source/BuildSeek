import React from "react";
import { ShieldAlert, MapPin, Camera, Mic, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PermissionKind = "forbidden_role" | "location" | "camera" | "microphone";

export interface PermissionDeniedProps {
  kind: PermissionKind;
  onRetry?: () => void;
}

export function PermissionDeniedState({ kind, onRetry }: PermissionDeniedProps) {
  const config = {
    forbidden_role: {
      icon: <ShieldAlert size={28} color="#C62F3A" />,
      title: "Access Restricted (403)",
      description: "You do not have the required administrative permissions to access this management console.",
      tip: "Please switch to an authorized organization account.",
    },
    location: {
      icon: <MapPin size={28} color="#0B1033" />,
      title: "Location Permission Needed",
      description: "SideQuest needs your device location to sort hackathons within a 100km radius of your college or city.",
      tip: "Click the lock/settings icon in your browser address bar to enable Location access.",
    },
    camera: {
      icon: <Camera size={28} color="#0B1033" />,
      title: "Camera Permission Denied",
      description: "Camera access was denied. You will not be able to scan hackathon QR codes.",
      tip: "Allow camera access in your browser site permissions.",
    },
    microphone: {
      icon: <Mic size={28} color="#0B1033" />,
      title: "Microphone Access Denied",
      description: "Microphone access is needed for voice query recognition.",
      tip: "Enable microphone access in your browser settings.",
    },
  }[kind];

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
        maxWidth: "460px",
        margin: "24px auto",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#FFE3A3",
          border: "2px solid #0B1033",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        {config.icon}
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
        {config.title}
      </h3>

      <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.5, marginBottom: "12px" }}>
        {config.description}
      </p>

      <div
        style={{
          background: "rgba(11, 16, 51, 0.05)",
          border: "1px dashed #0B1033",
          borderRadius: "12px",
          padding: "10px 14px",
          fontSize: "12px",
          color: "#0B1033",
          marginBottom: "20px",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Settings size={15} className="flex-shrink-0" />
        <span>{config.tip}</span>
      </div>

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
          Check Permissions Again
        </Button>
      )}
    </div>
  );
}

export default PermissionDeniedState;
