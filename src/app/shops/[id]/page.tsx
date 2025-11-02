import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import ShopDetailClient from '@/components/Shop/ShopDetailClient'

const ShopMap = dynamic(() => import('@/components/Map/ShopMap'), {
  ssr: false,
})

interface PageProps {
  params: { id: string }
}

export default async function ShopDetailPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Fetch shop details
  const { data: shop, error } = await supabase
    .from('shops')
    .select(`
      *,
      shop_images (*),
      comments (
        *,
        profiles (display_name, avatar_url)
      )
    `)
    .eq('id', params.id)
    .single()
  
  if (error || !shop) {
    notFound()
  }
  
  // Get vote counts
  const { data: voteData } = await supabase
    .rpc('calculate_shop_score', { shop_uuid: params.id })
  
  const votes = voteData?.[0] || { 
    quality_score: 0, 
    bitcoin_verified_score: 0, 
    total_votes: 0 
  }
  
  // Generate direction links
  const appleMapsUrl = `https://maps.apple.com/?daddr=${shop.latitude},${shop.longitude}`
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <a href="/" className="text-orange-600 hover:text-orange-700">
              ← Back to Map
            </a>
            <h1 className="text-2xl font-bold">{shop.name}</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {shop.shop_images && shop.shop_images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img
                  src={shop.shop_images[0].image_url}
                  alt={shop.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-gray-700">
                {shop.description || 'No description available.'}
              </p>
            </div>

            {/* Crypto Accepted */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Accepted Cryptocurrencies</h2>
              <div className="flex flex-wrap gap-2">
                {(shop.crypto_accepted as string[])?.map((crypto) => (
                  <span
                    key={crypto}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                  >
                    {crypto}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">
                Reviews & Comments ({shop.comments?.length || 0})
              </h2>

              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {shop.comments?.map((comment: any) => (
                  <div key={comment.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                        {comment.profiles?.display_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {comment.profiles?.display_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          {comment.comment_type !== 'general' && (
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                              {comment.comment_type.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!shop.comments || shop.comments.length === 0) && (
                  <p className="text-gray-500 text-center py-8">
                    No comments yet. Be the first to share your experience!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client-side components (voting & comments) */}
            <ShopDetailClient shopId={params.id} votes={votes} />

            {/* Location Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">Location</h3>
              <p className="text-sm text-gray-700 mb-4">{shop.address}</p>
              
              {/* Mini Map */}
              <div className="h-48 rounded-lg overflow-hidden mb-4">
                <ShopMap
                  shops={[shop]}
                  center={[shop.latitude, shop.longitude]}
                  zoom={15}
                />
              </div>

              {/* Direction Links */}
              <div className="space-y-2">
                <a
                  href={appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-gray-900 text-white text-center rounded-lg hover:bg-gray-800 transition"
                >
                  Open in Apple Maps
                </a>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* Contact Info */}
            {(shop.website || shop.phone) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold mb-4">Contact</h3>
                <div className="space-y-2 text-sm">
                  {shop.website && (
                    <div>
                      <span className="text-gray-600">Website:</span>{' '}
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  {shop.phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>{' '}
                      <a href={`tel:${shop.phone}`} className="text-orange-600 hover:underline">
                        {shop.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hours */}
            {shop.hours && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold mb-4">Hours</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(shop.hours as Record<string, any>).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize text-gray-600">{day}</span>
                      <span className="font-medium">
                        {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}