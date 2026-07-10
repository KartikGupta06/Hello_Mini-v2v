"use client";

import React, { useEffect, useRef, useCallback } from "react";
import type { Map as LeafletMap, Polyline, Marker, TileLayer } from "leaflet";

// ─── Shared prop types ────────────────────────────────────────────────────────
export interface MapHotspot {
  lat: number;
  lng: number;
  type: "unsafe_cluster" | "sudden_drop";
  description: string;
}

export interface MapRoute {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[]; // Raw backend format
  color: string;
  distance: string;
  time: string;
  score: number;
  badgeVariant: "success" | "warning" | "danger" | "info" | "destructive";
  notes: string;
  hotspots?: MapHotspot[];
}

interface LeafletMapProps {
  routes: MapRoute[];
  selectedRouteId: string;
  onRouteSelect: (id: string) => void;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
}

// ─── Internal map state refs (not React state to avoid re-renders) ────────────
interface MapRefs {
  map: LeafletMap | null;
  polylines: Map<string, Polyline>;
  outlines: Map<string, Polyline>;
  markers: Marker[];
  tileLayer: TileLayer | null;
}

// ─── Coordinate conversion adapter (Backend format → Leaflet format) ──────────
const toLatLng = (coord: { lat: number; lng: number }): [number, number] => [coord.lat, coord.lng];

