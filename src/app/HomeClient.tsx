'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ShopMap from '@/components/Map/MapWrapper'
import type L from 'leaflet'

interface Shop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  crypto_accepted: string[]
}

interface User {
  id: string
  email?: string
}

interface HomeClientProps {
  shops: Shop[]
  user: User | null
}

export default function HomeClient({ shops: initialShops, user }: HomeClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [shops, setShops] = useState<Shop[]>(initialShops)
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]) // Default to SF
  const [isLocating, setIsLocating] = useState(false)
  const supabase = createClient()

  // Fetch user shops based on map location
  const fetchUserShops = useCallback(async (center: [number, number]) => {
    try {
      const radius = 10 // 10km radius
      const response = await fetch(
        `/api/shops?lat=${center[0]}&lng=${center[1]}&radius=${radius}`
      )
      
      if (response.ok) {
        const { data } = await response.json()
        setShops(data || [])
      } else {
        console.error('Failed to fetch user shops:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching user shops:', error)
    }
  }, [])

  // Handle map movement - fetch shops for new location
  const handleMapMove = useCallback((center: [number, number], bounds: L.LatLngBounds) => {
    setMapCenter(center)
    fetchUserShops(center)
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

  const handleShopClick = (shop: Shop) => {
    // Only navigate to detail page for user-submitted shops
    // OSM shops don't have database records, so they can only be viewed in the map popup
    const isOsmShop = shop.id.startsWith('osm-')
    
    console.log('[HomeClient] handleShopClick called:', {
      id: shop.id,
      name: shop.name,
      source: (shop as any).source,
      isOsmShop,
      willNavigate: !isOsmShop
    })
    
    if (!isOsmShop) {
      router.push(`/shops/${shop.id}`)
    }
    // For OSM shops, do nothing - the popup already shows all available info
  }

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
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
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
              />
            </div>
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