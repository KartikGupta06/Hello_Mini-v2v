"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Shield, 
  Eye, 
  Phone, 
  MapPin, 
  Building, 
  Activity, 
  ShieldCheck,
  ChevronLeft,
  RotateCcw,
  Navigation,
  Share2,
  AlertTriangle,
  Lightbulb,
  Compass,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, Button, Badge, LoadingSkeleton, MapContainer, FilterChips, EmptyState, AIInsightCard } from "@/components/ui";
import { SafetyService } from "@/services/safety";
import styles from "./Nearby.module.css";

const MOCK_PLACES_EXTENSIONS = [
  {
    id: "metro-saket",
    name: "Saket Metro Station Gate 2",
    type: "metro_station",
    address: "Saket District Centre, New Delhi",
    phone: "011-23417910",
    lat: 28.5233,
    lng: 77.2083,
    distance: "350m",
    time: "5 mins",
    isOpen: true,
    safetyScore: 94,
    aiRecommendation: "Highly recommended. Active CCTV surveillance, public transit hub with constant security presence."
  },
  {
    id: "medical-fortis",
    name: "Fortis Pharmacy Malviya Nagar",
    type: "medical_store",
    address: "Press Enclave Road, New Delhi",
    phone: "011-4277 6222",
    lat: 28.5306,
    lng: 77.2045,
    distance: "200m",
    time: "3 mins",
    isOpen: true,
    safetyScore: 92,
    aiRecommendation: "Recommended. Located on the main press enclave highway, 24/7 lighting and security desks."
  },
  {
    id: "shelter-police",
    name: "Safe Shelter NGO Centre",
    type: "safe_shelter",
    address: "Saket Enclave Marg, South Delhi",
    phone: "+91 98112 04512",
    lat: 28.5262,
    lng: 77.1779,
    distance: "900m",
    time: "11 mins",
    isOpen: true,
    safetyScore: 96,
    aiRecommendation: "Excellent backup haven. Publicly audited emergency lighting and staffed security gate."
  }
];

const FILTER_CHIPS = [
  { label: "All Safe", id: "all" },
  { label: "Police", id: "police" },
  { label: "Hospitals", id: "hospital" },
  { label: "Safe Havens", id: "safe_shelter" },
  { label: "Medical", id: "medical_store" },
  { label: "Metro", id: "metro_station" }
];

