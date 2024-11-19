"use client"
import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Defibrillator } from '@/types/types'
import defibrillatorData from '@/data/defibrillators.json'
import { Phone, Clock, Mail, MapPin, Clipboard, Heart, SquareActivity } from 'lucide-react'

// Modificar a importação dinâmica
const GoogleMaps = dynamic(
  () => import('../google-maps'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }
)

export default function Dashboard() {
  const [latitude, setLatitude] = useState(-16.7286406)
  const [longitude, setLongitude] = useState(-43.8582139)
  const [address, setAddress] = useState("Montes Claros, MG")
  const [defibrillators, setDefibrillators] = useState<Defibrillator[]>([])
  const radius = 10000
  const style = { width: '100%', height: '60vh' }
  const mapRef = useRef<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use environment variable for API key
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  useEffect(() => {
    setDefibrillators(defibrillatorData.defibrillators);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="bg-red-900 bg-opacity-50 py-1 sm:py-2">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-2 sm:gap-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center sm:justify-start w-full sm:w-auto">
                  <span className="flex items-center">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="whitespace-nowrap">Emergência: 192 (SAMU)</span>
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="whitespace-nowrap">24h</span>
                  </span>
                </div>
                <span className="flex items-center text-xs">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="whitespace-nowrap">contato@desfibriladores.com.br</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-2 sm:py-4 px-2 sm:px-4 lg:px-6">
        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 mb-4">
          <div className="flex flex-col space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="w-full h-[50vh] sm:h-[60vh] rounded-lg overflow-hidden">
              <GoogleMaps
                radius={radius}
                setLatitude={setLatitude}
                setLongitude={setLongitude}
                latitude={latitude}
                longitude={longitude}
                style={{ width: '100%', height: '100%' }}
                address={address}
                setAddress={setAddress}
                defibrillators={defibrillators.map(d => ({
                  ...d,
                  id: d.id.toString()
                }))}
                apiKey={googleMapsApiKey}
                mapRef={mapRef}
              />
            </div>
            
            <button
              onClick={() => {
                const mapComponent = document.querySelector('[aria-label="Mapa"]')
                if (mapComponent) mapComponent.querySelector('button')?.click()
              }}
              className="mt-3 w-full px-3 py-2 sm:px-4 sm:py-3 bg-red-600 
                         hover:bg-red-700 text-white text-sm font-medium
                         rounded-lg shadow-md transition-colors duration-200 flex 
                         items-center justify-center gap-2"
            >
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Localizar Desfibrilador mais Próximo</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <Clipboard className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-red-600" />
              Unidades Disponíveis
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <div className="block sm:hidden">
              {defibrillators.map((def) => (
                <div key={def.id} className="p-4 border-b">
                  <div className="font-medium text-gray-900 mb-1">{def.nome}</div>
                  <div className="text-sm text-gray-600 mb-1">{def.bairro}</div>
                  <div className="text-sm text-gray-600 mb-2">{def.rua}, {def.numero}</div>
                  <button
                    onClick={() => {
                      setLatitude(parseFloat(def.latitude))
                      setLongitude(parseFloat(def.longitude))
                    }}
                    className="text-sm text-red-600 hover:text-red-900 font-medium"
                  >
                    Ver no mapa
                  </button>
                </div>
              ))}
            </div>

            <table className="hidden sm:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bairro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {defibrillators.map((def) => (
                  <tr key={def.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{def.nome}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{def.bairro}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <div className="text-xs sm:text-sm text-gray-900">
                        {def.rua}, {def.numero}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setLatitude(parseFloat(def.latitude))
                          setLongitude(parseFloat(def.longitude))
                        }}
                        className="text-xs sm:text-sm text-red-600 hover:text-red-900 font-medium"
                      >
                        Ver no mapa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
