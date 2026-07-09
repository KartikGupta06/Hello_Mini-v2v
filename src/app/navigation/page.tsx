"use client";

import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles,
  Info
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SectionHeader, Input, Button, Badge } from "@/components/ui";
import styles from "./Navigation.module.css";

export default function NavigationPage() {
  const [origin, setOrigin] = useState("My Location (Midtown Manhattan)");
  const [destination, setDestination] = useState("Union Square Park");
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState("safest");

  const routes = [
    {
      id: "safest",
      name: "AI Safe Path",
      isAISuggested: true,
      score: 94,
      time: "18 min",
      distance: "2.4 km",
      incidentsCount: 0,
      notes: "Fully lit avenues, high sidewalk density, and positive crowdsourced ratings.",
      badgeVariant: "success" as const
    },
    {
      id: "fastest",
      name: "Standard Direct Path",
      isAISuggested: false,
      score: 58,
      time: "14 min",
      distance: "2.0 km",
      incidentsCount: 3,
      notes: "Shortest route, but passes through poorly lit construction zones and alleyways.",
      badgeVariant: "warning" as const
    }
  ];

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <SectionHeader 
          title="Safe Navigation Planner" 
          subtitle="Define your path and contrast safety scores across routes"
        />

        <div className={styles.grid}>
          {/* Left Panel: Search and Options */}
          <div className={styles.panelLeft}>
            <Card padding="md" glass={true} className={styles.searchCard}>
              <h3 className={styles.panelTitle}>Plan Safe Route</h3>
              
              <div className={styles.inputsStack}>
                <Input 
                  label="Origin Location"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  leftIcon={<MapPin size={18} className={styles.inputIconBlue} />}
                  placeholder="Enter starting point..."
                />
                
                <Input 
                  label="Destination Address"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  leftIcon={<Search size={18} className={styles.inputIconEmerald} />}
                  placeholder="Enter destination..."
                />
              </div>

              <Button 
                variant="primary" 
                className={styles.searchBtn} 
                onClick={() => setShowRoutes(true)}
              >
                Analyze Paths
              </Button>
            </Card>

            {/* Route Selection Comparison */}
            {showRoutes && (
              <div className={styles.routesWrapper}>
                <h3 className={styles.routesHeading}>Generated Paths</h3>
                
                <div className={styles.routesStack}>
                  {routes.map((route) => (
                    <div 
                      key={route.id}
                      onClick={() => setSelectedRoute(route.id)}
                      className={`${styles.routeItem} ${selectedRoute === route.id ? styles.routeActive : ""}`}
                    >
                      <div className={styles.routeHeader}>
                        <div className={styles.routeNameGroup}>
                          <span className={styles.routeName}>{route.name}</span>
                          {route.isAISuggested && (
                            <Badge variant="success" size="sm" glow={true} className={styles.aiBadge}>
                              <span className={styles.aiBadgeContent}>
                                <Sparkles size={10} />
                                Recommended
                              </span>
                            </Badge>
                          )}
                        </div>
                        <div className={styles.scoreRow}>
                          <span className={styles.scoreLabel}>Score</span>
                          <span className={`${styles.scoreVal} ${styles[`score-${route.badgeVariant}`]}`}>
                            {route.score}%
                          </span>
                        </div>
                      </div>

                      <div className={styles.routeSpecs}>
                        <span className={styles.spec}>
                          <Clock size={12} />
                          {route.time}
                        </span>
                        <span className={styles.spec}>
                          <Navigation size={12} />
                          {route.distance}
                        </span>
                        <span className={`${styles.spec} ${route.incidentsCount > 0 ? styles.alertText : ""}`}>
                          <ShieldAlert size={12} />
                          {route.incidentsCount} alerts
                        </span>
                      </div>

                      <p className={styles.routeNotes}>{route.notes}</p>
                    </div>
                  ))}
                </div>

                <Button variant="emerald" className={styles.startBtn} rightIcon={<ChevronRight size={18} />}>
                  Initialize Walk Navigation
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel: Map Sandbox Placeholder */}
          <div className={styles.panelRight}>
            <div className={styles.mapContainer}>
              {/* Map grid lines simulation */}
              <div className={styles.mapGridLines} />
              
              {/* Floating Map Indicators */}
              <div className={styles.mapFloatingHeader}>
                <Badge variant="info" glow={true}>
                  Active Map Sandbox
                </Badge>
                <span className={styles.mapCoors}>40.7128° N, 74.0060° W</span>
              </div>

              <div className={styles.mapCenterMessage}>
                <Navigation className={styles.mapNavigationIcon} size={40} />
                <h4 className={styles.mapMessageTitle}>Interactive Safety Map</h4>
                <p className={styles.mapMessageDesc}>
                  Map canvas integration (Leaflet/Mapbox API) will render routes with safety scoring colors in Phase 3.
                </p>
              </div>

              {/* Simulation Overlay showing active route pins */}
              <div className={styles.simPinOrigin}>
                <span className={styles.pinLabel}>Origin</span>
              </div>
              
              <div className={styles.simPinDest}>
                <span className={styles.pinLabel}>Destination</span>
              </div>

              {/* Map Zoom Controls simulation */}
              <div className={styles.mapZoomControls}>
                <button className={styles.zoomBtn}>+</button>
                <button className={styles.zoomBtn}>-</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
