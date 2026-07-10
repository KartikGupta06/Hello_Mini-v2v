"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Shield, Eye, Phone, MapPin, Building, Activity, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Badge, MapContainer, LoadingSkeleton } from "@/components/ui";
import { SafetyService } from "@/services/safety";
import { SafeHaven } from "@/types";
import styles from "./Nearby.module.css";

export default function NearbyPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "police" | "hospital">("all");
  
  const [policeStations, setPoliceStations] = useState<SafeHaven[]>([]);
  const [hospitals, setHospitals] = useState<SafeHaven[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHavens() {
      setLoading(true);
      try {
        // Query South Delhi district which matches seeded database region
        const policeRes = await SafetyService.getPoliceStations("South Delhi");
        const hospitalRes = await SafetyService.getHospitals("South Delhi");

        setPoliceStations(policeRes.data);
        setHospitals(hospitalRes.data);
        
        const combined = [...policeRes.data, ...hospitalRes.data];
        if (combined.length > 0) {
          setSelectedPlaceId(combined[0].id);
        }
      } catch (e) {
        console.error("Failed to load safe places list:", e);
      } finally {
        setLoading(false);
      }
    }
    loadHavens();
  }, []);

  const displayedPlaces = useMemo(() => {
    let result: SafeHaven[] = [];
    if (filter === "all" || filter === "police") {
      result = [...result, ...policeStations];
    }
    if (filter === "all" || filter === "hospital") {
      result = [...result, ...hospitals];
    }
    return result;
  }, [filter, policeStations, hospitals]);

  const activePlace = useMemo(() => {
    return displayedPlaces.find(p => p.id === selectedPlaceId) || displayedPlaces[0];
  }, [selectedPlaceId, displayedPlaces]);

  // Construct map hotspots to display safe locations on the map container
  const mapRoutes = useMemo(() => {
    if (displayedPlaces.length === 0) return [];
    
    // We construct a mock route that spans the coordinates of the safe places
    // and registers each place as a hotspot overlay
    const hotspots = displayedPlaces.map(place => ({
      lat: place.lat,
      lng: place.lng,
      type: "unsafe_cluster" as const, // displays warning icon on map
      description: `${place.type === "police_station" ? "Police:" : "Hospital:"} ${place.name}`
    }));

    return [
      {
        id: "havens",
        name: "Verified Safe Havens",
        coordinates: displayedPlaces.map(p => [p.lng, p.lat]),
        color: "#10b981",
        distance: "Area view",
        time: "Active protection",
        score: 100,
        badgeVariant: "success" as const,
        notes: "Locations checked and verified by local municipal authorities.",
        hotspots
      }
    ];
  }, [displayedPlaces]);

  const centerCoords = useMemo(() => {
    if (activePlace) return [activePlace.lng, activePlace.lat] as [number, number];
    return [77.2045, 28.5306] as [number, number]; // South Delhi default
  }, [activePlace]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: "2rem" }}>
          <LoadingSkeleton count={3} height={100} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.mapWrapper}>
          <MapContainer 
            routes={mapRoutes} 
            selectedRouteId="havens" 
            onRouteSelect={() => {}} 
            center={centerCoords}
            zoom={14}
          />
        </div>

        <div className={styles.floatingUI}>
          {/* Filters Card */}
          <Card padding="md" glass={true} className={styles.filterCard}>
            <h3 className={styles.filterHeading}>Safe Havens Locator</h3>
            <div className={styles.buttonGroup}>
              <Button 
                variant={filter === "all" ? "primary" : "outline"} 
                size="sm"
                onClick={() => setFilter("all")}
              >
                All Safe Places
              </Button>
              <Button 
                variant={filter === "police" ? "primary" : "outline"} 
                size="sm"
                onClick={() => setFilter("police")}
                leftIcon={<Shield size={14} />}
              >
                Police
              </Button>
              <Button 
                variant={filter === "hospital" ? "primary" : "outline"} 
                size="sm"
                onClick={() => setFilter("hospital")}
                leftIcon={<Activity size={14} />}
              >
                Hospitals
              </Button>
            </div>
          </Card>

          {/* Safe Havens List Card */}
          <Card padding="md" glass={true} className={styles.placesCard}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>
              VERIFIED SECURE NODES ({displayedPlaces.length})
            </span>
            
            <div className={styles.placesList}>
              {displayedPlaces.length === 0 ? (
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center", padding: "1rem" }}>
                  No safe places matching search bounds.
                </div>
              ) : (
                displayedPlaces.map(place => {
                  const isSelected = place.id === selectedPlaceId;
                  const isPolice = place.type === "police_station";
                  
                  return (
                    <div 
                      key={place.id}
                      onClick={() => setSelectedPlaceId(place.id)}
                      className={`${styles.placeItem} ${isSelected ? styles.selectedPlace : ""}`}
                    >
                      <div className={styles.placeHeader}>
                        <span className={styles.placeName}>{place.name}</span>
                        <Badge variant={isPolice ? "success" : "info"} size="sm">
                          {isPolice ? "Police" : "Hospital"}
                        </Badge>
                      </div>
                      <p className={styles.placeAddress}>{place.address || "South Delhi Area, New Delhi"}</p>
                      {place.phone && place.phone !== "Unknown" && (
                        <div className={styles.placeContact}>
                          <Phone size={10} />
                          <span>{place.phone}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
