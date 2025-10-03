"use client";

import { RatingHex } from "./RatingHex";

interface Rating {
  value: number;
  label: string;
  shortLabel: string;
  icon: string;
}

interface HexagonalRatingsProps {
  academic?: number;
  practical?: number;
  language?: number;
  fit?: number;
  cardColor?: "blue" | "green" | "red" | "yellow";
}

const getRatingLabel = (score: number): string => {
  if (score >= 4.5) return "Perfect";
  if (score >= 4) return "Excellent";
  if (score >= 3.5) return "Good";
  if (score >= 3) return "Fair";
  return "Poor";
};

const getRatingColor = (score: number): string => {
  if (score >= 4.5) return "green";
  if (score >= 4) return "blue";
  if (score >= 3.5) return "yellow";
  if (score >= 3) return "yellow";
  return "red";
};

export default function HexagonalRatings({
  academic,
  practical,
  language,
  fit,
  cardColor = "blue",
}: HexagonalRatingsProps) {
  const ratings: Rating[] = [
    {
      value: academic || 0,
      label: "Academic Background",
      shortLabel: "Academic",
      icon: "🎓"
    },
    {
      value: fit || 0,
      label: "Overall Fit",
      shortLabel: "Fit",
      icon: "🎯"
    }
  ].filter(rating => rating.value > 0);

  if (ratings.length === 0) return null;

  return (
    <div className="ai-ratings-plain">
      {ratings.map((rating, index) => (
        <RatingHex
          key={index}
          value={`${rating.value}`}
          label={rating.shortLabel}
          color={cardColor}
        />
      ))}
    </div>
  );
}