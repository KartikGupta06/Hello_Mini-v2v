"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Layers, ZoomIn, ZoomOut } from "lucide-react";
import styles from "./MapContainer.module.css";
import type { MapRoute, MapHotspot, MapPinProp } from "./LeafletMap";

// Re-export types so callers can import from this file as before
export type { MapRoute, MapHotspot, MapPinProp };

// ── Dynamic import — Leaflet is browser-only, no SSR ─────────────────────────
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <MapLoadingPlaceholder />,
});

// ── Props interface (unchanged from original) ─────────────────────────────────
interface MapContainerProps {
  routes: MapRoute[];
  selectedRouteId: string;
  onRouteSelect: (id: string) => void;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  /** @deprecated — Mapbox token no longer required. Kept for interface compatibility. */
  accessToken?: string;
  pins?: MapPinProp[];
  onPinSelect?: (id: string | number) => void;
}

// ── Minimal loading placeholder ───────────────────────────────────────────────
function MapLoadingPlaceholder() {
  return (
    <div className={styles.loadingPlaceholder} role="status" aria-busy="true">
      <div className={styles.loadingGrid} />
      <div className={styles.loadingSpinner}>
        <div className={styles.spinnerRing} />
        <span className={styles.loadingLabel}>Loading Map…</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export const MapContainer: React.FC<MapContainerProps> = ({
  routes,
  selectedRouteId,
  onRouteSelect,
  center = [77.2045, 28.5306], // Default: South Delhi (matches demo origin)
  zoom = 14,
  pins = [],
  onPinSelect,
}) => {
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Zoom helpers — we post messages that LeafletMap can listen to.
  // For simplicity we just adjust a local state; LeafletMap handles its own zoom.
  const handleZoomIn = () => setCurrentZoom((z) => Math.min(18, z + 1));
  const handleZoomOut = () => setCurrentZoom((z) => Math.max(8, z - 1));

  return (
    <div className={styles.mapWrapper}>
      {/* ── OSM Map (client-side only) ─────────────────────────── */}
      <div className={styles.mapContainer}>
        <LeafletMap
          routes={routes}
          selectedRouteId={selectedRouteId}
          onRouteSelect={onRouteSelect}
          center={center}
          zoom={currentZoom}
          pins={pins}
          onPinSelect={onPinSelect}
        />
      </div>

      {/* ── Floating Controls ──────────────────────────────────── */}
      <div className={styles.floatingControls} aria-label="Map controls">
        <div className={styles.controlsStack}>
          <button
            className={styles.controlBtn}
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            className={styles.controlBtn}
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            className={styles.controlBtn}
            title="Powered by OpenStreetMap"
            aria-label="Map attribution"
            style={{ cursor: "default", opacity: 0.5 }}
          >
            <Layers size={18} />
          </button>
        </div>
      </div>


    </div>
  );
};