export default function NearbyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [combinedPlaces, setCombinedPlaces] = useState<any[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([77.2083, 28.5233]);
  const [mapZoom, setMapZoom] = useState(14);

  useEffect(() => {
    loadHavens();
  }, []);

  const loadHavens = async () => {
    setLoading(true);
    try {
      const policeRes = await SafetyService.getPoliceStations("South Delhi");
      const hospitalRes = await SafetyService.getHospitals("South Delhi");

      const formattedPolice = policeRes.data.map((p, idx) => ({
        id: p.id.toString(),
        name: p.name,
        type: "police_station",
        address: p.address || "South Delhi Area, New Delhi",
        phone: p.phone || "Unknown",
        lat: p.lat,
        lng: p.lng,
        distance: `${(idx + 1) * 350}m`,
        time: `${(idx + 1) * 4} mins`,
        isOpen: true,
        safetyScore: 98 - idx,
        aiRecommendation: "Recommended. Officially designated local security post with 24/7 active duty officers."
      }));

      const formattedHospitals = hospitalRes.data.map((h, idx) => ({
        id: h.id.toString(),
        name: h.name,
        type: "hospital",
        address: h.address || "South Delhi Area, New Delhi",
        phone: h.phone || "Unknown",
        lat: h.lat,
        lng: h.lng,
        distance: `${(idx + 1) * 450}m`,
        time: `${(idx + 1) * 6} mins`,
        isOpen: true,
        safetyScore: 95 - idx,
        aiRecommendation: "Recommended emergency care unit. Generates lighting corridor with verified guards on entry gates."
      }));

      const merged = [...formattedPolice, ...formattedHospitals, ...MOCK_PLACES_EXTENSIONS];
      setCombinedPlaces(merged);
      if (merged.length > 0) {
        setSelectedPlaceId(merged[0].id);
        setMapCenter([merged[0].lng, merged[0].lat]);
      }
    } catch (e) {
      console.error("Failed to load safe places list:", e);
    } finally {
      setLoading(false);
    }
  };

  const displayedPlaces = useMemo(() => {
    if (activeFilter === "all") return combinedPlaces;
    return combinedPlaces.filter(p => p.type === activeFilter);
  }, [combinedPlaces, activeFilter]);

  const activePlace = useMemo(() => {
    return displayedPlaces.find(p => p.id === selectedPlaceId) || displayedPlaces[0];
  }, [selectedPlaceId, displayedPlaces]);

  const handleSelectPlace = (place: any) => {
    setSelectedPlaceId(place.id);
    setMapCenter([place.lng, place.lat]);
    setMapZoom(15);
  };

  const handleNavigateNearest = () => {
    if (displayedPlaces.length > 0) {
      const nearest = displayedPlaces[0];
      router.push(`/navigation?dest=${encodeURIComponent(nearest.name)}`);
    } else {
      alert("No safe places discovered nearby.");
    }
  };

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case "police_station":
        return <Shield size={18} className={styles.iconDanger} />;
      case "hospital":
        return <Activity size={18} className={styles.iconInfo} />;
      case "metro_station":
        return <Building size={18} className={styles.iconPurple} />;
      case "medical_store":
        return <Heart size={18} className={styles.iconWarning} />;
      default:
        return <MapPin size={18} className={styles.iconInfo} />;
    }
  };

  const Heart = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );

  return (
    <DashboardLayout>
      <div className={styles.container}>
        
        {/* A. Top Header */}
        <div className={styles.topHeaderRow}>
          <button onClick={() => router.push("/dashboard")} className={styles.backBtn} aria-label="Go back to dashboard">
            <ChevronLeft size={18} />
          </button>
          <div className={styles.headerTitles}>
            <h2 className={styles.circleTitle}>Safe Places</h2>
            <span className={styles.membersCount}>South Delhi District</span>
          </div>
          <button onClick={loadHavens} className={styles.refreshBtn} aria-label="Refresh location havens">
            <RotateCcw size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "2rem 0" }}>
            <LoadingSkeleton count={3} height={120} />
          </div>
        ) : (
          <div className={styles.layoutScrollArea}>
            
            {/* B. Mini Live Map Hero */}
            <div className={styles.mapRadarWrapper}>
              <div className={styles.miniMapSandbox}>
                <MapContainer 
                  routes={[]} 
                  selectedRouteId="" 
                  onRouteSelect={() => {}} 
                  center={mapCenter}
                  zoom={mapZoom}
                />
              </div>

              {/* absolute coordinates pins */}
              <div className={styles.radarRadarContainer}>
                {/* Center User pulse */}
                <div className={styles.userCenterMarker}>
                  <div className={styles.userRadarPulse} />
                  <div className={styles.userDot} />
                </div>

                {displayedPlaces.map((p, idx) => {
                  const offsets = [
                    { top: "35px", left: "95px" },
                    { bottom: "50px", right: "85px" },
                    { top: "85px", right: "135px" },
                    { bottom: "70px", left: "115px" }
                  ];
                  const activePos = offsets[idx % offsets.length];
                  const isSelected = selectedPlaceId === p.id;

                  return (
                    <div 
                      key={p.id} 
                      className={`${styles.mapAvatarMarker} ${isSelected ? styles.highlightedMarker : ""}`} 
                      style={{ top: activePos.top, left: activePos.left, right: activePos.right, bottom: activePos.bottom }}
                      onClick={() => handleSelectPlace(p)}
                    >
                      <div className={styles.markerMiniInitials}>
                        {p.type.substring(0, 1).toUpperCase()}
                      </div>
                      <div className={styles.markerPulseBorder} />
                    </div>
                  );
                })}
              </div>

              <div className={styles.radarLabel}>
                <Compass size={12} className={styles.radarCompassIcon} />
                <span>Safest Haven Pins</span>
              </div>
            </div>

            {/* C. Quick Filter Chips horizontal row */}
            <FilterChips
              chips={FILTER_CHIPS}
              activeId={activeFilter}
              onChange={(id) => {
                setActiveFilter(id);
                setSelectedPlaceId(null);
              }}
              className={styles.chipsScroll}
            />

            {/* D. Scrollable Nearby cards stack */}
            <div className={styles.placesListPanel}>
              {displayedPlaces.length === 0 ? (
                <EmptyState
                  icon={<AlertTriangle size={32} className={styles.emptyIcon} />}
                  title="No Safe Places"
                  description="No safe places discovered matching selected filter bounds."
                />
              ) : (
                displayedPlaces.map(place => {
                  const isExpanded = selectedPlaceId === place.id;
                  
                  return (
                    <Card 
                      key={place.id} 
                      glass={true} 
                      padding="sm" 
                      className={`${styles.placeCard} ${isExpanded ? styles.placeCardExpanded : ""}`}
                      onClick={() => handleSelectPlace(place)}
                    >
                      <div className={styles.placeCardHeader}>
                        <div className={styles.placeHeaderLeft}>
                          <div className={styles.categoryIconBg}>
                            {getPlaceIcon(place.type)}
                          </div>
                          <div className={styles.categoryTitleCol}>
                            <h4 className={styles.placeCardName}>{place.name}</h4>
                            <span className={styles.placeCardMeta}>
                              {place.distance} • {place.time} walk
                            </span>
                          </div>
                        </div>

                        <div className={styles.badgeCol}>
                          <Badge variant="success" size="sm" glow={true}>
                            {place.isOpen ? "Open Now" : "Closed"}
                          </Badge>
                        </div>
                      </div>

                      {/* Expand Details view */}
                      {isExpanded && (
                        <div className={styles.expandedBlock}>
                          <div className={styles.addressRow}>
                            <MapPin size={12} className={styles.metaIcon} />
                            <span className={styles.addressText}>{place.address}</span>
                          </div>
                          
                          {place.phone && place.phone !== "Unknown" && (
                            <div className={styles.phoneRow}>
                              <Phone size={12} className={styles.metaIcon} />
                              <span className={styles.phoneText}>{place.phone}</span>
                            </div>
                          )}

                          <AIInsightCard
                            title="AI Recommendation"
                            text={place.aiRecommendation}
                            variant="success"
                            className={styles.aiInsightBox}
                          />

                          <div className={styles.actionRow}>
                            <Button 
                              variant="emerald" 
                              size="sm" 
                              onClick={() => router.push(`/navigation?dest=${encodeURIComponent(place.name)}`)}
                              leftIcon={<Navigation size={12} style={{ transform: "rotate(45deg)" }} />}
                            >
                              Navigate
                            </Button>
                            
                            <button onClick={() => alert(`Calling haven desk: ${place.name}...`)} className={styles.roundActionBtn}>
                              <Phone size={12} />
                            </button>
                            
                            <button onClick={() => alert("Haven sharing link copied.")} className={styles.roundActionBtn}>
                              <Share2 size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* E. Persistent emergency shortcuts overlay button */}
        {displayedPlaces.length > 0 && (
          <div className={styles.bottomCtaWrapper}>
            <button className={styles.floatingNavigateBtn} onClick={handleNavigateNearest}>
              <Navigation size={16} className={styles.navIconArrow} />
              <span className={styles.floatingBtnText}>Navigate to Nearest Safe Place</span>
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
