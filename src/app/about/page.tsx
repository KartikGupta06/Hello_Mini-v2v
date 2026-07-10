"use client";

import React from "react";
import { Sparkles, Shield, Heart, Eye, Database, Code } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader } from "@/components/ui";
import styles from "./About.module.css";

export default function AboutPage() {
  const pillars = [
    {
      icon: <Database size={24} className={styles.iconBlue} />,
      title: "Heterogeneous Data Ingestion",
      description: "Combines local municipal crime data, geographic street layouts, real-time crowdsourced reports, and satellite-measured street illumination levels."
    },
    {
      icon: <Sparkles size={24} className={styles.iconEmerald} />,
      title: "Predictive Safety Models",
      description: "Our AI model analyses crime density, temporal trends, and environmental details to compute safety predictions with detailed confidence indices."
    },
    {
      icon: <Eye size={24} className={styles.iconAmber} />,
      title: "Explainable Risk Factors",
      description: "No black box. The engine provides clear, natural language factors on why a route is recommended or marked caution, empowering you with local knowledge."
    }
  ];

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <SectionHeader 
          title="About SafeRoute AI" 
          subtitle="Understanding the technology, variables, and mission behind safety navigation"
        />

        <div className={styles.contentStack}>
          {/* Main Description */}
          <Card glass={true} padding="lg" className={styles.heroCard}>
            <div className={styles.heroTitleRow}>
              <img src="/logo.png" alt="SafeRoute AI" className={styles.aboutLogo} />
              <h2 className={styles.heroTitle}>Our Mission: Democratize Safety</h2>
            </div>
            
            <p className={styles.heroText}>
              Conventional navigation focuses solely on speed. SafeRoute AI changes the paradigm by prioritizing human physical security. By combining predictive AI with active crowdsourcing, we create maps that adapt to the real world, routing pedestrians through lit, safe, and active pathways.
            </p>
          </Card>

          {/* Core Technology Pillars */}
          <div className={styles.pillarsGrid}>
            {pillars.map((pillar, idx) => (
              <Card key={idx} glass={true} padding="md" className={styles.pillarCard}>
                <div className={styles.pillarIcon}>{pillar.icon}</div>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarDesc}>{pillar.description}</p>
              </Card>
            ))}
          </div>

          {/* How Safety Score is Calculated */}
          <Card glass={true} padding="lg" className={styles.formulaCard}>
            <h3 className={styles.formulaTitle}>How is the Safety Score calculated?</h3>
            <p className={styles.formulaText}>
              The SafeRoute Safety Score (0–100%) is computed via a multi-layered risk model:
            </p>
            
            <div className={styles.mathBlock}>
              <span className={styles.formula}>
                Safety Score = (Lighting &times; 0.3) + (Incidents &times; 0.35) + (Pedestrian Flow &times; 0.2) + (Havens Near &times; 0.15)
              </span>
            </div>

            <ul className={styles.formulaList}>
              <li>
                <strong>Lighting (30%):</strong> Measured from streetlight indexes and commercial shop visibility.
              </li>
              <li>
                <strong>Incident Reports (35%):</strong> Evaluated based on recent crime database records and crowdsourced alerts.
              </li>
              <li>
                <strong>Pedestrian Flow (20%):</strong> Density of foot traffic at specific hours.
              </li>
              <li>
                <strong>Safe Havens (15%):</strong> Proximity to fire, police, or open 24/7 security buildings.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
