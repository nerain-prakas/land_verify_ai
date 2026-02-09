"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((m) => m.GeoJSON), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

interface Props {
    geoTarget: {
        district_name: string;
        taluk_name: string;
        revenue_village_name: string;
    };
    onVerified: () => void;
}

export default function LocationVerifier({ geoTarget, onVerified }: Props) {
    const [villageBoundary, setVillageBoundary] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]);
    const [manualVillage, setManualVillage] = useState("");
    const [showManualInput, setShowManualInput] = useState(false);
    const [distanceKm, setDistanceKm] = useState<number | null>(null);

    // Fix for Leaflet marker icons in Next.js
    useEffect(() => {
        const fixIcons = async () => {
            const L = (await import('leaflet')).default;
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        };
        fixIcons();
    }, []);

    useEffect(() => {
        fetchVillageBoundary();
    }, [geoTarget]);

    const fetchVillageBoundary = async (manualName?: string) => {
        setStatus("loading");
        const villageName = manualName || geoTarget.revenue_village_name;
        try {
            const query = `${villageName}, ${geoTarget.taluk_name}, ${geoTarget.district_name}, Tamil Nadu, India`;
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&polygon_geojson=1&limit=1`;

            const response = await fetch(url, {
                headers: {
                    "User-Agent": "LandGuard-Verification-App"
                }
            });
            const data = await response.json();

            if (data && data.length > 0) {
                if (data[0].geojson) {
                    setVillageBoundary(data[0].geojson);
                }
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setMapCenter([lat, lon]);
                setStatus("idle");
                if (manualName) {
                    toast.success(`Found location for ${manualName}`);
                    setShowManualInput(false);
                }
            } else {
                // Try broader search
                const broadQuery = `${villageName}, ${geoTarget.district_name}, Tamil Nadu`;
                const broadUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(broadQuery)}&format=json&polygon_geojson=1&limit=1`;
                const broadResponse = await fetch(broadUrl);
                const broadData = await broadResponse.json();

                if (broadData && broadData.length > 0) {
                    if (broadData[0].geojson) {
                        setVillageBoundary(broadData[0].geojson);
                    }
                    setMapCenter([parseFloat(broadData[0].lat), parseFloat(broadData[0].lon)]);
                    setStatus("idle");
                    if (manualName) setShowManualInput(false);
                } else {
                    toast.error(`Could not find location for "${villageName}".`);
                    setStatus("error");
                    setShowManualInput(true);
                }
            }
        } catch (error) {
            console.error("Nominatim fetch error:", error);
            setStatus("error");
        }
    };

    const handleCheckLocation = () => {
        setIsVerifying(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const point = turf.point([longitude, latitude]);
                    const centerPoint = turf.point([mapCenter[1], mapCenter[0]]);
                    const distance = turf.distance(point, centerPoint, { units: "kilometers" });

                    setUserLocation([latitude, longitude]);
                    setDistanceKm(distance);

                    // Validation logic: Inside boundary OR within 2km radius
                    let isInside = false;
                    try {
                        // Only check if it's a Polygon or MultiPolygon
                        if (villageBoundary && (villageBoundary.type === "Polygon" || villageBoundary.type === "MultiPolygon")) {
                            isInside = turf.booleanPointInPolygon(point, villageBoundary);
                        }
                    } catch (turfError) {
                        console.warn("Turf polygon check failed:", turfError);
                        // Fallback to radius-only check
                    }

                    const isWithinRadius = distance <= 2;

                    if (isInside || isWithinRadius) {
                        setStatus("success");
                        toast.success(isInside ? "Location Verified! You are at the site." : `Location Verified (${distance.toFixed(1)}km from center)`);
                        onVerified();
                    } else {
                        setStatus("error");
                        toast.error(`Too far from site. You are ${distance.toFixed(1)}km away from ${manualVillage || geoTarget.revenue_village_name}.`);
                    }
                } catch (err) {
                    console.error("GPS Verification logic error:", err);
                    toast.error("An error occurred during verification. Please try again.");
                    setStatus("error");
                } finally {
                    setIsVerifying(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast.error("Please enable GPS to verify your location.");
                setIsVerifying(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualVillage.trim()) {
            fetchVillageBoundary(manualVillage);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    📍 Location Verification Required
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                    Based on your document, you must be physically present in <b>{manualVillage || geoTarget.revenue_village_name}</b> to upload the site video.
                </p>
            </div>

            <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 relative">
                {typeof window !== "undefined" && (
                    <MapContainer
                        key={`${mapCenter[0]}-${mapCenter[1]}`}
                        center={mapCenter}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* Target Location Circle (2km) */}
                        <Circle
                            center={mapCenter}
                            radius={2000}
                            pathOptions={{
                                color: "#10b981",
                                fillColor: "#10b981",
                                fillOpacity: 0.1,
                                weight: 2,
                                dashArray: "5, 10"
                            }}
                        />

                        {villageBoundary && (
                            <GeoJSON
                                data={villageBoundary}
                                style={{
                                    color: "#4f46e5",
                                    weight: 2,
                                    fillColor: "#4f46e5",
                                    fillOpacity: 0.1
                                }}
                            />
                        )}

                        {/* Target Marker (Blue) */}
                        <Marker position={mapCenter}>
                            <Popup>
                                <b>Target: {manualVillage || geoTarget.revenue_village_name}</b>
                                <br />
                                Extracted from document
                            </Popup>
                        </Marker>

                        {userLocation && (
                            <Marker position={userLocation}>
                                <Popup>
                                    <b>You are here</b>
                                    {distanceKm !== null && (
                                        <div className="mt-1 text-xs">
                                            {distanceKm.toFixed(1)}km from site
                                        </div>
                                    )}
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                )}

                {status === "loading" && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-[1000]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                )}
            </div>

            {showManualInput && (
                <form onSubmit={handleManualSubmit} className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-3">
                    <p className="text-sm text-amber-800 font-medium">
                        Automatic search failed. Please manually enter the village name as written in your document:
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={manualVillage}
                            onChange={(e) => setManualVillage(e.target.value)}
                            placeholder="Enter Village Name"
                            className="flex-1 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                            type="submit"
                            className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-amber-700"
                        >
                            Search
                        </button>
                    </div>
                </form>
            )}

            <div className="flex flex-col gap-3">
                <button
                    onClick={handleCheckLocation}
                    disabled={isVerifying || status === "loading"}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${status === "success"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                        } disabled:opacity-50`}
                >
                    {isVerifying ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Checking GPS...
                        </>
                    ) : status === "success" ? (
                        "✅ Location Verified"
                    ) : (
                        "📍 Check My Location"
                    )}
                </button>

                {status === "error" && !showManualInput && (
                    <div className="text-center">
                        <p className="text-red-600 text-sm font-medium">
                            Location mismatch. {distanceKm ? `You are ${distanceKm.toFixed(1)}km away.` : ""}
                        </p>
                        <button
                            onClick={() => setShowManualInput(true)}
                            className="text-xs text-gray-500 underline mt-1"
                        >
                            Search manually or retry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
