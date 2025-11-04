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
    <main className="flex min-h-screen flex-col bg-stone-50 dark:bg-stone-950">
      {/* Hero Header */}
      <header className="relative glass-effect border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl sm:text-4xl">☕</span>
                <div className="flex flex-col">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                    BitcoinLatte
                  </h1>
                  <p className="text-xs text-stone-600 dark:text-stone-400 hidden sm:block">
                    Discover crypto-friendly cafés
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2 sm:gap-3">
              <a
                href="/shops/submit"
                className="px-3 sm:px-5 py-2 sm:py-2.5 gradient-bitcoin text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium text-sm sm:text-base flex items-center gap-2"
              >
                <span className="hidden sm:inline">➕</span>
                <span>Add Shop</span>
              </a>
              <a
                href="/auth/login"
                className="px-3 sm:px-5 py-2 sm:py-2.5 border-2 border-stone-300 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 font-medium text-sm sm:text-base"
              >
                Login
              </a>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="pb-4">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for coffee shops, cities, or cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pl-12 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:border-amber-500 dark:focus:border-amber-600 focus:ring-4 focus:ring-amber-500/20 transition-all outline-none text-sm sm:text-base"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-100">{shops.length}</p>
                <p className="text-xs text-stone-600 dark:text-stone-400">Coffee Shops</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">₿</span>
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-100">Bitcoin</p>
                <p className="text-xs text-stone-600 dark:text-stone-400">Accepted</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-100">Lightning</p>
                <p className="text-xs text-stone-600 dark:text-stone-400">Fast Payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 p-2 sm:p-4">
          <div className="h-full rounded-xl overflow-hidden shadow-2xl border-2 border-stone-200 dark:border-stone-800">
            <ShopMap
              shops={shops}
              center={[37.7749, -122.4194]}
              zoom={13}
              onShopClick={handleShopClick}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="glass-effect border-t border-stone-200 dark:border-stone-800 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <span className="text-lg">🌍</span>
              <p className="text-center sm:text-left">
                Empowering the Bitcoin economy, one coffee at a time
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/about"
                className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="https://github.com/yourusername/bitcoinlatte"
                className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium flex items-center gap-1"
              >
                <span>GitHub</span>
                <span className="text-xs">↗</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}