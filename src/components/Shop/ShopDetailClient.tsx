'use client'

import { useEffect } from 'react'
import VoteButton from '@/components/Voting/VoteButton'
import CommentForm from '@/components/Comments/CommentForm'
import { useRouter } from 'next/navigation'
import { trackShopView } from '@/lib/analytics/datafast'

interface ShopDetailClientProps {
  shopId: string
  shopName?: string
  votes: {
    quality_score: number
    bitcoin_verified_score: number
    total_votes: number
  }
}

export default function ShopDetailClient({ shopId, shopName, votes }: ShopDetailClientProps) {
  const router = useRouter()

  // Track shop view on mount
  useEffect(() => {
    trackShopView(shopId, shopName || 'Unknown Shop')
  }, [shopId, shopName])

  const handleCommentAdded = () => {
    // Refresh the page to show new comment
    router.refresh()
  }

  return (
    <>
      {/* Voting Section */}
      <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⭐</span>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Community Rating</h3>
        </div>
        <div className="space-y-4">
          <VoteButton
            shopId={shopId}
            voteType="shop_quality"
            initialScore={votes.quality_score}
            label="Shop Quality"
          />
          <VoteButton
            shopId={shopId}
            voteType="bitcoin_verified"
            initialScore={votes.bitcoin_verified_score}
            label="Bitcoin Verified"
          />
        </div>
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400 text-center font-medium">
          {votes.total_votes} total votes
        </div>
      </div>

      {/* Comment Form Section */}
      <div className="glass-effect rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✍️</span>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Leave a Comment</h3>
        </div>
        <CommentForm shopId={shopId} onCommentAdded={handleCommentAdded} />
      </div>
    </>
  )
}