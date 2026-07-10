"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Card } from "./Card";
import styles from "./AIInsightCard.module.css";

interface AIInsightCardProps {
  text: string | React.ReactNode;
  title?: string;
  variant?: "info" | "warning" | "success" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  text,
  title = "AI Insight",
  variant = "info",
  icon = <Sparkles size={14} className={styles.sparkleIcon} />,
  className = ""
}) => {
  return (
    <Card
      glass={true}
      hoverEffect={false}
      padding="sm"
      className={`${styles.insightCard} ${styles[variant]} ${className}`}
    >
      <div className={styles.header}>
        {icon}
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.text}>{text}</div>
    </Card>
  );
};
