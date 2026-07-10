"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar, Sidebar } from "../ui";
import { AuthService } from "@/services/auth";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)" }}>
        <div style={{ width: "300px" }}>
          <LoadingSkeleton count={3} height={40} />
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Navbar onMenuToggle={toggleSidebar} />
      
      <div className={styles.mainWrapper}>
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        <main className={styles.content}>
          <div className={styles.innerContent}>{children}</div>
        </main>
      </div>
    </div>
  );
};
