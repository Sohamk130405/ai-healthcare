"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  initialRating = 0,
  onRatingChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (readonly) return;
    setRating(value);
    onRatingChange?.(value);
  };

  const handleMouseEnter = (value: number) => {
    if (readonly) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const currentRating = hoverRating || rating;

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          onMouseEnter={() => handleMouseEnter(value)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={cn(
            "transition-colors duration-150",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors duration-150",
              value <= currentRating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200",
              !readonly && "hover:fill-yellow-300 hover:text-yellow-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
