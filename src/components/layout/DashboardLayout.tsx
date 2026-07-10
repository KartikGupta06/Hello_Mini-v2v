"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MobileHeader, BottomNavigation, EmergencyOverlay } from "../ui";
import { AuthService } from "@/services/auth";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { EmergencyProvider, useEmergency } from "@/contexts/EmergencyContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SOSTriggerHandler: React.FC = () => {
  const searchParams = useSearchParams();
  const { triggerEmergency } = useEmergency();

  useEffect(() => {
    if (searchParams.get("sos") === "true") {
      triggerEmergency();
    }
  }, [searchParams, triggerEmergency]);

  return null;
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client-side authentication gate
    const authenticated = AuthService.isAuthenticated();
    if (!authenticated) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className={styles.desktopWrapper}>
        <div className={styles.phoneViewport} style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: "260px" }}>
            <LoadingSkeleton count={3} height={40} />
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const isDashboard = pathname === "/dashboard";

  return (
    <>
      <Suspense fallback={null}>
        <SOSTriggerHandler />
      </Suspense>
      <div className={styles.desktopWrapper}>
        <div className={styles.phoneViewport}>
          <MobileHeader />
          
          <main className={styles.contentArea}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ height: "100%" }}
            >
              {children}
            </motion.div>
          </main>

          {/* Floating AI Assistant (Only on Dashboard) */}
          {isDashboard && (
            <div className={styles.aiAssistantFloating}>
              <div className={styles.aiBadgeLabel}>
                <span className={styles.aiDot} />
                <span>AI Assistant</span>
              </div>
              <button 
                className={styles.aiFloatingBtn} 
                onClick={() => router.push("/navigation")}
                aria-label="Ask AI Assistant"
              >
                <img src="/ai_avatar.png" alt="AI Assistant" className={styles.aiAvatarImg} />
              </button>
            </div>
          )}

          <BottomNavigation />
          <EmergencyOverlay />
        </div>
      </div>
    </>
  );
};
