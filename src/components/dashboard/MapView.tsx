"use client";

import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  type GeoJSONSource,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Location } from "@/lib/types";
import { COVERAGE_STYLES } from "./coverage-styles";

type MapViewProps = {
  locations: Location[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const NYC_CENTER: [number, number] = [-73.94, 40.7];

function toGeoJson(locations: Location[]) {
  return {
    type: "FeatureCollection" as const,
    features: locations
      .filter(
        (l): l is Location & { lat: number; lon: number } =>
          l.lat !== null && l.lon !== null,
      )
      .map((l) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [l.lon, l.lat] },
        properties: {
          id: l.id,
          coverage: l.coverage,
          deviationScore: l.deviationScore,
          street: l.street,
        },
      })),
  };
}

export function MapView({ locations, selectedId, onSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const styleUrl = prefersDark
      ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

    const map = new MapLibreMap({
      container: containerRef.current,
      style: styleUrl,
      center: NYC_CENTER,
      zoom: 10,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("locations", {
        type: "geojson",
        data: toGeoJson(locations) as GeoJSON.FeatureCollection,
      });

      map.addLayer({
        id: "locations-circles",
        type: "circle",
        source: "locations",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "deviationScore"],
            0,
            5,
            1,
            11,
          ],
          "circle-color": [
            "match",
            ["get", "coverage"],
            "continuous",
            COVERAGE_STYLES.continuous.color,
            "annual",
            COVERAGE_STYLES.annual.color,
            "sparse",
            COVERAGE_STYLES.sparse.color,
            "stale",
            COVERAGE_STYLES.stale.color,
            "#999999",
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.85,
        },
      });

      map.on("mouseenter", "locations-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "locations-circles", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", "locations-circles", (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const id = feature?.properties?.id;
        if (typeof id === "string") onSelectRef.current(id);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // The map is created once; locations only change on initial data load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("locations")) return;
    (map.getSource("locations") as GeoJSONSource).setData(
      toGeoJson(locations) as GeoJSON.FeatureCollection,
    );
  }, [locations]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("locations-circles")) return;
    map.setPaintProperty("locations-circles", "circle-stroke-width", [
      "case",
      ["==", ["get", "id"], selectedId ?? ""],
      3.5,
      1.5,
    ]);
    map.setPaintProperty("locations-circles", "circle-stroke-color", [
      "case",
      ["==", ["get", "id"], selectedId ?? ""],
      "#111827",
      "#ffffff",
    ]);
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-2xl border border-border"
    />
  );
}
