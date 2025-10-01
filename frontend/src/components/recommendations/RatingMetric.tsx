"use client";

import { Typography } from "antd";
import "../../styles/recommendations.css";

const { Text } = Typography;

interface RatingMetricProps {
  value: string;
  label: string;
  color: string;
}

export default function RatingMetric({
  value,
  label,
  color,
}: RatingMetricProps) {
  return (
    <div className="rating-metric-container">
      {/* Hexagon SVG */}
      <div className="rating-metric-hex">
        <svg
          viewBox="0 0 80 80"
          className="rating-metric-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter
              id={`shadow-${color.replace("#", "")}`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="4"
                floodColor={color}
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <path
            d="M40 2L65 20V60L40 78L15 60V20L40 2Z"
            fill="white"
            stroke={color}
            strokeWidth="2"
            filter={`url(#shadow-${color.replace("#", "")})`}
          />
        </svg>

        {/* Value and Label */}
        <div className="rating-metric-content">
          <Text strong className="rating-metric-value">
            {value}
          </Text>
          <Text className="rating-metric-label">{label}</Text>
        </div>
      </div>
    </div>
  );
}
