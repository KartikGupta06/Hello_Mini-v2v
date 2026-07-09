"use client";

import React, { useState, useMemo } from "react";
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
  RotateCcw
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Badge, MapContainer } from "@/components/ui";
import styles from "./Navigation.module.css";

// Reusable mock locations suggestions list
const MOCK_SUGGESTIONS = [
  { name: "Midtown Manhattan (Herald Square)", coords: [-73.9857, 40.7484] },
  { name: "Union Square Park, NYC", coords: [-73.9911, 40.7359] },
  { name: "Times Square Broadway Theater District", coords: [-73.9851, 40.7580] },
  { name: "Empire State Building observation deck", coords: [-73.9857, 40.7484] },
  { name: "Madison Square Park District", coords: [-73.9879, 40.7420] }
];

export default function NavigationPage() {
  const [origin, setOrigin] = useState("My Location (Midtown Manhattan)");
  const [destination, setDestination] = useState("Union Square Park");
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState("safest");
  const [isSearching, setIsSearching] = useState(false);
  const [originFocused, setOriginFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(true);

  // Memoize mock coordinates paths to prevent unnecessary rerenders
  const routes = useMemo(() => [
    {
      id: "safest",
      name: "AI Safe Path",
      isAISuggested: true,
      score: 94,
      time: "18 min",
      distance: "2.4 km",
      incidentsCount: 0,
      color: "#10b981", // Emerald
      badgeVariant: "success" as const,
      notes: "Fully lit avenues, high sidewalk density, and positive community reviews.",
      coordinates: [
        [-73.9857, 40.7484], // Herald Sq
        [-73.9850, 40.7460],
        [-73.9835, 40.7420], // Madison Sq
        [-73.9870, 40.7380],
        [-73.9911, 40.7359]  // Union Sq
      ],
      hotspots: []
    },
    {
      id: "balanced",
      name: "Balanced Avenue Path",
      isAISuggested: false,
      score: 81,
      time: "16 min",
      distance: "2.2 km",
      incidentsCount: 1,
      color: "#3b82f6", // Blue
      badgeVariant: "info" as const,
      notes: "Standard commercial street lighting, moderate foot traffic near intersections.",
      coordinates: [
        [-73.9857, 40.7484],
        [-73.9820, 40.7465],
        [-73.9805, 40.7435],
        [-73.9840, 40.7390],
        [-73.9911, 40.7359]
      ],
      hotspots: [
        { lat: 40.7435, lng: -73.9805, type: "sudden_drop" as const, description: "Slight decrease in active foot traffic." }
      ]
    },
    {
      id: "fastest",
      name: "Standard Direct Path",
      isAISuggested: false,
      score: 58,
      time: "14 min",
      distance: "2.0 km",
      incidentsCount: 3,
      color: "#f59e0b", // Amber
      badgeVariant: "warning" as const,
      notes: "Shortest route, but passes through poorly lit construction zones and alleyways.",
      coordinates: [
        [-73.9857, 40.7484],
        [-73.9890, 40.7470],
        [-73.9920, 40.7410],
        [-73.9911, 40.7359]
      ],
      hotspots: [
        { lat: 40.7410, lng: -73.9920, type: "unsafe_cluster" as const, description: "Poorly lit segment. High community reports." }
      ]
    }
  ], []);

  // Fetch active route parameters
  const activeRouteData = useMemo(() => {
    return routes.find(r => r.id === selectedRoute) || routes[0];
  }, [selectedRoute, routes]);

  const handleSuggestClick = (name: string, type: "origin" | "dest") => {
    if (type === "origin") {
      setOrigin(name);
      setOriginFocused(false);
    } else {
      setDestination(name);
      setDestFocused(false);
    }
  };

  const handleRouteSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowRoutes(true);
      setSheetExpanded(true);
    }, 1200);
  };

  const handleResetSearch = () => {
    setShowRoutes(false);
    setOrigin("");
    setDestination("");
  };

  return (
    <DashboardLayout>
      <div className={styles.navContainer}>
        {/* Fill map sandbox layer */}
        <div className={styles.mapSandbox}>
          <MapContainer 
            routes={routes} 
            selectedRouteId={selectedRoute} 
            onRouteSelect={setSelectedRoute} 
          />
        </div>

        {/* Floating Controls Header overlay */}
        <div className={styles.floatingUI}>
          
          {/* Search Planner Container */}
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
                        <div key={idx} onMouseDown={() => handleSuggestClick(s.name, "origin")} className={styles.suggestItem}>
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
                        <div key={idx} onMouseDown={() => handleSuggestClick(s.name, "dest")} className={styles.suggestItem}>
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

          {/* Desktop Route Comparison Sidebar overlay */}
          {showRoutes && (
            <div className={styles.desktopSidebar}>
              <Card padding="md" glass={true} className={styles.routesCard}>
                <h4 className={styles.panelHeading}>Available Paths</h4>
                <div className={styles.routesList}>
                  {routes.map(r => {
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
              </Card>
            </div>
          )}

          {/* Floating Selected Route Safety Card */}
          {showRoutes && (
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
                    {activeRouteData.hotspots.map((hs, idx) => (
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
                  <Button variant="emerald" className={styles.initializeBtn} rightIcon={<ChevronRight size={16} />}>
                    Start Safe Navigation
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Draggable Bottom Sheet Layer for Tablet/Mobile viewport */}
          {showRoutes && (
            <div className={`${styles.mobileBottomSheet} ${sheetExpanded ? styles.sheetExpanded : styles.sheetCollapsed}`}>
              <div 
                className={styles.bottomSheetHeader} 
                onClick={() => setSheetExpanded(!sheetExpanded)}
              >
                <div className={styles.dragBar} />
                <div className={styles.headerTitleRow}>
                  <span>Route Options ({routes.length})</span>
                  {sheetExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
              </div>

              {sheetExpanded && (
                <div className={styles.bottomSheetContent}>
                  <div className={styles.mobileRoutesList}>
                    {routes.map(r => {
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
                            <span>{r.incidentsCount} alerts</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.mobileActionBox}>
                    <div className={styles.mobileActiveRouteInfo}>
                      <p className={styles.mobileNotesText}>{activeRouteData.notes}</p>
                    </div>
                    <Button variant="emerald" className={styles.mobileStartBtn}>
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
