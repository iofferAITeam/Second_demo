"use client";

import { RatingHex } from "./RatingHex";
import { CardBackground } from "./CardBackground";
import "../../styles/recommendations.css";

interface SchoolData {
  id: string;
  name: string;
  program: string;
  location: string;
  duration: string;
  tuition: string;
  toefl: string;
  admissionRate: string;
  fitScore: string;
  fitLabel: string;
  category: "target" | "fit" | "safety";
  employment: string;
  schoolType: string;
}

interface SchoolRecommendationCardProps {
  school: SchoolData;
}

const colors = ["blue", "green", "red", "yellow"] as const;

export default function SchoolRecommendationCard({
  school,
}: SchoolRecommendationCardProps) {
  // 使用学校ID的哈希值来确定颜色索引，确保同一学校始终使用相同颜色
  const colorIndex = school.id
    ? Math.abs(school.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
      colors.length
    : 0;
  const colorKey = colors[colorIndex];

  return (
    <div className="school-card">
      {/* Decorative wave background on right */}
      <div className="school-card-decorative-container">
        <CardBackground color={colorKey} />
      </div>

      <div className="card-content">
        <div className="card-info">
          <div className="card-header">
            <div className="card-icon" />
            <span className="card-school-name">{school.name}</span>
            <span className="pill pill-service-type">{school.schoolType}</span>
          </div>
          <h4 className="card-program-title">{school.program}</h4>
          <div className="card-details">
            <span className="card-location">📍 {school.location}</span>
            <span className="pill-bullet pill-outline">{school.duration}</span>
            <span className="pill-bullet pill-outline">
              Annual tuition {school.tuition}
            </span>
            <span className="pill-bullet pill-outline">
              TOEFL {school.toefl}
            </span>
            <span className="pill-bullet pill-blue-text">
              {school.employment}
            </span>
          </div>
        </div>

        <div className="card-ratings">
          <RatingHex
            value={school.admissionRate}
            label="Admission Rate"
            color={colorKey}
          />
          <RatingHex
            value={school.fitScore}
            label={school.fitLabel}
            color={colorKey}
          />
        </div>
        <button className="analysis-button">View Analysis ↓</button>
      </div>
    </div>
  );
}
