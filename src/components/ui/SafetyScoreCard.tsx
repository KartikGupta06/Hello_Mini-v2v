"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Sparkles, MapPin, Lightbulb } from "lucide-react";
import { Card } from "./Card";
import { ProgressIndicator } from "./ProgressIndicator";
import { Badge } from "./Badge";
import styles from "./SafetyScoreCard.module.css";

interface SafetyScoreCardProps {
  score: number;
  locationName: string;
  explanations?: string[];
  confidenceScore?: number;
}

export const SafetyScoreCard: React.FC<SafetyScoreCardProps> = ({
  score,
  locationName,
  explanations = [
    "Well-lit main pathways with active retail lighting.",
    "No emergency incidents reported in the last 48 hours.",
    "High historical pedestrian activity during early evening hours."
  ],
  confidenceScore = 94
}) => {
  const getSafetyStatus = () => {
    if (score >= 80) return { label: "High Safety", variant: "success" as const, icon: <ShieldCheck size={16} /> };
    if (score >= 50) return { label: "Caution Advised", variant: "warning" as const, icon: <ShieldAlert size={16} /> };
    return { label: "Risk Zone", variant: "danger" as const, icon: <ShieldAlert size={16} /> };
  };

  const status = getSafetyStatus();

  return (
    <Card glass={true} hoverEffect={false} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <div className={styles.locationLabel}>
            <MapPin size={14} className={styles.locationIcon} />
            <span>{locationName}</span>
          </div>
          <h3 className={styles.cardTitle}>Safety Score Analysis</h3>
        </div>
        <Badge variant={status.variant} glow={true} className={styles.statusBadge}>
          <span className={styles.badgeContent}>
            {status.icon}
            {status.label}
          </span>
        </Badge>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Side: Score ring and confidence */}
        <div className={styles.scoreSection}>
          <ProgressIndicator value={score} size={110} strokeWidth={9} />
          
          <div className={styles.confidenceRating}>
            <div className={styles.sparkleRow}>
              <Sparkles size={12} className={styles.sparkleIcon} />
              <span>AI Confidence</span>
            </div>
            <div className={styles.confidenceValue}>{confidenceScore}%</div>
          </div>
        </div>

        {/* Right Side: AI Explanations */}
        <div className={styles.explanationSection}>
          <div className={styles.sectionSub}>
            <Lightbulb size={14} className={styles.bulbIcon} />
            <span>AI Factors & Insights</span>
          </div>
          
          <ul className={styles.insightsList}>
            {explanations.map((insight, idx) => (
              <li key={idx} className={styles.insightItem}>
                <span className={`${styles.bullet} ${styles[status.variant]}`} />
                <span className={styles.insightText}>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
