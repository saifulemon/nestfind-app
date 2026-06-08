// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Star, Loader2, MessageSquare } from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  helpfulCount: number;
  createdAt: string;
  status: string;
  user?: {
    name: string;
    email: string;
  };
  property?: {
    id: string;
    title: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/admin/reviews`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => setReviews(json?.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`${API}/admin/reviews/${id}/approve`, {
        method: 'PATCH',
        credentials: 'include',
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // ignore
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`${API}/admin/reviews/${id}/reject`, {
        method: 'PATCH',
        credentials: 'include',
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // ignore
    }
  };

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px] text-[#64748B]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px]">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[40px]">
      <div className="flex items-center gap-[10px] mb-[8px]">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[rgba(251,191,36,0.1)] flex items-center justify-center">
          <MessageSquare className="w-[20px] h-[20px] text-[#FBBF24]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Review Moderation</h1>
          <p className="text-[14px] text-[#64748B]">Approve or reject user-submitted reviews</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-[8px] mt-[24px] mb-[20px]">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`h-[36px] px-[16px] rounded-[10px] text-[13px] font-medium capitalize transition-all cursor-pointer border-none ${
              filter === f
                ? 'bg-[rgba(74,144,217,0.2)] text-[#4A90D9]'
                : 'bg-white/5 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/10'
            }`}
          >
            {f}
            {f === 'pending' && reviews.filter((r) => r.status === 'pending').length > 0 && (
              <span className="ml-[6px] px-[6px] py-[1px] rounded-full bg-[#F87171] text-white text-[11px]">
                {reviews.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-[60px]">
          <MessageSquare className="w-[32px] h-[32px] text-[#64748B] mx-auto mb-[8px]" />
          <p className="text-[14px] text-[#94A3B8]">No {filter} reviews</p>
        </div>
      ) : (
        <div className="space-y-[12px]">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] p-[20px]"
            >
              <div className="flex items-start justify-between mb-[12px]">
                <div>
                  <div className="flex items-center gap-[8px] mb-[4px]">
                    <div className="flex items-center gap-[2px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-[14px] h-[14px]"
                          fill={star <= review.rating ? '#FBBF24' : 'none'}
                          stroke={star <= review.rating ? '#FBBF24' : '#64748B'}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span className="text-[12px] text-[#64748B]">
                      by {review.user?.name || 'Anonymous'}
                    </span>
                  </div>
                  <Link
                    to={`/property/${review.property?.id}`}
                    className="text-[14px] text-[#4A90D9] hover:text-[#7C3AED] transition-colors no-underline"
                  >
                    {review.property?.title}
                  </Link>
                </div>
                <span
                  className={`px-[10px] py-[2px] rounded-full text-[11px] font-semibold capitalize ${
                    review.status === 'pending'
                      ? 'bg-[rgba(251,191,36,0.1)] text-[#FBBF24]'
                      : review.status === 'approved'
                      ? 'bg-[rgba(74,222,128,0.1)] text-[#4ADE80]'
                      : 'bg-[rgba(248,113,113,0.1)] text-[#F87171]'
                  }`}
                >
                  {review.status}
                </span>
              </div>

              {review.title && (
                <h4 className="text-[15px] font-semibold text-[#F1F5F9] mb-[6px]">{review.title}</h4>
              )}
              <p className="text-[14px] text-[#94A3B8] leading-[1.6] mb-[16px]">{review.comment}</p>

              {review.status === 'pending' && (
                <div className="flex gap-[8px]">
                  <button
                    type="button"
                    onClick={() => handleApprove(review.id)}
                    className="h-[36px] px-[16px] rounded-[10px] text-[13px] font-medium border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] text-[#4ADE80] hover:bg-[rgba(74,222,128,0.15)] transition-colors cursor-pointer inline-flex items-center gap-[6px]"
                  >
                    <Check className="w-[14px] h-[14px]" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(review.id)}
                    className="h-[36px] px-[16px] rounded-[10px] text-[13px] font-medium border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[#F87171] hover:bg-[rgba(248,113,113,0.15)] transition-colors cursor-pointer inline-flex items-center gap-[6px]"
                  >
                    <X className="w-[14px] h-[14px]" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
