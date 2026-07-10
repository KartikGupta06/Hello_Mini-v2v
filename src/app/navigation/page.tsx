"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Navigation as NavIcon, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  ArrowUpDown,
  Mic,
  Crosshair,
  Layers,
  Compass,
  Locate,
  Share2,
  ChevronLeft,
  Volume2,
  VolumeX,
  Phone,
  Building,
  Heart
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Badge, MapContainer, LoadingSkeleton } from "@/components/ui";
import { SafetyService } from "@/services/safety";
import { JourneyService } from "@/services/journeys";
import { ContactService } from "@/services/contacts";
import { AuthService } from "@/services/auth";
import { User, EmergencyContact } from "@/types";
import { calculateDistance } from "@/utils/helpers";
import styles from "./Navigation.module.css";

const MOCK_SUGGESTIONS = [
  { name: "Malviya Nagar Police Station Area, South Delhi", coords: [77.2045, 28.5306] },
  { name: "Saket Metro District, South Delhi", coords: [77.2083, 28.5233] },
  { name: "Delhi Police - Mehrauli Area, South Delhi", coords: [77.1779, 28.5262] },
  { name: "Times Square Broadway District, NYC", coords: [-73.9851, 40.7580] },
  { name: "Union Square Park District, NYC", coords: [-73.9911, 40.7359] }
];

const QUICK_FILTERS = [
  { label: "Safest", id: "safest" },
  { label: "Fastest", id: "fastest" },
  { label: "Balanced", id: "balanced" },
  { label: "Avoid Crowds", id: "avoid-crowds" },
  { label: "Well Lit", id: "well-lit" },
  { label: "Police Nearby", id: "police-nearby" }
];

const AI_INSIGHTS = [
  "✓ Stay on this street. It is well lit and has low crime rating.",
  "✓ Police station ahead in 500m.",
  "⚠ Community reported poor lighting 300m ahead. Stay on the main avenue.",
  "✓ Crowded commercial area ahead increases active safety score."
];

