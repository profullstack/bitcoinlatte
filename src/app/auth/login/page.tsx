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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-6xl">☕</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-3">
            BitcoinLatte
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-lg">
            Sign in to vote, comment, and track submissions
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-effect rounded-2xl shadow-2xl p-8 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-bitcoin flex items-center justify-center text-white text-xl">
              🔐
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Sign In</h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 pl-11 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-600 transition-all outline-none bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  placeholder="your@email.com"
                  disabled={loading}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  ✉️
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 gradient-bitcoin text-white rounded-xl hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2"
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
            <div className={`mt-5 p-4 rounded-xl border-2 ${
              message.includes('Error')
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
                : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{message.includes('Error') ? '❌' : '✅'}</span>
                <p className="text-sm font-medium flex-1">{message}</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-start gap-3 text-sm text-stone-600 dark:text-stone-400">
              <span className="text-lg">💡</span>
              <p>
                <strong className="text-stone-900 dark:text-stone-100">No password required!</strong>
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
            className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium"
          >
            <span>←</span>
            <span>Back to Map</span>
          </a>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-white/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
            <div className="text-2xl mb-1">👍</div>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">Vote on Shops</p>
          </div>
          <div className="p-3 rounded-xl bg-white/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
            <div className="text-2xl mb-1">💬</div>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">Leave Comments</p>
          </div>
          <div className="p-3 rounded-xl bg-white/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
            <div className="text-2xl mb-1">📍</div>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">Track Submissions</p>
          </div>
        </div>
      </div>
    </div>
  )
}