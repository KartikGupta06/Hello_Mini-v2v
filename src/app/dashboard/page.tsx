"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  MessageSquareWarning, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle,
  Eye
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, SafetyScoreCard, Button, Badge } from "@/components/ui";
import styles from "./Dashboard.module.css";

export default function DashboardPage() {
  const stats = [
    {
      title: "Average Safety Index",
      value: "92/100",
      description: "Based on your frequent routes",
      icon: <TrendingUp size={20} className={styles.iconBlue} />
    },
    {
      title: "Guardian Network",
      value: "4 Contacts",
      description: "Ready to receive alerts",
      icon: <Users size={20} className={styles.iconEmerald} />
    },
    {
      title: "Active Area Alerts",
      value: "2 Incident reports",
      description: "Within 2km of your location",
      icon: <MessageSquareWarning size={20} className={styles.iconAmber} />
    }
  ];

  const recentTrips = [
    {
      destination: "Office Core (Downtown)",
      date: "Today, 5:30 PM",
      score: 88,
      status: "Safe Pathway",
      statusVariant: "success" as const
    },
    {
      destination: "Metro Station North",
      date: "Yesterday, 9:15 PM",
      score: 72,
      status: "Minor Lights Out",
      statusVariant: "warning" as const
    }
  ];

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
              score={86} 
              locationName="Current Area (Midtown Manhattan)"
              explanations={[
                "Streets are highly illuminated with commercial store facades.",
                "High crowdsourced safe walking scores recorded in the last hour.",
                "Nearest Police Station is 450m away (Safe Haven ID #109)."
              ]}
              confidenceScore={96}
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

          <div className={styles.tripsList}>
            {recentTrips.map((trip, idx) => (
              <Card key={idx} glass={true} padding="sm" className={styles.tripItem}>
                <div className={styles.tripInfo}>
                  <div className={styles.tripDestRow}>
                    <MapPin size={16} className={styles.pinIcon} />
                    <span className={styles.tripDestName}>{trip.destination}</span>
                  </div>
                  <span className={styles.tripDate}>{trip.date}</span>
                </div>

                <div className={styles.tripMetrics}>
                  <Badge variant={trip.statusVariant} glow={true}>
                    {trip.status}
                  </Badge>
                  <div className={styles.tripScoreBox}>
                    <span className={styles.scoreLabel}>Score</span>
                    <span className={`${styles.scoreNumber} ${styles[`score-${trip.statusVariant}`]}`}>
                      {trip.score}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