export default function NavigationPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [origin, setOrigin] = useState("Saket Metro District, South Delhi");
  const [destination, setDestination] = useState("Malviya Nagar Police Station Area, South Delhi");
  
  const [originCoords, setOriginCoords] = useState<[number, number]>([77.2083, 28.5233]);
  const [destCoords, setDestCoords] = useState<[number, number]>([77.2045, 28.5306]);

  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("safest");
  const [isSearching, setIsSearching] = useState(false);
  const [originFocused, setOriginFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("safest");

  // Active Walk States
  const [activeJourneyId, setActiveJourneyId] = useState<number | null>(null);
  const [activeWalkMode, setActiveWalkMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [navSheetExpanded, setNavSheetExpanded] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [safePlaces, setSafePlaces] = useState<any[]>([]);

  // Dynamic calculations container
  const [dynamicRoutes, setDynamicRoutes] = useState<any[]>([]);
  const [recommendationReason, setRecommendationReason] = useState("");
  const [tradeOffsSummary, setTradeOffsSummary] = useState("");

  useEffect(() => {
    setUser(AuthService.getSavedUser());
    loadEmergencyData();
  }, []);

  // Rotate AI Insights during walk navigation
  useEffect(() => {
    if (!activeWalkMode) return;
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % AI_INSIGHTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeWalkMode]);

  const loadEmergencyData = async () => {
    try {
      const contacts = await ContactService.getContacts();
      setEmergencyContacts(contacts.slice(0, 2));
      
      const stations = await SafetyService.getPoliceStations("South Delhi");
      setSafePlaces(stations.data.slice(0, 2));
    } catch (e) {
      console.error("Failed to load emergency overlay details:", e);
    }
  };

  const handleSuggestClick = (name: string, coords: number[], type: "origin" | "dest") => {
    if (type === "origin") {
      setOrigin(name);
      setOriginCoords(coords as [number, number]);
      setOriginFocused(false);
    } else {
      setDestination(name);
      setDestCoords(coords as [number, number]);
      setDestFocused(false);
    }
  };

  const handleSwapLocations = () => {
    const tempOrigin = origin;
    const tempCoords = originCoords;
    setOrigin(destination);
    setOriginCoords(destCoords);
    setDestination(tempOrigin);
    setDestCoords(tempCoords);
    if (showRoutes) {
      handleRouteSearch();
    }
  };

  const generateCoordinatesLine = (
    start: [number, number],
    end: [number, number],
    offsetFactor: number,
    steps = 8
  ): { lat: number; lng: number }[] => {
    const points: { lat: number; lng: number }[] = [];
    const [lng1, lat1] = start;
    const [lng2, lat2] = end;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let lng = lng1 + (lng2 - lng1) * t;
      let lat = lat1 + (lat2 - lat1) * t;

      if (i > 0 && i < steps) {
        const orthoLng = -(lat2 - lat1);
        const orthoLat = lng2 - lng1;
        const length = Math.sqrt(orthoLng * orthoLng + orthoLat * orthoLat);
        if (length > 0) {
          const sine = Math.sin(t * Math.PI);
          lng += (orthoLng / length) * offsetFactor * sine;
          lat += (orthoLat / length) * offsetFactor * sine;
        }
      }
      points.push({ lat, lng });
    }
    return points;
  };

  const handleRouteSearch = async () => {
    setIsSearching(true);
    setSheetExpanded(true);
    try {
      const distance = calculateDistance(originCoords[1], originCoords[0], destCoords[1], destCoords[0]);
      
      const safestLine = generateCoordinatesLine(originCoords, destCoords, 0.0035);
      const balancedLine = generateCoordinatesLine(originCoords, destCoords, 0);
      const fastestLine = generateCoordinatesLine(originCoords, destCoords, -0.002);

      const candidateInputs = [
        {
          id: "safest",
          name: "AI Safe Path",
          coordinates: safestLine,
          distance_meters: distance * 1.15,
          time_seconds: (distance * 1.15) / 1.3
        },
        {
          id: "balanced",
          name: "Balanced Avenue Path",
          coordinates: balancedLine,
          distance_meters: distance * 1.0,
          time_seconds: (distance * 1.0) / 1.3
        },
        {
          id: "fastest",
          name: "Standard Direct Path",
          coordinates: fastestLine,
          distance_meters: distance * 0.9,
          time_seconds: (distance * 0.9) / 1.4
        }
      ];

      const analysisResponse = await SafetyService.analyzeRoutes(candidateInputs);
      
      setRecommendationReason(analysisResponse.recommendation_reason);
      setTradeOffsSummary(analysisResponse.trade_offs_summary);

      const colors = { safest: "#10b981", balanced: "#3b82f6", fastest: "#f59e0b" };
      const badgeVariants = { safest: "success" as const, balanced: "info" as const, fastest: "warning" as const };

      const computedRoutes = candidateInputs.map((candidate) => {
        const ranking = analysisResponse.rankings.find((r) => r.route_id === candidate.id);
        const detailed = analysisResponse.detailed_analyses.find((d) => d.route_id === candidate.id);

        const score = Math.round(ranking?.avg_safety_score || 70);
        const timeMins = Math.round(candidate.time_seconds / 60);
        const distanceKm = (candidate.distance_meters / 1000).toFixed(1);

        const finalHotspots = (detailed?.hotspots || []).map((h) => ({
          lat: h.coordinates[0]?.lat || 0,
          lng: h.coordinates[0]?.lng || 0,
          type: h.type as any,
          description: h.description
        }));

        let notes = "Suggested safety prioritizations.";
        if (candidate.id === "safest") {
          notes = "Calculated safe pathway avoiding risk zones.";
        } else if (candidate.id === "fastest") {
          notes = "Shortest walking path, but passes closer to reported risk segments.";
        } else {
          notes = "Moderate exposure containing standard commercial lighting coverage.";
        }

        return {
          id: candidate.id,
          name: candidate.name,
          coordinates: candidate.coordinates.map((c) => [c.lng, c.lat]),
          color: colors[candidate.id as keyof typeof colors],
          distance: `${distanceKm} km`,
          time: `${timeMins} min`,
          score,
          badgeVariant: badgeVariants[candidate.id as keyof typeof badgeVariants],
          isAISuggested: analysisResponse.recommended_route_id === candidate.id,
          notes,
          hotspots: finalHotspots
        };
      });

      setDynamicRoutes(computedRoutes);
      setSelectedRoute(analysisResponse.recommended_route_id || "safest");
      setShowRoutes(true);
      setSheetExpanded(true);
    } catch (e) {
      console.error("Route analysis failure:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartWalk = async () => {
    if (!user) return;
    const selectedRouteData = dynamicRoutes.find((r) => r.id === selectedRoute);
    if (!selectedRouteData) return;

    try {
      const payload = {
        origin,
        destination,
        origin_lat: originCoords[1],
        origin_lng: originCoords[0],
        dest_lat: destCoords[1],
        dest_lng: destCoords[0],
        user_id: user.id,
        safety_score: selectedRouteData.score,
        status: "active",
        duration_seconds: 0,
        journey_metadata: {
          route_id: selectedRoute,
          distance: selectedRouteData.distance,
          time: selectedRouteData.time,
          hotspots_count: selectedRouteData.hotspots?.length || 0
        }
      };

      const journey = await JourneyService.createJourney(payload);
      setActiveJourneyId(journey.id);
      setActiveWalkMode(true);
      setNavSheetExpanded(false);
    } catch (e) {
      console.error("Failed to register active journey:", e);
    }
  };

  const handleCompleteWalk = async () => {
    if (!activeJourneyId) return;
    try {
      const selectedRouteData = dynamicRoutes.find((r) => r.id === selectedRoute);
      const minutes = selectedRouteData ? parseInt(selectedRouteData.time) : 10;

      await JourneyService.updateJourney(activeJourneyId, {
        status: "completed",
        duration_seconds: minutes * 60,
        completed_at: new Date().toISOString()
      });

      setActiveWalkMode(false);
      setActiveJourneyId(null);
      router.push("/dashboard");
    } catch (e) {
      console.error("Failed to complete journey log:", e);
    }
  };

  const handleResetSearch = () => {
    setShowRoutes(false);
    setDynamicRoutes([]);
    setActiveWalkMode(false);
    setActiveJourneyId(null);
    setSheetExpanded(false);
  };

  const activeRouteData = useMemo(() => {
    return dynamicRoutes.find((r) => r.id === selectedRoute) || dynamicRoutes[0];
  }, [selectedRoute, dynamicRoutes]);

  const getSafetyMarginPercent = () => {
    if (dynamicRoutes.length < 2) return 24;
    const safestScore = dynamicRoutes.find(r => r.id === "safest")?.score || 90;
    const fastestScore = dynamicRoutes.find(r => r.id === "fastest")?.score || 70;
    return Math.round(((safestScore - fastestScore) / fastestScore) * 100);
  };

  return (
    <DashboardLayout>
      <div className={styles.navContainer}>
        
        {/* Dominant Map Layer */}
        <div className={styles.mapSandbox}>
          <MapContainer 
            routes={dynamicRoutes.length ? dynamicRoutes : []} 
            selectedRouteId={selectedRoute} 
            onRouteSelect={setSelectedRoute} 
            center={originCoords}
            zoom={15}
          />
        </div>

        {/* 1. PLANNER: Top Search Overlay */}
        {!showRoutes && !activeWalkMode && (
          <div className={styles.floatingSearchWrapper}>
            <Card padding="sm" glass={true} className={styles.searchCard}>
              <div className={styles.searchFormRow}>
                <div className={styles.inputsStack}>
                  <div className={styles.inputBox}>
                    <span className={styles.dotOrigin} />
                    <input 
                      type="text" 
                      value={origin} 
                      onChange={(e) => setOrigin(e.target.value)}
                      onFocus={() => { setOriginFocused(true); setDestFocused(false); }}
                      onBlur={() => setTimeout(() => setOriginFocused(false), 200)}
                      placeholder="Start location..." 
                      className={styles.premiumInput}
                    />
                    <Mic size={14} className={styles.micIcon} />
                    {originFocused && (
                      <div className={styles.suggestionsList}>
                        {MOCK_SUGGESTIONS.map((s, idx) => (
                          <div 
                            key={idx} 
                            onMouseDown={() => handleSuggestClick(s.name, s.coords, "origin")} 
                            className={styles.suggestPill}
                          >
                            <MapPin size={12} />
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.inputBox}>
                    <MapPin size={14} className={styles.pinDest} />
                    <input 
                      type="text" 
                      value={destination} 
                      onChange={(e) => setDestination(e.target.value)}
                      onFocus={() => { setDestFocused(true); setOriginFocused(false); }}
                      onBlur={() => setTimeout(() => setDestFocused(false), 200)}
                      placeholder="Where do you want to go?" 
                      className={styles.premiumInput}
                    />
                    <Mic size={14} className={styles.micIcon} />
                    {destFocused && (
                      <div className={styles.suggestionsList}>
                        {MOCK_SUGGESTIONS.map((s, idx) => (
                          <div 
                            key={idx} 
                            onMouseDown={() => handleSuggestClick(s.name, s.coords, "dest")} 
                            className={styles.suggestPill}
                          >
                            <MapPin size={12} />
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.sideButtonsCol}>
                  <button onClick={handleSwapLocations} className={styles.swapCircleBtn} aria-label="Swap locations">
                    <ArrowUpDown size={16} />
                  </button>
                  <button onClick={handleRouteSearch} className={styles.goSearchBtn} aria-label="Search route">
                    <Search size={16} />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 2. RESULTS: Top Minimal Floating Header */}
        {showRoutes && !activeWalkMode && (
          <div className={styles.floatingResultsHeader}>
            <button onClick={handleResetSearch} className={styles.backResultsBtn} aria-label="Edit route criteria">
              <ChevronLeft size={20} />
            </button>
            <div className={styles.resultsHeaderDetails}>
              <span className={styles.resultsHeaderSub}>Destination</span>
              <h3 className={styles.resultsHeaderDest}>{destination.split(",")[0]}</h3>
            </div>
            <button className={styles.shareResultsBtn} onClick={() => alert("Route sharing link copied.")}>
              <Share2 size={18} />
            </button>
          </div>
        )}

        {/* 3. NAVIGATION: M5 Top Floating Instruction Card */}
        {activeWalkMode && activeRouteData && (
          <div className={styles.navigationTopWrapper}>
            <Card padding="sm" glass={true} className={styles.navInstructionCard}>
              <div className={styles.navInstructionLeft}>
                <div className={styles.navDirectionCircle}>
                  <NavIcon size={20} className={styles.navInstructionArrow} />
                </div>
                <div className={styles.instructionTextCol}>
                  <h3 className={styles.instructionHeading}>Turn left in 120m</h3>
                  <span className={styles.streetNameText}>Press Enclave Marg</span>
                </div>
              </div>
              <div className={styles.navInstructionMeta}>
                <span className={styles.etaNavText}>{activeRouteData.time}</span>
                <span className={styles.distNavText}>{activeRouteData.distance} left</span>
              </div>
            </Card>

            {/* Slim Live Safety Status Bar directly below instruction */}
            <div className={styles.liveSafetyBar}>
              <div className={styles.safetyBarMetric}>
                <span className={styles.safetyBarLabel}>Safety Rating</span>
                <span className={styles.safetyBarScore} style={{ color: activeRouteData.color }}>
                  {activeRouteData.score}% Secure
                </span>
              </div>
              <div className={styles.verticalSafetyDivider} />
              <div className={styles.safetyBarMetric}>
                <span className={styles.safetyBarLabel}>Risk Profile</span>
                <span className={styles.safetyBarRiskText}>Low Risk</span>
              </div>
              <div className={styles.verticalSafetyDivider} />
              <div className={styles.safetyBarMetric}>
                <span className={styles.safetyBarLabel}>AI Channel</span>
                <span className={styles.safetyBarShield}>🛡️ Enforced</span>
              </div>
            </div>

            {/* AI Assistant Live Guidance insight bar */}
            <div className={styles.aiGuidanceInsightCard}>
              <Sparkles size={14} className={styles.guidanceSparkle} />
              <span className={styles.guidanceText}>{AI_INSIGHTS[insightIndex]}</span>
            </div>
          </div>
        )}

        {/* PLANNER: Quick Filter Chips */}
        {!showRoutes && !activeWalkMode && (
          <div className={styles.chipsScroll}>
            {QUICK_FILTERS.map(f => (
              <button 
                key={f.id} 
                className={`${styles.filterChip} ${activeFilter === f.id ? styles.activeChip : ""}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Floating Right Map Controls */}
        <div className={styles.floatingActionsCol} style={{ bottom: activeWalkMode ? "170px" : showRoutes ? "160px" : "120px" }}>
          <button className={styles.actionRoundBtn} aria-label="Recenter Map" onClick={() => alert("Recentering map view...")}>
            <Crosshair size={16} />
          </button>
          <button className={styles.actionRoundBtn} aria-label="Layer Options">
            <Layers size={16} />
          </button>
          {activeWalkMode ? (
            <button className={styles.actionRoundBtn} aria-label="Mute voice guidance toggle" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={16} style={{ color: "var(--status-danger)" }} /> : <Volume2 size={16} />}
            </button>
          ) : (
            <button className={styles.actionRoundBtn} aria-label="Compass Orientation">
              <Compass size={16} />
            </button>
          )}
          <button className={styles.actionRoundBtn} aria-label="Verify GPS status">
            <Locate size={16} style={{ color: "var(--accent-emerald)" }} />
          </button>
        </div>

        {/* Bottom Right Floating Urgent SOS alert button */}
        {activeWalkMode && (
          <Link href="/emergency" className={styles.floatingSosOverlayBtn} aria-label="Trigger SOS Broadcast">
            <div className={styles.floatingSosPulse} />
            <div className={styles.floatingSosCircle}>
              <ShieldAlert size={26} />
            </div>
          </Link>
        )}

        {/* RESULTS: M4 Sliding Results Bottom Sheet */}
        {showRoutes && !activeWalkMode && (
          <div className={`${styles.bottomSheet} ${sheetExpanded ? styles.sheetExpandedM4 : styles.sheetCollapsedM4}`}>
            <div className={styles.sheetHandleRow} onClick={() => setSheetExpanded(!sheetExpanded)}>
              <div className={styles.sheetHandleDragBar} />
              {!sheetExpanded && activeRouteData && (
                <div className={styles.collapsedHeaderContent}>
                  <div className={styles.collapsedMeta}>
                    <span className={styles.collapsedDestName}>{destination.split(",")[0]}</span>
                    <span className={styles.collapsedDuration}>
                      ETA: <strong>{activeRouteData.time}</strong> ({activeRouteData.distance})
                    </span>
                  </div>
                  <div className={styles.collapsedBadgeCol}>
                    <span className={styles.collapsedBadgeScore} style={{ color: activeRouteData.color }}>
                      {activeRouteData.score}% Safe
                    </span>
                    <span className={styles.swipeIndicatorText}>Swipe up for AI Insights</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.sheetBody}>
              {isSearching ? (
                <div className={styles.aiLoadingWrapper}>
                  <div className={styles.aiPulseCircle}>
                    <Sparkles size={28} className={styles.sparkleIconAnim} />
                  </div>
                  <h4 className={styles.aiLoadingTitle}>AI Preparing Safest Route...</h4>
                  <p className={styles.aiLoadingSub}>Evaluating lighting layers and historical reports</p>
                </div>
              ) : (
                <div className={styles.expandedContent}>
                  <Card glass={true} padding="sm" className={styles.decisionHeroCard}>
                    <div className={styles.decisionTop}>
                      <div className={styles.decisionValueCol}>
                        <span className={styles.decisionLabel}>AI Route Safety Index</span>
                        <div className={styles.decisionScoreRow}>
                          <span className={styles.decisionScoreNum}>{activeRouteData.score}</span>
                          <span className={styles.decisionScoreScale}>/100</span>
                        </div>
                      </div>
                      <div className={styles.decisionStatusCol}>
                        <Badge variant={activeRouteData.badgeVariant} size="md" glow={true}>
                          {activeRouteData.score >= 85 ? "Very Safe" : "Moderately Safe"}
                        </Badge>
                        <span className={styles.confidenceText}>Confidence: 96%</span>
                      </div>
                    </div>
                  </Card>

                  <div className={styles.explanationSection}>
                    <h4 className={styles.resultsSubtitle}>Key Safety Indicators</h4>
                    <div className={styles.chipsWrap}>
                      <div className={styles.explanationChip}>✓ Well Lit Area</div>
                      <div className={styles.explanationChip}>✓ Police Nearby</div>
                      <div className={styles.explanationChip}>✓ Low Crime Rating</div>
                      <div className={styles.explanationChip}>✓ High Foot Traffic</div>
                    </div>
                  </div>

                  <div className={styles.comparisonGrid}>
                    {dynamicRoutes.map(r => {
                      const isSelected = r.id === selectedRoute;
                      return (
                        <div 
                          key={r.id} 
                          onClick={() => setSelectedRoute(r.id)}
                          className={`${styles.compareCard} ${isSelected ? styles.compareCardActive : ""}`}
                          style={{ borderTop: `3px solid ${r.color}` }}
                        >
                          <span className={styles.compareName}>{r.id === "safest" ? "Safest" : r.id === "balanced" ? "Balanced" : "Fastest"}</span>
                          <span className={styles.compareScore} style={{ color: r.color }}>{r.score}%</span>
                          <span className={styles.compareMeta}>{r.time}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Card glass={true} padding="sm" className={styles.aiInsightCard}>
                    <div className={styles.insightHeader}>
                      <Sparkles size={16} className={styles.sparkleIcon} />
                      <span className={styles.insightTitle}>AI SafeRoute Briefing</span>
                    </div>
                    <p className={styles.insightText}>
                      This route is <strong>{getSafetyMarginPercent()}% safer</strong> than the fastest direct alternative because it routes along commercial corridors with verified public lighting.
                    </p>
                  </Card>

                  <div className={styles.actionBtnWrapper}>
                    <Button variant="emerald" className={styles.startWalkBtn} onClick={handleStartWalk}>
                      Start Safe Navigation ({activeRouteData.time})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. NAVIGATION: M5 Sliding Bottom Mini Sheet */}
        {activeWalkMode && activeRouteData && (
          <div className={`${styles.bottomSheet} ${navSheetExpanded ? styles.sheetExpandedM5 : styles.sheetCollapsedM5}`}>
            <div className={styles.sheetHandleRow} onClick={() => setNavSheetExpanded(!navSheetExpanded)}>
              <div className={styles.sheetHandleDragBar} />
              
              {/* Collapsed state mini info bar */}
              {!navSheetExpanded && (
                <div className={styles.collapsedHeaderContent}>
                  <div className={styles.collapsedMeta}>
                    <span className={styles.collapsedDestName}>To: {destination.split(",")[0]}</span>
                    <span className={styles.collapsedDuration}>
                      ETA: <strong>{activeRouteData.time}</strong> ({activeRouteData.distance} left)
                    </span>
                  </div>
                  <Badge variant={activeRouteData.badgeVariant} size="sm" glow={true}>
                    🛡️ {activeRouteData.score}% Safety Index
                  </Badge>
                </div>
              )}
            </div>

            <div className={styles.sheetBody}>
              <div className={styles.expandedContent}>
                
                {/* A. Walk route summary heading */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.03em" }}>
                    Route Summary
                  </span>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: "600", margin: 0 }}>
                    Walkway via Press Enclave Marg Corridor.
                  </p>
                </div>

                {/* B. Emergency Contacts shortcuts */}
                <div className={styles.emergencyShortcutSection}>
                  <h4 className={styles.resultsSubtitle}>Quick Call Guardians</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    {emergencyContacts.length === 0 ? (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        No guardians configured. Go to Profile Settings page to add.
                      </span>
                    ) : (
                      emergencyContacts.map(c => (
                        <div key={c.id} className={styles.shortcutContactRow}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-primary)" }}>{c.name}</span>
                            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{c.relationship_type || "Guardian"}</span>
                          </div>
                          <button onClick={() => alert(`Dialing guardian ${c.name} (${c.phone})...`)} className={styles.callShortcutBtn}>
                            <Phone size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* C. Safe Havens nearby list */}
                <div className={styles.havensShortcutSection}>
                  <h4 className={styles.resultsSubtitle}>Emergency Safe places</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    {safePlaces.map(s => (
                      <div key={s.id} className={styles.shortcutContactRow}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <div className={styles.smallHavenIconBg}>
                            <Building size={14} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-primary)" }}>{s.name}</span>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{s.address}</span>
                          </div>
                        </div>
                        <button onClick={() => alert(`Displaying path directly to shelter: ${s.name}...`)} className={styles.directHavenBtn}>
                          <NavIcon size={12} style={{ transform: "rotate(45deg)" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* D. Finish button trigger */}
                <div className={styles.actionBtnWrapper} style={{ marginTop: "8px" }}>
                  <Button variant="emerald" className={styles.startWalkBtn} onClick={handleCompleteWalk}>
                    Complete Navigation Walk
                  </Button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
