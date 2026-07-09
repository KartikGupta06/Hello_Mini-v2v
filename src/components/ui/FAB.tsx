"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./FAB.module.css";

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: "primary" | "danger" | "emerald";
  title?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  variant = "primary",
  title,
  className = "",
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.92 }}
      className={`${styles.fab} ${styles[variant]} ${className}`}
      title={title}
      {...(props as any)}
    >
      {icon}
    </motion.button>
  );
};
