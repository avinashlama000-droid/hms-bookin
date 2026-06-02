"use client";

import { Search } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { CircleMarker, LayerGroup, Map as LeafletMap } from "leaflet";
import type { PublicLocation } from "@/lib/booking";

type PublicLocationMapProps = {
  locations: PublicLocation[];
};

const tileUrl =
  process.env.NEXT_PUBLIC_OSM_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const attribution =
  process.env.NEXT_PUBLIC_OSM_ATTRIBUTION || "&copy; OpenStreetMap contributors";
const defaultCenter: [number, number] = [27.7172, 85.324];
const defaultZoom = 12;
const focusedLocationZoom = 16;
type LeafletModule = typeof import("leaflet");

export function PublicLocationMap({ locations }: PublicLocationMapProps) {
  const mappedLocations = useMemo(() => locations.filter(hasMappedLocation), [locations]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const markerRefs = useRef(new Map<string, CircleMarker>());
  const locationsRef = useRef(mappedLocations);

  const filteredLocations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return mappedLocations;

    return mappedLocations.filter((item) =>
      [item.tenant_name, item.block_name, item.location]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery)),
    );
  }, [mappedLocations, searchQuery]);

  locationsRef.current = mappedLocations;

  useEffect(() => {
    const hasSelectedLocation =
      selectedLocationKey !== null &&
      mappedLocations.some((item) => getLocationKey(item) === selectedLocationKey);

    if (selectedLocationKey !== null && !hasSelectedLocation) {
      setSelectedLocationKey(null);
    }
  }, [mappedLocations, selectedLocationKey]);

  useEffect(() => {
    let isMounted = true;
    let resizeFrame: number | null = null;

    async function initializeMap() {
      if (!mapElementRef.current) return;

      const L = getLeafletModule(await import("leaflet"));
      if (!isMounted || !mapElementRef.current) return;

      const firstLocation = locationsRef.current[0];
      const center: [number, number] = firstLocation
        ? [firstLocation.latitude, firstLocation.longitude]
        : defaultCenter;
      const map = L.map(mapElementRef.current, {
        center,
        zoom: firstLocation ? focusedLocationZoom : defaultZoom,
        zoomControl: false,
        scrollWheelZoom: true,
      });
      const markerLayer = L.layerGroup().addTo(map);

      L.tileLayer(tileUrl, { attribution }).addTo(map);
      L.control.zoom({ position: "bottomleft" }).addTo(map);
      leafletRef.current = L;
      mapRef.current = map;
      markerLayerRef.current = markerLayer;
      updateMapLocations(L, markerLayer, markerRefs.current, filteredLocations, handleMarkerClick);

      resizeFrame = window.requestAnimationFrame(() => {
        map.invalidateSize();
        focusInitialLocation(map);
      });
    }

    void initializeMap();

    return () => {
      isMounted = false;
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }
      mapRef.current?.remove();
      leafletRef.current = null;
      mapRef.current = null;
      markerLayerRef.current = null;
      markerRefs.current.clear();
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!L || !map || !markerLayer) return;

    updateMapLocations(L, markerLayer, markerRefs.current, filteredLocations, handleMarkerClick);

    const resizeFrame = window.requestAnimationFrame(() => {
      map.invalidateSize();
      fitLocationOverview(map, filteredLocations);
    });

    return () => window.cancelAnimationFrame(resizeFrame);
  }, [filteredLocations]);

  useEffect(() => {
    if (!selectedLocationKey) return;

    const selectedLocation = mappedLocations.find(
      (item) => getLocationKey(item) === selectedLocationKey,
    );

    if (selectedLocation) {
      focusLocation(selectedLocation, markerRefs.current.get(selectedLocationKey), mapRef.current);
    } else {
      setSelectedLocationKey(null);
    }
  }, [mappedLocations, selectedLocationKey]);

  function handleMarkerClick(location: PublicLocation) {
    setSelectedLocationKey(getLocationKey(location));
  }

  function focusInitialLocation(map: LeafletMap) {
    fitLocationOverview(map, locationsRef.current);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSearched(true);

    const firstMatch = filteredLocations[0];
    if (!firstMatch) return;

    const key = getLocationKey(firstMatch);
    setSelectedLocationKey(key);
    focusLocation(firstMatch, markerRefs.current.get(key), mapRef.current, {
      popupDelay: 0,
    });
  }

  return (
    <div className="relative h-full min-h-[336px] w-full">
      <form
        onSubmit={handleSearchSubmit}
        className="absolute left-3 top-3 z-[1000] w-[min(22rem,calc(100%-1.5rem))] rounded-ui border border-white/80 bg-white/94 backdrop-blur"
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <label className="flex h-11 items-center gap-2 px-3" aria-label="Search hostel blocks">
          <button type="submit" className="shrink-0" aria-label="Search hostel">
            <Search className="h-4 w-4 text-muted-500" />
          </button>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setHasSearched(false);
            }}
            placeholder="Search hostel blocks"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-muted-900 outline-none placeholder:text-muted-500"
          />
        </label>
        {hasSearched && searchQuery.trim() && filteredLocations.length === 0 ? (
          <p className="border-t border-border px-3 py-2 text-xs font-semibold text-muted-500">
            No mapped hostel found.
          </p>
        ) : null}
      </form>
      <div ref={mapElementRef} className="h-full min-h-[336px] w-full" />
    </div>
  );
}

