"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Navigation,
  Shield,
  MessageSquareWarning,
  Settings,
  Info,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose
}) => {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      href: "/dashboard"
    },
    {
      label: "Safe Navigation",
      icon: <Navigation size={18} />,
      href: "/navigation"
    },
    {
      label: "Guardian Mode",
      icon: <Shield size={18} />,
      href: "/guardian"
    },
    {
      label: "Community Feed",
      icon: <MessageSquareWarning size={18} />,
      href: "/reports"
    },
    {
      label: "Settings",
      icon: <Settings size={18} />,
      href: "/settings"
    },
    {
      label: "About Safety AI",
      icon: <Info size={18} />,
      href: "/about"
    }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        {/* Navigation Section */}
        <nav className={styles.nav}>
          <div className={styles.sectionHeader}>Main Menu</div>
          
          <div className={styles.links}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.link} ${isActive ? styles.active : ""}`}
                  onClick={onClose}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className={styles.divider} />

          {/* SOS Hot Trigger link inside sidebar */}
          <div className={styles.sosContainer}>
            <Link
              href="/emergency"
              className={styles.sosBanner}
              onClick={onClose}
            >
              <div className={styles.sosIconWrapper}>
                <ShieldAlert size={20} className={styles.sosAlertIcon} />
              </div>
              <div className={styles.sosTextWrapper}>
                <span className={styles.sosTitle}>SOS Center</span>
                <span className={styles.sosSubtitle}>Immediate Assistance</span>
              </div>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer info */}
        <div className={styles.footer}>
          <div className={styles.footerAppInfo}>
            <div className={styles.footerAppName}>SafeRoute AI</div>
            <div className={styles.footerVersion}>v1.0.0 (Foundation)</div>
          </div>
        </div>
      </aside>
    </>
  );
};
