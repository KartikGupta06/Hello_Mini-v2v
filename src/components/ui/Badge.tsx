import React from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  children: React.ReactNode;
  glow?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  glow = false,
  className = ""
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    glow ? styles.glow : "",
    className
  ].join(" ");

  return <span className={badgeClasses}>{children}</span>;
};
