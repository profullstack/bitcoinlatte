'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Check your email for the magic link!')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-6xl">☕</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">
            Bitcoin<span className="text-orange-600">Latte</span>
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Sign in to vote, comment, and track submissions
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-orange-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg">
              🔐
            </div>
            <h2 className="text-2xl font-black text-gray-900">Sign In</h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 pl-11 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none text-gray-900"
                  placeholder="your@email.com"
                  disabled={loading}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  ✉️
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 font-black text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Sending magic link...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Send Magic Link</span>
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-5 p-4 rounded-xl border-4 ${
              message.includes('Error')
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-green-50 border-green-300 text-green-700'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{message.includes('Error') ? '❌' : '✅'}</span>
                <p className="text-sm font-bold flex-1">{message}</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <span className="text-2xl">💡</span>
              <p>
                <strong className="text-gray-900 font-bold">No password required!</strong>
                <br />
                We'll send you a secure magic link to sign in instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-bold text-lg"
          >
            <span>←</span>
            <span>Back to Map</span>
          </a>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">👍</div>
            <p className="text-xs text-gray-700 font-bold">Vote on Shops</p>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-xs text-gray-700 font-bold">Leave Comments</p>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📍</div>
            <p className="text-xs text-gray-700 font-bold">Track Submissions</p>
          </div>
        </div>
      </div>
    </div>
  )
}