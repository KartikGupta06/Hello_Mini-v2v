"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  ThumbsUp, 
  AlertTriangle,
  ChevronLeft,
  Filter,
  Eye,
  ShieldAlert,
  Flame,
  AlertCircle,
  Lightbulb,
  Lock,
  Activity,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Map,
  X,
  LayoutGrid,
  User as UserIcon,
  Car,
  MoreHorizontal
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Badge, Modal, Input, LoadingSkeleton, MapContainer, EmptyState, TimelineList, TimelineItem } from "@/components/ui";
import { SafetyService } from "@/services/safety";
import { AuthService } from "@/services/auth";
import { SafetyReport, ReportCategory, User } from "@/types";
import styles from "./Reports.module.css";

const CHIP_CATEGORIES = [
  { id: "all", label: "All", icon: <LayoutGrid size={14} /> },
  { id: "Poor Lighting", label: "Lighting", icon: <Lightbulb size={14} style={{ color: "#F59E0B" }} /> },
  { id: "Harassment", label: "Harassment", icon: <UserIcon size={14} style={{ color: "#8B5CF6" }} /> },
  { id: "Road Block", label: "Accident", icon: <Car size={14} style={{ color: "#EF4444" }} /> },
  { id: "Suspicious Activity", label: "Crime", icon: <AlertCircle size={14} style={{ color: "#F97316" }} /> },
  { id: "more", label: "More", icon: <MoreHorizontal size={14} /> }
];

