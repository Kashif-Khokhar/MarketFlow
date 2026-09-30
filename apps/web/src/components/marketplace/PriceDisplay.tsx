import React from 'react';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function PriceDisplay({ price, compareAtPrice, className, size = 'md' }: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
    xl: "text-2xl font-bold",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("text-foreground", sizeClasses[size])}>
        ${price.toFixed(2)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-sm text-muted-foreground line-through">
          ${compareAtPrice.toFixed(2)}
        </span>
      )}
    </div>
  );
}
