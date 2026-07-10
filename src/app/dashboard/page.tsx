"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  MapPin, 
  Search, 
  Building, 
  Heart, 
  Navigation,
  ArrowRight,
  CloudSun,
  AlertTriangle,
  Award,
  ChevronRight
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Badge, LoadingSkeleton } from "@/components/ui";
import { JourneyService } from "@/services/journeys";
import { ContactService } from "@/services/contacts";
import { SafetyService } from "@/services/safety";
import { AuthService } from "@/services/auth";
import { JourneyHistory, EmergencyContact } from "@/types";
import styles from "./Dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Data counts & dynamic scores
  const [recentTrip, setRecentTrip] = useState<JourneyHistory | null>(null);
  const [currentScore, setCurrentScore] = useState(92);
  const [reasons, setReasons] = useState<string[]>([]);
  const [nearestPlaces, setNearestPlaces] = useState<any[]>([]);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        // Load authenticated profile
        const activeUser = AuthService.getSavedUser();
        setUser(activeUser);

        // Fetch recent trip
        const fetchedTrips = await JourneyService.getJourneys({ limit: 1 });
        if (fetchedTrips && fetchedTrips.length > 0) {
          setRecentTrip(fetchedTrips[0]);
        }

        // Fetch browser GPS and safety details
        let lat = 28.5306; // South Delhi Saket default
        let lng = 77.2045;

        if (navigator.geolocation) {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
                resolve();
              },
              () => {
                console.warn("Using default coordinates for South Delhi");
                resolve();
              },
              { timeout: 3000 }
            );
          });
        }

        // Fetch score index
        try {
          const scoreRes = await SafetyService.getSafetyScore(lat, lng);
          setCurrentScore(Math.round(scoreRes.safety_score));
          setReasons(scoreRes.reasons);
        } catch (err) {
          console.error("Score fetch failed:", err);
        }

        // Fetch nearest police and hospitals
        try {
          const stationsRes = await SafetyService.getPoliceStations("South Delhi");
          const hospitalsRes = await SafetyService.getHospitals("South Delhi");
          
          const stations = stationsRes.data || [];
          const hospitals = hospitalsRes.data || [];
          
          const combined = [
            ...stations.map(s => ({ ...s, type: "police" })),
            ...hospitals.map(h => ({ ...h, type: "hospital" }))
          ].slice(0, 3);
          
          setNearestPlaces(combined);
        } catch (err) {
          console.error("Safe zones query failed:", err);
        }

      } catch (err) {
        console.error("Failed to load home page requirements:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  const getSafetySummary = (score: number) => {
    if (score >= 85) return "Your current area is well-lit and considered safe for walking.";
    if (score >= 70) return "Moderately safe area. Walk on main thoroughfares where possible.";
    return "Alert: Elevated local hazards flagged. Consider sharing live coordinates.";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "8px 0" }}>
          <LoadingSkeleton count={1} height={60} />
          <LoadingSkeleton count={1} height={180} />
          <LoadingSkeleton count={1} height={56} />
          <LoadingSkeleton count={1} height={160} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        
        {/* 1. Top Greeting Header */}
        <div className={styles.headerSection}>
          <div className={styles.greetingCol}>
            <span className={styles.greetingText}>{getGreeting()},</span>
            <h2 className={styles.userName}>{user?.name || "User"}</h2>
          </div>
          <div className={styles.weatherWidget}>
            <CloudSun size={18} className={styles.weatherIcon} />
            <span className={styles.weatherText}>New Delhi • 30°C</span>
          </div>
        </div>

        {/* 2. Primary Action Hero: Floating Search Bar */}
        <div className={styles.searchHero} onClick={() => router.push("/navigation")}>
          <div className={styles.searchInputMock}>
            <Search size={20} className={styles.searchBarIcon} />
            <span className={styles.searchPlaceholder}>Where do you want to go?</span>
            <div className={styles.searchGoBtn}>
              <Navigation size={14} className={styles.navigationArrow} />
            </div>
          </div>
        </div>

        {/* 3. Premium Safety Card */}
        <Card glass={true} padding="md" className={styles.safetyScoreCard}>
          <div className={styles.scoreTopRow}>
            <div className={styles.scoreProgressCol}>
              <span className={styles.scoreCardTitle}>AI Area Safety Rating</span>
              <div className={styles.scoreRow}>
                <span className={styles.scoreNum}>{currentScore}</span>
                <span className={styles.scoreScale}>/100</span>
              </div>
            </div>
            <Badge variant={currentScore >= 85 ? "success" : currentScore >= 70 ? "warning" : "danger"} glow={true}>
              {currentScore >= 85 ? "High Safety" : currentScore >= 70 ? "Moderate" : "Low Safety"}
            </Badge>
          </div>
          <p className={styles.scoreDescription}>
            {getSafetySummary(currentScore)}
          </p>
          {reasons.length > 0 && (
            <div className={styles.reasonBadgeRow}>
              <span className={styles.reasonBadgeDot} />
              <span className={styles.reasonText}>{reasons[0]}</span>
            </div>
          )}
        </Card>

        {/* 4. Mini Map Preview */}
        <div className={styles.miniMapWrapper} onClick={() => router.push("/navigation")}>
          <div className={styles.miniMapContent}>
            {/* Simulated Vector Roads Map Overlay */}
            <svg className={styles.mapSvg} viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0,90 Q 200,30 400,90" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 0,90 Q 200,150 400,90" stroke="rgba(16,185,129,0.3)" strokeWidth="5" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M 0,90 Q 200,150 400,90" stroke="rgba(16,185,129,0.7)" strokeWidth="3" strokeLinecap="round" />
              
              <circle cx="200" cy="120" r="14" fill="rgba(59,130,246,0.15)" />
              <circle cx="200" cy="120" r="6" fill="#3b82f6" />
              <circle cx="200" cy="120" r="2" fill="#ffffff" />
              
              <text x="200" y="152" fill="var(--text-secondary)" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="var(--font-sans)">
                Your Location
              </text>
            </svg>
            <div className={styles.mapLabelCard}>
              <Navigation size={12} className={styles.labelArrow} />
              <span>Tap to preview safest route</span>
            </div>
          </div>
        </div>

        {/* 5. Nearby Safety: Horizontal scroll list */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.sectionTitle}>Nearby Safe Zones</h3>
          <div className={styles.horizontalScroll}>
            {nearestPlaces.length === 0 ? (
              <div className={styles.emptyScrollCard}>
                Locating nearby emergency support stations...
              </div>
            ) : (
              nearestPlaces.map((place, idx) => (
                <Card 
                  key={idx} 
                  glass={true} 
                  padding="sm" 
                  className={styles.scrollCard}
                  onClick={() => router.push("/nearby")}
                >
                  <div className={styles.scrollCardHeader}>
                    <div className={place.type === "police" ? styles.policeIconBg : styles.hospitalIconBg}>
                      {place.type === "police" ? <Building size={16} /> : <Heart size={16} />}
                    </div>
                    <span className={styles.scrollCardDist}>
                      {place.distance_meters ? `${(place.distance_meters / 1000).toFixed(1)} km` : "Nearby"}
                    </span>
                  </div>
                  <h4 className={styles.scrollCardName}>{place.name}</h4>
                  <span className={styles.scrollCardSub}>
                    {place.type === "police" ? "Active Guard Post" : "24/7 Medical Care"}
                  </span>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* 6. Recent Activity Section */}
        {recentTrip && (
          <div className={styles.sectionBlock} style={{ marginBottom: "20px" }}>
            <div className={styles.recentHeaderRow}>
              <h3 className={styles.sectionTitle}>Recent Walk Activity</h3>
              <button className={styles.viewAllBtn} onClick={() => router.push("/settings")}>
                History <ChevronRight size={14} />
              </button>
            </div>
            
            <Card 
              glass={true} 
              padding="sm" 
              className={styles.compactTripCard}
              onClick={() => router.push("/navigation")}
            >
              <div className={styles.compactTripLeft}>
                <div className={styles.tripBadgeCircle}>
                  <Award size={16} className={styles.tripIconEmerald} />
                </div>
                <div className={styles.tripInfoCol}>
                  <span className={styles.tripDestText}>{recentTrip.destination}</span>
                  <span className={styles.tripTimeText}>
                    {new Date(recentTrip.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric"
                    })} • Safety Score: {recentTrip.safety_score}%
                  </span>
                </div>
              </div>
              <ArrowRight size={16} className={styles.tripChevron} />
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
