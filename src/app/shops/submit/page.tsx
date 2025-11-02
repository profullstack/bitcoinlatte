'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const ShopMap = dynamic(() => import('@/components/Map/ShopMap'), {
  ssr: false,
})

const CRYPTO_OPTIONS = [
  'BTC',
  'Lightning',
  'ETH',
  'USDC',
  'USDT',
  'LTC',
  'BCH',
  'DOGE',
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

  const handleCryptoToggle = (crypto: string) => {
    setFormData({
      ...formData,
      crypto_accepted: formData.crypto_accepted.includes(crypto)
        ? formData.crypto_accepted.filter((c) => c !== crypto)
        : [...formData.crypto_accepted, crypto],
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <a href="/" className="text-orange-600 hover:text-orange-700">
              ← Back
            </a>
            <h1 className="text-2xl font-bold">Submit a Coffee Shop</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shop Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Bitcoin Coffee House"
                />
              </div>

              {/* Address with Autocomplete */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value })
                    handleAddressSearch(e.target.value)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Start typing an address..."
                />
                
                {/* Address Suggestions */}
                {addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAddressSelect(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{suggestion.title}</div>
                        <div className="text-sm text-gray-600">
                          {suggestion.address?.label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Map Preview */}
              {formData.latitude !== 0 && formData.longitude !== 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Preview
                  </label>
                  <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Tell us about this coffee shop..."
                />
              </div>

              {/* Crypto Accepted */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accepted Cryptocurrencies *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CRYPTO_OPTIONS.map((crypto) => (
                    <button
                      key={crypto}
                      type="button"
                      onClick={() => handleCryptoToggle(crypto)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        formData.crypto_accepted.includes(crypto)
                          ? 'border-orange-600 bg-orange-50 text-orange-700 font-medium'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {crypto}
                    </button>
                  ))}
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || formData.crypto_accepted.length === 0}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
                >
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Your submission will be reviewed by our team before appearing on the map.
                No account required!
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}