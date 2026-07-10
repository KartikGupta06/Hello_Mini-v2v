"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Map, ShieldAlert, MessageSquareWarning, User } from "lucide-react";
import { useEmergency } from "@/contexts/EmergencyContext";
import styles from "./BottomNavigation.module.css";

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { triggerEmergency } = useEmergency();

  const navItems = [
    {
      label: "Home",
      icon: <Home size={20} />,
      href: "/dashboard"
    },
    {
      label: "Route",
      icon: <Map size={20} />,
      href: "/navigation"
    },
    {
      label: "SOS",
      icon: <ShieldAlert size={24} />,
      href: "/emergency",
      isSos: true
    },
    {
      label: "Alerts",
      icon: <MessageSquareWarning size={20} />,
      href: "/reports"
    },
    {
      label: "Profile",
      icon: <User size={20} />,
      href: "/settings"
    }
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        if (item.isSos) {
          return (
            <button
              key={item.href}
              onClick={triggerEmergency}
              className={styles.sosButtonWrapper}
              aria-label="Trigger SOS Broadcast"
            >
              <div className={styles.sosPulse} />
              <div className={styles.sosButton}>
                {item.icon}
              </div>
              <span className={styles.sosLabel}>{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
          >
            <div className={`${styles.iconWrapper} ${isActive ? styles.activeCapsule : ""}`}>{item.icon}</div>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
