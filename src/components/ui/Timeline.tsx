"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, HelpCircle, MapPin, Sparkles } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import styles from "./Timeline.module.css";

export interface TimelineItemProps {
  id: string | number;
  icon: React.ReactNode;
  category: string;
  meta: string;
  summary: string;
  isVerified: boolean;
  isExpanded: boolean;
  onClick: () => void;
  description: string;
  trustScore: number;
  aiConfidence: number;
  latitude: number;
  longitude: number;
  aiSummaryText?: string;
  className?: string;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  icon,
  category,
  meta,
  summary,
  isVerified,
  isExpanded,
  onClick,
  description,
  trustScore,
  aiConfidence,
  latitude,
  longitude,
  aiSummaryText,
  className = ""
}) => {
  return (
    <Card
      glass={true}
      padding="sm"
      hoverEffect={true}
      onClick={onClick}
      className={`${styles.feedCard} ${isExpanded ? styles.feedCardExpanded : ""} ${className}`}
    >
      <div className={styles.feedCardHeader}>
        <div className={styles.feedHeaderLeft}>
          <div className={styles.categoryIconBg}>{icon}</div>
          <div className={styles.categoryTitleCol}>
            <h4 className={styles.feedCardCategory}>{category}</h4>
            <span className={styles.feedCardMeta}>{meta}</span>
          </div>
        </div>

        <div className={styles.verificationBadgeCol}>
          {isVerified ? (
            <Badge variant="success" size="sm" glow={true}>
              <CheckCircle size={10} style={{ marginRight: 2 }} />
              Verified
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              <HelpCircle size={10} style={{ marginRight: 2 }} />
              Pending
            </Badge>
          )}
        </div>
      </div>

      <p className={styles.feedCardSummary}>{summary}</p>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={styles.expandedBlockOuter}
          >
            <div className={styles.expandedBlock}>
              <p className={styles.fullDescription}>{description}</p>

              <div className={styles.trustScoresRow}>
                <div className={styles.scoreMetric}>
                  <span className={styles.metricLabel}>Community Trust</span>
                  <span
                    className={styles.metricVal}
                    style={{
                      color: isVerified
                        ? "var(--accent-emerald)"
                        : "var(--status-warning)"
                    }}
                  >
                    {trustScore}% Score
                  </span>
                </div>
                <div className={styles.verticalScoreDivider} />
                <div className={styles.scoreMetric}>
                  <span className={styles.metricLabel}>AI Confidence</span>
                  <span className={styles.metricVal} style={{ color: "var(--accent-blue)" }}>
                    {aiConfidence}% Level
                  </span>
                </div>
              </div>

              {aiSummaryText && (
                <div className={styles.aiInsightBox}>
                  <Sparkles size={13} className={styles.sparkleIcon} />
                  <span className={styles.aiInsightText}>{aiSummaryText}</span>
                </div>
              )}

              <div className={styles.locationFooterRow}>
                <MapPin size={12} className={styles.pinIcon} />
                <span>
                  Lat: {latitude.toFixed(5)}° N, Lng: {longitude.toFixed(5)}° E
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

interface TimelineListProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineList: React.FC<TimelineListProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`${styles.timelineList} ${className}`}>{children}</div>
  );
};
