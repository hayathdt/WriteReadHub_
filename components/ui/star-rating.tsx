"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  currentRating: number;
  totalStars?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: string;
}

export function StarRating({
  currentRating,
  totalStars = 5,
  onRate,
  readOnly = true,
  size = "h-5 w-5",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const stars = Array.from({ length: totalStars }, (_, i) => i + 1);

  return (
    <div className="flex items-center">
      {stars.map((starValue) => {
        const displayRating = hoverRating ?? (readOnly ? currentRating : (userInteracting ? 0 : currentRating) );
        // userInteracting is true if hoverRating is not null, or if onRate is defined (i.e. interactive mode)
        const userInteracting = hoverRating !== null || (onRate !== undefined && !readOnly);

        // In interactive mode, if nothing is hovered, and currentRating is 0, show all as empty.
        // Otherwise, show based on hover or currentRating.
        const activeRating = !readOnly && userInteracting ? (hoverRating ?? currentRating) : currentRating;
        const isFilled = activeRating >= starValue;
        
        // Determine fill for interactive mode based on hover or click
        const fillToShow = !readOnly && hoverRating !== null ? (hoverRating ?? 0) >= starValue : currentRating >= starValue;


        return (
          <Star
            key={starValue}
            className={cn(
              size,
              !readOnly && "cursor-pointer",
              (hoverRating !== null && (hoverRating ?? 0) >= starValue) ? "text-yellow-300" : 
              (currentRating >= starValue ? "text-yellow-400" : "text-gray-300"),
              // Fallback for non-hover interactive state to reflect currentRating
              (!readOnly && hoverRating === null && currentRating >= starValue) && "text-yellow-400",
              (!readOnly && hoverRating === null && currentRating < starValue) && "text-gray-300"
            )}
            fill={
              !readOnly && hoverRating !== null ? 
                ((hoverRating ?? 0) >= starValue ? "currentColor" : "none") :
                (currentRating >= starValue ? "currentColor" : "none")
            }
            onClick={() => !readOnly && onRate?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(null)}
          />
        );
      })}
    </div>
  );
}
