import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api'
import { useState, useEffect } from 'react'
import { Defibrillator } from '@/types/types'
interface GoogleMapsProps {
  radius: number
  setLatitude: (lat: number) => void
  setLongitude: (lng: number) => void
  latitude: number
  longitude: number
  style: { width: string; height: string }
  address: string
  setAddress: (address: string) => void
  defibrillators: Defibrillator[]
  apiKey: string
}

const isClient = typeof window !== 'undefined'

export default function GoogleMaps({
  radius,
  setLatitude,
  setLongitude,
  latitude,
  longitude,
  style,
  address,
  setAddress,
  defibrillators,
  apiKey
}: GoogleMapsProps) {
  const [selectedDefibrillator, setSelectedDefibrillator] = useState<Defibrillator | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [nearestDefibrillator, setNearestDefibrillator] = useState<Defibrillator | null>(null)

  const defaultIconConfig = {
    url: '',
    scaledSize: undefined as google.maps.Size | undefined,
    origin: undefined as google.maps.Point | undefined,
    anchor: undefined as google.maps.Point | undefined
  }

  const [defibrillatorIcon, setDefibrillatorIcon] = useState(defaultIconConfig)
  const [userLocationIcon, setUserLocationIcon] = useState(defaultIconConfig)

  useEffect(() => {
    if (isClient && window.google?.maps) {
      setDefibrillatorIcon({
        url: '/defibrillator-marker.png',
        scaledSize: new window.google.maps.Size(40, 40),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(20, 40)
      })

      setUserLocationIcon({
        url: '/user-location.png',
        scaledSize: new window.google.maps.Size(30, 30),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(15, 15)
      })
    }
  }, [isClient])

  // Função para solicitar permissão de localização
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setIsLocationPermissionGranted(true)
          setLocationError('')
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Você precisa permitir o acesso à sua localização para encontrar o desfibrilador mais próximo.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informação de localização indisponível.'
              break
            case error.TIMEOUT:
              errorMessage = 'Tempo esgotado ao tentar obter localização.'
              break
          }
          setLocationError(errorMessage)
          setIsLocationPermissionGranted(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    } else {
      setLocationError('Seu navegador não suporta geolocalização.')
    }
  }

  // Solicitar localização ao montar o componente
  useEffect(() => {
    requestLocationPermission()
  }, [])

  // Encontrar o desfibrilador mais próximo
  const findNearestDefibrillator = (): Defibrillator | null => {
    if (!userLocation) return null

    let nearest: Defibrillator | null = null
    let shortestDistance = Infinity

    defibrillators.forEach((def) => {
      const lat = parseFloat(def.latitude)
      const lng = parseFloat(def.longitude)
      
      if (isNaN(lat) || isNaN(lng)) return

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      )

      if (distance < shortestDistance) {
        shortestDistance = distance
        nearest = def
      }
    })

    return nearest
  }

  // Calcular distância entre dois pontos
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Raio da Terra em km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  // Traçar rota para o desfibrilador mais próximo
  const getDirectionsToNearest = () => {
    if (!userLocation) {
      alert("Não foi possível obter sua localização. Por favor, permita o acesso à localização.")
      return
    }
    
    const nearest = findNearestDefibrillator()
    if (!nearest) {
      alert("Não foi possível encontrar um desfibrilador próximo.")
      return
    }

    const directionsService = new google.maps.DirectionsService()

    directionsService.route(
      {
        origin: userLocation,
        destination: {
          lat: parseFloat(nearest.latitude),
          lng: parseFloat(nearest.longitude)
        },
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result)
          setNearestDefibrillator(nearest)
          setSelectedDefibrillator(nearest) // Mostra info do desfibrilador selecionado
        } else {
          alert("Erro ao calcular a rota. Tente novamente.")
          console.error(`Erro ao traçar rota: ${status}`)
        }
      }
    )
  }

  const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

  return (
    <div className="relative w-full">
      {locationError && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {locationError}
            <button 
              onClick={requestLocationPermission}
              className="ml-auto bg-red-200 px-2 py-1 rounded hover:bg-red-300"
            >
              Permitir Localização
            </button>
          </p>
        </div>
      )}

      <LoadScript googleMapsApiKey={mapApiKey}>
        <GoogleMap
          mapContainerStyle={style}
          center={userLocation || { lat: latitude, lng: longitude }}
          zoom={13}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
          }}
          onLoad={(map) => {
            // Aqui podemos definir os ícones após o carregamento do mapa
            if (window.google?.maps) {
              defibrillatorIcon.scaledSize = new window.google.maps.Size(40, 40)
              defibrillatorIcon.origin = new window.google.maps.Point(0, 0)
              defibrillatorIcon.anchor = new window.google.maps.Point(20, 40)

              userLocationIcon.scaledSize = new window.google.maps.Size(30, 30)
              userLocationIcon.origin = new window.google.maps.Point(0, 0)
              userLocationIcon.anchor = new window.google.maps.Point(15, 15)
            }
          }}
        >
          {/* Marcador da localização do usuário */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={userLocationIcon}
              title="Sua localização"
            />
          )}

          {/* Marcadores dos desfibriladores */}
          {defibrillators.map((def) => {
            const lat = parseFloat(def.latitude)
            const lng = parseFloat(def.longitude)
            
            if (isNaN(lat) || isNaN(lng)) return null
            
            return (
              <Marker
                key={def.id}
                position={{ lat, lng }}
                icon={defibrillatorIcon}
                onClick={() => setSelectedDefibrillator(def)}
                title={def.nome}
              />
            )
          })}

          {/* InfoWindow do desfibrilador selecionado */}
          {selectedDefibrillator && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedDefibrillator.latitude),
                lng: parseFloat(selectedDefibrillator.longitude)
              }}
              onCloseClick={() => setSelectedDefibrillator(null)}
            >
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">{selectedDefibrillator.nome}</h3>
                <p className="text-sm mb-1">
                  {selectedDefibrillator.rua}, {selectedDefibrillator.numero}
                </p>
                <p className="text-sm mb-2">{selectedDefibrillator.bairro}</p>
                {userLocation && (
                  <button
                    onClick={() => getDirectionsToNearest()}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Traçar Rota
                  </button>
                )}
              </div>
            </InfoWindow>
          )}

          {/* Renderizar a rota */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#dc2626',
                  strokeWeight: 5
                }
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Card com informações da rota */}
      {nearestDefibrillator && directions && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <h4 className="font-bold text-lg mb-2">Desfibrilador mais próximo:</h4>
          <p className="text-sm mb-1">{nearestDefibrillator.nome}</p>
          <p className="text-sm mb-1">
            {nearestDefibrillator.rua}, {nearestDefibrillator.numero}
          </p>
          <p className="text-sm mb-2">{nearestDefibrillator.bairro}</p>
          <p className="text-sm font-semibold">
            Distância: {directions.routes[0].legs[0].distance?.text}
          </p>
          <p className="text-sm font-semibold">
            Tempo estimado: {directions.routes[0].legs[0].duration?.text}
          </p>
        </div>
      )}
    </div>
  )
}
