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
  AlertTriangle
} from "lucide-react";
import { useEmergency } from "@/contexts/EmergencyContext";
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

  const [lat, setLat] = useState(28.5306);
  const [lng, setLng] = useState(77.2045);
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

  // Stage 2: Real SOS trigger on broadcasting
  useEffect(() => {
    if (sosStage !== "broadcasting") return;

    setApiLoading(true);
    setApiError(null);
    setSosResponse(null);

    let active = true;

    const triggerSOSCall = async () => {
      if (!navigator.geolocation) {
        if (active) {
          setApiError("GPS Unavailable: Geolocation is not supported by your browser.");
          setSosStage("hold");
          setApiLoading(false);
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!active) return;
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          setLat(currentLat);
          setLng(currentLng);

          try {
            const res = await SafetyService.triggerSOS({
              latitude: currentLat,
              longitude: currentLng
            });
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
        },
        (error) => {
          if (!active) return;
          let errorMsg = "GPS Coordinates Unavailable.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Location Permission Denied: Please enable browser GPS permissions to trigger SOS.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = "GPS Unavailable: SafeRoute is unable to establish contact with satellite location providers.";
          } else if (error.code === error.TIMEOUT) {
            errorMsg = "Timeout: Geolocation query took too long to resolve.";
          }
          setApiError(errorMsg);
          setSosStage("hold");
          setApiLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
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
          {apiError && (
            <div className={styles.errorAlertBlock}>
              <AlertTriangle size={18} className={styles.errorAlertIcon} />
              <div className={styles.errorAlertContent}>
                <h4 className={styles.errorAlertTitle}>Emergency Dispatch Failed</h4>
                <p className={styles.errorAlertMessage}>{apiError}</p>
              </div>
              <button onClick={() => setApiError(null)} className={styles.errorAlertDismissBtn} aria-label="Dismiss error">
                <X size={14} />
              </button>
            </div>
          )}

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
              <h3 className={styles.broadcastingTitle}>Sending Emergency Request...</h3>
              <p className={styles.broadcastingSubtitle}>SafeRoute is contacting local emergency responders and notifying your guardians. Please stand by.</p>
              
              {/* Loading Spinner */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "24px" }}>
                <div className={styles.spinner}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: EMERGENCY LIVE PANEL */}
      {sosStage === "live" && (
        <div className={styles.stageContainer}>
          {/* Main Emergency Active Banner */}
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.1em", fontSize: "0.9rem" }}>
            <Badge variant="danger" size="md" glow={true}>
              🚨 Emergency Active 🚨
            </Badge>
          </div>

          {/* Location Area Card */}
          <div className={styles.statusCard}>
            <span className={styles.locationTitleLabel}>YOUR RESOLVED LOCATION</span>
            <div className={styles.locationAddressRow}>
              <MapPin size={16} className={styles.emeraldIcon} />
              <p className={styles.addressText}>
                {sosResponse?.nearest_police?.address || sosResponse?.nearest_hospital?.address || "Address resolving near south district coordinates"}
              </p>
            </div>
          </div>

          {/* ETA / Dispatch Metrics Card */}
          <div className={styles.etaContainerGrid}>
            <div className={styles.etaSubBox}>
              <span className={styles.etaBoxLabel}>Emergency Session</span>
              <span className={styles.etaBoxValue} style={{ color: "var(--status-danger)", textTransform: "capitalize" }}>
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
              <span className={styles.etaBoxValue} style={{ fontSize: "0.85rem" }}>
                {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
              </span>
            </div>

            <div className={styles.etaSubBox} style={{ gridColumn: "span 2" }}>
              <span className={styles.etaBoxLabel}>Guardian Notification Status</span>
              <span className={styles.etaBoxValue} style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                {contactsCount > 0 ? `Notified (${contactsCount} Guardians via SMS Broadcast)` : "No Emergency Contacts configured"}
              </span>
            </div>

            <div className={styles.etaSubBox} style={{ gridColumn: "span 2" }}>
              <span className={styles.etaBoxLabel}>Police Notification Status</span>
              <span className={styles.etaBoxValue} style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                {sosResponse?.nearest_police 
                  ? `Dispatched to ${sosResponse.nearest_police.name} (${(sosResponse.nearest_police.distance_m / 1000).toFixed(2)} km away)` 
                  : "Searching nearby police post..."}
              </span>
            </div>

            <div className={styles.etaSubBox} style={{ gridColumn: "span 2" }}>
              <span className={styles.etaBoxLabel}>Hospital Notification Status</span>
              <span className={styles.etaBoxValue} style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                {sosResponse?.nearest_hospital 
                  ? `Dispatched to ${sosResponse.nearest_hospital.name} (${(sosResponse.nearest_hospital.distance_m / 1000).toFixed(2)} km away)` 
                  : "Searching nearest trauma center..."}
              </span>
            </div>
          </div>

          {/* Touch actions tiles */}
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
