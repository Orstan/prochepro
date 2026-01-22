"use client";

import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "@/lib/api";

type Location = {
  latitude: number;
  longitude: number;
  updated_at?: string;
};

type TrackingData = {
  current_location: Location;
  task_location: Location;
  tracking: Location[];
  eta: {
    distance_km: number;
    duration_minutes: number;
    eta: string;
  } | null;
  prestataire_status: string;
};

type Props = {
  taskId: number;
};

export default function LiveTrackingMap({ taskId }: Props) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; eta: string } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const prestataireMarkerRef = useRef<any>(null);
  const taskMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

  useEffect(() => {
    loadGoogleMapsScript();
    fetchTracking();
    
    // Оновлюємо локацію кожні 10 секунд
    const interval = setInterval(fetchTracking, 10000);
    
    return () => clearInterval(interval);
  }, [taskId]);

  const loadGoogleMapsScript = () => {
    if (typeof window !== "undefined" && !(window as any).google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  };

  const fetchTracking = async () => {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/tracking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTrackingData(data);
        updateMap(data);
        setError(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Impossible de charger le suivi");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const updateMap = (data: TrackingData) => {
    if (!mapRef.current || typeof window === "undefined" || !(window as any).google) {
      return;
    }

    const google = (window as any).google;

    // Ініціалізуємо карту якщо ще не створена
    if (!googleMapRef.current) {
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        zoom: 13,
        center: {
          lat: data.current_location.latitude,
          lng: data.current_location.longitude,
        },
        mapTypeControl: false,
        streetViewControl: false,
      });
    }

    // Оновлюємо маркер майстра
    if (prestataireMarkerRef.current) {
      prestataireMarkerRef.current.setPosition({
        lat: data.current_location.latitude,
        lng: data.current_location.longitude,
      });
    } else {
      prestataireMarkerRef.current = new google.maps.Marker({
        position: {
          lat: data.current_location.latitude,
          lng: data.current_location.longitude,
        },
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#2563EB",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
        },
        title: "Prestataire",
        animation: google.maps.Animation.BOUNCE,
      });
      
      // Зупиняємо анімацію через 2 секунди
      setTimeout(() => {
        if (prestataireMarkerRef.current) {
          prestataireMarkerRef.current.setAnimation(null);
        }
      }, 2000);
    }

    // Оновлюємо маркер завдання
    if (!taskMarkerRef.current && data.task_location.latitude) {
      taskMarkerRef.current = new google.maps.Marker({
        position: {
          lat: data.task_location.latitude,
          lng: data.task_location.longitude,
        },
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#EF4444",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
        },
        title: "Destination",
      });
    }

    // Будуємо маршрут через Directions API
    if (data.task_location.latitude && data.current_location.latitude) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: {
            lat: data.current_location.latitude,
            lng: data.current_location.longitude,
          },
          destination: {
            lat: data.task_location.latitude,
            lng: data.task_location.longitude,
          },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            if (!directionsRendererRef.current) {
              directionsRendererRef.current = new google.maps.DirectionsRenderer({
                map: googleMapRef.current,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#2563EB",
                  strokeOpacity: 1,
                  strokeWeight: 6,
                },
              });
            }
            if (directionsRendererRef.current) {
              directionsRendererRef.current.setDirections(result);
            }
            
            // Розраховуємо ETA з результату Directions API
            const route = result.routes[0];
            if (route && route.legs[0]) {
              const leg = route.legs[0];
              const now = new Date();
              const etaTime = new Date(now.getTime() + leg.duration.value * 1000);
              
              setRouteInfo({
                distance: leg.distance.text,
                duration: leg.duration.text,
                eta: etaTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              });
              setLastUpdate(now);
            }
          }
        }
      );
    }

    // Малюємо лінію історії руху (якщо є)
    if (data.tracking.length > 0) {
      const path = data.tracking.map((loc) => ({
        lat: loc.latitude,
        lng: loc.longitude,
      }));

      if (polylineRef.current) {
        polylineRef.current.setPath(path);
      } else {
        polylineRef.current = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: "#4CAF50",
          strokeOpacity: 0.6,
          strokeWeight: 3,
          map: googleMapRef.current,
        });
      }
    }

    // Центруємо карту щоб показати обидва маркери (тільки при першій ініціалізації)
    if (data.task_location.latitude && !directionsRendererRef.current) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({
        lat: data.current_location.latitude,
        lng: data.current_location.longitude,
      });
      bounds.extend({
        lat: data.task_location.latitude,
        lng: data.task_location.longitude,
      });
      googleMapRef.current?.fitBounds(bounds);
      
      // Додаємо padding щоб маркери не були на краю карти
      setTimeout(() => {
        googleMapRef.current?.panBy(0, -50);
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-100 rounded-lg">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ETA Info */}
      {routeInfo && trackingData?.prestataire_status === "on_the_way" && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Arrivée estimée</p>
              <p className="text-3xl font-bold text-sky-600 mt-1">{routeInfo.eta}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Distance</p>
              <p className="text-xl font-semibold text-slate-700 mt-1">{routeInfo.distance}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Durée</p>
              <p className="text-xl font-semibold text-slate-700 mt-1">{routeInfo.duration}</p>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-xs text-slate-400 mt-2">
              Mis à jour il y a {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s
            </p>
          )}
        </div>
      )}

      {/* Status */}
      {trackingData?.prestataire_status && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-slate-600">
            {trackingData.prestataire_status === "on_the_way" && "En route vers vous"}
            {trackingData.prestataire_status === "arrived" && "Arrivé sur place"}
          </span>
        </div>
      )}

      {/* Map */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-slate-200"
          style={{ minHeight: "400px" }}
        />
        
        {/* Center on Prestataire Button */}
        <button
          onClick={() => {
            if (googleMapRef.current && trackingData?.current_location) {
              googleMapRef.current.panTo({
                lat: trackingData.current_location.latitude,
                lng: trackingData.current_location.longitude,
              });
              googleMapRef.current.setZoom(15);
            }
          }}
          className="absolute bottom-4 right-4 bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-full shadow-lg border border-slate-200 transition-all hover:scale-105"
          title="Centrer sur le prestataire"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
          <span>Prestataire</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Destination</span>
        </div>
      </div>
    </div>
  );
}
