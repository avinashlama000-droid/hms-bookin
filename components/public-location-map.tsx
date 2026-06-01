"use client";

import { MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(() =>
    mappedLocations[0] ? getLocationKey(mappedLocations[0]) : null,
  );
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const markerRefs = useRef(new Map<string, CircleMarker>());
  const locationsRef = useRef(mappedLocations);
  const selectedLocationKeyRef = useRef<string | null>(selectedLocationKey);

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
  selectedLocationKeyRef.current = selectedLocationKey;

  useEffect(() => {
    if (mappedLocations.length === 0) {
      if (selectedLocationKey !== null) {
        setSelectedLocationKey(null);
      }
      return;
    }

    const hasSelectedLocation =
      selectedLocationKey !== null &&
      mappedLocations.some((item) => getLocationKey(item) === selectedLocationKey);

    if (!hasSelectedLocation) {
      setSelectedLocationKey(getLocationKey(mappedLocations[0]));
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
      updateMapLocations(L, markerLayer, markerRefs.current, locationsRef.current);

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

    updateMapLocations(L, markerLayer, markerRefs.current, mappedLocations);

    const resizeFrame = window.requestAnimationFrame(() => {
      map.invalidateSize();

      const selectedLocation = getLocationByKey(mappedLocations, selectedLocationKey);
      if (selectedLocation) {
        focusLocation(
          selectedLocation,
          markerRefs.current.get(getLocationKey(selectedLocation)),
          map,
          { animate: false },
        );
      } else {
        fitLocationOverview(map, mappedLocations);
      }
    });

    return () => window.cancelAnimationFrame(resizeFrame);
  }, [mappedLocations, selectedLocationKey]);

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

  function handleSelectLocation(location: PublicLocation) {
    const key = getLocationKey(location);
    setSelectedLocationKey(key);
    focusLocation(location, markerRefs.current.get(key), mapRef.current);
  }

  function focusInitialLocation(map: LeafletMap) {
    const selectedLocation =
      getLocationByKey(locationsRef.current, selectedLocationKeyRef.current) ??
      locationsRef.current[0];

    if (!selectedLocation) {
      fitLocationOverview(map, locationsRef.current);
      return;
    }

    const key = getLocationKey(selectedLocation);
    if (selectedLocationKeyRef.current !== key) {
      selectedLocationKeyRef.current = key;
      setSelectedLocationKey(key);
    }

    focusLocation(selectedLocation, markerRefs.current.get(key), map, {
      animate: false,
      popupDelay: 350,
    });
  }

  return (
    <div className="relative h-full min-h-[420px] w-full">
      <div
        className="absolute left-3 top-3 z-[1000] w-[min(22rem,calc(100%-1.5rem))] rounded-ui border border-white/80 bg-white/94 shadow-deep backdrop-blur"
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <label className="flex h-11 items-center gap-2 px-3" aria-label="Search hostel blocks">
          <Search className="h-4 w-4 shrink-0 text-muted-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search hostel blocks"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-muted-900 outline-none placeholder:text-muted-500"
          />
        </label>

        <div className="max-h-64 overflow-y-auto border-t border-border">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((item) => {
              const key = getLocationKey(item);
              const isSelected = key === selectedLocationKey;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectLocation(item)}
                  className={`flex w-full items-start gap-2 px-3 py-2 text-left transition ${
                    isSelected ? "bg-brand-50 text-brand-900" : "hover:bg-surface-subtle"
                  }`}
                >
                  <MapPin
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      isSelected ? "text-brand-700" : "text-muted-500"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-muted-900">
                      {item.tenant_name}
                    </span>
                    <span className="block truncate text-xs font-semibold text-muted-600">
                      {item.block_name || "Block"}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-4 text-sm font-semibold text-muted-500">
              No mapped hostel blocks found.
            </p>
          )}
        </div>
      </div>
      <div ref={mapElementRef} className="h-full min-h-[420px] w-full" />
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
      .bindPopup(createPopupContent(item))
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

function getLocationByKey(
  locations: PublicLocation[],
  key: string | null,
): PublicLocation | undefined {
  if (!key) return undefined;
  return locations.find((item) => getLocationKey(item) === key);
}

function hasMappedLocation(item: PublicLocation): boolean {
  return (
    Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude)
  );
}

function createPopupContent(item: PublicLocation): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "min-w-[210px] space-y-2";

  const heading = document.createElement("div");
  const tenantName = document.createElement("p");
  tenantName.className = "text-sm font-bold text-slate-900";
  tenantName.textContent = item.tenant_name;

  const blockName = document.createElement("p");
  blockName.className = "text-xs font-semibold text-slate-600";
  blockName.textContent = item.block_name || "Block";

  heading.append(tenantName, blockName);
  wrapper.append(heading);

  const stats = document.createElement("div");
  stats.className = "grid grid-cols-2 gap-2 text-xs";

  const rooms = document.createElement("span");
  rooms.className = "rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700";
  rooms.textContent = `${item.available_rooms_count} rooms`;

  const beds = document.createElement("span");
  beds.className = "rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700";
  beds.textContent = `${item.vacant_beds} beds`;

  stats.append(rooms, beds);
  wrapper.append(stats);

  if (item.available_rooms_count > 0) {
    const link = document.createElement("a");
    link.href = "#available-rooms";
    link.className =
      "inline-flex h-8 items-center rounded-md bg-[#235999] px-3 text-xs font-bold text-white hover:bg-[#1d4b82]";
    link.textContent = "View rooms";
    wrapper.append(link);
  }

  return wrapper;
}
