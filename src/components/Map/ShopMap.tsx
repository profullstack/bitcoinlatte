'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Shop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  crypto_accepted: string[]
}

interface ShopMapProps {
  shops: Shop[]
  center?: [number, number]
  zoom?: number
  onShopClick?: (shop: Shop) => void
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  
  return null
}

export default function ShopMap({ 
  shops, 
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 13,
  onShopClick 
}: ShopMapProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="w-full h-full bg-stone-200 dark:bg-stone-800 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-stone-600 dark:text-stone-400 font-medium">Loading map...</p>
        </div>
      </div>
    )
  }
  
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full"
      scrollWheelZoom={true}
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      
      {shops.map((shop) => (
        <Marker
          key={shop.id}
          position={[shop.latitude, shop.longitude]}
          eventHandlers={{
            click: () => onShopClick?.(shop)
          }}
        >
          <Popup>
            <div className="p-3">
              <h3 className="font-bold text-lg text-stone-900 mb-1">{shop.name}</h3>
              <p className="text-sm text-stone-600 mb-2">{shop.address}</p>
              {shop.crypto_accepted && shop.crypto_accepted.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {shop.crypto_accepted.map((crypto) => (
                    <span
                      key={crypto}
                      className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md font-medium"
                    >
                      {crypto}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => onShopClick?.(shop)}
                className="mt-3 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-colors"
              >
                View Details →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}