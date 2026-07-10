"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileHeader, BottomNavigation } from "../ui";
import { AuthService } from "@/services/auth";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { motion } from "framer-motion";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
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

  return (
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

        <BottomNavigation />
      </div>
    </div>
  );
};
