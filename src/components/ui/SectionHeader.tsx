import React from "react";
import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.textContainer}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.actionContainer}>{action}</div>}
    </div>
  );
};
