"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Shield, Navigation, AlertTriangle, Eye, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthService } from "@/services/auth";
import styles from "./Landing.module.css";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(AuthService.isAuthenticated());
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const features = [
    {
      icon: <Navigation size={24} className={styles.emeraldIcon} />,
      title: "Safety Pathfinding",
      description: "Avoid unlit alleys, high-crime areas, and construction hazards with safety-prioritized routing algorithms."
    },
    {
      icon: <Eye size={24} className={styles.blueIcon} />,
      title: "Explainable Safety Scores",
      description: "Understand the exact risk factors on any route with real-time AI descriptions and incident statistics."
    },
    {
      icon: <Activity size={24} className={styles.amberIcon} />,
      title: "Guardian Tracking",
      description: "Share live location coordinates with your trust network during night walks, with instant trigger SOS alerts."
    }
  ];

  return (
    <div className={styles.landingContainer}>
      {/* Background glow animations */}
      <div className={styles.backgroundGlow} />

      {/* Header Navbar */}
      <nav className={styles.navHeader}>
        <div className={styles.logoRow}>
          <img src="/logo.png" alt="SafeRoute AI" width={36} height={36} style={{ borderRadius: "50%" }} />
          <span className={styles.logoText}>SafeRoute AI</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/about" className={styles.navLink}>About AI</Link>
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button variant="outline" size="sm">
              {isLoggedIn ? "Dashboard" : "Sign In"}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={styles.heroContent}
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className={styles.badgeWrapper}>
          <span className={styles.heroBadge}>
            <span className={styles.pulseDot} />
            Next-Gen Safety Mapping
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 variants={itemVariants} className={styles.heroTitle}>
          Navigate the world with <span className={styles.gradientText}>absolute confidence</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className={styles.heroDescription}>
          The first safety companion that calculates pedestrian paths based on real-time lighting, crowdsourced alerts, and predictive safety models.
        </motion.p>

        {/* Call to Actions */}
        <motion.div variants={itemVariants} className={styles.ctaRow}>
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
              {isLoggedIn ? "Open Dashboard" : "Get Started"}
            </Button>
          </Link>
          <Link href="/emergency">
            <Button variant="danger" size="lg">
              SOS Live Terminal
            </Button>
          </Link>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.section variants={itemVariants} className={styles.featureGrid}>
          {features.map((feature, index) => (
            <Card key={index} glass={true} hoverEffect={true} padding="md" className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </Card>
          ))}
        </motion.section>
      </motion.main>

      {/* Footer */}
      <footer className={styles.landingFooter}>
        <p>&copy; {new Date().getFullYear()} SafeRoute AI. Built with premium trust, safety, and modern technologies.</p>
      </footer>
    </div>
  );
}
