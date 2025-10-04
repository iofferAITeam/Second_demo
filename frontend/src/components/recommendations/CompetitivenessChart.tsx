"use client";

import { useEffect, useRef } from "react";

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface CompetitivenessChartProps {
  chartData?: ChartData[];
}

const defaultChartData: ChartData[] = [
  { label: "Academic Performance", value: 95, color: "#1890ff" },
  { label: "Research Experience", value: 50, color: "#52c41a" },
  { label: "Internship & Work Experience", value: 50, color: "#faad14" },
  { label: "Extracurriculars", value: 50, color: "#f5222d" },
  { label: "Standardized Test Score", value: 75, color: "#722ed1" },
  { label: "Recommendation letters", value: 60, color: "#13c2c2" },
];

export default function CompetitivenessChart({ chartData = defaultChartData }: CompetitivenessChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    ctx.strokeStyle = "#e8e8e8";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const gridRadius = (radius * i) / 5;

      // Draw polygon for each grid level
      for (let j = 0; j < chartData.length; j++) {
        const angle = (j * 2 * Math.PI) / chartData.length - Math.PI / 2;
        const x = centerX + gridRadius * Math.cos(angle);
        const y = centerY + gridRadius * Math.sin(angle);

        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axis lines
    ctx.strokeStyle = "#d9d9d9";
    ctx.lineWidth = 1;
    for (let i = 0; i < chartData.length; i++) {
      const angle = (i * 2 * Math.PI) / chartData.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Draw data polygon
    ctx.fillStyle = "rgba(24, 144, 255, 0.2)";
    ctx.strokeStyle = "#1890ff";
    ctx.lineWidth = 2;
    ctx.beginPath();

    chartData.forEach((item, index) => {
      const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
      const dataRadius = (radius * item.value) / 100;
      const x = centerX + dataRadius * Math.cos(angle);
      const y = centerY + dataRadius * Math.sin(angle);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw data points
    chartData.forEach((item, index) => {
      const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
      const dataRadius = (radius * item.value) / 100;
      const x = centerX + dataRadius * Math.cos(angle);
      const y = centerY + dataRadius * Math.sin(angle);

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = "#666";
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    chartData.forEach((item, index) => {
      const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      // Adjust text alignment based on position
      if (x < centerX - 10) {
        ctx.textAlign = "right";
      } else if (x > centerX + 10) {
        ctx.textAlign = "left";
      } else {
        ctx.textAlign = "center";
      }

      // Split long labels into multiple lines
      const words = item.label.split(" ");
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(" "), x, y - 6);
        ctx.fillText(words.slice(2).join(" "), x, y + 6);
      } else {
        ctx.fillText(item.label, x, y);
      }
    });
  }, []);

  return (
    <div className="competitiveness-chart-container">
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="competitiveness-chart-canvas"
      />
    </div>
  );
}
