'use client'

import { useEffect, useState } from 'react'

export interface LayerState {
  BTC: boolean
  BCH: boolean
  LTC: boolean
  XMR: boolean
  userShops: boolean
}

interface LayerToggleProps {
  layers: LayerState
  onLayerChange: (layers: LayerState) => void
}

const CRYPTO_INFO = {
  BTC: { name: 'Bitcoin', color: 'bg-orange-500', emoji: '₿' },
  BCH: { name: 'Bitcoin Cash', color: 'bg-green-500', emoji: '💚' },
  LTC: { name: 'Litecoin', color: 'bg-blue-500', emoji: '🔷' },
  XMR: { name: 'Monero', color: 'bg-purple-500', emoji: '🔒' },
}

export default function LayerToggle({ layers, onLayerChange }: LayerToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleLayer = (layer: keyof LayerState) => {
    const newLayers = { ...layers, [layer]: !layers[layer] }
    onLayerChange(newLayers)
  }

  const activeCount = Object.values(layers).filter(Boolean).length

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-xl border-2 border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <span className="font-bold text-gray-900">Map Layers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
            {activeCount} active
          </span>
          <span className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Layer Controls */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* User Shops Toggle */}
          <div className="px-4 py-3 border-b border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={layers.userShops}
                onChange={() => toggleLayer('userShops')}
                className="w-5 h-5 rounded border-2 border-gray-300 text-amber-600 focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-2xl">🏪</span>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                    User Shops
                  </div>
                  <div className="text-xs text-gray-500">Community submitted</div>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${layers.userShops ? 'bg-amber-500' : 'bg-gray-300'}`} />
            </label>
          </div>

          {/* OSM Crypto Layers */}
          <div className="px-4 py-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              OpenStreetMap Crypto
            </div>
            {(Object.keys(CRYPTO_INFO) as Array<keyof typeof CRYPTO_INFO>).map((crypto) => {
              const info = CRYPTO_INFO[crypto]
              return (
                <label
                  key={crypto}
                  className="flex items-center gap-3 py-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={layers[crypto]}
                    onChange={() => toggleLayer(crypto)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xl">{info.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {info.name}
                      </div>
                      <div className="text-xs text-gray-500">{crypto}</div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${layers[crypto] ? info.color : 'bg-gray-300'}`} />
                </label>
              )
            })}
          </div>

          {/* Legend */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-1">Legend:</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>User-submitted shops</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>OSM crypto shops</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}