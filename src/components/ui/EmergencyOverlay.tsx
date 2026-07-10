"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Share2, 
  Building, 
  Heart, 
  Users, 
  X, 
  Check, 
  Flame,
  Radio
} from "lucide-react";
import { useEmergency } from "@/contexts/EmergencyContext";
import { SafetyService } from "@/services/safety";
import { Button } from "./Button";
import styles from "./EmergencyOverlay.module.css";

export const EmergencyOverlay: React.FC = () => {
  const { 
    isEmergencyActive, 
    cancelEmergency, 
    primaryContact, 
    contactsCount 
  } = useEmergency();

  // Multi-stage flow: "hold" | "broadcasting" | "live"
  const [sosStage, setSosStage] = useState<"hold" | "broadcasting" | "live">("hold");

  // Stage 1: Hold to Trigger states
  const [holdSeconds, setHoldSeconds] = useState(5);
  const [isHolding, setIsHolding] = useState(false);

  // Stage 2: Broadcasting states
  const [broadcastStep, setBroadcastStep] = useState(0);

  // Stage 3: Live Active Timer
  const [liveSeconds, setLiveSeconds] = useState(0);

  const [lat, setLat] = useState(28.5306);
  const [lng, setLng] = useState(77.2045);
  const [closestPost, setClosestPost] = useState("Malviya Nagar Post");
  const [closestHospital, setClosestHospital] = useState("Max Super Speciality");

  // Geolocation and Safe Places stream
  useEffect(() => {
    if (!isEmergencyActive) return;
    
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        () => console.warn("Failed resolving geolocation streams"),
        { enableHighAccuracy: true }
      );
    }

    async function loadPlaces() {
      try {
        const posts = await SafetyService.getPoliceStations("South Delhi");
        if (posts.data.length > 0) setClosestPost(posts.data[0].name.split(" - ")[0]);
        
        const hospitals = await SafetyService.getHospitals("South Delhi");
        if (hospitals.data.length > 0) setClosestHospital(hospitals.data[0].name.split(" - ")[0]);
      } catch (e) {
        console.error("Failed loading safe places details:", e);
      }
    }
    loadPlaces();

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isEmergencyActive]);

  // Stage 1: Hold to Activate Countdown
  useEffect(() => {
    if (sosStage !== "hold") return;

    if (!isHolding) {
      setHoldSeconds(5);
      return;
    }

    const interval = setInterval(() => {
      setHoldSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSosStage("broadcasting");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isHolding, sosStage]);

  // Stage 2: Broadcasting checkmark animations
  useEffect(() => {
    if (sosStage !== "broadcasting") return;

    setBroadcastStep(0);
    const interval = setInterval(() => {
      setBroadcastStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          setTimeout(() => setSosStage("live"), 600);
          return 4;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [sosStage]);

  // Stage 3: Live Active Timer
  useEffect(() => {
    if (sosStage !== "live") return;

    setLiveSeconds(0);
    const interval = setInterval(() => {
      setLiveSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sosStage]);

  // Reset stage variables when closed
  useEffect(() => {
    if (!isEmergencyActive) {
      setSosStage("hold");
      setHoldSeconds(5);
      setIsHolding(false);
      setBroadcastStep(0);
      setLiveSeconds(0);
    }
  }, [isEmergencyActive]);

  if (!isEmergencyActive) return null;

  // Format seconds to HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, "0") : null,
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0")
    ].filter(Boolean).join(":");
  };

  const handleCallGuardian = () => {
    if (primaryContact) {
      alert(`Dialing Primary Guardian: ${primaryContact.name} (${primaryContact.phone})...`);
    } else {
      alert("No emergency contacts setup. Calling default emergency services...");
    }
  };

  return (
    <div className={styles.overlayWrapper}>
      {/* HEADER BAR */}
      <div className={styles.header}>
        <div className={styles.statusCol}>
          <div className={styles.liveIndicator}>
            <span className={styles.pulseDot} />
            <span className={styles.statusText}>
              {sosStage === "hold" && "SOS Standby Mode"}
              {sosStage === "broadcasting" && "SOS Broadcast Protocol"}
              {sosStage === "live" && `LIVE • ${formatTimer(liveSeconds)}`}
            </span>
          </div>
          <span className={styles.locationText}>
            GPS Coordinates: {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
          </span>
        </div>

        {sosStage === "hold" && (
          <button onClick={cancelEmergency} className={styles.closeBtn} aria-label="Abort SOS">
            <X size={18} />
          </button>
        )}
      </div>

      {/* STAGE 1: HOLD TO TRIGGER */}
      {sosStage === "hold" && (
        <div className={styles.stageContainer}>
          <div className={styles.centerHeroSection}>
            <div className={styles.countdownWrapper}>
              <div 
                className={`${styles.holdButtonCircle} ${isHolding ? styles.holdButtonActive : ""}`}
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
              >
                <ShieldAlert size={48} className={styles.shieldIcon} />
                <span className={styles.holdButtonText}>HOLD SOS</span>
              </div>
              <h2 className={styles.countdownHeading}>Press and Hold to Trigger</h2>
              <p className={styles.countdownSub}>
                Keep holding for {holdSeconds} seconds to broadcast emergency signals.
              </p>
            </div>
          </div>
          
          <div className={styles.bottomBarActions}>
            <Button 
              variant="secondary" 
              onClick={cancelEmergency} 
              fullWidth
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#FFFFFF" }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* STAGE 2: BROADCASTING SIGNALS */}
      {sosStage === "broadcasting" && (
        <div className={styles.stageContainer}>
          <div className={styles.centerHeroSection}>
            <div className={styles.broadcastingWrapper}>
              <div className={styles.broadcastRingAnimation}>
                <Radio size={40} className={styles.pulseRadioIcon} />
              </div>
              <h3 className={styles.broadcastingTitle}>Broadcasting Emergency Signals...</h3>
              <p className={styles.broadcastingSubtitle}>Please stay calm. Dispatching aids immediately.</p>
            </div>
          </div>

          {/* Verification checklist stack */}
          <div className={styles.statusCard}>
            <div className={styles.statusListStack}>
              <div className={`${styles.statusCheckItem} ${broadcastStep >= 1 ? styles.itemChecked : ""}`}>
                <div className={styles.circleBox}>
                  {broadcastStep >= 1 ? <Check size={12} /> : <span className={styles.dotCheck} />}
                </div>
                <span>Guardian Notified</span>
              </div>
              <div className={`${styles.statusCheckItem} ${broadcastStep >= 2 ? styles.itemChecked : ""}`}>
                <div className={styles.circleBox}>
                  {broadcastStep >= 2 ? <Check size={12} /> : <span className={styles.dotCheck} />}
                </div>
                <span>Police Dispatch Alerted</span>
              </div>
              <div className={`${styles.statusCheckItem} ${broadcastStep >= 3 ? styles.itemChecked : ""}`}>
                <div className={styles.circleBox}>
                  {broadcastStep >= 3 ? <Check size={12} /> : <span className={styles.dotCheck} />}
                </div>
                <span>Live Location Stream Shared</span>
              </div>
              <div className={`${styles.statusCheckItem} ${broadcastStep >= 4 ? styles.itemChecked : ""}`}>
                <div className={styles.circleBox}>
                  {broadcastStep >= 4 ? <Check size={12} /> : <span className={styles.dotCheck} />}
                </div>
                <span>Ambulance Unit Alerted</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", color: "var(--status-warning)", fontSize: "0.85rem", fontWeight: "bold" }}>
            ETA Police: 4 min
          </div>
        </div>
      )}

      {/* STAGE 3: EMERGENCY LIVE PANEL */}
      {sosStage === "live" && (
        <div className={styles.stageContainer}>
          {/* Location Area Card */}
          <div className={styles.statusCard}>
            <span className={styles.locationTitleLabel}>YOUR CURRENT LOCATION</span>
            <div className={styles.locationAddressRow}>
              <MapPin size={16} className={styles.emeraldIcon} />
              <p className={styles.addressText}>
                23, Main Road, Malviya Nagar, New Delhi, 110017
              </p>
            </div>
          </div>

          {/* ETA / Dispatch Metrics Card */}
          <div className={styles.etaContainerGrid}>
            <div className={styles.etaSubBox}>
              <span className={styles.etaBoxLabel}>Police ETA</span>
              <span className={styles.etaBoxValue}>4 min</span>
            </div>
            <div className={styles.etaSubBox}>
              <span className={styles.etaBoxLabel}>Guardian ETA</span>
              <span className={styles.etaBoxValue}>2 min</span>
            </div>
            <div className={styles.etaSubBox} style={{ gridColumn: "span 2" }}>
              <span className={styles.etaBoxLabel}>Live Coordinates Broadcast</span>
              <span className={styles.etaBoxValue} style={{ color: "var(--status-success)" }}>
                Streaming Live to {contactsCount} Contacts
              </span>
            </div>
          </div>

          {/* Touch actions tiles */}
          <div className={styles.actionsGrid}>
            <button className={`${styles.actionTile} ${styles.tileDanger}`} onClick={() => alert("Calling local police dispatch...")}>
              <PhoneCall size={18} />
              <div className={styles.tileTextCol}>
                <span className={styles.tileTitle}>Call Police</span>
                <span className={styles.tileDesc}>Direct police emergency hotline</span>
              </div>
            </button>

            <button className={styles.actionTile} onClick={handleCallGuardian}>
              <Users size={18} className={styles.blueIcon} />
              <div className={styles.tileTextCol}>
                <span className={styles.tileTitle}>Call Guardian</span>
                <span className={styles.tileDesc}>
                  {primaryContact ? primaryContact.name : "Call Emergency Circle"}
                </span>
              </div>
            </button>

            <button className={styles.actionTile} onClick={() => alert("Dialing default medical responders...")}>
              <Heart size={18} className={styles.redIcon} />
              <div className={styles.tileTextCol}>
                <span className={styles.tileTitle}>Call Ambulance</span>
                <span className={styles.tileDesc}>Direct hospital response desk</span>
              </div>
            </button>
          </div>

          {/* End SOS Button */}
          <div className={styles.bottomBarActions} style={{ marginTop: "24px" }}>
            <Button 
              variant="danger" 
              onClick={cancelEmergency} 
              fullWidth
              style={{ height: "54px", fontSize: "0.95rem", fontWeight: 800 }}
            >
              End SOS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmergencyOverlay;
