"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  MessageSquareWarning, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle,
  Eye,
  AlertTriangle
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, SafetyScoreCard, Button, Badge, LoadingSkeleton } from "@/components/ui";
import { JourneyService } from "@/services/journeys";
import { ContactService } from "@/services/contacts";
import { SafetyService } from "@/services/safety";
import { JourneyHistory, EmergencyContact, SafetyReport } from "@/types";
import styles from "./Dashboard.module.css";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<JourneyHistory[]>([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [avgSafetyScore, setAvgSafetyScore] = useState(90);
  
  // Geolocation & Safety score states
  const [locationName, setLocationName] = useState("Current Location (Midtown Manhattan)");
  const [currentScore, setCurrentScore] = useState(85);
  const [confidence, setConfidence] = useState(95);
  const [reasons, setReasons] = useState<string[]>([
    "Area is highly illuminated by public street lights.",
    "No historical crime incidents recorded within 200m.",
    "Nearest police station is 300m away."
  ]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // 1. Fetch historical journeys
        const fetchedTrips = await JourneyService.getJourneys({ limit: 5 });
        setTrips(fetchedTrips);

        // Calculate average safety score from history if available
        const scoredTrips = fetchedTrips.filter(t => t.safety_score !== null && t.safety_score !== undefined);
        if (scoredTrips.length > 0) {
          const sum = scoredTrips.reduce((acc, t) => acc + (t.safety_score || 0), 0);
          setAvgSafetyScore(Math.round(sum / scoredTrips.length));
        }

        // 2. Fetch emergency contacts count
        const fetchedContacts = await ContactService.getContacts();
        setContactsCount(fetchedContacts.length);

        // 3. Fetch community hazards count
        const fetchedReports = await SafetyService.getReports({ limit: 50 });
        setAlertsCount(fetchedReports.length);

        // 4. Fetch dynamic safety score for current coordinates
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setLocationName(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
              try {
                const scoreRes = await SafetyService.getSafetyScore(latitude, longitude);
                setCurrentScore(Math.round(scoreRes.safety_score));
                setConfidence(Math.round(scoreRes.confidence_percentage));
                setReasons(scoreRes.reasons);
              } catch (e) {
                console.error("Failed to query geolocation safety score:", e);
              }
            },
            async (err) => {
              // Fallback to Midtown Manhattan default coordinates
              console.warn("Geolocation permission denied, using default coordinates.", err);
              const defLat = 40.7484;
              const defLng = -73.9857;
              try {
                const scoreRes = await SafetyService.getSafetyScore(defLat, defLng);
                setCurrentScore(Math.round(scoreRes.safety_score));
                setConfidence(Math.round(scoreRes.confidence_percentage));
                setReasons(scoreRes.reasons);
              } catch (e) {
                console.error("Failed to query default location safety score:", e);
              }
            }
          );
        }
      } catch (err) {
        console.error("Failed to load dashboard parameters:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const stats = [
    {
      title: "Average Safety Index",
      value: `${avgSafetyScore}/100`,
      description: trips.length > 0 ? "Computed from your travel history" : "Default base safety rating",
      icon: <TrendingUp size={20} className={styles.iconBlue} />
    },
    {
      title: "Guardian Network",
      value: `${contactsCount} ${contactsCount === 1 ? "Contact" : "Contacts"}`,
      description: "Registered emergency recipients",
      icon: <Users size={20} className={styles.iconEmerald} />
    },
    {
      title: "Active Area Alerts",
      value: `${alertsCount} Safety ${alertsCount === 1 ? "Report" : "Reports"}`,
      description: "Hazard logs flagged by community",
      icon: <MessageSquareWarning size={20} className={styles.iconAmber} />
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: "2rem" }}>
          <SectionHeader title="Safety Dashboard" subtitle="Loading secure environment parameters..." />
          <LoadingSkeleton count={4} height={100} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Title */}
        <SectionHeader 
          title="Safety Dashboard" 
          subtitle="Real-time security analytics and safety scoring index"
          action={
            <Link href="/emergency">
              <Button variant="danger" size="md" leftIcon={<ShieldAlert size={18} />}>
                Trigger Emergency SOS
              </Button>
            </Link>
          }
        />

        {/* Safety Score Card Section */}
        <div className={styles.topSection}>
          <div className={styles.scoreWrapper}>
            <SafetyScoreCard 
              score={currentScore} 
              locationName={locationName}
              explanations={reasons}
              confidenceScore={confidence}
            />
          </div>

          {/* Quick Actions Card */}
          <Card className={styles.actionsCard} glass={true}>
            <h3 className={styles.actionsTitle}>Quick Navigation Actions</h3>
            <div className={styles.actionsGrid}>
              <Link href="/navigation" className={styles.actionBtn}>
                <div className={styles.actionIconWrapper}>
                  <MapPin size={18} />
                </div>
                <div className={styles.actionText}>
                  <span className={styles.actionName}>New Safety Trip</span>
                  <span className={styles.actionDesc}>Calculate secure pathways</span>
                </div>
                <ArrowUpRight size={16} className={styles.arrowIcon} />
              </Link>

              <Link href="/reports" className={styles.actionBtn}>
                <div className={styles.actionIconWrapper}>
                  <MessageSquareWarning size={18} />
                </div>
                <div className={styles.actionText}>
                  <span className={styles.actionName}>File Incident Report</span>
                  <span className={styles.actionDesc}>Crowdsource local risk alert</span>
                </div>
                <ArrowUpRight size={16} className={styles.arrowIcon} />
              </Link>
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} glass={true} padding="md" className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>{stat.title}</span>
                <div className={styles.statIcon}>{stat.icon}</div>
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <p className={styles.statDesc}>{stat.description}</p>
            </Card>
          ))}
        </div>

        {/* Recent Trips Section */}
        <div className={styles.recentSection}>
          <div className={styles.recentHeaderRow}>
            <h3 className={styles.recentHeading}>Recent Safely Navigated Trips</h3>
            <Link href="/navigation" className={styles.viewAllLink}>
              <span>Plan new route</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {trips.length === 0 ? (
            <Card glass={true} padding="md" className={styles.tripItem} style={{ justifyContent: "center", color: "var(--text-secondary)" }}>
              No recent trips logged. Start navigating to record paths.
            </Card>
          ) : (
            <div className={styles.tripsList}>
              {trips.map((trip, idx) => {
                const isSafe = (trip.safety_score || 0) >= 80;
                const badgeVariant = isSafe ? ("success" as const) : ("warning" as const);
                const scoreClass = isSafe ? styles["score-success"] : styles["score-warning"];
                
                return (
                  <Card key={idx} glass={true} padding="sm" className={styles.tripItem}>
                    <div className={styles.tripInfo}>
                      <div className={styles.tripDestRow}>
                        <MapPin size={16} className={styles.pinIcon} />
                        <span className={styles.tripDestName}>{trip.destination}</span>
                      </div>
                      <span className={styles.tripDate}>
                        {new Date(trip.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div className={styles.tripMetrics}>
                      <Badge variant={badgeVariant} glow={true}>
                        {trip.status === "completed" ? "Completed Walk" : "Active Navigation"}
                      </Badge>
                      <div className={styles.tripScoreBox}>
                        <span className={scoreClass} style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                          {trip.safety_score || "--"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "4px" }}>
                          Score
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
