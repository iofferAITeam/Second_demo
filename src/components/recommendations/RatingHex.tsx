import React from "react";
import "../../styles/recommendations.css";

interface RatingHexProps {
  value: string;
  label: string;
  color?: "blue" | "green" | "red" | "yellow";
}

const colorMap = {
  blue: {
    border: "#1C5DFF",
  },
  green: {
    border: "#12C848",
  },
  red: {
    border: "#F44949",
  },
  yellow: {
    border: "#FFD41C",
  },
} as const;

export function RatingHex({ value, label, color = "blue" }: RatingHexProps) {
  const c = colorMap[color];

  return (
    <div className="rating-hex-container">
      <svg
        width="144"
        height="160"
        viewBox="0 0 144 160"
        fill="none"
        className={`rating-hex-svg ${color}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id={`filter0_d_215_12873_${color}`}
            x="0.0390625"
            y="0.30957"
            width="143.922"
            height="159.381"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="20" />
            <feGaussianBlur stdDeviation="10" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values={`0 0 0 0 ${
                parseInt(c.border.slice(1, 3), 16) / 255
              } 0 0 0 0 ${parseInt(c.border.slice(3, 5), 16) / 255} 0 0 0 0 ${
                parseInt(c.border.slice(5, 7), 16) / 255
              } 0 0 0 0.6 0`}
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_215_12873"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_215_12873"
              result="shape"
            />
          </filter>
        </defs>
        <g filter={`url(#filter0_d_215_12873_${color})`}>
          <path
            d="M71 0.577351C71.6188 0.220085 72.3812 0.220085 73 0.57735L122.962 29.4226C123.58 29.7799 123.962 30.4402 123.962 31.1547V88.8453C123.962 89.5598 123.58 90.2201 122.962 90.5773L73 119.423C72.3812 119.78 71.6188 119.78 71 119.423L21.0385 90.5774C20.4197 90.2201 20.0385 89.5598 20.0385 88.8453V31.1547C20.0385 30.4402 20.4197 29.7799 21.0385 29.4226L71 0.577351Z"
            fill="white"
          />
          <path
            d="M71.25 1.01074C71.6561 0.776267 72.1446 0.746962 72.5713 0.922852L72.75 1.01074L122.712 29.8555C123.176 30.1234 123.462 30.6186 123.462 31.1543V88.8457C123.462 89.3814 123.176 89.8766 122.712 90.1445L72.75 118.989C72.2859 119.257 71.7141 119.257 71.25 118.989L21.2881 90.1445C20.8242 89.8766 20.5382 89.3814 20.5381 88.8457V31.1543C20.5382 30.6186 20.8242 30.1234 21.2881 29.8555L71.25 1.01074Z"
            stroke={c.border}
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <div className="rating-hex-content">
        <div className={`rating-hex-value ${color}`}>{value}</div>
        <div className={`rating-hex-label ${color}`}>{label}</div>
      </div>
    </div>
  );
}