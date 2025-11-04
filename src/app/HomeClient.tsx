'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ShopMap from '@/components/Map/MapWrapper'
import type { LayerState } from '@/components/Map/LayerToggle'
import type L from 'leaflet'

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

interface User {
  id: string
  email?: string
}

interface HomeClientProps {
  shops: Shop[]
  user: User | null
  isAdmin: boolean
}

export default function HomeClient({ shops: initialShops, user, isAdmin }: HomeClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [shops, setShops] = useState<Shop[]>(initialShops)
  const [osmShops, setOsmShops] = useState<Shop[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]) // Default to SF
  const [isLocating, setIsLocating] = useState(false)
  const [layers, setLayers] = useState<LayerState>({
    BTC: true,
    BCH: true,
    LTC: true,
    XMR: true,
    userShops: true,
  })
  const supabase = createClient()

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  // Fetch user shops based on map location with dynamic radius
  const fetchUserShops = useCallback(async (center: [number, number], bounds?: L.LatLngBounds) => {
    try {
      let radius = 10 // Default 10km radius
      
      // Calculate dynamic radius based on map bounds if available
      if (bounds) {
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()
        
        // Calculate diagonal distance of visible area
        const diagonalDistance = calculateDistance(
          sw.lat,
          sw.lng,
          ne.lat,
          ne.lng
        )
        
        // Use half the diagonal to cover the visible area
        // Apply min/max constraints: 10km minimum, 1000km maximum
        radius = Math.max(10, Math.min(1000, diagonalDistance / 2))
        
        console.log('[HomeClient] Dynamic radius calculated:', {
          bounds: { sw: [sw.lat, sw.lng], ne: [ne.lat, ne.lng] },
          diagonalDistance: diagonalDistance.toFixed(2),
          calculatedRadius: radius.toFixed(2)
        })
      }
      
      const response = await fetch(
        `/api/shops?lat=${center[0]}&lng=${center[1]}&radius=${radius}`
      )
      
      if (response.ok) {
        const { data } = await response.json()
        console.log('[HomeClient] Fetched shops:', {
          count: data?.length || 0,
          center,
          radius,
          shopIds: data?.map((s: Shop) => s.id) || []
        })
        setShops(data || [])
      } else {
        console.error('Failed to fetch user shops:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching user shops:', error)
    }
  }, [calculateDistance])

  // Handle map movement - fetch shops for new location with bounds
  const handleMapMove = useCallback((center: [number, number], bounds: L.LatLngBounds) => {
    setMapCenter(center)
    fetchUserShops(center, bounds)
  }, [fetchUserShops])

  // Try to get user's geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ]
          setMapCenter(userLocation)
          fetchUserShops(userLocation)
          setIsLocating(false)
        },
        (error) => {
          console.log('Geolocation error:', error.message, '- using default location')
          // Fall back to default location (San Francisco)
          fetchUserShops(mapCenter)
          setIsLocating(false)
        },
        {
          timeout: 5000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      )
    } else {
      // Geolocation not supported, use default
      fetchUserShops(mapCenter)
    }
  }, []) // Only run once on mount

  // Get visible shops based on layer filters
  const getVisibleShops = useCallback(() => {
    const visible: Shop[] = []

    // Add user shops if layer is active
    if (layers.userShops) {
      visible.push(...shops.map(shop => ({ ...shop, source: 'user' as const })))
    }

    // Add OSM shops filtered by crypto type
    osmShops.forEach(shop => {
      const hasVisibleCrypto = shop.crypto_accepted.some(crypto => {
        return layers[crypto as keyof LayerState]
      })
      if (hasVisibleCrypto) {
        visible.push(shop)
      }
    })

    return visible
  }, [shops, osmShops, layers])

  const handleShopClick = (shop: Shop) => {
    // Only navigate to detail page for user-submitted shops
    // OSM shops don't have database records, so they can only be viewed in the map popup
    const isOsmShop = shop.source === 'osm' || shop.id.startsWith('osm-')
    
    console.log('[HomeClient] handleShopClick called:', {
      id: shop.id,
      name: shop.name,
      source: shop.source,
      isOsmShop,
      willNavigate: !isOsmShop
    })
    
    if (!isOsmShop) {
      router.push(`/shops/${shop.id}`)
    }
    // For OSM shops, do nothing - the popup already shows all available info
  }

  // Handle OSM shops update from map
  const handleOsmShopsUpdate = useCallback((newOsmShops: Shop[]) => {
    setOsmShops(newOsmShops)
  }, [])

  // Handle layer changes from map
  const handleLayerChange = useCallback((newLayers: LayerState) => {
    setLayers(newLayers)
  }, [])

  const visibleShops = getVisibleShops()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl">☕</span>
              <div>
                <h1 className="text-4xl font-black text-gray-900">
                  Bitcoin<span className="text-orange-600">Latte</span>
                </h1>
                <p className="text-gray-600 font-semibold">Find Bitcoin-Friendly Coffee Shops</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {user && isAdmin && (
                <a
                  href="/admin"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all hover:scale-105 shadow-lg"
                >
                  👑 Admin
                </a>
              )}
              <a
                href="/shops/submit"
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all hover:scale-105 shadow-lg"
              >
                ➕ Add Shop
              </a>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-green-100 border-2 border-green-500 rounded-lg">
                    <span className="text-green-700 font-bold text-sm">
                      ✓ {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition-all hover:scale-105 shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <a
                  href="/auth/login"
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition-all hover:scale-105 shadow-lg"
                >
                  Login
                </a>
              )}
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search coffee shops, cities, or cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 outline-none transition-all"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-white border-b-2 border-gray-200 py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4">
                <span className="text-5xl">🏪</span>
                <div>
                  <p className="text-4xl font-black">{shops.length}</p>
                  <p className="text-orange-100 font-bold uppercase text-sm">Coffee Shops</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4">
                <span className="text-5xl">₿</span>
                <div>
                  <p className="text-3xl font-black">Bitcoin</p>
                  <p className="text-amber-100 font-bold uppercase text-sm">Accepted</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-400 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4">
                <span className="text-5xl">⚡</span>
                <div>
                  <p className="text-3xl font-black">Lightning</p>
                  <p className="text-yellow-100 font-bold uppercase text-sm">Fast Payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-orange-500 flex-1 flex flex-col relative">
            {isLocating && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span className="font-semibold">Finding your location...</span>
              </div>
            )}
            <div className="flex-1 w-full h-full">
              <ShopMap
                shops={shops}
                center={mapCenter}
                zoom={13}
                onShopClick={handleShopClick}
                onMapMove={handleMapMove}
                onOsmShopsUpdate={handleOsmShopsUpdate}
                onLayerChange={handleLayerChange}
              />
            </div>
          </div>

          {/* Shop List View */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-orange-500 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">
                📍 Shops in View
              </h2>
              <div className="text-sm">
                <span className="font-bold text-gray-900">{visibleShops.length}</span>
                <span className="text-gray-600"> shops visible</span>
              </div>
            </div>

            {visibleShops.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-bold text-gray-700 mb-2">No shops found</p>
                <p className="text-gray-600">
                  Try zooming out or enabling more layers to see shops in this area
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleShops
                  .sort((a, b) => {
                    // Calculate distance from map center for each shop
                    const distA = calculateDistance(mapCenter[0], mapCenter[1], a.latitude, a.longitude)
                    const distB = calculateDistance(mapCenter[0], mapCenter[1], b.latitude, b.longitude)
                    return distA - distB
                  })
                  .map((shop) => {
                    const isOsmShop = shop.source === 'osm'
                    const distance = calculateDistance(
                      mapCenter[0],
                      mapCenter[1],
                      shop.latitude,
                      shop.longitude
                    )

                    return (
                      <div
                        key={shop.id}
                        className={`bg-gradient-to-br ${
                          isOsmShop
                            ? 'from-blue-50 to-blue-100 border-blue-300'
                            : 'from-amber-50 to-orange-100 border-orange-300'
                        } border-2 rounded-xl p-4 hover:shadow-lg transition-all ${
                          !isOsmShop ? 'cursor-pointer hover:scale-105' : ''
                        }`}
                        onClick={() => !isOsmShop && handleShopClick(shop)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 flex-1">
                            {shop.name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              isOsmShop
                                ? 'bg-blue-200 text-blue-800'
                                : 'bg-amber-200 text-amber-800'
                            }`}
                          >
                            {isOsmShop ? 'OSM' : 'User'}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {shop.address}
                        </p>

                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                          <span>📍</span>
                          <span className="font-semibold">
                            {distance < 1
                              ? `${(distance * 1000).toFixed(0)}m away`
                              : `${distance.toFixed(1)}km away`}
                          </span>
                        </div>

                        {shop.shop_type && (
                          <p className="text-xs text-gray-600 mb-2">
                            <span className="font-semibold">Type:</span> {shop.shop_type}
                          </p>
                        )}

                        {shop.crypto_accepted && shop.crypto_accepted.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-3">
                            {shop.crypto_accepted.map((crypto) => (
                              <span
                                key={crypto}
                                className={`px-2 py-1 text-xs rounded-md font-bold ${
                                  crypto === 'BTC'
                                    ? 'bg-orange-200 text-orange-800'
                                    : crypto === 'BCH'
                                    ? 'bg-green-200 text-green-800'
                                    : crypto === 'LTC'
                                    ? 'bg-blue-200 text-blue-800'
                                    : crypto === 'XMR'
                                    ? 'bg-purple-200 text-purple-800'
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                              >
                                {crypto}
                              </span>
                            ))}
                          </div>
                        )}

                        {isOsmShop ? (
                          <div className="space-y-1">
                            {shop.opening_hours && (
                              <p className="text-xs text-gray-600">
                                <span className="font-semibold">Hours:</span> {shop.opening_hours}
                              </p>
                            )}
                            {shop.phone && (
                              <p className="text-xs text-gray-600">
                                <span className="font-semibold">Phone:</span> {shop.phone}
                              </p>
                            )}
                            {shop.website && (
                              <a
                                href={shop.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline font-semibold inline-block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Visit Website →
                              </a>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShopClick(shop)
                            }}
                            className="w-full mt-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-bold transition-colors"
                          >
                            View Details →
                          </button>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <p className="font-bold text-lg">
                Empowering the Bitcoin economy, one coffee at a time
              </p>
            </div>
            <div className="flex gap-6">
              <a href="/about" className="font-bold hover:text-orange-400 transition-colors">
                About
              </a>
              <a
                href="https://github.com/profullstack/bitcoinlatte"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-orange-400 transition-colors flex items-center gap-2"
              >
                GitHub <span>↗</span>
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400 border-t border-gray-800 pt-4">
            &copy; 2025{' '}
            <a
              href="https://profullstack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-400 transition-colors font-semibold"
            >
              Profullstack, Inc.
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}