'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VoteButtonProps {
  shopId: string
  voteType: 'shop_quality' | 'bitcoin_verified' | 'submission_accuracy'
  initialScore: number
  label: string
}

export default function VoteButton({ shopId, voteType, initialScore, label }: VoteButtonProps) {
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchUserVote()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const fetchUserVote = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('votes')
      .select('value')
      .eq('shop_id', shopId)
      .eq('user_id', user.id)
      .eq('vote_type', voteType)
      .single()

    if (data) {
      setUserVote(data.value)
    }
  }

  const handleVote = async (value: number) => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login'
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          vote_type: voteType,
          value,
        }),
      })

      if (response.ok) {
        // Update local state
        const diff = userVote === value ? -value : (userVote ? value - userVote : value)
        setScore(score + diff)
        setUserVote(userVote === value ? null : value)
      }
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <button
          onClick={() => handleVote(1)}
          disabled={loading}
          className={`p-2 rounded-lg transition ${
            userVote === 1
              ? 'bg-green-100 text-green-700'
              : 'hover:bg-gray-100 text-gray-600'
          } disabled:opacity-50`}
          title="Upvote"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3l6 6H4l6-6z" />
          </svg>
        </button>
        
        <span className="text-lg font-bold my-1">
          {score > 0 ? '+' : ''}{score}
        </span>
        
        <button
          onClick={() => handleVote(-1)}
          disabled={loading}
          className={`p-2 rounded-lg transition ${
            userVote === -1
              ? 'bg-red-100 text-red-700'
              : 'hover:bg-gray-100 text-gray-600'
          } disabled:opacity-50`}
          title="Downvote"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 17l-6-6h12l-6 6z" />
          </svg>
        </button>
      </div>
      
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}