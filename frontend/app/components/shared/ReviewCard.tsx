import { ThumbsUp, User } from 'lucide-react';
import RatingStars from './RatingStars';

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

interface ReviewCardProps {
  review: Review;
  onHelpful?: (id: string) => void;
}

export default function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  return (
    <div className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] p-[20px]">
      <div className="flex items-start justify-between mb-[12px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center text-[14px] font-bold text-white">
            {review.user?.name?.charAt(0).toUpperCase() || <User className="w-[16px] h-[16px]" />}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#F1F5F9]">{review.user?.name || 'Anonymous'}</p>
            <p className="text-[12px] text-[#64748B]">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <RatingStars rating={review.rating} />
      </div>

      {review.title && (
        <h4 className="text-[15px] font-semibold text-[#F1F5F9] mb-[8px]">{review.title}</h4>
      )}

      <p className="text-[14px] text-[#94A3B8] leading-[1.6] mb-[16px]">{review.comment}</p>

      <button
        type="button"
        onClick={() => onHelpful?.(review.id)}
        className="inline-flex items-center gap-[6px] text-[13px] text-[#64748B] hover:text-[#4A90D9] transition-colors cursor-pointer border-none bg-transparent"
      >
        <ThumbsUp className="w-[14px] h-[14px]" />
        Helpful ({review.helpfulCount})
      </button>
    </div>
  );
}
