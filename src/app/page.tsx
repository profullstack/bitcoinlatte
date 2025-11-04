import { createClient } from '@/lib/supabase/server'
import ShopMap from '@/components/Map/MapWrapper'

export default async function Home() {
  const supabase = createClient()
  
  // Fetch approved shops
  const { data: shops } = await supabase
    .from('shops')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
  
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-orange-600">
                ☕️ BitcoinLatte
              </h1>
              <span className="text-sm text-gray-500">
                Find Bitcoin-accepting coffee shops
              </span>
            </div>
            <nav className="flex gap-4">
              <a
                href="/shops/submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                Submit Shop
              </a>
              <a
                href="/auth/login"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Login
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Map Section */}
      <div className="flex-1 relative">
        <ShopMap
          shops={shops || []}
          center={[37.7749, -122.4194]}
          zoom={13}
          onShopClick={(shop) => {
            window.location.href = `/shops/${shop.id}`
          }}
        />
      </div>

      {/* Stats Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              {shops?.length || 0} Bitcoin-accepting coffee shops and counting
            </p>
            <div className="flex gap-4">
              <a href="/about" className="hover:text-orange-600">About</a>
              <a href="https://github.com/yourusername/bitcoinlatte" className="hover:text-orange-600">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
