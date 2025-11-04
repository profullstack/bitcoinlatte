'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const ShopMap = dynamic(() => import('@/components/Map/ShopMap'), {
  ssr: false,
})

const CRYPTO_OPTIONS = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿' },
  { id: 'Lightning', name: 'Lightning', icon: '⚡' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { id: 'USDC', name: 'USDC', icon: '💵' },
  { id: 'USDT', name: 'Tether', icon: '💲' },
  { id: 'LTC', name: 'Litecoin', icon: 'Ł' },
  { id: 'BCH', name: 'Bitcoin Cash', icon: '฿' },
  { id: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
]

export default function SubmitShopPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    crypto_accepted: [] as string[],
    website: '',
    phone: '',
    hours: {},
  })

  const handleAddressSearch = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}&type=autosuggest`)
      const { data } = await response.json()
      
      if (data?.items) {
        setAddressSuggestions(data.items)
      }
    } catch (error) {
      console.error('Address search error:', error)
    }
  }

  const handleAddressSelect = async (suggestion: any) => {
    const address = suggestion.address?.label || suggestion.title
    
    // Geocode the selected address
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(address)}&type=geocode`)
      const { data } = await response.json()
      
      if (data?.items?.[0]?.position) {
        const { lat, lng } = data.items[0].position
        setFormData({
          ...formData,
          address,
          latitude: lat,
          longitude: lng,
        })
        setAddressSuggestions([])
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const handleCryptoToggle = (cryptoId: string) => {
    setFormData({
      ...formData,
      crypto_accepted: formData.crypto_accepted.includes(cryptoId)
        ? formData.crypto_accepted.filter((c) => c !== cryptoId)
        : [...formData.crypto_accepted, cryptoId],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Shop submitted successfully! It will be reviewed by our team.')
        router.push('/')
      } else {
        const { error } = await response.json()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      alert('Failed to submit shop. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Header */}
      <header className="glass-effect border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium"
            >
              <span className="text-xl">←</span>
              <span className="hidden sm:inline">Back to Map</span>
            </a>
            <div className="flex items-center gap-3 flex-1">
              <span className="text-3xl">📍</span>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                Submit a Coffee Shop
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Info Banner */}
          <div className="mb-6 p-4 rounded-xl bg-amber-100 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                  Help grow the Bitcoin economy!
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Your submission will be reviewed by our team before appearing on the map. 
                  No account required!
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-effect rounded-2xl shadow-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shop Name */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  ☕ Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-600 transition-all outline-none bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  placeholder="e.g., Bitcoin Coffee House"
                />
              </div>

              {/* Address with Autocomplete */}
              <div className="relative">
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  📍 Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value })
                    handleAddressSearch(e.target.value)
                  }}
                  className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-600 transition-all outline-none bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  placeholder="Start typing an address..."
                />
                
                {/* Address Suggestions */}
                {addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAddressSelect(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800 border-b border-stone-200 dark:border-stone-700 last:border-b-0 transition-colors"
                      >
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{suggestion.title}</div>
                        <div className="text-sm text-stone-600 dark:text-stone-400">
                          {suggestion.address?.label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Map Preview */}
              {formData.latitude !== 0 && formData.longitude !== 0 && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900">
                  <label className="block text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                    <span>✅</span>
                    <span>Location Preview</span>
                  </label>
                  <div className="h-64 rounded-xl overflow-hidden border-2 border-green-300 dark:border-green-800 shadow-lg">
                    <ShopMap
                      shops={[{
                        id: 'preview',
                        name: formData.name || 'New Shop',
                        address: formData.address,
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                        crypto_accepted: formData.crypto_accepted,
                      }]}
                      center={[formData.latitude, formData.longitude]}
                      zoom={15}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  📝 Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-600 transition-all outline-none bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 resize-none"
                  placeholder="Tell us what makes this coffee shop special..."
                />
              </div>

              {/* Crypto Accepted */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
                  ₿ Accepted Cryptocurrencies * 
                  <span className="ml-2 text-xs font-normal text-stone-500 dark:text-stone-400">
                    (Select at least one)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CRYPTO_OPTIONS.map((crypto) => (
                    <button
                      key={crypto.id}
                      type="button"
                      onClick={() => handleCryptoToggle(crypto.id)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                        formData.crypto_accepted.includes(crypto.id)
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 shadow-lg scale-105'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{crypto.icon}</div>
                      <div className="text-xs">{crypto.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  🌐 Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-600 transition-all outline-none bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  placeholder="https://example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  📞 Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-600 transition-all outline-none bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || formData.crypto_accepted.length === 0}
                  className="flex-1 px-6 py-4 gradient-bitcoin text-white rounded-xl hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 font-bold text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Submit for Review</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-4 border-2 border-stone-300 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}