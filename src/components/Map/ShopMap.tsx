'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import LayerToggle, { LayerState } from './LayerToggle'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom marker icons for different cryptocurrencies
const createCryptoIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-crypto-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// User shop icon (amber/yellow)
const userShopIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="
      background-color: #f59e0b;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      🏪
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

// Crypto-specific icons
const cryptoIcons = {
  BTC: createCryptoIcon('#f97316', '₿'),
  BCH: createCryptoIcon('#22c55e', '💚'),
  LTC: createCryptoIcon('#3b82f6', '🔷'),
  XMR: createCryptoIcon('#a855f7', '🔒'),
}

interface Shop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  crypto_accepted: string[]
  source?: 'user' | 'osm'
  shop_type?: string
  website?: string | null
  phone?: string | null
  opening_hours?: string | null
}

interface OsmShop extends Shop {
  source: 'osm'
  osmId: number
  osmType: string
}

interface ShopMapProps {
  shops: Shop[]
  center?: [number, number]
  zoom?: number
  onShopClick?: (shop: Shop) => void
  onMapMove?: (center: [number, number], bounds: L.LatLngBounds) => void
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  
  return null
}

// Component to handle map movement events with debouncing
function MapEventHandler({
  onMapMove
}: {
  onMapMove?: (center: [number, number], bounds: L.LatLngBounds) => void
}) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitializedRef = useRef(false)
  
  const map = useMapEvents({
    moveend: () => {
      console.log('[MapEventHandler] moveend event fired')
      
      // Trigger immediately on first load, then debounce subsequent moves
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true
        const center = map.getCenter()
        const bounds = map.getBounds()
        console.log('[MapEventHandler] Initial load - triggering immediately:', {
          center: [center.lat, center.lng],
          bounds: bounds.toBBoxString()
        })
        onMapMove?.([center.lat, center.lng], bounds)
        return
      }
      
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      // Set new timer for debounced callback
      debounceTimerRef.current = setTimeout(() => {
        const center = map.getCenter()
        const bounds = map.getBounds()
        console.log('[MapEventHandler] Debounced callback executing:', {
          center: [center.lat, center.lng],
          bounds: bounds.toBBoxString()
        })
        onMapMove?.([center.lat, center.lng], bounds)
      }, 500) // 500ms debounce
    }
  })
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])
  
  return null
}

