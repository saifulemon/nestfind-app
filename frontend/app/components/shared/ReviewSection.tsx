// @ts-nocheck
import { useState } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import ReviewCard from './ReviewCard';
import RatingStars from './RatingStars';
import { reviewSchema } from '~/utils/validations/review';

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  helpfulCount: number;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface ReviewSectionProps {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
  onSubmitReview: (data: { rating: number; title: string; comment: string }) => void;
  onHelpful: (id: string) => void;
}

export default function ReviewSection({ reviews, averageRating, totalCount, onSubmitReview, onHelpful }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setValidationError(null);
    const result = reviewSchema.safeParse({ rating, title, comment });
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message || 'Invalid input');
      return;
    }
    setIsSubmitting(true);
    onSubmitReview({ rating, title, comment });
    setShowForm(false);
    setRating(0);
    setTitle('');
    setComment('');
    setValidationError(null);
    setIsSubmitting(false);
  };

  return (
    <div className="mt-[40px]">
      <div className="flex items-center justify-between mb-[24px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-[rgba(251,191,36,0.1)] flex items-center justify-center">
            <MessageSquare className="w-[18px] h-[18px] text-[#FBBF24]" />
          </div>
          <div>
            <h3 className="text-[20px] font-bold">Reviews</h3>
            <div className="flex items-center gap-[8px]">
              <RatingStars rating={Math.round(averageRating)} size={14} />
              <span className="text-[14px] text-[#94A3B8]">
                {averageRating.toFixed(1)} ({totalCount} reviews)
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="h-[38px] px-[16px] rounded-[10px] text-[13px] font-medium border border-[rgba(74,144,217,0.3)] bg-[rgba(74,144,217,0.08)] text-[#4A90D9] hover:bg-[rgba(74,144,217,0.15)] transition-colors cursor-pointer"
        >
          Write a Review
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-[20px] mb-[24px]">
          <div className="mb-[16px]">
            <label className="block text-[13px] font-medium text-[#94A3B8] mb-[8px]">Rating</label>
            <div className="flex items-center gap-[4px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-[2px] cursor-pointer bg-transparent border-none"
                >
                  <Star
                    className="w-[24px] h-[24px]"
                    fill={star <= (hoverRating || rating) ? '#FBBF24' : 'none'}
                    stroke={star <= (hoverRating || rating) ? '#FBBF24' : '#64748B'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-[16px]">
            <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="h-[44px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[14px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)]"
            />
          </div>

          <div className="mb-[16px]">
            <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Review *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this property..."
              rows={4}
              required
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[14px] py-[10px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] resize-y min-h-[100px]"
            />
          </div>

          {validationError && (
            <div className="mb-[16px] p-[12px] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] rounded-[8px] text-[#F87171] text-[13px]">
              {validationError}
            </div>
          )}

          <div className="flex gap-[12px]">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-[42px] px-[20px] rounded-[10px] border border-white/10 bg-white/5 text-[#F1F5F9] text-[13px] font-medium hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || !comment.trim() || isSubmitting}
              className="h-[42px] px-[20px] rounded-[10px] border-none bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white text-[13px] font-semibold hover:shadow-[0_0_20px_rgba(74,144,217,0.3)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-[6px]"
            >
              <Send className="w-[14px] h-[14px]" />
              Submit Review
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-[40px]">
          <MessageSquare className="w-[32px] h-[32px] text-[#64748B] mx-auto mb-[8px]" />
          <p className="text-[14px] text-[#94A3B8]">No reviews yet. Be the first to write one!</p>
        </div>
      ) : (
        <div className="space-y-[12px]">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onHelpful={onHelpful} />
          ))}
        </div>
      )}
    </div>
  );
}
