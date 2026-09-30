import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

export interface OrderTimelineProps {
  currentStatus: string;
}

const STATUSES = ['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const currentIndex = STATUSES.indexOf(currentStatus);

  return (
    <div className="flex items-center w-full my-6">
      {STATUSES.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STATUSES.length - 1;

        return (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center relative">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-background",
                  isCompleted ? "border-primary bg-primary text-primary-foreground" :
                  isCurrent ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground/30"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <Circle className="w-2 h-2 fill-current" />}
              </div>
              <span className={cn(
                "absolute top-10 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap",
                isCompleted || isCurrent ? "text-primary" : "text-muted-foreground"
              )}>
                {status.replace(/_/g, ' ')}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-1 mx-2 bg-muted-foreground/20 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-500" 
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
