"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "outline" | "ghost" | "emerald";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.015, translateY: -1 }}
      whileTap={isDisabled ? {} : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={isDisabled}
      {...(props as any)}
    >
      {isLoading && <span className={styles.spinner} />}
      {!isLoading && leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {!isLoading && rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
    </motion.button>
  );
};
