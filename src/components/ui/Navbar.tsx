"use client";

import React from "react";
import { Bell, Shield, Menu, ShieldAlert } from "lucide-react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { Badge } from "./Badge";

interface NavbarProps {
  onMenuToggle?: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuToggle,
  title = "SafeRoute AI"
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {onMenuToggle && (
          <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="Toggle Menu">
            <Menu size={20} />
          </button>
        )}
        <Link href="/dashboard" className={styles.logoWrapper}>
          <Shield className={styles.logoIcon} size={22} />
          <span className={styles.logoText}>{title}</span>
        </Link>
      </div>

      <div className={styles.right}>
        {/* Active Protection State */}
        <div className={styles.statusIndicator}>
          <Badge variant="success" size="sm" glow={true}>
            System Secure
          </Badge>
        </div>

        {/* SOS Quick Button */}
        <Link href="/emergency" className={styles.sosButton} title="Emergency SOS Screen">
          <ShieldAlert size={16} />
          <span>SOS</span>
        </Link>

        {/* Notification Button */}
        <button className={styles.iconBtn} aria-label="Notifications" title="Notifications">
          <Bell size={18} />
          <span className={styles.badgeDot} />
        </button>

        {/* User Profile Avatar */}
        <div className={styles.profile}>
          <div className={styles.avatar}>KG</div>
        </div>
      </div>
    </header>
  );
};
