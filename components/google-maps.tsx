"use client"
import { useEffect, useState, useRef } from 'react'
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import { SquareActivity } from 'lucide-react'
import { toast } from 'react-hot-toast'

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

interface GoogleMapsProps {
  latitude: number;
  longitude: number;
  radius?: number;
  setLatitude: (lat: number) => void;
  setLongitude: (lng: number) => void;
  style?: React.CSSProperties;
  address?: string;
  setAddress?: (address: string) => void;
  defibrillators: Array<{ id: string; latitude: string; longitude: string }>;
  apiKey: string;
  mapRef?: React.MutableRefObject<google.maps.Map | null>;
  markerIcon?: google.maps.Icon;
}

const createMarkerIcon = (isUser: boolean = false) => {
  const svgString = isUser 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#DC2626" stroke="#991B1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><line x1="22" y1="22" x2="18" y2="18"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#DC2626" stroke="#991B1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 7h18M3 12h18M3 17h18M7 21V3M12 21V3M17 21V3"/></svg>`;
  
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
    scaledSize: new google.maps.Size(32, 32),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(16, 16)
  };
}

const GoogleMaps = ({
  latitude,
  longitude,
  radius,
  setLatitude,
  setLongitude,
  style,
  address,
  setAddress,
  defibrillators,
  apiKey,
  mapRef,
  markerIcon
}: GoogleMapsProps) => {
  const [center, setCenter] = useState({
    lat: latitude,
    lng: longitude
  });

  const options = {
    disableDefaultUI: false,
    zoomControl: true
  }

  const [userMarker, setUserMarker] = useState<google.maps.Icon | null>(null);
  const [defibMarker, setDefibMarker] = useState<google.maps.Icon | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (typeof google !== 'undefined') {
      setUserMarker(createMarkerIcon(true));
      setDefibMarker(createMarkerIcon(false));
    }
  }, []);

  // Verifique se a chave está sendo carregada corretamente
  const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          toast.error("Erro ao obter sua localização. Por favor, permita o acesso à localização.");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      toast.error("Geolocalização não é suportada neste navegador");
    }
  };

  useEffect(() => {
    // Solicitar localização quando o componente montar
    handleGetLocation();
  }, []);

  const findNearestDefibrillator = () => {
    if (!center) {
      toast.error("Sua localização não está disponível");
      return;
    }

    type Defibrillator = {
      latitude: string;
      longitude: string;
      id: string;
    };

    let nearest: Defibrillator | null = null;
    let shortestDistance = Infinity;

    defibrillators.forEach((def: Defibrillator) => {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(center.lat, center.lng),
        new google.maps.LatLng(
          parseFloat(def.latitude),
          parseFloat(def.longitude)
        )
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearest = def;
      }
    });

    if (!nearest) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    if (!mapRef?.current) return;
    directionsRenderer.setMap(mapRef.current);

    directionsService.route(
      {
        origin: new google.maps.LatLng(center.lat, center.lng),
        destination: new google.maps.LatLng(
          parseFloat((nearest as { latitude: string }).latitude),
          parseFloat((nearest as { longitude: string }).longitude)
        ),
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
          setDirectionsRenderer(directionsRenderer);
        } else {
          console.error("Erro ao calcular rota:", status);
          toast.error("Erro ao calcular a rota");
        }
      }
    );
  };

  useEffect(() => {
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, [directionsRenderer]);

  return (
    <div style={style || mapContainerStyle}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={["places", "geometry"]}
        onLoad={() => console.log('Google Maps carregado')}
        onError={(error) => console.error('Erro ao carregar Google Maps:', error)}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          options={options}
          onLoad={(map) => {
            if (mapRef) {
              mapRef.current = map;
            }
          }}
        >
          <Marker
            position={center}
            icon={userMarker || undefined}
          />

          {defibrillators.map((def) => (
            <Marker
              key={def.id}
              position={{
                lat: parseFloat(def.latitude),
                lng: parseFloat(def.longitude)
              }}
              icon={defibMarker || undefined}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}

export default GoogleMaps
