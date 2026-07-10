"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "outline" | "ghost" | "emerald";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.01 }}
      whileTap={isDisabled ? {} : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 450, damping: 20 }}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={isDisabled}
      style={{ width: fullWidth ? "100%" : undefined, ...style }}
      {...(props as any)}
    >
      {isLoading && <span className={styles.spinner} />}
      {!isLoading && leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {!isLoading && rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
    </motion.button>
  );
};
