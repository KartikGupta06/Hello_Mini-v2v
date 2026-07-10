"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./Card.module.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = true,
  glass = true,
  padding = "md",
  className = "",
  ...props
}) => {
  const cardClasses = [
    styles.card,
    glass ? styles.glass : styles.solid,
    hoverEffect ? styles.hover : "",
    styles[`pad-${padding}`],
    className
  ].join(" ");

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -1, scale: 1.002 } : {}}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={cardClasses}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};
