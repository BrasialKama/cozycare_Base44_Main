import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, total, size = 'sm', interactive = false, onChange }) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          >
            <Star
              className={`${sizeClass} ${
                star <= (rating || 0)
                  ? 'text-terracotta fill-terracotta'
                  : 'text-border'
              }`}
            />
          </button>
        ))}
      </div>
      {typeof rating === 'number' && !interactive && (
        <span className="text-xs text-muted-foreground font-medium ml-0.5">
          {rating.toFixed(1)}
          {total !== undefined && <span className="ml-0.5">({total})</span>}
        </span>
      )}
    </div>
  );
}