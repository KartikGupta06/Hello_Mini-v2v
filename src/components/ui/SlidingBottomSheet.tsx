"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./SlidingBottomSheet.module.css";

interface SlidingBottomSheetProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  expandedHeight: string | number;
  collapsedHeight: string | number;
  collapsedHeader?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SlidingBottomSheet: React.FC<SlidingBottomSheetProps> = ({
  isExpanded,
  onToggleExpanded,
  expandedHeight,
  collapsedHeight,
  collapsedHeader,
  children,
  className = ""
}) => {
  return (
    <motion.div
      initial={false}
      animate={{ height: isExpanded ? expandedHeight : collapsedHeight }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`${styles.bottomSheet} ${className}`}
    >
      {/* Handle and dragging indicator trigger */}
      <div className={styles.sheetHandleRow} onClick={onToggleExpanded}>
        <div className={styles.sheetHandleDragBar} />
        {!isExpanded && collapsedHeader && (
          <div className={styles.collapsedHeaderContent}>
            {collapsedHeader}
          </div>
        )}
      </div>

      {/* Body content */}
      <div className={styles.sheetBody}>
        {children}
      </div>
    </motion.div>
  );
};
