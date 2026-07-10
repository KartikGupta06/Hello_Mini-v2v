"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./RouteCard.module.css";

interface RouteCardProps {
  name: string;
  score: number;
  time: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  name,
  score,
  time,
  color,
  isSelected,
  onClick,
  className = ""
}) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      onClick={onClick}
      className={`${styles.compareCard} ${isSelected ? styles.compareCardActive : ""} ${className}`}
      style={{ borderTop: `3px solid ${color}` }}
    >
      <span className={styles.compareName}>{name}</span>
      <span className={styles.compareScore} style={{ color }}>
        {score}%
      </span>
      <span className={styles.compareMeta}>{time}</span>
    </motion.div>
  );
};
