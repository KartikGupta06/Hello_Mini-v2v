"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./BottomSheet.module.css";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = "75vh"
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.wrapper}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.backdrop}
            onClick={onClose}
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{ maxHeight }}
            className={styles.sheet}
          >
            {/* Drag Handle indicator */}
            <div className={styles.dragHandle} onClick={onClose}>
              <div className={styles.bar} />
            </div>

            {/* Header */}
            {title && (
              <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
              </div>
            )}

            {/* Content */}
            <div className={styles.content}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
