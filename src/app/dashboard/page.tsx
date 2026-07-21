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
  ChevronRight,
  Sun,
  Calendar,
  Mic,
  Send,
  CheckCircle2,
  HelpCircle,
  Activity,
  Eye,
  Lightbulb,
  Phone,
  Shield,
  MessageSquareWarning
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Badge, LoadingSkeleton, SectionHeader, EmptyState } from "@/components/ui";
import { JourneyService } from "@/services/journeys";
import { SafetyService } from "@/services/safety";
import { AuthService } from "@/services/auth";
import { JourneyHistory } from "@/types";
import { useLocation } from "@/contexts/LocationContext";
import styles from "./Dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Data counts & dynamic scores
  const [recentTrip, setRecentTrip] = useState<JourneyHistory | null>(null);
  const [currentScore, setCurrentScore] = useState(75);
  const [confidencePercentage, setConfidencePercentage] = useState(87);
  const [reasons, setReasons] = useState<string[]>([]);
  const [nearestPlaces, setNearestPlaces] = useState<any[]>([]);
  const [coverageData, setCoverageData] = useState<boolean>(true);
  const [coverageMessage, setCoverageMessage] = useState<string>("");

  const { location, status: locStatus } = useLocation();

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

  useEffect(() => {
    async function loadScore() {
      if (!location) {
        if (locStatus !== "idle" && locStatus !== "detecting") {
          setCurrentScore(0);
          setCoverageData(false);
          setCoverageMessage("Real-time location is required to calculate your area's safety score.");
        }
        return;
      }
      
      try {
        const scoreRes = await SafetyService.getSafetyScore(location.latitude, location.longitude);
        if (scoreRes.coverage === false) {
          setCurrentScore(0);
          setCoverageData(false);
          setCoverageMessage(scoreRes.ai_explanation?.why_this_route || "Safety intelligence data is not yet available for this region.");
        } else {
          setCurrentScore(Math.round(scoreRes.safety_score || 0));
          setCoverageData(true);
          setReasons(scoreRes.reasons || []);
          setConfidencePercentage(scoreRes.confidence_percentage || 87);
        }
      } catch (err) {
        console.error("Score fetch failed:", err);
      }
    }
    loadScore();
  }, [location, locStatus]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  const getSafetySummary = (score: number) => {
    if (!coverageData) return coverageMessage;
    if (score >= 85) return "Your current area is well-lit and considered safe for walking.";
    if (score >= 70) return "Moderately safe area. Walk on main thoroughfares where possible.";
    return "Alert: Elevated local hazards flagged. Consider sharing live coordinates.";
  };

  const getRiskBadgeLabel = (score: number) => {
    if (!coverageData) return "UNAVAILABLE";
    if (score >= 85) return "SAFE";
    if (score >= 70) return "MODERATE";
    return "ELEVATED RISK";
  };

  const formattedDate = () => {
    const date = new Date();
    const day = date.getDate();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = days[date.getDay()];
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${day} ${month} ${year} • ${dayOfWeek} • ${hours}:${minutes} ${ampm}`;
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

  // Calculate circular stroke values
  const radius = 38;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <DashboardLayout>
      <div className={styles.container}>
        
        {/* 1. Top Greeting Header */}
        <div className={styles.headerSection}>
          <div className={styles.greetingCol}>
            <span className={styles.greetingText}>{getGreeting()},</span>
            <h2 className={styles.userName}>
              {user && (user.email === "demo@saferoute.ai" || user.name === "Demo User") ? "Siddhi" : (user?.name || "Siddhi")} 👋
            </h2>
            <p className={styles.greetingSub}>Have a safe and secure day!</p>
          </div>
          
          {/* Weather Widget */}
          <div className={styles.weatherCard}>
            <Sun className={styles.weatherSunIcon} size={28} />
            <div className={styles.weatherInfo}>
              <span className={styles.weatherTemp}>30°C</span>
              <div className={styles.weatherLocRow}>
                <MapPin size={10} className={styles.weatherPin} />
                <span className={styles.weatherLoc}>New Delhi</span>
              </div>
              <div className={styles.weatherAqiRow}>
                <span className={styles.aqiDot} />
                <span className={styles.weatherAqi}>Haze • AQI 78</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Date Badges Row */}
        <div className={styles.metaBadgesRow}>
          <div className={styles.locationBadge}>
            <MapPin size={12} className={styles.metaIcon} />
            <span className={styles.metaLabel}>Current Location</span>
            <span className={styles.metaVal}>{location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Location Unknown"}</span>
          </div>
          <div className={styles.dateBadge}>
            <Calendar size={12} className={styles.metaIcon} />
            <span className={styles.dateText}>{formattedDate()}</span>
          </div>
        </div>

        {/* 2. Primary Action Hero: Floating Search Bar */}
        <div className={styles.searchHero}>
          <div className={styles.searchInputMock} onClick={() => router.push("/navigation")}>
            <Search size={20} className={styles.searchBarIcon} />
            <span className={styles.searchPlaceholder}>Where do you want to go?</span>
            <div className={styles.searchRightActions}>
              <button className={styles.micBtn} onClick={(e) => { e.stopPropagation(); }}>
                <Mic size={18} />
              </button>
              <div className={styles.searchGoBtn}>
                <Send size={16} className={styles.navigationArrow} />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Premium Safety Card */}
        <div className={styles.safetyScoreCard}>
          <div className={styles.scoreHeaderRow}>
            <div className={styles.scoreTitleCol}>
              <span className={styles.scoreCardTitle}>AI AREA SAFETY RATING</span>
              <Shield size={14} className={styles.shieldTitleIcon} />
            </div>
            <div className={`${styles.riskBadge} ${styles[getRiskBadgeLabel(currentScore).replace(" ", "_")]}`}>
              <span>{getRiskBadgeLabel(currentScore)}</span>
              <AlertTriangle size={12} />
            </div>
          </div>
          
          <div className={styles.scoreContentGrid}>
            {/* Circle Progress */}
            <div className={styles.circularProgressContainer}>
              <svg className={styles.circularSvg} viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="safetyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="60%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
                <circle 
                  className={styles.circularBg} 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  strokeWidth={strokeWidth} 
                />
                <circle 
                  className={styles.circularFg} 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  strokeWidth={strokeWidth} 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  stroke="url(#safetyGradient)"
                  strokeLinecap="round"
                />
                {/* Marker Dot */}
                {currentScore > 0 && currentScore < 100 && (
                  <circle
                    cx={50 + radius * Math.cos((currentScore / 100) * 2 * Math.PI - Math.PI / 2)}
                    cy={50 + radius * Math.sin((currentScore / 100) * 2 * Math.PI - Math.PI / 2)}
                    r="3.5"
                    fill="#ffffff"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                  />
                )}
              </svg>
              <div className={styles.circularCenterText}>
                {coverageData ? (
                  <>
                    <span className={styles.circularScore}>{currentScore}</span>
                    <span className={styles.circularScale}>/100</span>
                    <span className={styles.circularConfidenceLabel}>AI Confidence</span>
                    <span className={styles.circularConfidenceVal}>{confidencePercentage}%</span>
                  </>
                ) : (
                  <>
                    <span className={styles.circularScore} style={{ fontSize: '24px' }}>N/A</span>
                  </>
                )}
              </div>
            </div>

            {/* Description & Insights */}
            <div className={styles.scoreDetailsCol}>
              <h4 className={styles.mainSafetyDesc}>{getSafetySummary(currentScore)}</h4>
              
              <div className={styles.crimeIncidentStatus}>
                <CheckCircle2 size={16} className={styles.checkmarkIcon} />
                <span className={styles.crimeStatusText}>
                  {!coverageData ? "No data points available." : (reasons.length > 0 ? reasons[0] : "No recent historical crime incidents detected.")}
                </span>
              </div>

              <button className={styles.whyScoreBtn} onClick={() => router.push("/navigation")}>
                <Activity size={12} />
                <span>Why this score?</span>
                <ChevronRight size={12} className={styles.whyChevron} />
              </button>
            </div>
          </div>

          <div className={styles.scoreDivider} />

          {/* Quick Stats Grid */}
          <div className={styles.quickStatsRow}>
            <div className={styles.statCol}>
              <div className={styles.statIconWrapper}>
                <Shield size={14} className={styles.statIconBlue} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statLabel}>Crime Risk</span>
                <span className={`${styles.statVal} ${styles.valGreen}`}>Low</span>
              </div>
            </div>

            <div className={styles.statCol}>
              <div className={styles.statIconWrapper}>
                <Eye size={14} className={styles.statIconEmerald} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statLabel}>CCTV Coverage</span>
                <span className={`${styles.statVal} ${styles.valGreen}`}>Good</span>
              </div>
            </div>

            <div className={styles.statCol}>
              <div className={styles.statIconWrapper}>
                <Lightbulb size={14} className={styles.statIconOrange} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statLabel}>Street Lights</span>
                <span className={`${styles.statVal} ${styles.valOrange}`}>72%</span>
              </div>
            </div>

            <div className={styles.statCol}>
              <div className={styles.statIconWrapper}>
                <Building size={14} className={styles.statIconViolet} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statLabel}>Hospitals Nearby</span>
                <span className={`${styles.statVal} ${styles.valBlue}`}>1.2 km</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Route Recommendation Card */}
        <div className={styles.routeRecommendCard} onClick={() => router.push("/navigation")}>
          <div className={styles.routeCardInfoCol}>
            <span className={styles.recommendLabel}>Recommended</span>
            <h3 className={styles.recommendTitle}>Safest Route</h3>
            
            <div className={styles.aiBadge}>
              <CheckCircle2 size={12} />
              <span>AI Recommended</span>
            </div>

            <div className={styles.routeSpecs}>
              <div className={styles.specItem}>
                <Activity size={12} className={styles.specIcon} />
                <span>18 min <span className={styles.specSub}>ETA</span></span>
              </div>
              <div className={styles.specItem}>
                <Navigation size={12} className={styles.specIconRotated} />
                <span>6.4 km <span className={styles.specSub}>Distance</span></span>
              </div>
              <div className={styles.specItem}>
                <Shield size={12} className={styles.specIcon} />
                <span>High <span className={styles.specSub}>Safety</span></span>
              </div>
            </div>
          </div>

          <div className={styles.mapSnippetWrapper}>
            <svg className={styles.recommendMapSvg} viewBox="0 0 160 140" fill="none">
              {/* Background grid */}
              <path d="M0 20 H160 M0 60 H160 M0 100 H160 M30 0 V140 M70 0 V140 M110 0 V140" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
              {/* Secondary path */}
              <path d="M 20,110 L 60,90 L 100,100 L 140,40" stroke="rgba(0,0,0,0.06)" strokeWidth="4" strokeLinecap="round" />
              {/* Safest route path */}
              <path d="M 20,110 Q 50,70 80,90 T 140,40" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" fill="none" />
              
              {/* Blue source dot */}
              <circle cx="20" cy="110" r="8" fill="rgba(79, 124, 255, 0.2)" />
              <circle cx="20" cy="110" r="4" fill="#4F7CFF" />
              
              {/* Red destination pin pin */}
              <circle cx="140" cy="40" r="5" fill="#EF4444" />
              <path d="M140 40 L140 33" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className={styles.expandMapIconBtn}>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* 5. Quick Actions Section */}
        <div className={styles.quickActionsSection}>
          <SectionHeader title="Quick Actions" />
          <div className={styles.actionsGrid}>
            <div className={styles.actionItemCard} onClick={() => router.push("/nearby")}>
              <div className={styles.actionIconOuterBlue}>
                <Building size={20} />
              </div>
              <span className={styles.actionItemTitle}>Nearby Police</span>
            </div>

            <div className={styles.actionItemCard} onClick={() => router.push("/nearby")}>
              <div className={styles.actionIconOuterRed}>
                <Heart size={20} />
              </div>
              <span className={styles.actionItemTitle}>Nearby Hospitals</span>
            </div>

            <div className={styles.actionItemCard} onClick={() => router.push("/nearby")}>
              <div className={styles.actionIconOuterOrange}>
                <Lightbulb size={20} />
              </div>
              <span className={styles.actionItemTitle}>Street Lights</span>
            </div>

            <div className={styles.actionItemCard} onClick={() => router.push("/reports")}>
              <div className={styles.actionIconOuterYellow}>
                <AlertTriangle size={20} />
              </div>
              <span className={styles.actionItemTitle}>Report Incident</span>
            </div>

            <div className={styles.actionItemCard} onClick={() => router.push("/settings")}>
              <div className={styles.actionIconOuterGreen}>
                <Phone size={20} />
              </div>
              <span className={styles.actionItemTitle}>Emergency Contacts</span>
            </div>

            <div className={styles.actionItemCard} onClick={() => router.push("/settings")}>
              <div className={styles.actionIconOuterViolet}>
                <Activity size={20} />
              </div>
              <span className={styles.actionItemTitle}>My Journeys</span>
            </div>
          </div>
        </div>

        {/* 6. Recent Activity Section */}
        {recentTrip && (
          <div className={styles.sectionBlock} style={{ marginBottom: "20px" }}>
            <SectionHeader 
              title="Recent Walk Activity" 
              action={
                <button className={styles.viewAllBtn} onClick={() => router.push("/settings")}>
                  History <ChevronRight size={14} />
                </button>
              }
            />
            
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

