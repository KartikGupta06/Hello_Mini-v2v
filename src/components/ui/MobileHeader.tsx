"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, Bell, Menu } from "lucide-react";
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

  const isDashboard = pathname === "/dashboard";

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
    hideHeader = true; // Avoid double header on reports page
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
  let initials = user ? user.name.split(" ").map((n) => n[0]).join("") : "U";
  if (user && (user.email === "demo@saferoute.ai" || user.name === "Demo User")) {
    initials = "S";
  } else if (!user) {
    initials = "S"; // Fallback default to match Siddhi
  }

  return (
    <header className={`${styles.header} ${isDashboard ? styles.dashboardHeader : ""}`}>
      <div className={styles.leftCol}>
        {showBack ? (
          <button onClick={() => router.back()} className={styles.iconBtn} aria-label="Go back">
            <ChevronLeft size={22} />
          </button>
        ) : isDashboard ? (
          <div className={styles.menuContainer}>
            <button className={styles.iconBtn} aria-label="Open menu">
              <Menu size={22} className={styles.menuIcon} />
            </button>
            <span className={styles.menuOnlineDot} />
          </div>
        ) : (
          <div className={styles.logoIndicator}>
            <span className={styles.pulseDot} />
          </div>
        )}
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{title}</h1>
          {isDashboard && (
            <span className={styles.subtitle}>AI-Powered Safety Companion</span>
          )}
        </div>
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
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarCircle}>{initials}</div>
              <span className={styles.avatarOnlineDot} />
            </div>
          </button>
        )}
      </div>
    </header>
  );
};
