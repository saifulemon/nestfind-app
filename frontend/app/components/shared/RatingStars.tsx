import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: number;
}

export default function RatingStars({ rating, size = 16 }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-[${size}px] h-[${size}px]`}
          style={{ width: size, height: size }}
          fill={star <= rating ? '#FBBF24' : 'none'}
          stroke={star <= rating ? '#FBBF24' : '#64748B'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
