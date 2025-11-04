'use client'

import dynamic from 'next/dynamic'

const ShopMap = dynamic(() => import('./ShopMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
})

export default ShopMap