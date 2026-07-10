"use client";

import React, { useState, useEffect } from "react";
import { Plus, MessageSquareWarning, MapPin, Calendar, ThumbsUp, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, Button, Badge, Modal, Input, LoadingSkeleton } from "@/components/ui";
import { SafetyService } from "@/services/safety";
import { AuthService } from "@/services/auth";
import { SafetyReport, ReportCategory, User } from "@/types";
import styles from "./Reports.module.css";

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newType, setNewType] = useState<ReportCategory>("Poor Lighting");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUser(AuthService.getSavedUser());
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await SafetyService.getReports({ limit: 100 });
      // Sort reports by created_at descending
      const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReports(sorted);
    } catch (e) {
      console.error("Failed to load reports:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc) return;

    setSubmitting(true);
    try {
      // Capture browser coordinates if available
      let lat = 28.5306; // South Delhi defaults
      let lng = 77.2045;

      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude;
              lng = position.coords.longitude;
              resolve();
            },
            () => {
              console.warn("Geolocation coordinate resolution failed, utilizing default area coordinates.");
              resolve();
            },
            { timeout: 3000 }
          );
        });
      }

      await SafetyService.submitReport({
        lat,
        lng,
        type: newType,
        description: newDesc,
        user_id: user?.id
      });

      setNewDesc("");
      setIsModalOpen(false);
      await fetchReports(); // Reload lists
    } catch (err) {
      console.error("Failed to post community hazard alert:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getBadgeVariant = (type: ReportCategory) => {
    switch (type) {
      case "Harassment":
      case "Stalking":
        return "danger" as const;
      case "Street Light Issue":
      case "Poor Lighting":
      case "Broken CCTV":
        return "warning" as const;
      case "Road Block":
      case "Suspicious Activity":
      case "Other":
      default:
        return "info" as const;
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <SectionHeader 
          title="Community Reports Feed" 
          subtitle="Recent safety alerts and hazards reported by walking pedestrians in your vicinity"
          action={
            <Button 
              variant="primary" 
              size="md" 
              leftIcon={<Plus size={18} />}
              onClick={() => setIsModalOpen(true)}
            >
              Submit Report
            </Button>
          }
        />

        {loading ? (
          <div style={{ padding: "2rem 0" }}>
            <LoadingSkeleton count={3} height={120} />
          </div>
        ) : (
          <div className={styles.layoutGrid}>
            {/* Main Feed */}
            <div className={styles.feedPanel}>
              <div className={styles.feedList}>
                {reports.length === 0 ? (
                  <Card glass={true} padding="md" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                    No safety hazard alerts currently logged in this district.
                  </Card>
                ) : (
                  reports.map((report) => (
                    <Card key={report.id} glass={true} padding="md" className={styles.reportCard}>
                      <div className={styles.cardHeader}>
                        <Badge variant={getBadgeVariant(report.type)} size="sm">
                          {report.type}
                        </Badge>
                        <span className={styles.reportDate}>
                          <Calendar size={12} className={styles.headerIcon} />
                          {new Date(report.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                      <div className={styles.locationRow}>
                        <MapPin size={14} className={styles.pinIcon} />
                        <span className={styles.locationName}>
                          Location: {report.lat.toFixed(4)}° N, {report.lng.toFixed(4)}° E
                        </span>
                      </div>

                      <p className={styles.description}>{report.description}</p>

                      <div className={styles.cardFooter}>
                        <button className={`${styles.voteBtn} ${styles.voted}`} style={{ cursor: "default" }}>
                          <ThumbsUp size={14} />
                          <span>Verified active security indicator</span>
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Secondary Info card */}
            <div className={styles.infoPanel}>
              <Card glass={true} padding="md" className={styles.infoCard}>
                <div className={styles.infoTitleRow}>
                  <AlertTriangle size={20} className={styles.alertIcon} />
                  <h3 className={styles.infoTitle}>Verification System</h3>
                </div>
                <p className={styles.infoText}>
                  Crowdsourced safety alerts are automatically integrated into local routing scores after receiving confirmations from other pedestrians.
                </p>
                <div className={styles.divider} />
                <p className={styles.infoSubText}>
                  SafeRoute AI filters spam and flags outdated alerts automatically after 24 hours of inactivity.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Create Report Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Submit Local Safety Report"
          size="sm"
        >
          <form onSubmit={handleCreateReport} className={styles.modalForm}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              <span className={styles.pulseDot} style={{ display: "inline-block", marginRight: "6px", backgroundColor: "var(--accent-emerald)" }} />
              Coordinates will be automatically resolved using your current GPS location.
            </div>

            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel}>Incident Category</label>
              <select 
                value={newType} 
                onChange={(e) => setNewType(e.target.value as ReportCategory)}
                className={styles.select}
                disabled={submitting}
              >
                <option value="Poor Lighting">Poor Lighting Coverage</option>
                <option value="Street Light Issue">Street Light Out / Faulty</option>
                <option value="Broken CCTV">Broken Surveillance Camera</option>
                <option value="Harassment">Harassment / Safety Danger</option>
                <option value="Stalking">Stalking Incident</option>
                <option value="Road Block">Road Block / Construction</option>
                <option value="Suspicious Activity">Suspicious Loitering Activity</option>
                <option value="Other">Other Hazard Alert</option>
              </select>
            </div>

            <div className={styles.textareaWrapper}>
              <label className={styles.textareaLabel}>Detailed Description</label>
              <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe lighting issues, physical barriers, or safety concerns..."
                className={styles.textarea}
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Publish Alert
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
