"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./FilterChips.module.css";

interface ChipItem {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: ChipItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  activeId,
  onChange,
  className = ""
}) => {
  return (
    <div className={`${styles.chipsScroll} ${className}`}>
      {chips.map((chip) => {
        const isActive = activeId === chip.id;
        return (
          <motion.button
            key={chip.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`${styles.filterChip} ${isActive ? styles.activeChip : ""}`}
            onClick={() => onChange(chip.id)}
          >
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
};
