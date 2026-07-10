"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation, 
  Layers, 
  MapPin, 
  ShieldAlert, 
  Compass, 
  Maximize2, 
  AlertTriangle,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import styles from "./MapContainer.module.css";

// Check for mapbox dynamically
let mapboxgl: any = null;
if (typeof window !== "undefined") {
  try {
    mapboxgl = require("mapbox-gl");
    // Also include CSS dynamically if loaded
    require("mapbox-gl/dist/mapbox-gl.css");
  } catch (e) {
    console.warn("Mapbox GL JS failed to load dynamically:", e);
  }
}

export interface MapHotspot {
  lat: number;
  lng: number;
  type: "unsafe_cluster" | "sudden_drop";
  description: string;
}

export interface MapRoute {
  id: string;
  name: string;
  coordinates: number[][]; // [lng, lat]
  color: string;
  distance: string;
  time: string;
  score: number;
  badgeVariant: "success" | "warning" | "danger" | "info";
  notes: string;
  hotspots?: MapHotspot[];
}

interface MapContainerProps {
  routes: MapRoute[];
  selectedRouteId: string;
  onRouteSelect: (id: string) => void;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  accessToken?: string;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  routes,
  selectedRouteId,
  onRouteSelect,
  center = [-73.9857, 40.7484], // Midtown Manhattan default
  zoom = 14,
  accessToken
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [fallbackMode, setFallbackMode] = useState<boolean>(true);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  // Markers and route layers tracking
  const markersRef = useRef<any[]>([]);

  // Resolve Mapbox token
  useEffect(() => {
    const token = accessToken || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
    setMapboxToken(token);
    if (token && mapboxgl) {
      setFallbackMode(false);
    } else {
      setFallbackMode(true);
    }
  }, [accessToken]);

