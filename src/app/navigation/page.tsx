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
  TrendingUp, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles,
  ChevronUp,
  ChevronDown,
  Info,
  MapPinOff,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Badge, MapContainer, LoadingSkeleton } from "@/components/ui";
import { SafetyService } from "@/services/safety";
import { JourneyService } from "@/services/journeys";
import { AuthService } from "@/services/auth";
import { User, RouteDetail, RouteHotspot } from "@/types";
import { calculateDistance } from "@/utils/helpers";
import styles from "./Navigation.module.css";

// Seeded South Delhi and NYC suggest locations
const MOCK_SUGGESTIONS = [
  { name: "Malviya Nagar Police Station Area, South Delhi", coords: [77.2045, 28.5306] },
  { name: "Saket Metro District, South Delhi", coords: [77.2083, 28.5233] },
  { name: "Delhi Police - Mehrauli Area, South Delhi", coords: [77.1779, 28.5262] },
  { name: "Times Square Broadway District, NYC", coords: [-73.9851, 40.7580] },
  { name: "Union Square Park District, NYC", coords: [-73.9911, 40.7359] }
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
  const [sheetExpanded, setSheetExpanded] = useState(true);

  // Active Walk States
  const [activeJourneyId, setActiveJourneyId] = useState<number | null>(null);
  const [activeWalkMode, setActiveWalkMode] = useState(false);

  // Dynamic calculations container
  const [dynamicRoutes, setDynamicRoutes] = useState<any[]>([]);
  const [recommendationReason, setRecommendationReason] = useState("");
  const [tradeOffsSummary, setTradeOffsSummary] = useState("");

  useEffect(() => {
    setUser(AuthService.getSavedUser());
  }, []);

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

  // Helper to interpolate coordinate curves between points
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
        // Orthogonal offset vector for curving paths
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
    try {
      const distance = calculateDistance(originCoords[1], originCoords[0], destCoords[1], destCoords[0]);
      
      // Construct 3 distinct coordinate lines
      // Safest (offset to left), Balanced (straight), Fastest (offset to right)
      const safestLine = generateCoordinatesLine(originCoords, destCoords, 0.0035);
      const balancedLine = generateCoordinatesLine(originCoords, destCoords, 0);
      const fastestLine = generateCoordinatesLine(originCoords, destCoords, -0.002);

      const candidateInputs = [
        {
          id: "safest",
          name: "AI Safe Path",
          coordinates: safestLine,
          distance_meters: distance * 1.15,
          time_seconds: (distance * 1.15) / 1.3 // Average walking speed: 1.3 m/s
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
          time_seconds: (distance * 0.9) / 1.4 // Speed up slightly for shortcut
        }
      ];

      // Fetch dynamic analysis rankings from FastAPI Router
      const analysisResponse = await SafetyService.analyzeRoutes(candidateInputs);
      
      setRecommendationReason(analysisResponse.recommendation_reason);
      setTradeOffsSummary(analysisResponse.trade_offs_summary);

      // Re-map backend responses to matching map layouts structure
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
          coordinates: candidate.coordinates.map((c) => [c.lng, c.lat]), // Mapbox expects [lng, lat]
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
  };

  const activeRouteData = useMemo(() => {
    return dynamicRoutes.find((r) => r.id === selectedRoute) || dynamicRoutes[0];
  }, [selectedRoute, dynamicRoutes]);

  return (
    <DashboardLayout>
      <div className={styles.navContainer}>
        {/* Fill map sandbox layer */}
        <div className={styles.mapSandbox}>
          <MapContainer 
            routes={dynamicRoutes.length ? dynamicRoutes : []} 
            selectedRouteId={selectedRoute} 
            onRouteSelect={setSelectedRoute} 
            center={originCoords}
            zoom={14}
          />
        </div>

        {/* Floating Controls Header overlay */}
        <div className={styles.floatingUI}>
          
          {/* Active Navigation Control View */}
          {activeWalkMode && activeRouteData ? (
            <div className={styles.searchContainer} style={{ zIndex: 100 }}>
              <Card padding="md" glass={true} className={styles.searchCard} style={{ borderLeft: `4px solid ${activeRouteData.color}` }}>
                <div className={styles.searchTitleRow}>
                  <div className={styles.titleIconGroup}>
                    <span className={styles.pulseDot} style={{ backgroundColor: "var(--accent-emerald)" }} />
                    <h3 className={styles.searchTitle}>Active Safe Walk</h3>
                  </div>
                  <Badge variant="success" size="sm" glow={true}>
                    Broadcasting Live
                  </Badge>
                </div>
                <div style={{ margin: "1rem 0", fontSize: "0.9rem" }}>
                  <p style={{ color: "var(--text-secondary)" }}>Navigating from <strong>{origin}</strong></p>
                  <p style={{ color: "var(--text-secondary)" }}>to <strong>{destination}</strong></p>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                    <span>ETA: <strong>{activeRouteData.time}</strong></span>
                    <span>Distance: <strong>{activeRouteData.distance}</strong></span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <Button variant="emerald" fullWidth onClick={handleCompleteWalk} leftIcon={<CheckCircle size={16} />}>
                    Complete Journey
                  </Button>
                  <Link href="/emergency" style={{ flex: 1 }}>
                    <Button variant="danger" fullWidth leftIcon={<ShieldAlert size={16} />}>
                      SOS Urgent
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          ) : (
            /* Standard Planner Container */
            <div className={styles.searchContainer}>
              <Card padding="md" glass={true} className={styles.searchCard}>
                <div className={styles.searchTitleRow}>
                  <div className={styles.titleIconGroup}>
                    <Sparkles size={16} className={styles.sparkleIcon} />
                    <h3 className={styles.searchTitle}>Plan Safe Route</h3>
                  </div>
                  {showRoutes && (
                    <button onClick={handleResetSearch} className={styles.resetBtn} title="Reset Route search">
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className={styles.searchForm}>
                  <div className={styles.inputWrapper}>
                    <MapPin size={16} className={styles.pinBlue} />
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      onFocus={() => { setOriginFocused(true); setDestFocused(false); }}
                      onBlur={() => setTimeout(() => setOriginFocused(false), 200)}
                      placeholder="Enter start point..."
                      className={styles.floatingInput}
                    />
                    {originFocused && (
                      <div className={styles.suggestionsDropdown}>
                        {MOCK_SUGGESTIONS.map((s, idx) => (
                          <div 
                            key={idx} 
                            onMouseDown={() => handleSuggestClick(s.name, s.coords, "origin")} 
                            className={styles.suggestItem}
                          >
                            <MapPin size={12} />
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.inputWrapper}>
                    <Search size={16} className={styles.searchGreen} />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onFocus={() => { setDestFocused(true); setOriginFocused(false); }}
                      onBlur={() => setTimeout(() => setDestFocused(false), 200)}
                      placeholder="Enter destination..."
                      className={styles.floatingInput}
                    />
                    {destFocused && (
                      <div className={styles.suggestionsDropdown}>
                        {MOCK_SUGGESTIONS.map((s, idx) => (
                          <div 
                            key={idx} 
                            onMouseDown={() => handleSuggestClick(s.name, s.coords, "dest")} 
                            className={styles.suggestItem}
                          >
                            <MapPin size={12} />
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {!showRoutes && (
                    <Button 
                      variant="emerald" 
                      onClick={handleRouteSearch}
                      isLoading={isSearching}
                      className={styles.searchBtn}
                      leftIcon={<NavIcon size={16} />}
                    >
                      Analyze Paths
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Desktop Route Comparison Sidebar overlay */}
          {showRoutes && !activeWalkMode && dynamicRoutes.length > 0 && (
            <div className={styles.desktopSidebar}>
              <Card padding="md" glass={true} className={styles.routesCard}>
                <h4 className={styles.panelHeading}>Available Paths</h4>
                <div className={styles.routesList}>
                  {dynamicRoutes.map(r => {
                    const isSelected = r.id === selectedRoute;
                    return (
                      <div 
                        key={r.id}
                        onClick={() => setSelectedRoute(r.id)}
                        className={`${styles.routeListItem} ${isSelected ? styles.listItemActive : ""}`}
                        style={{ borderLeftColor: r.color }}
                      >
                        <div className={styles.listItemHeader}>
                          <span className={styles.listItemName}>{r.name}</span>
                          {r.isAISuggested && (
                            <Badge variant="success" size="sm" glow={true}>
                              <Sparkles size={10} style={{ marginRight: 2 }} />
                              Safest
                            </Badge>
                          )}
                        </div>
                        <div className={styles.listItemMeta}>
                          <span><Clock size={12} /> {r.time}</span>
                          <span><NavIcon size={12} /> {r.distance}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {recommendationReason && (
                  <div style={{ marginTop: "1rem", fontSize: "0.8rem", borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
                    <p style={{ color: "var(--accent-emerald)", fontWeight: "bold", display: "flex", gap: "4px", alignItems: "center" }}>
                      <Sparkles size={12} /> AI Recommendation
                    </p>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>{recommendationReason}</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Floating Selected Route Safety Card */}
          {showRoutes && !activeWalkMode && activeRouteData && (
            <div className={styles.floatingSafetyCard}>
              <Card padding="md" glass={true} className={styles.safetyScoreCard}>
                <div className={styles.safetyHeader}>
                  <div className={styles.safetyTitle}>
                    <ShieldCheck size={18} className={styles.shieldIcon} />
                    <span>Safety Score Breakdown</span>
                  </div>
                  <Badge variant={activeRouteData.badgeVariant} size="md" glow={true}>
                    {activeRouteData.score}% Safety Index
                  </Badge>
                </div>
                
                <h4 className={styles.activeRouteTitle}>{activeRouteData.name}</h4>
                <p className={styles.activeRouteNotes}>{activeRouteData.notes}</p>

                {activeRouteData.hotspots && activeRouteData.hotspots.length > 0 ? (
                  <div className={styles.hotspotsSection}>
                    <div className={styles.hotspotsTitle}>
                      <ShieldAlert size={14} className={styles.alertIcon} />
                      <span>{activeRouteData.hotspots.length} Risk Hotspot(s) Detected</span>
                    </div>
                    {activeRouteData.hotspots.map((hs: any, idx: number) => (
                      <div key={idx} className={styles.hotspotBox}>
                        <AlertTriangle size={12} className={styles.hotspotWarningIcon} />
                        <span>{hs.description}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.cleanRouteBox}>
                    <ShieldCheck size={14} className={styles.cleanIcon} />
                    <span>No safety hotspots detected on this path.</span>
                  </div>
                )}

                <div className={styles.actionBtnGroup}>
                  <Button variant="emerald" className={styles.initializeBtn} onClick={handleStartWalk} rightIcon={<ChevronRight size={16} />}>
                    Start Safe Navigation
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Draggable Bottom Sheet Layer for Tablet/Mobile viewport */}
          {showRoutes && !activeWalkMode && dynamicRoutes.length > 0 && (
            <div className={`${styles.mobileBottomSheet} ${sheetExpanded ? styles.sheetExpanded : styles.sheetCollapsed}`}>
              <div 
                className={styles.bottomSheetHeader} 
                onClick={() => setSheetExpanded(!sheetExpanded)}
              >
                <div className={styles.dragBar} />
                <div className={styles.headerTitleRow}>
                  <span>Route Options ({dynamicRoutes.length})</span>
                  {sheetExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
              </div>

              {sheetExpanded && (
                <div className={styles.bottomSheetContent}>
                  <div className={styles.mobileRoutesList}>
                    {dynamicRoutes.map(r => {
                      const isSelected = r.id === selectedRoute;
                      return (
                        <div 
                          key={r.id} 
                          onClick={() => setSelectedRoute(r.id)}
                          className={`${styles.mobileRouteItem} ${isSelected ? styles.mobileItemActive : ""}`}
                          style={{ borderLeftColor: r.color }}
                        >
                          <div className={styles.mobileHeaderRow}>
                            <span className={styles.mobileRouteName}>{r.name}</span>
                            <span className={styles.mobileRouteScore} style={{ color: r.color }}>{r.score}% Safe</span>
                          </div>
                          <div className={styles.mobileMetaRow}>
                            <span><Clock size={12} /> {r.time} ({r.distance})</span>
                            <span>{r.hotspots?.length || 0} alerts</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.mobileActionBox}>
                    <div className={styles.mobileActiveRouteInfo}>
                      <p className={styles.mobileNotesText}>{activeRouteData.notes}</p>
                    </div>
                    <Button variant="emerald" className={styles.mobileStartBtn} onClick={handleStartWalk}>
                      Start Navigation ({activeRouteData.time})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