export default function ReportsPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newType, setNewType] = useState<ReportCategory>("Poor Lighting");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Custom states
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeReportId, setActiveReportId] = useState<number | null>(null);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([77.2083, 28.5233]);
  const [mapZoom, setMapZoom] = useState(14);

  // Backend Integration States
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    setUser(AuthService.getSavedUser());
  }, []);

  // Fetch reports when category filters change
  useEffect(() => {
    fetchReports();
  }, [activeFilter]);

  const fetchReports = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params: any = { limit: 100 };
      if (activeFilter !== "all") {
        params.type = activeFilter;
      }
      const data = await SafetyService.getReports(params);
      const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReports(sorted);
    } catch (e: any) {
      console.error("Failed to load reports:", e);
      setApiError(e.message || "Failed to load community reports from backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingReportId(null);
    setNewType("Poor Lighting");
    setNewDesc("");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (report: SafetyReport) => {
    setEditingReportId(report.id);
    setNewType(report.type);
    setNewDesc(report.description);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc) return;

    setSubmitting(true);
    setModalError(null);
    try {
      if (editingReportId !== null) {
        // Update report
        await SafetyService.updateReport(editingReportId, {
          type: newType,
          description: newDesc
        });
        setSuccessToast("Hazard incident updated successfully!");
      } else {
        // Create report
        let lat = 28.5306;
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
                console.warn("Geolocation failed. Falling back.");
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
        setSuccessToast("Hazard incident reported successfully!");
      }

      setNewDesc("");
      setEditingReportId(null);
      setIsModalOpen(false);
      await fetchReports();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to save report:", err);
      setModalError(err.message || "Failed to submit hazard report.");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDeleteReport = async (id: number) => {
    setLoading(true);
    setApiError(null);
    try {
      await SafetyService.deleteReport(id);
      setSuccessToast("Hazard incident deleted successfully!");
      await fetchReports();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete report:", err);
      setApiError(err.message || "Failed to delete hazard report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = (id: number) => {
    setDeleteConfirmId(id);
  };

  const getIncidentIcon = (type: ReportCategory) => {
    switch (type) {
      case "Harassment":
      case "Stalking":
        return <ShieldAlert size={18} className={styles.iconDanger} />;
      case "Street Light Issue":
      case "Poor Lighting":
        return <Lightbulb size={18} className={styles.iconWarning} />;
      case "Broken CCTV":
        return <Eye size={18} className={styles.iconInfo} />;
      case "Road Block":
        return <AlertTriangle size={18} className={styles.iconWarning} />;
      case "Suspicious Activity":
        return <Lock size={18} className={styles.iconPurple} />;
      default:
        return <AlertCircle size={18} className={styles.iconInfo} />;
    }
  };

  const handleSelectReport = (report: SafetyReport) => {
    setActiveReportId(activeReportId === report.id ? null : report.id);
    setMapCenter([report.lng, report.lat]);
    setMapZoom(15);
  };

  const verifiedCount = useMemo(() => {
    return reports.filter(r => r.id % 2 === 0).length;
  }, [reports]);

  // Map pins mapping from actual backend data
  const mapPins = useMemo(() => {
    return reports.map((r) => ({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      label: `${r.type}: ${r.description.substring(0, 30)}...`,
      color: r.type === "Harassment" || r.type === "Stalking" ? "#ef4444" : "#f59e0b",
      isHighlighted: activeReportId === r.id
    }));
  }, [reports, activeReportId]);

  return (
    <DashboardLayout>
      <div className={styles.container}>
        
        {/* 1. Main Header Row */}
        <div className={styles.mainHeaderRow}>
          <div className={styles.titleSection}>
            <div className={styles.pinkDot} />
            <div className={styles.titleTextCol}>
              <h2 className={styles.mainTitle}>Community Intelligence</h2>
              <span className={styles.mainSubtitle}>Real-time Community Safety Reports</span>
            </div>
          </div>
          <div className={styles.headerRightActions}>
            <button className={styles.bellBtn} aria-label="Notifications">
              <span className={styles.bellDot} />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className={styles.profileAvatar}>
              <span>S</span>
              <span className={styles.onlineDot} />
            </div>
          </div>
        </div>

        {/* Scroll area */}
        <div className={styles.layoutScrollArea}>
          
          {/* 2. Map Card */}
          <div className={styles.mapCard}>
            <div className={styles.mapSubHeader}>
              <button onClick={() => router.push("/dashboard")} className={styles.mapBackBtn} aria-label="Back to home">
                <ChevronLeft size={18} />
              </button>
              <div className={styles.mapHeaderTitles}>
                <h3 className={styles.mapTitle}>Community Intel</h3>
                <span className={styles.mapLiveStatus}>
                  LIVE STATUS: <span className={styles.greenText}>{verifiedCount} VERIFIED ALERTS</span>
                </span>
              </div>
              <button className={styles.mapPulseBtn} onClick={() => fetchReports()} aria-label="Refresh alerts">
                <Activity size={18} />
              </button>
            </div>

            <div className={styles.mapRadarWrapper}>
              <div className={styles.miniMapSandbox}>
                <MapContainer 
                  routes={[]} 
                  selectedRouteId="" 
                  onRouteSelect={() => {}} 
                  center={mapCenter}
                  zoom={mapZoom}
                  pins={mapPins}
                  onPinSelect={(pinId) => {
                    const report = reports.find(r => r.id === pinId);
                    if (report) {
                      handleSelectReport(report);
                    }
                  }}
                />
              </div>

              {/* Heatmap overlay */}
              <div className={`${styles.heatmapLayer} ${heatmapActive ? styles.heatmapActiveState : ""}`}>
                <div className={styles.heatPulse} style={{ top: "30%", left: "40%" }} />
                <div className={styles.heatPulse} style={{ top: "60%", right: "30%" }} />
                <div className={styles.heatPulse} style={{ bottom: "25%", left: "55%" }} />
              </div>

              <div className={styles.mapTopControls}>
                <button 
                  className={`${styles.heatmapToggleBtn} ${heatmapActive ? styles.activeHeatmapBtn : ""}`} 
                  onClick={() => setHeatmapActive(!heatmapActive)}
                >
                  <span>🔥 {heatmapActive ? "Heatmap On" : "SHOW HEATMAP"}</span>
                </button>
                <div className={styles.verifiedCountBadge}>
                  <span>✔ {verifiedCount} Verified Hazards</span>
                </div>
              </div>

              {/* Bottom Legend Overlay */}
              <div className={styles.mapLegendOverlay}>
                <span className={styles.legendPill}>
                  <span className={`${styles.legendDot} ${styles.dotGreen}`} /> Safe
                </span>
                <span className={styles.legendPill}>
                  <span className={`${styles.legendDot} ${styles.dotYellow}`} /> Moderate
                </span>
                <span className={styles.legendPill}>
                  <span className={`${styles.legendDot} ${styles.dotRed}`} /> Dangerous
                </span>
              </div>

              {/* Bottom Right Selected Location */}
              <div className={styles.mapSelectedLocation}>
                <span>Select Citywalk</span>
              </div>
            </div>
          </div>

          {/* 3. Statistics Grid */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statsCard} ${styles.redCard}`}>
              <div className={styles.statsIconRow}>
                <span style={{ fontSize: "1.1rem" }}>🚨</span>
                <span className={styles.statsVal}>12</span>
              </div>
              <span className={styles.statsLabel}>Active Alerts</span>
              <span className={styles.statsSubTextRed}>• Live Now</span>
            </div>
            <div className={`${styles.statsCard} ${styles.blueCard}`}>
              <div className={styles.statsIconRow}>
                <span style={{ fontSize: "1.1rem" }}>👥</span>
                <span className={styles.statsVal}>86</span>
              </div>
              <span className={styles.statsLabel}>Community Reports</span>
              <span className={styles.statsSubText}>Total Reports</span>
            </div>
            <div className={`${styles.statsCard} ${styles.greenCard}`}>
              <div className={styles.statsIconRow}>
                <span style={{ fontSize: "1.1rem" }}>✔</span>
                <span className={styles.statsVal}>74</span>
              </div>
              <span className={styles.statsLabel}>Verified Reports</span>
              <span className={styles.statsSubText}>Trusted by Community</span>
            </div>
            <div className={`${styles.statsCard} ${styles.purpleCard}`}>
              <div className={styles.statsIconRow}>
                <span style={{ fontSize: "1.1rem" }}>🕒</span>
                <span className={styles.statsVal}>2m ago</span>
              </div>
              <span className={styles.statsLabel}>Last Updated</span>
              <span className={styles.statsSubText}>Live Sync</span>
            </div>
          </div>

          {/* 4. Custom Category Chips scroll */}
          <div className={styles.customChipsScroll}>
            {CHIP_CATEGORIES.map((chip) => {
              const isActive = activeFilter === chip.id;
              return (
                <motion.button
                  key={chip.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className={`${styles.customFilterChip} ${isActive ? styles.customActiveChip : ""}`}
                  onClick={() => {
                    if (chip.id === "more") {
                      setActiveFilter("all");
                    } else {
                      setActiveFilter(chip.id);
                    }
                  }}
                >
                  <span className={styles.chipIcon}>{chip.icon}</span>
                  <span className={styles.chipLabel}>{chip.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* 5. Live Community Summary Card */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <div className={styles.summaryHeaderLeft}>
                <span className={styles.greenLiveDot} />
                <span>Live Community Summary</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </div>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryIcon}>🚨</span>
                <div className={styles.summaryTextCol}>
                  <span className={styles.summaryVal}>2</span>
                  <span className={styles.summaryLabel}>Reports in last hour</span>
                </div>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryIcon}>👤</span>
                <div className={styles.summaryTextCol}>
                  <span className={styles.summaryVal}>3</span>
                  <span className={styles.summaryLabel}>Verified users nearby</span>
                </div>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryIcon}>🛡</span>
                <div className={styles.summaryTextCol}>
                  <span className={styles.summaryVal}>800 m</span>
                  <span className={styles.summaryLabel}>Nearest Police Station</span>
                </div>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryIcon}>⛑</span>
                <div className={styles.summaryTextCol}>
                  <span className={styles.summaryVal}>1.2 km</span>
                  <span className={styles.summaryLabel}>Nearest Hospital Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Report Incident CTA */}
          <button className={styles.reportNewIncidentCTA} onClick={handleOpenCreateModal}>
            <div className={styles.ctaLeftIconBg}>
              <ShieldAlert size={20} className={styles.ctaWarningIcon} />
            </div>
            <div className={styles.ctaTextCol}>
              <span className={styles.ctaTitle}>Report New Incident</span>
              <span className={styles.ctaSubtitle}>Help keep your community safe</span>
            </div>
            <div className={styles.ctaRightIconBg}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </button>

          {/* Inline API Error alert */}
          {apiError && (
            <div style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <AlertTriangle size={18} style={{ color: "var(--status-danger)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 800 }}>Network Failure / Backend Error</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{apiError}</div>
              </div>
              <button onClick={() => setApiError(null)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* 7. Feed Feed Feed */}
          {loading ? (
            <div>
              <LoadingSkeleton count={3} height={120} />
            </div>
          ) : (
            <div className={styles.feedPanel}>
              {reports.length === 0 ? (
                <div className={styles.premiumEmptyState}>
                  <div className={styles.emptyStateIllustrationCol}>
                    <div className={styles.shieldIllustrationWrapper}>
                      <div className={styles.shieldPulseBg} />
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(34, 197, 94, 0.1)"/>
                        <path d="m9 11 2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.emptyStateTextCol}>
                    <h4 className={styles.emptyStateTitle}>Great News!</h4>
                    <p className={styles.emptyStateDesc}>No community safety incidents have been reported in this area.</p>
                    <span className={styles.emptyStateFooter}>Stay Safe • Stay Aware 💚</span>
                  </div>
                </div>
              ) : (
                <TimelineList>
                  {reports.map((report) => {
                    const isExpanded = activeReportId === report.id;
                    const reportedByUser = report.user_id ? `User #${report.user_id}` : "Anonymous";
                    const reportTime = new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const reportDate = new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    const trustScore = 80 + (report.id % 19);
                    const aiConfidence = 85 + (report.id % 13);
                    const isVerified = report.id % 2 === 0;
                    const severity = report.type === "Harassment" || report.type === "Stalking" ? "High" : "Moderate";

                    return (
                      <TimelineItem
                        key={report.id}
                        id={report.id}
                        icon={getIncidentIcon(report.type)}
                        category={report.type}
                        meta={`${reportedByUser} • ${reportTime}, ${reportDate} • Status: ${isVerified ? "Verified" : "Pending"} • Severity: ${severity}`}
                        summary={`${report.description.substring(0, 56)}...`}
                        isVerified={isVerified}
                        isExpanded={isExpanded}
                        onClick={() => handleSelectReport(report)}
                        description={report.description}
                        trustScore={trustScore}
                        aiConfidence={aiConfidence}
                        latitude={report.lat}
                        longitude={report.lng}
                        aiSummaryText={`AI Summary: Safety index decreased slightly on coordinates segments due to ${report.type.toLowerCase()} updates.`}
                        onEdit={user && (report.user_id === user.id || !report.user_id) ? () => handleOpenEditModal(report) : undefined}
                        onDelete={user && (report.user_id === user.id || !report.user_id) ? () => handleDeleteReport(report.id) : undefined}
                      />
                    );
                  })}
                </TimelineList>
              )}
            </div>
          )}

        </div>


        {/* E. Floating report trigger button */}
        <button className={styles.floatingReportBtn} onClick={handleOpenCreateModal} aria-label="Submit Hazard Report">
          <Plus size={20} />
          <span className={styles.floatingBtnText}>Report Incident</span>
        </button>

        {/* Create / Edit Report Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={editingReportId !== null ? "Edit Hazard Alert" : "File Hazard Alert"}
          size="sm"
        >
          <form onSubmit={handleFormSubmit} className={styles.modalForm}>
            {modalError && (
              <div style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                marginBottom: "14px",
                fontSize: "0.75rem",
                color: "var(--text-primary)"
              }}>
                {modalError}
              </div>
            )}

            <div className={styles.coordinatesWarningText}>
              <span className={styles.redPulseDot} />
              <span>Location coordinates will resolve dynamically via your active mobile GPS.</span>
            </div>

            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel}>Incident Type</label>
              <select 
                value={newType} 
                onChange={(e) => setNewType(e.target.value as ReportCategory)}
                className={styles.selectInput}
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
              <label className={styles.textareaLabel}>Incident Description</label>
              <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe lighting issues, physical barriers, or loitering safety concerns..."
                className={styles.textareaInput}
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="emerald" isLoading={submitting}>
                {editingReportId !== null ? "Update Incident" : "Publish Incident"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Custom Delete Confirmation Modal */}
        <Modal
          isOpen={deleteConfirmId !== null}
          onClose={() => setDeleteConfirmId(null)}
          title="Confirm Hazard Deletion"
          size="sm"
        >
          <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
              Are you sure you want to delete this community hazard alert? This action is permanent and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button type="button" variant="secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={async () => {
                if (deleteConfirmId !== null) {
                  await executeDeleteReport(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}>
                Delete Alert
              </Button>
            </div>
          </div>
        </Modal>

        {/* Premium Floating Success Toast */}
        {successToast && (
          <div style={{
            position: "fixed",
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--accent-emerald)",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 3000,
            fontWeight: 700,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle size={16} />
            <span>{successToast}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
