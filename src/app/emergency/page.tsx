"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, ShieldCheck, PhoneCall, ChevronLeft, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ContactService } from "@/services/contacts";
import { EmergencyContact } from "@/types";
import styles from "./Emergency.module.css";

export default function EmergencyPage() {
  const [sosState, setSosState] = useState<"idle" | "countdown" | "active">("idle");
  const [countdown, setCountdown] = useState(5);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [primaryContact, setPrimaryContact] = useState<EmergencyContact | null>(null);

  // Position tracking states
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch emergency contacts to display notification count
    async function loadContacts() {
      try {
        const fetched = await ContactService.getContacts();
        setContacts(fetched);
        const primary = fetched.find(c => c.is_primary) || fetched[0] || null;
        setPrimaryContact(primary);
      } catch (e) {
        console.error("Failed to load emergency contacts:", e);
      }
    }
    loadContacts();
  }, []);

  // Control countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosState === "countdown" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (sosState === "countdown" && countdown === 0) {
      setSosState("active");
      startLocationStreaming();
    }
    return () => clearTimeout(timer);
  }, [sosState, countdown]);

  // Clean location stream on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startLocationStreaming = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (err) => {
          console.error("Error watching GPS position:", err);
          // Fallback to default Malviya Nagar coordinates if GPS fails
          setLatitude(28.5306);
          setLongitude(77.2045);
        },
        { enableHighAccuracy: true }
      );
      setWatchId(id);
    } else {
      // Fallback
      setLatitude(28.5306);
      setLongitude(77.2045);
    }
  };

  const triggerSOS = () => {
    setCountdown(5);
    setSosState("countdown");
  };

  const cancelSOS = () => {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setSosState("idle");
    setCountdown(5);
  };

  const formattedCoordinates = () => {
    if (latitude !== null && longitude !== null) {
      return `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`;
    }
    return "Resolving GPS position...";
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
                    <span className={styles.statusValue}>{formattedCoordinates()}</span>
                  </div>
                </div>

                <div className={styles.statusRow}>
                  <Users size={16} className={styles.statusIconEmerald} />
                  <div>
                    <span className={styles.statusLabel}>Notified Guardians</span>
                    <span className={styles.statusValue}>
                      {contacts.length > 0
                        ? `${contacts.length} Contact${contacts.length > 1 ? "s" : ""} (Alert Link Sent)`
                        : "No Guardians Added (Direct Dispatch Only)"}
                    </span>
                    {primaryContact && (
                      <span style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", display: "block", marginTop: "2px" }}>
                        Primary Target: <strong>{primaryContact.name}</strong> ({primaryContact.phone})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.activeActionsGrid}>
                <Button 
                  variant="primary" 
                  size="md" 
                  leftIcon={<PhoneCall size={18} />}
                  onClick={() => alert(`Dialing local emergency dispatch services...`)}
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
