import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ShopMap from '@/components/Map/MapWrapper'
import ShopDetailClient from '@/components/Shop/ShopDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ShopDetailPage({ params }: PageProps) {
  const { id } = await params
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
    .eq('id', id)
    .single()
  
  if (error || !shop) {
    notFound()
  }
  
  // Get vote counts
  const { data: voteData } = await supabase
    .rpc('calculate_shop_score', { shop_uuid: id })
  
  const votes = voteData?.[0] || { 
    quality_score: 0, 
    bitcoin_verified_score: 0, 
    total_votes: 0 
  }
  
  // Generate direction links
  const appleMapsUrl = `https://maps.apple.com/?daddr=${shop.latitude},${shop.longitude}`
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`
  
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
              <span className="text-3xl">☕</span>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 truncate">
                {shop.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {shop.shop_images && shop.shop_images.length > 0 && (
              <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
                <img
                  src={shop.shop_images[0].image_url}
                  alt={shop.name}
                  className="w-full h-64 sm:h-96 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📖</span>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">About</h2>
              </div>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                {shop.description || 'No description available.'}
              </p>
            </div>

            {/* Crypto Accepted */}
            <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">₿</span>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Accepted Cryptocurrencies</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {(shop.crypto_accepted as string[])?.map((crypto) => (
                  <span
                    key={crypto}
                    className="px-4 py-2 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 rounded-xl text-sm font-bold border-2 border-amber-200 dark:border-amber-900"
                  >
                    {crypto}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">💬</span>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Reviews & Comments ({shop.comments?.length || 0})
                </h2>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {shop.comments?.map((comment: any) => (
                  <div key={comment.id} className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {comment.profiles?.display_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {comment.profiles?.display_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-stone-500 dark:text-stone-400">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          {comment.comment_type !== 'general' && (
                            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-md font-medium">
                              {comment.comment_type.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-700 dark:text-stone-300">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!shop.comments || shop.comments.length === 0) && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">💭</div>
                    <p className="text-stone-500 dark:text-stone-400 font-medium">
                      No comments yet. Be the first to share your experience!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client-side components (voting & comments) */}
            <ShopDetailClient shopId={id} votes={votes} />

            {/* Location Info */}
            <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📍</span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Location</h3>
              </div>
              <p className="text-sm text-stone-700 dark:text-stone-300 mb-4 leading-relaxed">{shop.address}</p>
              
              {/* Mini Map */}
              <div className="h-48 rounded-xl overflow-hidden mb-4 border-2 border-stone-200 dark:border-stone-700 shadow-md">
                <ShopMap
                  shops={[shop]}
                  center={[shop.latitude, shop.longitude]}
                  zoom={15}
                />
              </div>

              {/* Direction Links */}
              <div className="space-y-3">
                <a
                  href={appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 bg-stone-900 dark:bg-stone-800 text-white text-center rounded-xl hover:bg-stone-800 dark:hover:bg-stone-700 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  🍎 Open in Apple Maps
                </a>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  🗺️ Open in Google Maps
                </a>
              </div>
            </div>

            {/* Contact Info */}
            {(shop.website || shop.phone) && (
              <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📞</span>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Contact</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {shop.website && (
                    <div className="flex items-center gap-2">
                      <span className="text-stone-600 dark:text-stone-400 font-medium">🌐 Website:</span>
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 dark:text-amber-500 hover:underline font-medium"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  {shop.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-stone-600 dark:text-stone-400 font-medium">📱 Phone:</span>
                      <a href={`tel:${shop.phone}`} className="text-amber-600 dark:text-amber-500 hover:underline font-medium">
                        {shop.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hours */}
            {shop.hours && (
              <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🕐</span>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {Object.entries(shop.hours as Record<string, any>).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
                      <span className="capitalize text-stone-600 dark:text-stone-400 font-medium">{day}</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
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