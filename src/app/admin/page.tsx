'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Submission {
  id: string
  name: string
  address: string
  description?: string
  crypto_accepted: string[]
  created_at: string
  submission_images?: Array<{
    id: string
    image_url: string
  }>
}

interface Stats {
  totalShops: number
  pendingCount: number
}

interface LoadingState {
  [key: string]: boolean
}

interface MessageState {
  type: 'success' | 'error'
  text: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats>({ totalShops: 0, pendingCount: 0 })
  const [loading, setLoading] = useState<LoadingState>({})
  const [message, setMessage] = useState<MessageState | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user, submissions, and stats
      const [userRes, submissionsRes, shopsRes, pendingRes] = await Promise.all([
        fetch('/api/auth/user'),
        fetch('/api/submissions?status=pending'),
        fetch('/api/shops?approved=true&count=true'),
        fetch('/api/submissions?status=pending&count=true')
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUserEmail(userData.email || '')
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        setSubmissions(submissionsData.data || [])
      }

      if (shopsRes.ok) {
        const shopsData = await shopsRes.json()
        setStats(prev => ({ ...prev, totalShops: shopsData.count || 0 }))
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setStats(prev => ({ ...prev, pendingCount: pendingData.count || 0 }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showMessage('error', 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleAction = async (submissionId: string, action: 'approve' | 'reject') => {
    setLoading(prev => ({ ...prev, [submissionId]: true }))
    
    try {
      const response = await fetch('/api/submissions/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          action,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} submission`)
      }

      showMessage('success', `Submission ${action}d successfully!`)
      
      // Refresh the page data
      await fetchData()
    } catch (error) {
      console.error(`Error ${action}ing submission:`, error)
      showMessage('error', error instanceof Error ? error.message : `Failed to ${action} submission`)
    } finally {
      setLoading(prev => ({ ...prev, [submissionId]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-bold text-gray-900">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-xl shadow-2xl border-2 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{message.type === 'success' ? '✅' : '❌'}</span>
              <p className="font-semibold">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg">
                👑
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {userEmail}</p>
              </div>
            </div>
            <a
              href="/"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition-all hover:scale-105 shadow-lg"
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
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                🏪
              </div>
              <div className="text-sm font-bold uppercase">Total Shops</div>
            </div>
            <div className="text-4xl font-black">{stats.totalShops}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div className="text-sm font-bold uppercase">Pending Review</div>
            </div>
            <div className="text-4xl font-black">{stats.pendingCount}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="text-sm font-bold uppercase">Your Role</div>
            </div>
            <div className="text-xl font-black">Administrator</div>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-orange-500">
          <div className="p-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <h2 className="text-2xl font-bold text-gray-900">Pending Submissions</h2>
            </div>
          </div>
          
          {submissions && submissions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <div key={submission.id} className="p-6 hover:bg-orange-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{submission.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <span>📍</span>
                        <span>{submission.address}</span>
                      </p>
                      
                      {submission.description && (
                        <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-100 rounded-lg">
                          {submission.description}
                        </p>
                      )}
                      
                      {/* Crypto Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {submission.crypto_accepted?.map((crypto) => (
                          <span
                            key={crypto}
                            className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200"
                          >
                            ₿ {crypto}
                          </span>
                        ))}
                      </div>
                      
                      {/* Images */}
                      {submission.submission_images && submission.submission_images.length > 0 && (
                        <div className="flex gap-3 mb-4">
                          {submission.submission_images.map((img) => (
                            <img
                              key={img.id}
                              src={img.image_url}
                              alt="Shop"
                              className="w-24 h-24 object-cover rounded-xl border-2 border-gray-300 shadow-md"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>🕒</span>
                        <span>Submitted {new Date(submission.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex lg:flex-col gap-3">
                      <button
                        onClick={() => handleAction(submission.id, 'approve')}
                        disabled={loading[submission.id]}
                        className="flex-1 lg:flex-none px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:shadow-lg transition-all text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[submission.id] ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>✅</span>
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(submission.id, 'reject')}
                        disabled={loading[submission.id]}
                        className="flex-1 lg:flex-none px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg transition-all text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[submission.id] ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>❌</span>
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-xl font-bold text-gray-900 mb-2">No pending submissions</p>
              <p className="text-sm text-gray-600">All caught up! Great work!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}