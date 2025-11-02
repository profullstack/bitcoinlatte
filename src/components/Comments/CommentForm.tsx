'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CommentFormProps {
  shopId: string
  onCommentAdded?: () => void
}

export default function CommentForm({ shopId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [commentType, setCommentType] = useState<'general' | 'bitcoin_experience' | 'review'>('general')
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useState(() => {
    checkAuth()
  })

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      window.location.href = '/auth/login'
      return
    }

    if (!content.trim() || content.length > 2000) {
      alert('Comment must be between 1 and 2000 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          content: content.trim(),
          comment_type: commentType,
        }),
      })

      if (response.ok) {
        setContent('')
        onCommentAdded?.()
      } else {
        const { error } = await response.json()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      alert('Failed to post comment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          <a href="/auth/login" className="text-orange-600 hover:underline font-medium">
            Login
          </a>{' '}
          to leave a comment
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Comment Type */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCommentType('general')}
          className={`px-3 py-1 rounded-lg text-sm transition ${
            commentType === 'general'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setCommentType('bitcoin_experience')}
          className={`px-3 py-1 rounded-lg text-sm transition ${
            commentType === 'bitcoin_experience'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Bitcoin Experience
        </button>
        <button
          type="button"
          onClick={() => setCommentType('review')}
          className={`px-3 py-1 rounded-lg text-sm transition ${
            commentType === 'review'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Review
        </button>
      </div>

      {/* Comment Input */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your experience..."
        rows={4}
        maxLength={2000}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        disabled={loading}
      />

      {/* Character Count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {content.length}/2000 characters
        </span>
        
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}