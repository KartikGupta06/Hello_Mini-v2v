"use client";

import React, { useEffect, useState } from "react";
import { AuthService } from "@/services/auth";

export function DevModeBadge() {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(AuthService.isDevMode());
  }, []);

  if (!isDev) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "16px",
      right: "16px",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      backgroundColor: "rgba(15, 21, 36, 0.8)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(245, 158, 11, 0.3)",
      borderRadius: "9999px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5), 0 0 10px rgba(245, 158, 11, 0.15)",
      fontSize: "0.75rem",
      fontWeight: 600,
      color: "var(--text-primary)",
      fontFamily: "var(--font-sans)",
      pointerEvents: "none"
    }}>
      <span style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: "#f59e0b",
        boxShadow: "0 0 8px #f59e0b"
      }} />
      <span>Development Mode</span>
    </div>
  );
}
export default DevModeBadge;