  // Real Mapbox GL JS Initialization
  useEffect(() => {
    if (fallbackMode || !mapboxgl || !mapboxToken || !mapContainerRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: satelliteView 
          ? "mapbox://styles/mapbox/satellite-streets-v12" 
          : "mapbox://styles/mapbox/dark-v11",
        center: center,
        zoom: zoom,
        pitch: 45, // Premium 3D perspective angle
        bearing: -17,
        antialias: true
      });

      map.on("load", () => {
        setMapInstance(map);
        map.resize();
        
        // Add zoom and pitch controls
        map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
        
        // Load route layers
        updateMapRoutes(map);
      });

      map.on("zoom", () => {
        setCurrentZoom(map.getZoom());
      });

      return () => {
        map.remove();
        setMapInstance(null);
      };
    } catch (e) {
      console.error("Mapbox init failed, triggering fallback:", e);
      setFallbackMode(true);
    }
  }, [fallbackMode, mapboxToken, satelliteView]);

  // Handle route layers update inside active Mapbox instance
  const updateMapRoutes = (map: any) => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    routes.forEach(route => {
      const routeSourceId = `source-${route.id}`;
      const routeLayerId = `layer-${route.id}`;
      const routeOutlineLayerId = `layer-outline-${route.id}`;

      // Remove layer/source if existing
      if (map.getLayer(routeLayerId)) map.removeLayer(routeLayerId);
      if (map.getLayer(routeOutlineLayerId)) map.removeLayer(routeOutlineLayerId);
      if (map.getSource(routeSourceId)) map.removeSource(routeSourceId);

      // Add GeoJSON source
      map.addSource(routeSourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route.coordinates
          }
        }
      });

      const isSelected = route.id === selectedRouteId;

      // Add route casing outline layer for glowing visuals
      map.addLayer({
        id: routeOutlineLayerId,
        type: "line",
        source: routeSourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": route.color,
          "line-width": isSelected ? 10 : 6,
          "line-opacity": isSelected ? 0.35 : 0.1,
          "line-blur": 4
        }
      });

      // Add main route line layer
      map.addLayer({
        id: routeLayerId,
        type: "line",
        source: routeSourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": route.color,
          "line-width": isSelected ? 5 : 3.5,
          "line-opacity": isSelected ? 1.0 : 0.4
        }
      });

      // Register click triggers on route lines
      map.on("click", routeLayerId, () => {
        onRouteSelect(route.id);
      });

      map.on("mouseenter", routeLayerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", routeLayerId, () => {
        map.getCanvas().style.cursor = "";
      });

      // Render start/end markers for selected route
      if (isSelected && route.coordinates.length > 0) {
        const startCoords = route.coordinates[0];
        const endCoords = route.coordinates[route.coordinates.length - 1];

        // Origin Marker (Blue pulsing dot)
        const elOrigin = document.createElement("div");
        elOrigin.className = styles.pulseMarkerBlue;
        const originMarker = new mapboxgl.Marker(elOrigin)
          .setLngLat(startCoords)
          .addTo(map);
        markersRef.current.push(originMarker);

        // Destination Marker (Emerald pulsing map pin)
        const elDest = document.createElement("div");
        elDest.className = styles.pulseMarkerEmerald;
        const destMarker = new mapboxgl.Marker(elDest)
          .setLngLat(endCoords)
          .addTo(map);
        markersRef.current.push(destMarker);

        // Render hotspots warning indicators if present
        if (route.hotspots) {
          route.hotspots.forEach((hs, idx) => {
            const elHs = document.createElement("div");
            elHs.className = styles.hotspotMarker;
            elHs.innerHTML = `<span class="${styles.hotspotDot}">⚠</span>`;
            
            // Add popup descriptions
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<strong style="color: #ef4444;">Route Hotspot</strong><br/>${hs.description}`
            );

            const hsMarker = new mapboxgl.Marker(elHs)
              .setLngLat([hs.lng, hs.lat])
              .setPopup(popup)
              .addTo(map);
            
            markersRef.current.push(hsMarker);
          });
        }
      }
    });
  };

  // Fly Camera to selected route bounds
  useEffect(() => {
    if (fallbackMode || !mapInstance || !selectedRouteId) return;

    const selectedRoute = routes.find(r => r.id === selectedRouteId);
    if (!selectedRoute || selectedRoute.coordinates.length === 0) return;

    // Trigger update of route opacities
    updateMapRoutes(mapInstance);

    // Compute bounding box
    const coordinates = selectedRoute.coordinates;
    let minLng = coordinates[0][0];
    let maxLng = coordinates[0][0];
    let minLat = coordinates[0][1];
    let maxLat = coordinates[0][1];

    coordinates.forEach(coord => {
      if (coord[0] < minLng) minLng = coord[0];
      if (coord[0] > maxLng) maxLng = coord[0];
      if (coord[1] < minLat) minLat = coord[1];
      if (coord[1] > maxLat) maxLat = coord[1];
    });

    mapInstance.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding: 80, duration: 1500, pitch: 45 }
    );
  }, [selectedRouteId, mapInstance, fallbackMode]);

  // Fallback Camera flight controls
  const handleZoom = (direction: "in" | "out") => {
    if (fallbackMode) {
      setCurrentZoom(prev => Math.min(18, Math.max(10, direction === "in" ? prev + 1 : prev - 1)));
    } else if (mapInstance) {
      if (direction === "in") mapInstance.zoomIn();
      else mapInstance.zoomOut();
    }
  };

  // Render Premium Fallback vector mockup map
  const renderFallbackMap = () => {
    // Standard size limits
    const width = 800;
    const height = 600;

    // Project coordinates [lng, lat] into SVG pixel spaces dynamically
    // Herald Square center approx: [-73.9857, 40.7484]
    const project = (lng: number, lat: number): [number, number] => {
      const scale = 200000 * (currentZoom / 14);
      const centerLng = center[0];
      const centerLat = center[1];
      
      const x = width / 2 + (lng - centerLng) * scale;
      const y = height / 2 - (lat - centerLat) * scale * 1.3; // aspect distortion adjustment
      return [x, y];
    };

    return (
      <div className={styles.fallbackMapContainer}>
        {/* Glowing grid background elements */}
        <div className={styles.fallbackGrid} />

        <svg className={styles.svgMap} viewBox={`0 0 ${width} ${height}`}>
          {/* Simulated Street grid background lines */}
          <g stroke="#ffffff" strokeOpacity="0.04" strokeWidth="2">
            {/* Horizontal streets */}
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={i} x1="0" y1={40 + i * 40} x2={width} y2={40 + i * 40} />
            ))}
            {/* Vertical avenues */}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={i} x1={40 + i * 40} y1="0" x2={40 + i * 40} y2={height} />
            ))}
          </g>

          {/* Render Route paths lines */}
          {routes.map(route => {
            const isSelected = route.id === selectedRouteId;
            const pointsStr = route.coordinates
              .map(c => {
                const [x, y] = project(c[0], c[1]);
                return `${x},${y}`;
              })
              .join(" ");

            return (
              <g 
                key={route.id}
                onClick={() => onRouteSelect(route.id)}
                onMouseEnter={() => setHoveredRoute(route.id)}
                onMouseLeave={() => setHoveredRoute(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Glowing thick base line */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={isSelected ? 10 : 6}
                  strokeOpacity={isSelected ? 0.35 : hoveredRoute === route.id ? 0.25 : 0.08}
                  className={styles.glowPath}
                />
                {/* Solid core line */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={isSelected ? 4 : 2.5}
                  strokeOpacity={isSelected ? 1.0 : hoveredRoute === route.id ? 0.8 : 0.3}
                  className={styles.solidPath}
                />
              </g>
            );
          })}

          {/* Render active markers for the selected route */}
          {(() => {
            const selectedRoute = routes.find(r => r.id === selectedRouteId);
            if (!selectedRoute || selectedRoute.coordinates.length === 0) return null;

            const startCoords = selectedRoute.coordinates[0];
            const endCoords = selectedRoute.coordinates[selectedRoute.coordinates.length - 1];
            const [startX, startY] = project(startCoords[0], startCoords[1]);
            const [endX, endY] = project(endCoords[0], endCoords[1]);

            return (
              <g>
                {/* Start Marker */}
                <circle cx={startX} cy={startY} r="15" fill="#3b82f6" fillOpacity="0.15" />
                <circle cx={startX} cy={startY} r="8" fill="#3b82f6" fillOpacity="0.4" />
                <circle cx={startX} cy={startY} r="4" fill="#3b82f6" />

                {/* Destination Marker */}
                <circle cx={endX} cy={endY} r="18" fill="#10b981" fillOpacity="0.15" />
                <circle cx={endX} cy={endY} r="10" fill="#10b981" fillOpacity="0.4" />
                <circle cx={endX} cy={endY} r="5" fill="#10b981" />

                {/* Hotspots indicators */}
                {selectedRoute.hotspots && selectedRoute.hotspots.map((hs, idx) => {
                  const [hx, hy] = project(hs.lng, hs.lat);
                  return (
                    <g key={idx} className={styles.svgHotspotGroup}>
                      <circle cx={hx} cy={hy} r="12" fill="#ef4444" fillOpacity="0.25" />
                      <circle cx={hx} cy={hy} r="5" fill="#ef4444" />
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </svg>

        {/* Ambient mockup helper text overlay */}
        <div className={styles.fallbackNotice}>
          <div className={styles.fallbackNoticeHeader}>
            <AlertTriangle size={16} className={styles.warningIcon} />
            <span>Mapbox Access Token Missing</span>
          </div>
          <p className={styles.fallbackNoticeDesc}>
            Rendered interactive vector map canvas. Define <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in your environment variables to load premium styling sheets.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.mapWrapper}>
      {/* Mapbox Ref Container */}
      <div 
        ref={mapContainerRef} 
        className={styles.mapContainer} 
        style={{ opacity: fallbackMode ? 0 : 1 }}
      />

      {/* Fallback Vector Mockup */}
      {fallbackMode && renderFallbackMap()}

      {/* Floating Reusable MapControls Layer */}
      <div className={styles.floatingControls}>
        <div className={styles.controlsStack}>
          <button 
            className={styles.controlBtn} 
            onClick={() => handleZoom("in")} 
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            className={styles.controlBtn} 
            onClick={() => handleZoom("out")} 
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button 
            className={`${styles.controlBtn} ${satelliteView ? styles.controlBtnActive : ""}`} 
            onClick={() => setSatelliteView(!satelliteView)}
            title="Toggle Map Style"
            disabled={fallbackMode}
          >
            <Layers size={18} />
          </button>
        </div>
      </div>

      {/* Reusable Map Legend Overlay */}
      <div className={styles.mapLegend}>
        <div className={styles.legendHeader}>Safety Legend</div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{ backgroundColor: "var(--status-success)" }} />
          <span>Safest AI Path (90-100)</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{ backgroundColor: "var(--status-info)" }} />
          <span>Balanced Path (70-89)</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{ backgroundColor: "var(--status-danger)" }} />
          <span>Standard Path (&lt; 70)</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{ backgroundColor: "var(--status-warning)" }} />
          <span>Unsafe Hotspot Area</span>
        </div>
      </div>
    </div>
  );
};
