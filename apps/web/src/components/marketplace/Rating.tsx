import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  rating: number;
  max?: number;
  className?: string;
  showText?: boolean;
}

export function Rating({ rating, max = 5, className, showText = false }: RatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[...Array(max)].map((_, i) => {
          const isFull = i < Math.floor(rating);
          const isHalf = !isFull && i < rating;
          
          if (isFull) {
            return <Star key={i} className="w-4 h-4 fill-warning text-warning" />;
          } else if (isHalf) {
            return <StarHalf key={i} className="w-4 h-4 fill-warning text-warning" />;
          } else {
            return <Star key={i} className="w-4 h-4 text-muted-foreground opacity-30" />;
          }
        })}
      </div>
      {showText && <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}
