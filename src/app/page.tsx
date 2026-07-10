"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { 
  Navigation, 
  Eye, 
  Activity, 
  Sparkles, 
  Menu, 
  LayoutGrid, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  MapPin, 
  CheckCircle 
} from "lucide-react";
import { BottomNavigation } from "@/components/ui";
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
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 }
    }
  };

  const features = [
    {
      icon: <Navigation size={22} className={styles.purpleIcon} />,
      circleClass: styles.purpleCircle,
      title: "Smart Safety Pathfinding",
      description: "Avoid unsafe routes, dark areas, and high-risk zones.",
      badge: "Smart Routing",
      badgeClass: styles.badgePurple
    },
    {
      icon: <Eye size={22} className={styles.blueIcon} />,
      circleClass: styles.blueCircle,
      title: "Explainable AI Safety Scores",
      description: "Know the exact safety score and risk factors of any route.",
      badge: "AI Transparency",
      badgeClass: styles.badgeBlue
    },
    {
      icon: <Activity size={22} className={styles.pinkIcon} />,
      circleClass: styles.pinkCircle,
      title: "Guardian Tracking",
      description: "Share live location with your trusted contacts & get instant help.",
      badge: "Live Protection",
      badgeClass: styles.badgePink
    }
  ];

  const stats = [
    {
      value: "10K+",
      label: "Safe Journeys Every Month",
      icon: <ShieldCheck size={18} />,
      iconClass: styles.statIconPurple
    },
    {
      value: "50K+",
      label: "Community Contributors",
      icon: <Users size={18} />,
      iconClass: styles.statIconPink
    },
    {
      value: "250+",
      label: "Cities Covered",
      icon: <MapPin size={18} />,
      iconClass: styles.statIconPurple
    },
    {
      value: "98%",
      label: "Safety Score Accuracy",
      icon: <CheckCircle size={18} />,
      iconClass: styles.statIconPink
    }
  ];

  return (
    <div className={styles.landingContainer}>
      {/* Background glow animations */}
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowSecond} />

      {/* Header Navbar */}
      <nav className={styles.navHeader}>
        <div className={styles.logoGroup}>
          <img src="/logo.png" alt="SafeRoute AI" className={styles.logoImg} />
          <div className={styles.logoTexts}>
            <span className={styles.logoTitle}>SafeRoute AI</span>
            <span className={styles.logoSub}>Your Safety, Our Priority ❤️</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link href="/about" className={styles.aboutBtn}>
            <Sparkles size={13} className={styles.sparkleIcon} />
            <span>About AI</span>
          </Link>
          <button className={styles.hamburgerBtn} aria-label="Open menu">
            <Menu size={16} />
          </button>
        </div>
      </nav>

      {/* Viewport Scroll Area */}
      <div className={styles.scrollContent}>
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={styles.heroContent}
        >
          {/* Hero Brand Logo */}
          <motion.div variants={itemVariants} className={styles.heroLogoWrapper}>
            <img src="/logo.png" alt="SafeRoute AI Brand Logo" className={styles.heroLogoImg} />
          </motion.div>

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

          {/* Hero Illustration */}
          <motion.div variants={itemVariants} className={styles.illustrationContainer}>
            <img 
              src="/hero_illustration.png" 
              alt="SafeRoute AI Safety Companion Illustration" 
              className={styles.heroIllustration} 
            />
          </motion.div>

          {/* Call to Actions */}
          <motion.div variants={itemVariants} className={styles.ctaRow}>
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className={styles.dashboardBtn}>
              <LayoutGrid size={16} />
              <span>Open Dashboard</span>
            </Link>
            <Link href="/emergency" className={styles.sosBtn}>
              <ShieldAlert size={16} />
              <span>SOS Live Terminal</span>
            </Link>
          </motion.div>
        </motion.main>

        {/* Feature Cards Section */}
        <section className={styles.featuresSection}>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={`${styles.iconWrapper} ${feature.circleClass}`}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
                <span className={`${styles.featureBadge} ${feature.badgeClass}`}>
                  {feature.badge}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsCard}>
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} className={styles.statItem}>
                  <div className={`${styles.statIconWrapper} ${stat.iconClass}`}>
                    {stat.icon}
                  </div>
                  <div className={styles.statTexts}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.landingFooter}>
          <p>&copy; {new Date().getFullYear()} SafeRoute AI. Built with premium trust, safety, and modern technologies.</p>
        </footer>
      </div>

      {/* Floating Bottom Nav */}
      <BottomNavigation />
    </div>
  );
}
