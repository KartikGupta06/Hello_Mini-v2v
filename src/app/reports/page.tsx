"use client";

import React, { useState } from "react";
import { Plus, MessageSquareWarning, MapPin, Calendar, ThumbsUp, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, Button, Badge, Modal, Input } from "@/components/ui";
import styles from "./Reports.module.css";

export default function ReportsPage() {
  const [reports, setReports] = useState([
    {
      id: "1",
      type: "Poorly Lit Area",
      typeVariant: "warning" as const,
      location: "8th Ave & W 34th St",
      date: "Today, 6:00 PM",
      description: "Streetlights are fully out on the northeast corner. Very dark near the subway exit entrance.",
      likes: 12,
      voted: false
    },
    {
      id: "2",
      type: "Suspicious Activity",
      typeVariant: "danger" as const,
      location: "Broadway & W 29th St",
      date: "Yesterday, 10:45 PM",
      description: "Two individuals loitering near the dark alleyway behind the convenience store, acting aggressively towards passersby.",
      likes: 8,
      voted: false
    },
    {
      id: "3",
      type: "Obstruction",
      typeVariant: "info" as const,
      location: "5th Ave & E 31st St",
      date: "2 days ago",
      description: "Sidewalk blocked by construction barriers forcing pedestrians to walk on the active roadway. Poor safety cones.",
      likes: 4,
      voted: false
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newType, setNewType] = useState("poorly-lit");
  const [newDesc, setNewDesc] = useState("");

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation || !newDesc) return;

    const typeMapping: Record<string, { label: string, variant: "warning" | "danger" | "info" }> = {
      "poorly-lit": { label: "Poorly Lit Area", variant: "warning" },
      "theft": { label: "Theft / Robbery Alert", variant: "danger" },
      "harassment": { label: "Harassment Alert", variant: "danger" },
      "obstruction": { label: "Obstruction", variant: "info" },
      "other": { label: "Suspicious Activity", variant: "warning" }
    };

    const mapped = typeMapping[newType] || { label: "Alert", variant: "warning" as const };

    const newReport = {
      id: String(reports.length + 1),
      type: mapped.label,
      typeVariant: mapped.variant,
      location: newLocation,
      date: "Just now",
      description: newDesc,
      likes: 0,
      voted: false
    };

    setReports([newReport, ...reports]);
    setIsModalOpen(false);
    setNewLocation("");
    setNewDesc("");
  };

  const handleVote = (id: string) => {
    setReports(reports.map(r => {
      if (r.id === id) {
        return {
          ...r,
          likes: r.voted ? r.likes - 1 : r.likes + 1,
          voted: !r.voted
        };
      }
      return r;
    }));
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

        <div className={styles.layoutGrid}>
          {/* Main Feed */}
          <div className={styles.feedPanel}>
            <div className={styles.feedList}>
              {reports.map((report) => (
                <Card key={report.id} glass={true} padding="md" className={styles.reportCard}>
                  <div className={styles.cardHeader}>
                    <Badge variant={report.typeVariant} size="sm">
                      {report.type}
                    </Badge>
                    <span className={styles.reportDate}>
                      <Calendar size={12} className={styles.headerIcon} />
                      {report.date}
                    </span>
                  </div>

                  <div className={styles.locationRow}>
                    <MapPin size={14} className={styles.pinIcon} />
                    <span className={styles.locationName}>{report.location}</span>
                  </div>

                  <p className={styles.description}>{report.description}</p>

                  <div className={styles.cardFooter}>
                    <button 
                      onClick={() => handleVote(report.id)}
                      className={`${styles.voteBtn} ${report.voted ? styles.voted : ""}`}
                    >
                      <ThumbsUp size={14} />
                      <span>{report.likes} Pedestrians confirmed this</span>
                    </button>
                  </div>
                </Card>
              ))}
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

        {/* Create Report Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Submit Local Safety Report"
          size="sm"
        >
          <form onSubmit={handleCreateReport} className={styles.modalForm}>
            <Input 
              label="Location / Intersection"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g. 8th Ave & W 34th St"
              required
            />

            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel}>Incident Category</label>
              <select 
                value={newType} 
                onChange={(e) => setNewType(e.target.value)}
                className={styles.select}
              >
                <option value="poorly-lit">Poorly Lit Pathway</option>
                <option value="theft">Theft / Physical Danger</option>
                <option value="harassment">Harassment / Safety Risk</option>
                <option value="obstruction">Sidewalk Blocked / Construction</option>
                <option value="other">Other Suspicious Behavior</option>
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
              />
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Publish Alert
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
