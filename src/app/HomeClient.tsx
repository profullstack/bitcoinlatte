'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ShopMap from '@/components/Map/MapWrapper'

interface Shop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  crypto_accepted: string[]
}

interface HomeClientProps {
  shops: Shop[]
}

export default function HomeClient({ shops }: HomeClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleShopClick = (shop: Shop) => {
    router.push(`/shops/${shop.id}`)
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
            <div className="flex gap-3">
              <a
                href="/shops/submit"
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all hover:scale-105 shadow-lg"
              >
                ➕ Add Shop
              </a>
              <a
                href="/auth/login"
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition-all hover:scale-105 shadow-lg"
              >
                Login
              </a>
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
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-orange-500 flex-1 flex flex-col">
            <div className="flex-1 w-full h-full">
              <ShopMap
                shops={shops}
                center={[37.7749, -122.4194]}
                zoom={13}
                onShopClick={handleShopClick}
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