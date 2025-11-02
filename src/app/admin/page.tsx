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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.email}</p>
            </div>
            <a
              href="/"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Back to Map
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Shops</div>
            <div className="text-3xl font-bold text-orange-600">{totalShops || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-600">{pendingCount || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Your Role</div>
            <div className="text-lg font-bold text-green-600">Administrator</div>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Pending Submissions</h2>
          </div>
          
          {submissions && submissions.length > 0 ? (
            <div className="divide-y">
              {submissions.map((submission: any) => (
                <div key={submission.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{submission.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{submission.address}</p>
                      
                      {submission.description && (
                        <p className="text-sm text-gray-700 mb-3">{submission.description}</p>
                      )}
                      
                      {/* Crypto Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(submission.crypto_accepted as string[])?.map((crypto) => (
                          <span
                            key={crypto}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                          >
                            {crypto}
                          </span>
                        ))}
                      </div>
                      
                      {/* Images */}
                      {submission.submission_images && submission.submission_images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {submission.submission_images.map((img: any) => (
                            <img
                              key={img.id}
                              src={img.image_url}
                              alt="Shop"
                              className="w-20 h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Submitted {new Date(submission.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <form action={`/admin/submissions/${submission.id}/approve`} method="POST">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={`/admin/submissions/${submission.id}/reject`} method="POST">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No pending submissions</p>
              <p className="text-sm mt-2">All caught up! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}