export default function ShopMap({
  shops,
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 13,
  onShopClick,
  onMapMove
}: ShopMapProps) {
  const [mounted, setMounted] = useState(false)
  const [osmShops, setOsmShops] = useState<OsmShop[]>([])
  const [loading, setLoading] = useState(false)
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center)
  const [layers, setLayers] = useState<LayerState>(() => {
    // Load layer preferences from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mapLayers')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved layers:', e)
        }
      }
    }
    // Default: all layers enabled
    return {
      BTC: true,
      BCH: true,
      LTC: true,
      XMR: true,
      userShops: true,
    }
  })
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch OSM shops based on map bounds
  const fetchOsmShops = useCallback(async (bounds: L.LatLngBounds) => {
    console.log('[ShopMap] fetchOsmShops called with bounds:', bounds.toBBoxString())
    setLoading(true)
    try {
      // Use actual map bounds for bbox
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      const bbox = [
        sw.lat, // south
        sw.lng, // west
        ne.lat, // north
        ne.lng, // east
      ]

      console.log('[ShopMap] Calculated bbox from map bounds:', bbox)
      console.log('[ShopMap] Bbox covers visible area')

      const url = `/api/osm-crypto-shops?bbox=${bbox.join(',')}`
      console.log('[ShopMap] Fetching from:', url)
      
      const response = await fetch(url)
      
      console.log('[ShopMap] Response status:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[ShopMap] Received data:', { shopCount: data.shops?.length || 0, cached: data.cached })
        setOsmShops(data.shops || [])
      } else {
        const errorText = await response.text()
        console.error('[ShopMap] Failed to fetch OSM shops:', response.status, response.statusText, errorText)
      }
    } catch (error) {
      console.error('[ShopMap] Error fetching OSM shops:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle map movement
  const handleMapMove = useCallback((newCenter: [number, number], bounds: L.LatLngBounds) => {
    console.log('[ShopMap] handleMapMove called:', { newCenter, bounds: bounds.toBBoxString() })
    setCurrentCenter(newCenter)
    fetchOsmShops(bounds)
    onMapMove?.(newCenter, bounds)
  }, [fetchOsmShops, onMapMove])

  // Initial fetch on mount - need to get bounds from map
  useEffect(() => {
    if (!mounted) return
    // We can't fetch on mount without bounds, so we'll wait for the first moveend event
    // which fires automatically when the map initializes
  }, [mounted])

  // Save layer preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mapLayers', JSON.stringify(layers))
    }
  }, [layers])

  // Filter shops based on active layers
  const getVisibleShops = () => {
    const visible: Shop[] = []

    // Add user shops if layer is active
    if (layers.userShops) {
      visible.push(...shops.map(shop => ({ ...shop, source: 'user' as const })))
    }

    // Add OSM shops filtered by crypto type
    osmShops.forEach(shop => {
      const hasVisibleCrypto = shop.crypto_accepted.some(crypto => {
        return layers[crypto as keyof typeof cryptoIcons]
      })
      if (hasVisibleCrypto) {
        visible.push(shop)
      }
    })

    return visible
  }

  // Get appropriate icon for a shop
  const getShopIcon = (shop: Shop) => {
    if (shop.source === 'user') {
      return userShopIcon
    }
    
    // For OSM shops, use the first crypto type's icon
    const firstCrypto = shop.crypto_accepted[0] as keyof typeof cryptoIcons
    return cryptoIcons[firstCrypto] || cryptoIcons.BTC
  }

  const visibleShops = getVisibleShops()
  
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
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        <MapEventHandler onMapMove={handleMapMove} />
        
        {visibleShops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.latitude, shop.longitude]}
            icon={getShopIcon(shop)}
            eventHandlers={{
              click: () => {
                const isOsmShop = shop.source === 'osm'
                console.log('[ShopMap] Shop clicked:', {
                  id: shop.id,
                  name: shop.name,
                  source: shop.source,
                  isOSM: isOsmShop,
                  willTriggerNavigation: !isOsmShop
                })
                // Only trigger onShopClick for user shops (which navigates to detail page)
                // OSM shops show all info in the popup, so no navigation needed
                if (!isOsmShop) {
                  onShopClick?.(shop)
                }
              }
            }}
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg text-stone-900">{shop.name}</h3>
                  {shop.source === 'osm' && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                      OSM
                    </span>
                  )}
                </div>
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

                {shop.source === 'osm' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs text-gray-600">
                    {shop.shop_type && (
                      <div>
                        <span className="font-semibold">Type:</span> {shop.shop_type}
                      </div>
                    )}
                    {shop.opening_hours && (
                      <div>
                        <span className="font-semibold">Hours:</span> {shop.opening_hours}
                      </div>
                    )}
                    {shop.phone && (
                      <div>
                        <span className="font-semibold">Phone:</span> {shop.phone}
                      </div>
                    )}
                    {shop.website && (
                      <div>
                        <a
                          href={shop.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website →
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {shop.source === 'user' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // Prevent marker click from firing again
                      onShopClick?.(shop)
                    }}
                    className="mt-3 w-full px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-colors"
                  >
                    View Details →
                  </button>
                )}
                {shop.source === 'osm' && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                    <span className="font-semibold">ℹ️ OSM Shop:</span> This shop is from OpenStreetMap. All available information is shown above.
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Layer Toggle Control */}
      <LayerToggle layers={layers} onLayerChange={setLayers} />

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-gray-200">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent" />
            <span className="text-sm font-semibold text-gray-700">Loading OSM shops...</span>
          </div>
        </div>
      )}

      {/* Shop Count */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-gray-200">
        <div className="text-sm">
          <span className="font-bold text-gray-900">{visibleShops.length}</span>
          <span className="text-gray-600"> shops visible</span>
          {osmShops.length > 0 && (
            <span className="text-xs text-gray-500 ml-2">
              ({shops.length} user, {osmShops.length} OSM)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}