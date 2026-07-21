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
  Radio,
  AlertTriangle,
  Bell,
  Shield,
  Cctv,
  Lightbulb,
  MessageSquare,
  Activity,
  ChevronRight
} from "lucide-react";
import { useEmergency } from "@/contexts/EmergencyContext";
import { useLocation } from "@/contexts/LocationContext";
import { SafetyService } from "@/services/safety";
import { Button } from "./Button";
import styles from "./EmergencyOverlay.module.css";
import { Badge } from "./Badge";

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

  const { location, status: locStatus } = useLocation();

  const [closestPost, setClosestPost] = useState("Malviya Nagar Post");
  const [closestHospital, setClosestHospital] = useState("Max Super Speciality");
  
  // Real SOS API States
  const [sosResponse, setSosResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [triggerTime, setTriggerTime] = useState<string | null>(null);

  // Geolocation and Safe Places stream
  useEffect(() => {
    if (!isEmergencyActive) return;

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

  // Stage 2: Real SOS trigger on broadcasting
  useEffect(() => {
    if (sosStage !== "broadcasting") return;

    setApiLoading(true);
    setApiError(null);
    setSosResponse(null);

    let active = true;

    const triggerSOSCall = async () => {
      let payload: { latitude?: number; longitude?: number } = {};

      if (!location) {
        if (active) {
          let errorMsg = "Live location unavailable.";
          if (locStatus === 'denied') errorMsg = "Location Permission Denied: Live location unavailable.";
          else if (locStatus === 'unavailable') errorMsg = "GPS Unavailable: Live location unavailable.";
          else if (locStatus === 'timeout') errorMsg = "Timeout: Live location unavailable.";
          else if (locStatus === 'unsupported') errorMsg = "GPS Unavailable: Live location unavailable.";

          setApiError(errorMsg);
        }
        // Do NOT return here, allow demo SOS to continue
      } else {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
      }

      try {
        const res = await SafetyService.triggerSOS(payload);
        if (!active) return;
        setSosResponse(res);
        setTriggerTime(new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString());
        setSosStage("live");
      } catch (error: any) {
        if (!active) return;
        setApiError(error.message || "Backend Failure: Unable to connect to SafeRoute SOS server.");
        setSosStage("hold");
      } finally {
        if (active) {
          setApiLoading(false);
        }
      }
    };

    triggerSOSCall();

    return () => {
      active = false;
    };
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
      setSosResponse(null);
      setApiError(null);
      setApiLoading(false);
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
      window.location.href = `tel:${primaryContact.phone}`;
    } else {
      window.location.href = "tel:112";
    }
  };

  const handleCallPolice = () => {
    const policePhone = sosResponse?.nearest_police?.contact_number;
    if (policePhone) {
      window.location.href = `tel:${policePhone}`;
    } else {
      window.location.href = "tel:100";
    }
  };

  const handleCallAmbulance = () => {
    const hospitalPhone = sosResponse?.nearest_hospital?.contact_number;
    if (hospitalPhone) {
      window.location.href = `tel:${hospitalPhone}`;
    } else {
      window.location.href = "tel:102";
    }
  };

  return (
    <div className={styles.overlayWrapper}>
      {/* 1. Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.headerStatusCol}>
          <div className={styles.headerLiveIndicator}>
            <span className={styles.headerPulseDot} />
            <span className={styles.headerStatusText}>
              {sosStage === "hold" && "SOS Standby Mode"}
              {sosStage === "broadcasting" && "SOS Broadcast Protocol"}
              {sosStage === "live" && `LIVE • ${formatTimer(liveSeconds)}`}
            </span>
          </div>
          <span className={styles.headerLocationText}>
            <MapPin size={12} />
            GPS Coordinates: {location ? `${location.latitude.toFixed(5)}° N, ${location.longitude.toFixed(5)}° E` : (locStatus === "detecting" ? "Detecting..." : "Live location unavailable")}
          </span>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.iconBtn} aria-label="Notifications">
            <Bell size={18} />
            <span className={styles.bellDot} />
          </button>
          {sosStage === "hold" && (
            <button onClick={cancelEmergency} className={styles.iconBtn} aria-label="Abort SOS">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* STAGE 1: HOLD TO TRIGGER (Dashboard Match) */}
      {sosStage === "hold" && (
        <div className={styles.stageContainer}>
          
          {/* Info Card */}
          <div className={styles.infoCard}>
            <div className={styles.infoCardIconWrapper}>
              <Shield size={24} />
            </div>
            <div className={styles.infoCardTextCol}>
              <h3 className={styles.infoCardTitle}>Help is on the way when you need it.</h3>
              <p className={styles.infoCardSub}>Your location will be shared during emergency.</p>
            </div>
            <ChevronRight size={18} className={styles.infoCardChevron} />
          </div>

          {/* Safety Indicators */}
          <div className={styles.safetyIndicatorsGrid}>
            <div className={styles.safetyIndicatorCard}>
              <Shield size={20} className={`${styles.safetyIcon} ${styles.valGreen}`} />
              <span className={styles.safetyLabel}>Crime Risk</span>
              <span className={`${styles.safetyVal} ${styles.valGreen}`}>Low</span>
            </div>
            <div className={styles.safetyIndicatorCard}>
              <Cctv size={20} className={`${styles.safetyIcon} ${styles.valGreen}`} />
              <span className={styles.safetyLabel}>CCTV Coverage</span>
              <span className={`${styles.safetyVal} ${styles.valGreen}`}>Good</span>
            </div>
            <div className={styles.safetyIndicatorCard}>
              <Lightbulb size={20} className={`${styles.safetyIcon} ${styles.valYellow}`} />
              <span className={styles.safetyLabel}>Street Lights</span>
              <span className={`${styles.safetyVal} ${styles.valYellow}`}>72%</span>
            </div>
            <div className={styles.safetyIndicatorCard}>
              <Building size={20} className={`${styles.safetyIcon} ${styles.valBlue}`} />
              <span className={styles.safetyLabel}>Hospitals Nearby</span>
              <span className={`${styles.safetyVal} ${styles.valBlue}`}>1.2 km</span>
            </div>
          </div>

          {/* Hero Center - Button */}
          <div className={styles.heroSection}>
            <div className={styles.holdButtonWrapper}>
              <div className={styles.pulseRing1} />
              <div className={styles.pulseRing2} />
              
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
            </div>

            <div className={styles.standbyBadge}>
              <Activity size={14} />
              Standby Mode Active
            </div>

            <h2 className={styles.countdownHeading}>Press and Hold to Trigger</h2>
            <p className={styles.countdownSub}>
              Keep holding for {holdSeconds} seconds to broadcast emergency signals.
            </p>
          </div>

          {/* Emergency Info Card */}
          <div className={styles.emergencyInfoCard}>
            <div className={styles.infoCardItem}>
              <div className={styles.infoCardItemIcon}>
                <Radio size={16} />
              </div>
              <span className={styles.infoCardItemText}>Alerts will be sent to Emergency Contacts</span>
            </div>
            <div className={styles.infoCardDivider} />
            <div className={styles.infoCardItem}>
              <div className={styles.infoCardItemIcon}>
                <MapPin size={16} />
              </div>
              <span className={styles.infoCardItemText}>Live location will be shared</span>
            </div>
            <div className={styles.infoCardDivider} />
            <div className={styles.infoCardItem}>
              <div className={styles.infoCardItemIcon}>
                <AlertTriangle size={16} />
              </div>
              <span className={styles.infoCardItemText}>Nearby authorities will be notified</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className={styles.quickActionsHeader}>Quick Actions</h3>
            <div className={styles.quickActionsGrid} style={{ marginTop: "20px" }}>
              <div className={styles.quickActionItem}>
                <div className={styles.quickActionIconWrapper}>
                  <ShieldAlert size={20} className={styles.iconPolice} />
                </div>
                <span className={styles.quickActionTitle}>Nearby Police</span>
                <span className={`${styles.quickActionVal} ${styles.valPolice}`}>800 m</span>
              </div>
              <div className={styles.quickActionItem}>
                <div className={styles.quickActionIconWrapper}>
                  <Heart size={20} className={styles.iconHospital} />
                </div>
                <span className={styles.quickActionTitle}>Nearby Hospitals</span>
                <span className={`${styles.quickActionVal} ${styles.valHospital}`}>1.2 km</span>
              </div>
              <div className={styles.quickActionItem}>
                <div className={styles.quickActionIconWrapper}>
                  <Users size={20} className={styles.iconContacts} />
                </div>
                <span className={styles.quickActionTitle}>Emergency Contacts</span>
                <span className={`${styles.quickActionVal} ${styles.valContacts}`}>3 Contacts</span>
              </div>
              <div className={styles.quickActionItem}>
                <div className={styles.quickActionIconWrapper}>
                  <MessageSquare size={20} className={styles.iconMessage} />
                </div>
                <span className={styles.quickActionTitle}>Auto Message</span>
                <span className={`${styles.quickActionVal} ${styles.valMessage}`}>On</span>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <div className={styles.cancelPillWrapper}>
            <button className={styles.cancelPillBtn} onClick={cancelEmergency}>
              <X size={18} />
              Cancel SOS
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: BROADCASTING SIGNALS */}
      {sosStage === "broadcasting" && (
        <div className={styles.stageContainer}>
          <div className={styles.broadcastingWrapper}>
            <div className={styles.broadcastRingAnimation}>
              <Radio size={40} className={styles.pulseRadioIcon} />
            </div>
            <h3 className={styles.broadcastingTitle}>Sending Emergency Request...</h3>
            <p className={styles.broadcastingSubtitle}>SafeRoute is contacting local emergency responders and notifying your guardians. Please stand by.</p>
            
            {/* Loading Spinner */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "24px" }}>
              <div className={styles.spinner}></div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: EMERGENCY LIVE PANEL */}
      {sosStage === "live" && (
        <div className={styles.stageContainer}>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.1em", fontSize: "0.9rem" }}>
            <Badge variant="danger" size="md" glow={true}>
              🚨 Emergency Active 🚨
            </Badge>
          </div>

          <div className={styles.etaContainerGrid}>
            <div className={styles.etaSubBox}>
              <span className={styles.etaBoxLabel}>Emergency Session</span>
              <span className={styles.etaBoxValue} style={{ color: "#EF4444", textTransform: "capitalize" }}>
                {sosResponse?.sos_status || "Active"}
              </span>
            </div>
            <div className={styles.etaSubBox}>
              <span className={styles.etaBoxLabel}>Trigger Time</span>
              <span className={styles.etaBoxValue} style={{ fontSize: "0.78rem" }}>
                {triggerTime || "Unspecified"}
              </span>
            </div>
            
            <div className={styles.etaSubBox} style={{ gridColumn: "span 2" }}>
              <span className={styles.etaBoxLabel}>Current Coordinates</span>
              <span className={styles.etaBoxValue} style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                {sosResponse?.location_url ? (
                  <>
                    <span>{location ? `${location.latitude.toFixed(6)}° N, ${location.longitude.toFixed(6)}° E` : "Detecting..."}</span>
                    <a 
                      href={sosResponse.location_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontSize: "0.75rem", color: "#3B82F6", textDecoration: "underline", fontWeight: 700 }}
                    >
                      View Emergency Location
                    </a>
                  </>
                ) : (
                  <span>Live location unavailable</span>
                )}
              </span>
            </div>

            <div className={styles.etaSubBox} style={{ gridColumn: "span 2" }}>
              <span className={styles.etaBoxLabel}>Guardian Notification Status</span>
              <span className={styles.etaBoxValue} style={{ fontSize: "0.82rem", color: "#1E2A39" }}>
                {(() => {
                  const ns = sosResponse?.notification?.notification_status;
                  if (ns === "sent") return `Emergency contacts notified (${sosResponse?.notification?.contacts_notified ?? 0})`;
                  if (ns === "partial") return `SOS activated — some emergency contacts notified (${sosResponse?.notification?.contacts_notified ?? 0}/${sosResponse?.notification?.contacts_attempted ?? 0})`;
                  if (ns === "failed") return "SOS activated — contact notification failed";
                  if (ns === "provider_not_configured") return "SOS activated — contact notification unavailable";
                  if (ns === "no_contacts") return "SOS activated — no emergency contacts configured";
                  return "Notifying emergency contacts...";
                })()}
              </span>
            </div>

            <div className={styles.etaSubBox} style={{ gridColumn: "span 2" }}>
              <span className={styles.etaBoxLabel}>Police Notification Status</span>
              <span className={styles.etaBoxValue} style={{ fontSize: "0.82rem", color: "#1E2A39" }}>
                {sosResponse?.nearest_police 
                  ? `Dispatched to ${sosResponse.nearest_police.name} (${(sosResponse.nearest_police.distance_m / 1000).toFixed(2)} km away)` 
                  : "Searching nearby police post..."}
              </span>
            </div>

            <div className={styles.etaSubBox} style={{ gridColumn: "span 2" }}>
              <span className={styles.etaBoxLabel}>Hospital Notification Status</span>
              <span className={styles.etaBoxValue} style={{ fontSize: "0.82rem", color: "#1E2A39" }}>
                {sosResponse?.nearest_hospital 
                  ? `Dispatched to ${sosResponse.nearest_hospital.name} (${(sosResponse.nearest_hospital.distance_m / 1000).toFixed(2)} km away)` 
                  : "Searching nearest trauma center..."}
              </span>
            </div>
          </div>

          <div className={styles.actionsGrid}>
            <button className={`${styles.actionTile} ${styles.tileDanger}`} onClick={handleCallPolice}>
              <PhoneCall size={18} />
              <div className={styles.tileTextCol}>
                <span className={styles.tileTitle}>Call Police</span>
                <span className={styles.tileDesc}>
                  {sosResponse?.nearest_police ? `Direct: ${sosResponse.nearest_police.name}` : "Direct police emergency hotline"}
                </span>
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

            <button className={styles.actionTile} onClick={handleCallAmbulance}>
              <Heart size={18} className={styles.redIcon} />
              <div className={styles.tileTextCol}>
                <span className={styles.tileTitle}>Call Ambulance</span>
                <span className={styles.tileDesc}>
                  {sosResponse?.nearest_hospital ? `Direct: ${sosResponse.nearest_hospital.name}` : "Direct hospital response desk"}
                </span>
              </div>
            </button>
          </div>

          <div className={styles.cancelPillWrapper} style={{ marginTop: "24px" }}>
            <button className={styles.cancelPillBtn} onClick={cancelEmergency}>
              End SOS
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Assistant (Reused from DashboardLayout) */}
      <div className={styles.aiAssistantFloating}>
        <div className={styles.aiBadgeLabel}>
          <span className={styles.aiDot} />
          <span>AI Assistant</span>
        </div>
        <button 
          className={styles.aiFloatingBtn} 
          aria-label="Ask AI Assistant"
        >
          <img src="/ai_avatar.png" alt="AI Assistant" className={styles.aiAvatarImg} />
        </button>
      </div>

    </div>
  );
};
export default EmergencyOverlay;
