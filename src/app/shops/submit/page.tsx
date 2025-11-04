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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-bold"
            >
              <span className="text-2xl">←</span>
              <span className="hidden sm:inline">Back to Map</span>
            </a>
            <div className="flex items-center gap-3 flex-1">
              <span className="text-4xl">📍</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                Submit a Coffee Shop
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-orange-100 to-amber-100 border-4 border-orange-300 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div className="flex-1">
              <h3 className="font-black text-orange-900 mb-2 text-lg">
                Help grow the Bitcoin economy!
              </h3>
              <p className="text-orange-800 font-medium">
                Your submission will be reviewed by our team before appearing on the map. 
                No account required!
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-4 border-orange-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                ☕ Shop Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none text-gray-900"
                placeholder="e.g., Bitcoin Coffee House"
              />
            </div>

            {/* Address */}
            <div className="relative">
              <label className="block text-sm font-bold text-gray-900 mb-2">
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none text-gray-900"
                placeholder="Start typing an address..."
              />
              
              {addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAddressSelect(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-orange-50 border-b border-gray-200 last:border-b-0 transition-colors"
                    >
                      <div className="font-bold text-gray-900">{suggestion.title}</div>
                      <div className="text-sm text-gray-600">{suggestion.address?.label}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map Preview */}
            {formData.latitude !== 0 && formData.longitude !== 0 && (
              <div className="p-4 rounded-xl bg-green-50 border-4 border-green-300">
                <label className="block text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                  <span>✅</span>
                  <span>Location Preview</span>
                </label>
                <div className="h-64 rounded-xl overflow-hidden border-2 border-green-400 shadow-lg">
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
              <label className="block text-sm font-bold text-gray-900 mb-2">
                📝 Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none text-gray-900 resize-none"
                placeholder="Tell us what makes this coffee shop special..."
              />
            </div>

            {/* Crypto Accepted */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                ₿ Accepted Cryptocurrencies * 
                <span className="ml-2 text-xs font-normal text-gray-600">
                  (Select at least one)
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CRYPTO_OPTIONS.map((crypto) => (
                  <button
                    key={crypto.id}
                    type="button"
                    onClick={() => handleCryptoToggle(crypto.id)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
                      formData.crypto_accepted.includes(crypto.id)
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg scale-105'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
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
              <label className="block text-sm font-bold text-gray-900 mb-2">
                🌐 Website (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none text-gray-900"
                placeholder="https://example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                📞 Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none text-gray-900"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || formData.crypto_accepted.length === 0}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 font-black text-lg flex items-center justify-center gap-2 shadow-lg"
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
                className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}