// ─── Custom pulsing div icon builder ─────────────────────────────────────────
const createPulseIcon = (L: typeof import("leaflet"), color: string, size = 16) => {
  const hex = color.replace("#", "");
  const rgb = color;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        position:relative;
        width:${size}px;
        height:${size}px;
      ">
        <div style="
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:${size * 2.5}px;
          height:${size * 2.5}px;
          border-radius:50%;
          background:${rgb};
          opacity:0.25;
          animation:leafletPulse 1.8s infinite;
        "></div>
        <div style="
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:${rgb};
          border:2.5px solid #fff;
          box-shadow:0 0 12px ${rgb};
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// ─── Component ────────────────────────────────────────────────────────────────
const LeafletMapComponent: React.FC<LeafletMapProps> = ({
  routes,
  selectedRouteId,
  onRouteSelect,
  center = [-73.9857, 40.7484],
  zoom = 14,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const refs = useRef<MapRefs>({
    map: null,
    polylines: new Map(),
    outlines: new Map(),
    markers: [],
    tileLayer: null,
  });
  // track what was last rendered so we can diff
  const prevRoutesRef = useRef<MapRoute[]>([]);
  const prevSelectedRef = useRef<string>("");

  // ── Init map once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || refs.current.map) return;

    // Inject pulse animation keyframes into document head (once)
    if (!document.getElementById("leaflet-pulse-style")) {
      const style = document.createElement("style");
      style.id = "leaflet-pulse-style";
      style.innerHTML = `
        @keyframes leafletPulse {
          0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.3; }
          70% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
          100% { transform: translate(-50%,-50%) scale(0.8); opacity: 0; }
        }
        .leaflet-tile-pane { filter: brightness(0.92) saturate(1.1); }
      `;
      document.head.appendChild(style);
    }

    // Dynamic import — Leaflet must load in browser only
    import("leaflet").then((L) => {
      // Fix default icon path broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Import CSS
      import("leaflet/dist/leaflet.css");

      const initialCenter: [number, number] = [center[1], center[0]]; // convert [lng,lat]→[lat,lng]

      const map = L.map(containerRef.current!, {
        center: initialCenter,
        zoom,
        zoomControl: false, // we add our own
        attributionControl: true,
      });

      // OSM tile layer
      const tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          crossOrigin: "anonymous",
        }
      ).addTo(map);

      refs.current.map = map;
      refs.current.tileLayer = tileLayer;

      // Trigger initial route render after map is ready
      renderRoutes(L, map);
    });

    return () => {
      if (refs.current.map) {
        refs.current.map.remove();
        refs.current.map = null;
        refs.current.polylines.clear();
        refs.current.outlines.clear();
        refs.current.markers = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-render routes when data or selection changes ──────────────────────
  useEffect(() => {
    if (!refs.current.map) return;

    const routesChanged = JSON.stringify(routes.map(r => r.id)) !== JSON.stringify(prevRoutesRef.current.map(r => r.id));
    const selectionChanged = selectedRouteId !== prevSelectedRef.current;

    if (!routesChanged && !selectionChanged) return;

    import("leaflet").then((L) => {
      if (!refs.current.map) return;
      renderRoutes(L, refs.current.map);
    });

    prevRoutesRef.current = routes;
    prevSelectedRef.current = selectedRouteId;
  }, [routes, selectedRouteId]);

  // ── Core render function (pure side-effects on Leaflet) ──────────────────
  const renderRoutes = useCallback(
    (L: typeof import("leaflet"), map: LeafletMap) => {
      // 1. Remove old polylines
      refs.current.polylines.forEach((pl) => pl.remove());
      refs.current.outlines.forEach((ol) => ol.remove());
      refs.current.markers.forEach((m) => m.remove());
      refs.current.polylines.clear();
      refs.current.outlines.clear();
      refs.current.markers = [];

      if (routes.length === 0) return;

      const boundsCoords: [number, number][] = [];

      // 2. Draw routes — alternatives first so selected renders on top
      const ordered = [...routes].sort((a, b) =>
        a.id === selectedRouteId ? 1 : b.id === selectedRouteId ? -1 : 0
      );

      ordered.forEach((route) => {
        if (!route.coordinates || route.coordinates.length === 0) return;

        const isSelected = route.id === selectedRouteId;
        const latLngs = route.coordinates.map(toLatLng);

        // Glow outline layer
        const outline = L.polyline(latLngs, {
          color: route.color,
          weight: isSelected ? 12 : 7,
          opacity: isSelected ? 0.3 : 0.08,
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
        }).addTo(map);

        // Solid core line
        const poly = L.polyline(latLngs, {
          color: route.color,
          weight: isSelected ? 5 : 3,
          opacity: isSelected ? 1 : 0.38,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        // Click handler on main polyline
        poly.on("click", () => onRouteSelect(route.id));
        poly.on("mouseover", () => {
          if (!isSelected) poly.setStyle({ opacity: 0.7, weight: 4 });
          map.getContainer().style.cursor = "pointer";
        });
        poly.on("mouseout", () => {
          if (!isSelected) poly.setStyle({ opacity: 0.38, weight: 3 });
          map.getContainer().style.cursor = "";
        });

        refs.current.polylines.set(route.id, poly);
        refs.current.outlines.set(route.id, outline);

        // Accumulate bounds coords from selected route only
        if (isSelected) {
          latLngs.forEach((ll) => boundsCoords.push(ll));
        }
      });

      // 3. Markers for selected route
      const selected = routes.find((r) => r.id === selectedRouteId) || routes[0];
      if (selected && selected.coordinates.length > 0) {
        const startCoord = selected.coordinates[0];
        const endCoord = selected.coordinates[selected.coordinates.length - 1];

        const originMarker = L.marker(toLatLng(startCoord), {
          icon: createPulseIcon(L, "#3b82f6", 14),
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindTooltip("Origin", { direction: "top", offset: [0, -10] });

        const destMarker = L.marker(toLatLng(endCoord), {
          icon: createPulseIcon(L, "#10b981", 16),
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindTooltip("Destination", { direction: "top", offset: [0, -12] });

        refs.current.markers.push(originMarker, destMarker);

        // Hotspot markers (extensible for future safe havens)
        if (selected.hotspots) {
          selected.hotspots.forEach((hs) => {
            const hsMarker = L.marker([hs.lat, hs.lng], {
              icon: createPulseIcon(L, "#ef4444", 12),
              zIndexOffset: 900,
            })
              .addTo(map)
              .bindTooltip(hs.description, { direction: "top" });
            refs.current.markers.push(hsMarker);
          });
        }

        // 4. Fit bounds to selected route
        if (boundsCoords.length >= 2) {
          try {
            map.fitBounds(boundsCoords, {
              padding: [60, 60],
              animate: true,
              duration: 0.8,
              maxZoom: 16,
            });
          } catch {
            // Bounds may fail if coords are invalid — silently ignore
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routes, selectedRouteId, onRouteSelect]
  );

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", zIndex: 1 }}
      aria-label="Interactive route map powered by OpenStreetMap"
    />
  );
};

export default LeafletMapComponent;
