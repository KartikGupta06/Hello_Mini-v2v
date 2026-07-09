"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, ShieldCheck, PhoneCall, ChevronLeft, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import styles from "./Emergency.module.css";

export default function EmergencyPage() {
  const [sosState, setSosState] = useState<"idle" | "countdown" | "active">("idle");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosState === "countdown" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (sosState === "countdown" && countdown === 0) {
      setSosState("active");
    }
    return () => clearTimeout(timer);
  }, [sosState, countdown]);

  const triggerSOS = () => {
    setCountdown(5);
    setSosState("countdown");
  };

  const cancelSOS = () => {
    setSosState("idle");
    setCountdown(5);
  };

  return (
    <div className={`${styles.container} ${styles[sosState]}`}>
      {/* Background glow effects based on SOS state */}
      <div className={styles.bgGlow} />

      {/* Standalone Header */}
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backBtn}>
          <ChevronLeft size={18} />
          <span>Exit Emergency View</span>
        </Link>
        <Badge variant={sosState === "active" ? "danger" : "warning"} glow={true}>
          {sosState === "active" ? "SOS Broadcast Active" : "Emergency Terminal"}
        </Badge>
      </header>

      {/* Main SOS Interaction Area */}
      <main className={styles.mainContent}>
        <AnimatePresence mode="wait">
          {/* IDLE State */}
          {sosState === "idle" && (
            <motion.div
              key="idle"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.stateWrapper}
            >
              <div className={styles.alertNotice}>
                <AlertTriangle size={20} className={styles.alertNoticeIcon} />
                <span>Single-press will initiate a 5s silent countdown before notifying contacts.</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={triggerSOS}
                className={styles.sosTriggerBtn}
              >
                <div className={styles.sosBtnInner}>
                  <ShieldAlert size={64} className={styles.sosAlertLogo} />
                  <span className={styles.sosBtnText}>TRIGGER SOS</span>
                </div>
              </motion.button>

              <h2 className={styles.promptText}>Hold or press to activate emergency protocol</h2>
            </motion.div>
          )}

          {/* COUNTDOWN State */}
          {sosState === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.stateWrapper}
            >
              <div className={styles.countdownCircle}>
                <motion.span
                  key={countdown}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={styles.countdownNumber}
                >
                  {countdown}
                </motion.span>
              </div>

              <h2 className={styles.broadcastAlert}>Initiating SOS Broadcast...</h2>
              <p className={styles.broadcastDesc}>Press below immediately to cancel if this is a false alarm.</p>

              <Button 
                variant="outline" 
                size="lg" 
                className={styles.cancelBtn}
                onClick={cancelSOS}
              >
                Cancel Broadcast
              </Button>
            </motion.div>
          )}

          {/* ACTIVE Broadcasting State */}
          {sosState === "active" && (
            <motion.div
              key="active"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.stateWrapper}
            >
              {/* Broadcasting glowing pulse ring */}
              <div className={styles.broadcastingRing}>
                <div className={`${styles.pulse} ${styles.pulse1}`} />
                <div className={`${styles.pulse} ${styles.pulse2}`} />
                <div className={styles.broadcastLogoWrapper}>
                  <ShieldAlert size={48} />
                </div>
              </div>

              <h2 className={styles.activeTitle}>Active SOS Broadcasting</h2>
              <p className={styles.activeSubtitle}>Coordinates sharing live with your trust network.</p>

              {/* Status details card */}
              <div className={styles.activeStatusCard}>
                <div className={styles.statusRow}>
                  <MapPin size={16} className={styles.statusIconBlue} />
                  <div>
                    <span className={styles.statusLabel}>Live Position</span>
                    <span className={styles.statusValue}>40.7128° N, 74.0060° W</span>
                  </div>
                </div>

                <div className={styles.statusRow}>
                  <Users size={16} className={styles.statusIconEmerald} />
                  <div>
                    <span className={styles.statusLabel}>Notified Guardians</span>
                    <span className={styles.statusValue}>4 Contacts (SMS Sent)</span>
                  </div>
                </div>
              </div>

              <div className={styles.activeActionsGrid}>
                <Button 
                  variant="primary" 
                  size="md" 
                  leftIcon={<PhoneCall size={18} />}
                  onClick={() => alert("Simulating phone call connection to emergency services...")}
                >
                  Call Local Police
                </Button>
                <Button 
                  variant="outline" 
                  size="md"
                  onClick={cancelSOS}
                  className={styles.resolvedBtn}
                >
                  I am Safe / Close SOS
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer support text */}
      <footer className={styles.footer}>
        <span>Encryption Tunnel Secure. SafeRoute Emergency Dispatch active.</span>
      </footer>
    </div>
  );
}
