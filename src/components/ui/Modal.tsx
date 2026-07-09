"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md"
}) => {
  // Prevent body scroll when modal is open
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
            transition={{ duration: 0.2 }}
            className={styles.backdrop}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className={styles.container}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`${styles.modal} ${styles[size]}`}
            >
              {/* Header */}
              <div className={styles.header}>
                {title ? <h3 className={styles.title}>{title}</h3> : <div />}
                <button className={styles.closeBtn} onClick={onClose}>
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className={styles.content}>{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
