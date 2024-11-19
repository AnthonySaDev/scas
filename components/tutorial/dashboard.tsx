"use client"
import React, { useState, useEffect } from 'react'
import GoogleMaps from '../google-maps'
import { Defibrillator } from '@/types/types'
import defibrillatorData from '@/data/defibrillators.json'

export default function Dashboard() {
  const [latitude, setLatitude] = useState(-16.7286406)
  const [longitude, setLongitude] = useState(-43.8582139)
  const [address, setAddress] = useState("Montes Claros, MG")
  const [defibrillators, setDefibrillators] = useState<Defibrillator[]>([])
  const radius = 10000
  const style = { width: '100%', height: '60vh' }
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null)

  useEffect(() => {
    // Carrega os dados do arquivo JSON
    setDefibrillators(defibrillatorData.defibrillators)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Barra superior com informações de contato */}
          <div className="bg-red-900 bg-opacity-50 py-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Emergência: 192 (SAMU)
                  </span>
                  <span className="hidden md:flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Atendimento 24 horas
                  </span>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    contato@desfibriladores.com.br
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cabeçalho principal */}
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Desfibriladores Montes Claros</h1>
                  <p className="text-sm text-gray-100 mt-1">Localize o equipamento mais próximo de você</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {defibrillators.length} unidades disponíveis
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex flex-col space-y-4">
            <GoogleMaps
              radius={radius}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              latitude={latitude}
              longitude={longitude}
              style={style}
              address={address}
              setAddress={setAddress}
              defibrillators={defibrillators}
              apiKey="AIzaSyAOG-YUafBi4posDk_J4-jS4jtgrrGAMDo"
            />
            
            <button
              onClick={() => {
                const mapComponent = document.querySelector('[aria-label="Mapa"]')
                if (mapComponent) mapComponent.querySelector('button')?.click()
              }}
              className="w-full md:w-auto mx-auto px-6 py-3 bg-red-600 hover:bg-red-700 
                         text-white font-semibold rounded-lg shadow-md transition-colors 
                         duration-200 flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>Localizar Desfibrilador mais Próximo</span>
            </button>
          </div>
        </div>

        {/* Seção da tabela */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Unidades Disponíveis
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{def.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{def.bairro}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {def.rua}, {def.numero}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setLatitude(parseFloat(def.latitude))
                          setLongitude(parseFloat(def.longitude))
                        }}
                        className="text-red-600 hover:text-red-900 font-medium"
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
