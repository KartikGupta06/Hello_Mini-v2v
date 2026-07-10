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
  onEdit?: () => void;
  onDelete?: () => void;
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
  className = "",
  onEdit,
  onDelete
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

              {(onEdit || onDelete) && (
                <div style={{ display: "flex", gap: "10px", marginTop: "14px", borderTop: "1px solid var(--border-light)", paddingTop: "10px", justifyContent: "flex-end" }}>
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      style={{
                        background: "rgba(59, 130, 246, 0.08)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        color: "var(--accent-blue)",
                        padding: "6px 12px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      Edit Alert
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      style={{
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "var(--status-danger)",
                        padding: "6px 12px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
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
