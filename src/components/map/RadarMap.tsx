import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  setRadiusKm,
  setSelectedMarker,
  setHoveredMarkerId,
  DiscoveryMarker,
} from "../../redux/slices/mapSlice";
import { requestUserLocation } from "../../redux/slices/locationSlice";
import { useGetNearbyDiscoveryQuery } from "../../redux/services/discoveryApi";
import { MapMarker } from "./MapMarker";
import { RadiusSelector } from "./RadiusSelector";
import { MapEmptyState } from "./MapEmptyState";
import { mutedMapStyle } from "./mapStyle";
import {
  RotateCw,
  ExternalLink,
  X,
  Plus,
  Minus,
  Navigation,
} from "lucide-react";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
    initGoogleMapCallback?: () => void;
    gm_authFailure?: () => void;
  }
}

interface RadarMapProps {
  className?: string;
  heightClass?: string;
  onRefreshLocation?: () => void;
}

export function RadarMap({
  className = "",
  heightClass = "h-[360px] sm:h-[420px] lg:h-[480px]",
  onRefreshLocation,
}: RadarMapProps) {
  const dispatch = useAppDispatch();
  const location = useAppSelector((state) => state.location);
  const { radiusKm, selectedMarker, hoveredMarkerId } = useAppSelector(
    (state) => state.map
  );

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [mapAuthError, setMapAuthError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  // Query nearby needs and offers server-side with distanceKm precomputed
  const {
    data: discoveryData,
    isLoading: isFetchingData,
    isFetching,
    refetch,
  } = useGetNearbyDiscoveryQuery(
    {
      lat: location.lat,
      lng: location.lng,
      radiusKm,
    },
    {
      skip: !location.lat || !location.lng,
    }
  );

  // Manual refresh handler: re-triggers snapshot location read + RTK query refetch
  const handleManualRefresh = () => {
    if (onRefreshLocation) {
      onRefreshLocation();
    } else {
      dispatch(requestUserLocation());
    }
    refetch();
  };

  // Construct self marker
  const selfMarker: DiscoveryMarker = useMemo(
    () => ({
      id: "self-user-marker",
      type: "self",
      title: "Your Location",
      lat: location.lat,
      lng: location.lng,
      distanceKm: 0,
    }),
    [location.lat, location.lng]
  );

  // Combine all markers
  const displayMarkers = useMemo(() => {
    const rawNeeds = discoveryData?.needs || [];
    const rawOffers = discoveryData?.offers || [];
    return [...rawNeeds, ...rawOffers];
  }, [discoveryData]);

  // Dynamic Google Maps Script Loader & Map Instantiation
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn("Google Maps API auth failure detected. Falling back to vector map.");
      setMapAuthError(true);
      setGoogleMapsReady(false);
    };

    const googleApiKey =
      (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() || "";

    const initMap = () => {
      if (!mapContainerRef.current || !window.google?.maps || mapAuthError) return;

      const center = {
        lat: location.lat || 12.9716,
        lng: location.lng || 77.5946,
      };

      const mapOptions = {
        center,
        zoom: zoomLevel,
        styles: mutedMapStyle,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        backgroundColor: "#000000",
      };

      try {
        const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
        googleMapInstanceRef.current = map;
        setGoogleMapsReady(true);
      } catch (err) {
        console.error("Failed to initialize Google Map:", err);
        setMapAuthError(true);
        setGoogleMapsReady(false);
      }
    };

    if (window.google?.maps && !mapAuthError) {
      initMap();
      return;
    }

    if (!googleApiKey || mapAuthError) {
      setGoogleMapsReady(false);
      return;
    }

    const existingScript = document.getElementById("google-maps-sdk");
    if (!existingScript) {
      window.initGoogleMapCallback = () => {
        initMap();
      };

      const script = document.createElement("script");
      script.id = "google-maps-sdk";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&callback=initGoogleMapCallback&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [location.lat, location.lng, zoomLevel]);

  // Sync center when user's lat/lng updates
  useEffect(() => {
    if (googleMapInstanceRef.current && location.lat && location.lng) {
      googleMapInstanceRef.current.panTo({
        lat: location.lat,
        lng: location.lng,
      });
    }
  }, [location.lat, location.lng]);

  const handleZoomIn = () => {
    if (googleMapInstanceRef.current) {
      const current = googleMapInstanceRef.current.getZoom() || 14;
      googleMapInstanceRef.current.setZoom(current + 1);
      setZoomLevel(current + 1);
    }
  };

  const handleZoomOut = () => {
    if (googleMapInstanceRef.current) {
      const current = googleMapInstanceRef.current.getZoom() || 14;
      googleMapInstanceRef.current.setZoom(Math.max(current - 1, 10));
      setZoomLevel(Math.max(current - 1, 10));
    }
  };

  const handleResetCenter = () => {
    if (googleMapInstanceRef.current && location.lat && location.lng) {
      googleMapInstanceRef.current.panTo({
        lat: location.lat,
        lng: location.lng,
      });
      googleMapInstanceRef.current.setZoom(14);
      setZoomLevel(14);
    }
  };

  const projectCoordinates = (
    targetLat: number,
    targetLng: number
  ): { x: number; y: number } => {
    const centerLat = location.lat || 12.9716;
    const centerLng = location.lng || 77.5946;

    const latDiff = targetLat - centerLat;
    const lngDiff = targetLng - centerLng;

    const radiusDegrees = (radiusKm * 1.3) / 111.32;

    const normX = lngDiff / (radiusDegrees * Math.cos((centerLat * Math.PI) / 180));
    const normY = -latDiff / radiusDegrees;

    const clampedX = Math.max(-0.92, Math.min(0.92, normX));
    const clampedY = Math.max(-0.92, Math.min(0.92, normY));

    const x = 500 + clampedX * 420;
    const y = 500 + clampedY * 420;

    return { x, y };
  };

  const hasNoMarkers = displayMarkers.length === 0;

  return (
    <div
      id="radar-map-container"
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-[var(--line)] bg-[var(--surface)] shadow-xl transition-all select-none ${className}`}
    >
      {/* 1. Base Map Layer */}
      {googleMapsReady && !mapAuthError ? (
        <div
          ref={mapContainerRef}
          className="absolute inset-0 z-0 w-full h-full bg-[var(--paper)]"
        />
      ) : (
        /* Fallback Vector Map Canvas if Google Maps API key is unavailable or fails to authenticate */
        <div className="absolute inset-0 z-0 bg-[var(--surface)] flex items-center justify-center">
          <div className="w-full h-full opacity-20 bg-[radial-gradient(var(--ink)_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
      )}

      {/* 2. Concentric Radar Rings & Sweep SVG Layer */}
      <svg
        viewBox="0 0 1000 1000"
        className="absolute inset-0 z-10 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="zomatoRadarSweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#10B981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric Subtle Radar Rings */}
        <circle
          cx="500"
          cy="500"
          r="140"
          fill="none"
          stroke="#10B981"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          opacity="0.35"
        />
        <circle
          cx="500"
          cy="500"
          r="280"
          fill="none"
          stroke="#10B981"
          strokeWidth="1.2"
          strokeDasharray="5 5"
          opacity="0.25"
        />
        <circle
          cx="500"
          cy="500"
          r="420"
          fill="none"
          stroke="#10B981"
          strokeWidth="1.5"
          opacity="0.3"
        />

        {/* Radar Sweep Rotating Beam */}
        <g className="animate-radar-sweep origin-center" style={{ transformOrigin: "500px 500px" }}>
          <path d="M 500 500 L 920 500 A 420 420 0 0 0 500 80 Z" fill="url(#zomatoRadarSweep)" />
          <line x1="500" y1="500" x2="920" y2="500" stroke="#10B981" strokeWidth="1.8" opacity="0.6" />
        </g>
      </svg>

      {/* 3. Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left: Radar Location Badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--line)] text-[var(--ink)] shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-85"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold truncate max-w-[130px] sm:max-w-[200px]">
            {location.cityName || "Radar Center"}
          </span>
          <span className="text-[var(--muted)] text-xs">·</span>
          <span className="text-[11px] font-medium text-[var(--muted)]">
            {radiusKm} km
          </span>
        </div>

        {/* Right: Manual Refresh Button & Radius Chips */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            id="radar-refresh-btn"
            onClick={handleManualRefresh}
            disabled={isFetching}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)]/90 hover:bg-[var(--surface)] active:scale-95 text-xs font-bold text-[var(--ink)] backdrop-blur-md border border-[var(--line)] shadow-md transition-all cursor-pointer ${
              isFetching ? "opacity-75" : ""
            }`}
            title="Refresh radar scans"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-emerald-500 ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">{isFetching ? "Scanning…" : "Scan"}</span>
          </button>

          <RadiusSelector
            value={radiusKm}
            onChange={(r) => dispatch(setRadiusKm(r))}
          />
        </div>
      </div>

      {/* 4. Center User Marker */}
      <div
        style={{ left: "50%", top: "50%" }}
        className="absolute z-20 pointer-events-auto -translate-x-1/2 -translate-y-1/2"
      >
        <MapMarker marker={selfMarker} />
      </div>

      {/* 5. Custom Overlay Markers */}
      {displayMarkers.map((marker) => {
        const { x, y } = projectCoordinates(marker.lat, marker.lng);
        const isSelected = selectedMarker?.id === marker.id;
        const isHovered = hoveredMarkerId === marker.id;

        return (
          <div
            key={marker.id}
            style={{
              left: `${(x / 1000) * 100}%`,
              top: `${(y / 1000) * 100}%`,
            }}
            className="absolute z-20 pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
          >
            <MapMarker
              marker={marker}
              isSelected={isSelected}
              isHovered={isHovered}
              onClick={(m) => dispatch(setSelectedMarker(m))}
              onMouseEnter={(m) => dispatch(setHoveredMarkerId(m.id))}
              onMouseLeave={() => dispatch(setHoveredMarkerId(null))}
            />
          </div>
        );
      })}

      {/* 6. Bottom Right Floating Map Zoom & Recenter Controls */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-full bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--line)] shadow-sm flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-full bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--line)] shadow-sm flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleResetCenter}
          className="w-8 h-8 rounded-full bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--line)] shadow-sm flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
          title="Center GPS"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-500" />
        </button>
      </div>

      {/* 7. Empty State Message when no nearby needs are available */}
      {hasNoMarkers && !isFetchingData && (
        <MapEmptyState
          radiusKm={radiusKm}
          onExpandRadius={() => dispatch(setRadiusKm(25))}
        />
      )}

      {/* 8. Selected Marker Detail Floating Popup */}
      {selectedMarker && selectedMarker.type !== "self" && (
        <div className="absolute bottom-3 left-3 right-14 sm:right-auto sm:max-w-sm z-40 p-4 rounded-2xl bg-[var(--surface)]/95 backdrop-blur-xl border border-[var(--line)] text-[var(--ink)] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    selectedMarker.type === "need" ? "#3B82F6" : "#EF4444",
                }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                {selectedMarker.type === "need" ? "Community Need" : "Local Offer"}
              </span>
              {selectedMarker.distanceKm !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] font-bold border border-[var(--line)]">
                  {selectedMarker.distanceKm < 1
                    ? `${Math.round(selectedMarker.distanceKm * 1000)} m`
                    : `${selectedMarker.distanceKm} km`}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => dispatch(setSelectedMarker(null))}
              className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="font-bold text-sm text-[var(--ink)] mt-2 line-clamp-1">
            {selectedMarker.title}
          </h4>
          {selectedMarker.description && (
            <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
              {selectedMarker.description}
            </p>
          )}

          <div className="mt-3 pt-2 border-t border-[var(--line)] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[var(--muted)] block font-medium">Budget</span>
              <span className="text-xs font-bold text-emerald-500">
                ₹{selectedMarker.budgetMin || 0}
                {selectedMarker.budgetMax && selectedMarker.budgetMax > (selectedMarker.budgetMin || 0)
                  ? ` – ₹${selectedMarker.budgetMax}`
                  : ""}
              </span>
            </div>

            {selectedMarker.dealId && (
              <Link
                to={`/deals/${selectedMarker.dealId}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--ink)] text-[var(--paper)] text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs"
              >
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RadarMap;
