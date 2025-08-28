"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface RatingSystemProps {
  videoId: number
  initialRating?: number
  totalRatings?: number
  userRating?: number
  onRatingChange?: (rating: number) => void
  compact?: boolean
}

export function RatingSystem({
  videoId,
  initialRating = 0,
  totalRatings = 0,
  userRating = 0,
  onRatingChange,
  compact = false,
}: RatingSystemProps) {
  const [currentRating, setCurrentRating] = useState(initialRating)
  const [userCurrentRating, setUserCurrentRating] = useState(userRating)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleStarClick = (rating: number) => {
    setUserCurrentRating(rating)
    // Calculate new average (simplified)
    const newRating = (currentRating * totalRatings + rating) / (totalRatings + 1)
    setCurrentRating(newRating)
    onRatingChange?.(rating)
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isFilled = starValue <= (hoveredRating || userCurrentRating)

      return (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className={`p-1 h-auto ${compact ? "text-white hover:bg-white/20" : ""}`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => handleStarClick(starValue)}
        >
          <Star
            className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${isFilled ? "fill-yellow-400 text-yellow-400" : compact ? "text-white/70" : "text-muted-foreground"}`}
          />
        </Button>
      )
    })
  }

  if (compact) {
    return (
      <div className="flex flex-col items-center space-y-1">
        <div className="flex items-center space-x-0.5">{renderStars()}</div>
        <div className="text-xs text-white/80 text-center">{currentRating > 0 ? currentRating.toFixed(1) : "Rate"}</div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1">{renderStars()}</div>
      <div className="text-sm text-muted-foreground">
        {currentRating > 0 ? (
          <>
            {currentRating.toFixed(1)} ({totalRatings} rating{totalRatings !== 1 ? "s" : ""})
          </>
        ) : (
          "No ratings yet"
        )}
      </div>
    </div>
  )
}