function getLeafletModule(module: LeafletModule & { default?: LeafletModule }): LeafletModule {
  return module.default ?? module;
}

function updateMapLocations(
  L: LeafletModule,
  markerLayer: LayerGroup,
  markers: Map<string, CircleMarker>,
  locations: PublicLocation[],
  onMarkerClick: (location: PublicLocation) => void,
) {
  markerLayer.clearLayers();
  markers.clear();

  locations.forEach((item) => {
    const marker = L.circleMarker([item.latitude, item.longitude], {
      color: "#235999",
      fillColor: "#2f7de1",
      fillOpacity: 0.85,
      radius: 10,
      weight: 2,
    })
      .bindPopup(createHostelNamePopup(item))
      .bindTooltip(item.tenant_name, {
        className: "hostel-map-label",
        direction: "top",
        offset: [0, -12],
        opacity: 1,
        permanent: true,
      })
      .on("click", () => onMarkerClick(item))
      .addTo(markerLayer);

    markers.set(getLocationKey(item), marker);
  });
}

function focusLocation(
  item: PublicLocation,
  marker: CircleMarker | undefined,
  map: LeafletMap | null,
  options: { animate?: boolean; popupDelay?: number } = {},
) {
  if (!map) return;

  map.setView([item.latitude, item.longitude], focusedLocationZoom, {
    animate: options.animate ?? true,
  });
  window.setTimeout(() => marker?.openPopup(), options.popupDelay ?? 250);
}

function fitLocationOverview(map: LeafletMap, locations: PublicLocation[]) {
  if (locations.length === 1) {
    map.setView([locations[0].latitude, locations[0].longitude], focusedLocationZoom);
  } else if (locations.length > 1) {
    map.fitBounds(
      locations.map((item) => [item.latitude, item.longitude] as [number, number]),
      { padding: [32, 32], maxZoom: focusedLocationZoom },
    );
  } else {
    map.setView(defaultCenter, defaultZoom);
  }
}

function getLocationKey(item: PublicLocation): string {
  return `${item.tenant_slug}:${item.block_id}`;
}

function hasMappedLocation(item: PublicLocation): boolean {
  return (
    Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude)
  );
}

function createHostelNamePopup(item: PublicLocation): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "min-w-[120px]";

  const tenantName = document.createElement("p");
  tenantName.className = "text-sm font-bold text-slate-900";
  tenantName.textContent = item.tenant_name;

  wrapper.append(tenantName);

  return wrapper;
}
