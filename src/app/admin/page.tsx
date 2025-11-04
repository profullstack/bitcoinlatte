import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    redirect('/')
  }
  
  // Fetch pending submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, submission_images (*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  
  // Fetch stats
  const { count: totalShops } = await supabase
    .from('shops')
    .select('*', { count: 'exact', head: true })
    .eq('approved', true)
  
  const { count: pendingCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Header */}
      <header className="glass-effect border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-bitcoin flex items-center justify-center text-white text-2xl">
                👑
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">Admin Dashboard</h1>
                <p className="text-sm text-stone-600 dark:text-stone-400">Welcome back, {user.email}</p>
              </div>
            </div>
            <a
              href="/"
              className="px-4 py-2 border-2 border-stone-300 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all font-medium"
            >
              <span className="hidden sm:inline">Back to Map</span>
              <span className="sm:hidden">←</span>
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-2xl">
                🏪
              </div>
              <div className="text-sm font-semibold text-stone-600 dark:text-stone-400">Total Shops</div>
            </div>
            <div className="text-4xl font-bold text-green-600 dark:text-green-500">{totalShops || 0}</div>
          </div>
          <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div className="text-sm font-semibold text-stone-600 dark:text-stone-400">Pending Review</div>
            </div>
            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-500">{pendingCount || 0}</div>
          </div>
          <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="text-sm font-semibold text-stone-600 dark:text-stone-400">Your Role</div>
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-500">Administrator</div>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="glass-effect rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800">
          <div className="p-6 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Pending Submissions</h2>
            </div>
          </div>
          
          {submissions && submissions.length > 0 ? (
            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {submissions.map((submission: any) => (
                <div key={submission.id} className="p-6 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">{submission.name}</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mb-3 flex items-center gap-2">
                        <span>📍</span>
                        <span>{submission.address}</span>
                      </p>
                      
                      {submission.description && (
                        <p className="text-sm text-stone-700 dark:text-stone-300 mb-4 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
                          {submission.description}
                        </p>
                      )}
                      
                      {/* Crypto Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(submission.crypto_accepted as string[])?.map((crypto) => (
                          <span
                            key={crypto}
                            className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 text-xs font-semibold rounded-lg border border-amber-200 dark:border-amber-900"
                          >
                            ₿ {crypto}
                          </span>
                        ))}
                      </div>
                      
                      {/* Images */}
                      {submission.submission_images && submission.submission_images.length > 0 && (
                        <div className="flex gap-3 mb-4">
                          {submission.submission_images.map((img: any) => (
                            <img
                              key={img.id}
                              src={img.image_url}
                              alt="Shop"
                              className="w-24 h-24 object-cover rounded-xl border-2 border-stone-200 dark:border-stone-700 shadow-md"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                        <span>🕒</span>
                        <span>Submitted {new Date(submission.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex lg:flex-col gap-3">
                      <form action={`/admin/submissions/${submission.id}/approve`} method="POST" className="flex-1 lg:flex-none">
                        <button
                          type="submit"
                          className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:shadow-lg transition-all text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <span>✅</span>
                          <span>Approve</span>
                        </button>
                      </form>
                      <form action={`/admin/submissions/${submission.id}/reject`} method="POST" className="flex-1 lg:flex-none">
                        <button
                          type="submit"
                          className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg transition-all text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <span>❌</span>
                          <span>Reject</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">No pending submissions</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">All caught up! Great work!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}