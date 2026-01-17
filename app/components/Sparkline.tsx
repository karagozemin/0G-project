"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  animated?: boolean;
}

export default function Sparkline({
  data,
  color = "#7B61FF",
  height = 24,
  animated = true,
}: SparklineProps) {
  const { path, points, min, max } = useMemo(() => {
    if (data.length === 0) return { path: "", points: [], min: 0, max: 0 };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const width = 100;
    const padding = 2;
    const effectiveHeight = height - padding * 2;
    const stepX = width / (data.length - 1 || 1);

    const points = data.map((value, index) => ({
      x: index * stepX,
      y: padding + effectiveHeight - ((value - min) / range) * effectiveHeight,
    }));

    const path = points
      .map((point, index) =>
        index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
      )
      .join(" ");

    return { path, points, min, max };
  }, [data, height]);

  if (data.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <motion.path
        d={`${path} L ${points[points.length - 1]?.x || 0} ${height} L 0 ${height} Z`}
        fill={`url(#sparkline-gradient-${color})`}
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: 1 } : undefined}
        transition={{ duration: 0.5 }}
      />

      {/* Line */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* End dot */}
      {points.length > 0 && (
        <motion.circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2"
          fill={color}
          initial={animated ? { scale: 0 } : undefined}
          animate={animated ? { scale: 1 } : undefined}
          transition={{ delay: 0.8, duration: 0.3 }}
        />
      )}
    </svg>
  );
}

// Bar chart sparkline variant
export function SparklineBar({
  data,
  color = "#7B61FF",
  height = 24,
}: SparklineProps) {
  const bars = useMemo(() => {
    if (data.length === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    return data.map((value) => ((value - min) / range) * 100);
  }, [data]);

  return (
    <div className="flex items-end gap-[2px] h-full" style={{ height }}>
      {bars.map((barHeight, index) => (
        <motion.div
          key={index}
          className="flex-1 rounded-sm"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(barHeight, 10)}%` }}
          transition={{ delay: index * 0.02, duration: 0.3 }}
        />
      ))}
    </div>
  );
}
