import React from "react";
import styles from "./ProgressIndicator.module.css";

interface ProgressIndicatorProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  variant?: "success" | "warning" | "danger" | "info";
  showText?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  variant,
  showText = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Automatically determine color variant based on safety score value if variant is not explicitly provided
  const getVariant = () => {
    if (variant) return variant;
    if (value >= 80) return "success";
    if (value >= 50) return "warning";
    return "danger";
  };

  const currentVariant = getVariant();
  const indicatorColorClass = styles[currentVariant];

  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      <svg className={styles.svg} width={size} height={size}>
        {/* Background Track circle */}
        <circle
          className={styles.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Foreground Progress circle */}
        <circle
          className={`${styles.indicator} ${indicatorColorClass}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className={styles.textWrapper}>
          <span className={`${styles.percentageText} ${styles[`text-${currentVariant}`]}`}>
            {value}
          </span>
          <span className={styles.labelSub}>Safety</span>
        </div>
      )}
    </div>
  );
};
