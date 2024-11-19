"use client"
import { useEffect, useState } from 'react'
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import { SquareActivity } from 'lucide-react'

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
  const center = {
    lat: latitude,
    lng: longitude
  }

  const options = {
    disableDefaultUI: false,
    zoomControl: true
  }

  const [userMarker, setUserMarker] = useState<google.maps.Icon | null>(null);
  const [defibMarker, setDefibMarker] = useState<google.maps.Icon | null>(null);

  useEffect(() => {
    if (typeof google !== 'undefined') {
      setUserMarker(createMarkerIcon(true));
      setDefibMarker(createMarkerIcon(false));
    }
  }, []);

  return (
    <div style={style || mapContainerStyle}>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          options={options}
          onLoad={map => {
            if (mapRef) {
              mapRef.current = map
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
