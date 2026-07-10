"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Share2, 
  Flame,
  X,
  ShieldCheck,
  Building,
  Heart,
  Users
} from "lucide-react";
import { useEmergency } from "@/contexts/EmergencyContext";
import { SafetyService } from "@/services/safety";
import styles from "./EmergencyOverlay.module.css";

export const EmergencyOverlay: React.FC = () => {
  const { 
    isEmergencyActive, 
    isBroadcasting, 
    countdown, 
    cancelEmergency, 
    primaryContact, 
    contactsCount 
  } = useEmergency();

  const [lat, setLat] = useState(28.5306);
  const [lng, setLng] = useState(77.2045);
  const [closestPost, setClosestPost] = useState("Malviya Nagar Post");
  const [closestHospital, setClosestHospital] = useState("Max Super Speciality");

  // Track browser coordinates during active emergency overlays
  useEffect(() => {
    if (!isEmergencyActive) return;
    
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        () => console.warn("Failed resolving emergency coordinates stream"),
        { enableHighAccuracy: true }
      );
    }

    // Load nearest safe places details
    async function loadPlaces() {
      try {
        const posts = await SafetyService.getPoliceStations("South Delhi");
        if (posts.data.length > 0) setClosestPost(posts.data[0].name.split(" - ")[0]);
        
        const hospitals = await SafetyService.getHospitals("South Delhi");
        if (hospitals.data.length > 0) setClosestHospital(hospitals.data[0].name.split(" - ")[0]);
      } catch (e) {
        console.error("Failed loading nearby info in overlay:", e);
      }
    }
    loadPlaces();

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isEmergencyActive]);

  if (!isEmergencyActive) return null;

  const handleCallGuardian = () => {
    if (primaryContact) {
      alert(`Calling Primary Guardian: ${primaryContact.name} (${primaryContact.phone})...`);
    } else {
      alert("No emergency contacts configured. Calling local dispatch...");
    }
  };

  return (
    <div className={styles.overlayWrapper}>
      {/* 1. Header Row */}
      <div className={styles.header}>
        <div className={styles.statusCol}>
          <div className={styles.liveIndicator}>
            <span className={styles.pulseDot} />
            <span className={styles.statusText}>
              {isBroadcasting ? "SOS Broadcast Active" : "Emergency Countdown"}
            </span>
          </div>
          <span className={styles.locationText}>
            GPS: {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
          </span>
        </div>
        
        <button onClick={cancelEmergency} className={styles.closeBtn} aria-label="Cancel SOS">
          <X size={20} />
        </button>
      </div>

      {/* 2. Central Hero Action */}
      <div className={styles.centerHeroSection}>
        {isBroadcasting ? (
          <div className={styles.shieldPulseWrapper}>
            <div className={`${styles.glowRing} ${styles.glowRing1}`} />
            <div className={`${styles.glowRing} ${styles.glowRing2}`} />
            <div className={styles.shieldActiveCircle}>
              <ShieldAlert size={48} className={styles.crimsonIcon} />
            </div>
            <h2 className={styles.broadcastingText}>GPS Coordinates Streaming Live</h2>
          </div>
        ) : (
          <div className={styles.countdownWrapper}>
            <div className={styles.countdownCircle}>
              <span className={styles.countdownNumber}>{countdown}</span>
            </div>
            <h2 className={styles.countdownHeading}>Sending Urgent SOS Signal</h2>
            <p className={styles.countdownSub}>Dimming screen. Tap Cancel at the top to abort.</p>
          </div>
        )}
      </div>

      {/* 3. Concise Live Status Card */}
      <div className={styles.statusCard}>
        <div className={styles.statusCardHeader}>
          <ShieldCheck size={16} className={styles.emeraldIcon} />
          <h4 className={styles.statusCardTitle}>Emergency Area Briefing</h4>
        </div>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Nearest Police</span>
            <span className={styles.statusVal}>{closestPost}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Nearest Hospital</span>
            <span className={styles.statusVal}>{closestHospital}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Guardian Alerts</span>
            <span className={styles.statusVal}>
              {contactsCount > 0 ? `${contactsCount} Notified` : "None Setup"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Large Touch Actions Grid */}
      <div className={styles.actionsGrid}>
        <button className={`${styles.actionTile} ${styles.tileDanger}`} onClick={() => alert("Dialing local police dispatch services...")}>
          <PhoneCall size={20} />
          <div className={styles.tileTextCol}>
            <span className={styles.tileTitle}>Call Police</span>
            <span className={styles.tileDesc}>Direct authority link</span>
          </div>
        </button>

        <button className={styles.actionTile} onClick={handleCallGuardian}>
          <Users size={20} className={styles.blueIcon} />
          <div className={styles.tileTextCol}>
            <span className={styles.tileTitle}>Call Guardian</span>
            <span className={styles.tileDesc}>
              {primaryContact ? primaryContact.name : "Call Primary"}
            </span>
          </div>
        </button>

        <button className={styles.actionTile} onClick={() => alert(`Calculating safe route directly to police station haven...`)}>
          <Building size={20} className={styles.emeraldIcon} />
          <div className={styles.tileTextCol}>
            <span className={styles.tileTitle}>Nearest Haven</span>
            <span className={styles.tileDesc}>Navigate to guard post</span>
          </div>
        </button>

        <button className={styles.actionTile} onClick={() => alert("SOS coordinate tracking link copied to clipboard.")}>
          <Share2 size={20} className={styles.purpleIcon} />
          <div className={styles.tileTextCol}>
            <span className={styles.tileTitle}>Share Live Track</span>
            <span className={styles.tileDesc}>Copy monitoring link</span>
          </div>
        </button>

        <button className={styles.actionTile} onClick={() => alert("Dialing local emergency medical responders...")}>
          <Heart size={20} className={styles.redIcon} />
          <div className={styles.tileTextCol}>
            <span className={styles.tileTitle}>Medical Dispatch</span>
            <span className={styles.tileDesc}>Call ambulance desk</span>
          </div>
        </button>
      </div>
    </div>
  );
};
export default EmergencyOverlay;
