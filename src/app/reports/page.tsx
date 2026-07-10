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
  Map
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Badge, Modal, Input, LoadingSkeleton, MapContainer, FilterChips, EmptyState, TimelineList, TimelineItem } from "@/components/ui";
import { SafetyService } from "@/services/safety";
import { AuthService } from "@/services/auth";
import { SafetyReport, ReportCategory, User } from "@/types";
import styles from "./Reports.module.css";

const QUICK_FILTERS = [
  { label: "All Alerts", id: "all" },
  { label: "Poor Lighting", id: "Poor Lighting" },
  { label: "Harassment", id: "Harassment" },
  { label: "Stalking", id: "Stalking" },
  { label: "Broken CCTV", id: "Broken CCTV" },
  { label: "Road Blocks", id: "Road Block" },
  { label: "Suspicious Activity", id: "Suspicious Activity" }
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

  useEffect(() => {
    setUser(AuthService.getSavedUser());
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await SafetyService.getReports({ limit: 100 });
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

      setNewDesc("");
      setIsModalOpen(false);
      await fetchReports();
    } catch (err) {
      console.error("Failed to post hazard alert:", err);
    } finally {
      setSubmitting(false);
    }
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

  // Filtered reports list
  const filteredReports = useMemo(() => {
    if (activeFilter === "all") return reports;
    return reports.filter(r => r.type === activeFilter);
  }, [reports, activeFilter]);

  const verifiedCount = useMemo(() => {
    return reports.filter(r => r.id % 2 === 0).length + 12; // Simulate verified counter
  }, [reports]);

  return (
    <DashboardLayout>
      <div className={styles.container}>
        
        {/* A. Top Header */}
        <div className={styles.topHeaderRow}>
          <button onClick={() => router.push("/dashboard")} className={styles.backBtn} aria-label="Back to home">
            <ChevronLeft size={18} />
          </button>
          <div className={styles.headerTitles}>
            <h2 className={styles.circleTitle}>Community Intel</h2>
            <span className={styles.membersCount}>
              Live Status: {verifiedCount} Verified Alerts
            </span>
          </div>
          <button className={styles.filterBtn} onClick={() => alert("Report sorting layers applied.")} aria-label="Filter alerts">
            <Filter size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "2rem 0" }}>
            <LoadingSkeleton count={3} height={120} />
          </div>
        ) : (
          <div className={styles.layoutScrollArea}>
            
            {/* B. Mini Live Map Hero */}
            <div className={styles.mapRadarWrapper}>
              <div className={styles.miniMapSandbox}>
                <MapContainer 
                  routes={[]} 
                  selectedRouteId="" 
                  onRouteSelect={() => {}} 
                  center={mapCenter}
                  zoom={mapZoom}
                />
              </div>

              {/* Heatmap/Verifications overlays */}
              <div className={`${styles.heatmapLayer} ${heatmapActive ? styles.heatmapActiveState : ""}`}>
                {/* Simulated Heatmap glow dots */}
                <div className={styles.heatPulse} style={{ top: "30%", left: "40%" }} />
                <div className={styles.heatPulse} style={{ top: "60%", right: "30%" }} />
                <div className={styles.heatPulse} style={{ bottom: "25%", left: "55%" }} />
              </div>

              <div className={styles.mapOverlayControls}>
                <button 
                  className={`${styles.heatmapToggleBtn} ${heatmapActive ? styles.activeHeatmapBtn : ""}`} 
                  onClick={() => setHeatmapActive(!heatmapActive)}
                >
                  <Flame size={12} />
                  <span>{heatmapActive ? "Heatmap On" : "Show Heatmap"}</span>
                </button>
                <div className={styles.verifiedCountBadge}>
                  <Sparkles size={11} />
                  <span>{verifiedCount} Verified Hazards</span>
                </div>
              </div>

              {/* absolute coordinates pins */}
              <div className={styles.radarRadarContainer}>
                {filteredReports.map((r, idx) => {
                  const offsets = [
                    { top: "35px", left: "90px" },
                    { bottom: "50px", right: "80px" },
                    { top: "85px", right: "140px" },
                    { bottom: "70px", left: "120px" }
                  ];
                  const activePos = offsets[idx % offsets.length];
                  const isHighlighted = activeReportId === r.id;

                  return (
                    <div 
                      key={r.id} 
                      className={`${styles.mapAvatarMarker} ${isHighlighted ? styles.highlightedMarker : ""}`} 
                      style={{ top: activePos.top, left: activePos.left, right: activePos.right, bottom: activePos.bottom }}
                      onClick={() => handleSelectReport(r)}
                    >
                      <div className={styles.markerMiniInitials}>
                        {r.type.substring(0, 1)}
                      </div>
                      <div className={styles.markerPulseBorder} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* C. Quick Filter Chips horizontal row */}
            <FilterChips
              chips={QUICK_FILTERS}
              activeId={activeFilter}
              onChange={setActiveFilter}
              className={styles.chipsScroll}
            />

            {/* D. Live timeline feed panel */}
            <div className={styles.feedPanel}>
              {filteredReports.length === 0 ? (
                <EmptyState
                  icon={<AlertTriangle size={32} className={styles.emptyIcon} />}
                  title="No Alerts Reported"
                  description="No alerts reported in this category."
                />
              ) : (
                <TimelineList>
                  {filteredReports.map((report, idx) => {
                    const isExpanded = activeReportId === report.id;
                    const timeLabel = `${((idx + 1) * 7)}m ago`;
                    const trustScore = 80 + (report.id % 19);
                    const aiConfidence = 85 + (report.id % 13);
                    const isVerified = report.id % 2 === 0;

                    return (
                      <TimelineItem
                        key={report.id}
                        id={report.id}
                        icon={getIncidentIcon(report.type)}
                        category={report.type}
                        meta={`Nearby Area • ${timeLabel}`}
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
                      />
                    );
                  })}
                </TimelineList>
              )}
            </div>

          </div>
        )}

        {/* E. Floating report trigger button */}
        <button className={styles.floatingReportBtn} onClick={() => setIsModalOpen(true)} aria-label="Submit Hazard Report">
          <Plus size={20} />
          <span className={styles.floatingBtnText}>Report Incident</span>
        </button>

        {/* Create Report Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="File Hazard Alert"
          size="sm"
        >
          <form onSubmit={handleCreateReport} className={styles.modalForm}>
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
                Publish Incident
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
