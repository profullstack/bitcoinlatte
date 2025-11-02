'use client'

import VoteButton from '@/components/Voting/VoteButton'
import CommentForm from '@/components/Comments/CommentForm'
import { useRouter } from 'next/navigation'

interface ShopDetailClientProps {
  shopId: string
  votes: {
    quality_score: number
    bitcoin_verified_score: number
    total_votes: number
  }
}

export default function ShopDetailClient({ shopId, votes }: ShopDetailClientProps) {
  const router = useRouter()

  const handleCommentAdded = () => {
    // Refresh the page to show new comment
    router.refresh()
  }

  return (
    <>
      {/* Voting Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-bold mb-4">Community Rating</h3>
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
        <div className="mt-4 pt-4 border-t text-xs text-gray-500 text-center">
          {votes.total_votes} total votes
        </div>
      </div>

      {/* Comment Form Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-bold mb-4">Leave a Comment</h3>
        <CommentForm shopId={shopId} onCommentAdded={handleCommentAdded} />
      </div>
    </>
  )
}