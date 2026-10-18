"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { WifiOff, RefreshCw, AlertTriangle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UIStateContextType {
  isOnline: boolean;
  isSlowNetwork: boolean;
  setSlowNetwork: (slow: boolean) => void;
  sessionExpired: boolean;
  triggerSessionExpired: () => void;
  closeSessionExpired: () => void;
}

const UIStateContext = createContext<UIStateContextType>({
  isOnline: true,
  isSlowNetwork: false,
  setSlowNetwork: () => {},
  sessionExpired: false,
  triggerSessionExpired: () => {},
  closeSessionExpired: () => {},
});

export function GlobalUIStateProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSlowNetwork, setIsSlowNetwork] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Global fetch interceptor to catch 401 responses (Session Expired State)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (response.status === 401) {
          // Avoid triggering on initial guest probes
          const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "";
          if (url.includes("/api/bookmarks") || url.includes("/api/user")) {
            setSessionExpired(true);
          }
        }
        return response;
      } catch (err) {
        throw err;
      }
    };

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.fetch = originalFetch;
    };
  }, []);

  const triggerSessionExpired = useCallback(() => setSessionExpired(true), []);
  const closeSessionExpired = useCallback(() => setSessionExpired(false), []);

  const handleRetryConnection = () => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        window.location.reload();
      }
    }
  };

  return (
    <UIStateContext.Provider
      value={{
        isOnline,
        isSlowNetwork,
        setSlowNetwork: setIsSlowNetwork,
        sessionExpired,
        triggerSessionExpired,
        closeSessionExpired,
      }}
    >
      {/* 4. No Internet State Banner */}
      {!isOnline && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: "#C62F3A",
            color: "#ffffff",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(198, 47, 58, 0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <WifiOff size={18} />
            <span>No Internet Connection. You are currently viewing cached data.</span>
          </div>
          <button
            onClick={handleRetryConnection}
            style={{
              background: "#ffffff",
              color: "#C62F3A",
              border: "none",
              borderRadius: "999px",
              padding: "4px 14px",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* 5. Slow Network State Banner */}
      {isOnline && isSlowNetwork && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: !isOnline ? "44px" : "0",
            left: 0,
            right: 0,
            zIndex: 9998,
            backgroundColor: "#FFB020",
            color: "#0B1033",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={16} />
          <span>It&apos;s taking longer than usual. You may be on a slow connection…</span>
          <div
            style={{
              width: "12px",
              height: "12px",
              border: "2px solid #0B1033",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}

      {/* 8. Session Expired State Modal */}
      {sessionExpired && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(11, 16, 51, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFBE8",
              border: "3px solid #0B1033",
              borderRadius: "24px",
              padding: "28px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "6px 6px 0px #0B1033",
              textAlign: "center",
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
              <LogIn size={26} color="#0B1033" />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 800, color: "#0B1033", marginBottom: "8px" }}>
              Session Expired
            </h2>
            <p style={{ fontSize: "14px", color: "#3A4070", lineHeight: 1.5, marginBottom: "20px" }}>
              Your security session has timed out. Please sign in again to sync your quests and save alerts.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <Button
                asChild
                style={{
                  backgroundColor: "#B6F500",
                  color: "#0B1033",
                  border: "2px solid #0B1033",
                  boxShadow: "3px 3px 0px #0B1033",
                  fontWeight: 700,
                }}
              >
                <a href="/login?next=%2Fquest-log">Log In Again</a>
              </Button>
              <Button
                variant="outline"
                onClick={() => setSessionExpired(false)}
                style={{
                  border: "2px solid #0B1033",
                  fontWeight: 600,
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState() {
  return useContext(UIStateContext);
}
