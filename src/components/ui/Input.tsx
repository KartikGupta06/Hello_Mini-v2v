import React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className = "",
  id,
  ...props
}) => {
  const containerClasses = `${styles.container} ${className}`;
  const inputWrapperClasses = `${styles.inputWrapper} ${error ? styles.hasError : ""}`;

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={inputWrapperClasses}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        <input
          id={id}
          className={`${styles.input} ${leftIcon ? styles.withLeft : ""} ${
            rightIcon ? styles.withRight : ""
          }`}
          {...props}
        />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
