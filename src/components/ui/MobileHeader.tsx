"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, Bell } from "lucide-react";
import { AuthService } from "@/services/auth";
import styles from "./MobileHeader.module.css";

export const MobileHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Resolve header state based on pathname
  let title = "SafeRoute AI";
  let showBack = false;
  let showNotification = true;
  let showProfile = true;
  let hideHeader = false;

  if (pathname === "/dashboard") {
    title = "SafeRoute AI";
    showBack = false;
  } else if (pathname === "/navigation") {
    title = "Route Planner";
    showBack = false;
    hideHeader = true; // Keep navigation page full screen for absolute maps view
  } else if (pathname === "/nearby") {
    title = "Safe Havens";
    showBack = false;
  } else if (pathname === "/reports") {
    title = "Community Feed";
    showBack = false;
  } else if (pathname === "/settings") {
    title = "Settings";
    showBack = false;
    showNotification = false;
  } else {
    // Fallback for nested pages
    showBack = true;
    showNotification = false;
    showProfile = false;
    
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      title = parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1);
    }
  }

  if (hideHeader) return null;

  const user = AuthService.getSavedUser();
  const initials = user ? user.name.split(" ").map((n) => n[0]).join("") : "U";

  return (
    <header className={styles.header}>
      <div className={styles.leftCol}>
        {showBack ? (
          <button onClick={() => router.back()} className={styles.iconBtn} aria-label="Go back">
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div className={styles.logoIndicator}>
            <span className={styles.pulseDot} />
          </div>
        )}
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.rightCol}>
        {showNotification && (
          <button className={styles.iconBtn} aria-label="Notifications" onClick={() => router.push("/reports")}>
            <Bell size={20} />
            <span className={styles.notificationDot} />
          </button>
        )}
        {showProfile && (
          <button className={styles.profileBtn} aria-label="Profile Settings" onClick={() => router.push("/settings")}>
            <div className={styles.avatarCircle}>{initials}</div>
          </button>
        )}
      </div>
    </header>
  );
};
