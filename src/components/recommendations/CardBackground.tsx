"use client";

interface CardBackgroundProps {
  color: string;
}

const colorMap = {
  red: "#F44949B8",
  green: "#12C848B8",
  blue: "#1C5DFFB8",
  yellow: "#FFD41CEB",
} as const;

export function CardBackground({ color }: CardBackgroundProps) {
  const hexColor = colorMap[color as keyof typeof colorMap] || "#1C5DFF";

  return (
    <svg
      width="441"
      height="204"
      viewBox="0 0 441 204"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className="school-card-decorative-svg"
    >
      <mask
        id={`mask0_215_12871_${color}`}
        className="card-background-mask"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="460"
        height="204"
      >
        <path
          d="M138.346 102C139.476 45.9344 184.273 0 240.35 0H440C451.046 0 460 8.95431 460 20V184C460 195.046 451.046 204 440 204H0C0 204 136.621 187.56 138.346 102Z"
          fill={hexColor}
        />
      </mask>
      <g mask={`url(#mask0_215_12871_${color})`}>
        <path
          d="M138.346 102C139.476 45.9344 184.273 0 240.35 0H440C451.046 0 460 8.95431 460 20V184C460 195.046 451.046 204 440 204H0C0 204 136.621 187.56 138.346 102Z"
          fill={`url(#pattern0_215_12871_${color})`}
        />
        <path
          d="M138.346 102C139.476 45.9344 184.273 0 240.35 0H440C451.046 0 460 8.95431 460 20V184C460 195.046 451.046 204 440 204H0C0 204 136.621 187.56 138.346 102Z"
          fill={hexColor}
          className="card-background-blend"
        />
        <foreignObject x="0" y="0" width="0" height="0">
          {/* eslint-disable-next-line react/no-inline-styles */}
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="card-background-blur"
            style={{
              clipPath: `url(#bgblur_0_215_12871_clip_path_${color})`,
            }}
          />
        </foreignObject>
        <path
          data-figma-bg-blur-radius="4"
          d="M138.346 102C139.476 45.9344 184.273 0 240.35 0H440C451.046 0 460 8.95431 460 20V184C460 195.046 451.046 204 440 204H0C0 204 136.621 187.56 138.346 102Z"
          fill={`url(#paint0_linear_215_12871_${color})`}
        />
      </g>
      <defs>
        <pattern
          id={`pattern0_215_12871_${color}`}
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref={`#image0_215_12871_${color}`}
            transform="matrix(0.000651042 0 0 0.00112526 0 -0.00284946)"
          />
        </pattern>
        <image
          id={`image0_215_12871_${color}`}
          width="1536"
          height="1536"
          preserveAspectRatio="none"
          xlinkHref="/images/card-backgrounds/texture.png"
        />
        <clipPath
          id={`bgblur_0_215_12871_clip_path_${color}`}
          transform="translate(0 0)"
        >
          <path d="M138.346 102C139.476 45.9344 184.273 0 240.35 0H440C451.046 0 460 8.95431 460 20V184C460 195.046 451.046 204 440 204H0C0 204 136.621 187.56 138.346 102Z" />
        </clipPath>
        <linearGradient
          id={`paint0_linear_215_12871_${color}`}
          x1="230"
          y1="204"
          x2="230"
          y2="5.51426e-06"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={hexColor} stopOpacity="0.72" />
          <stop offset="1" stopColor={hexColor} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}