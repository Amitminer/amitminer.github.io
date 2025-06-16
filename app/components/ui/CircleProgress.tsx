'use client';

import { useEffect, useState } from 'react';

interface CircleProgressProps {
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  isVisible: boolean;
}

export const CircleProgress = ({
  value,
  max,
  size,
  strokeWidth,
  isVisible,
}: CircleProgressProps) => {
  // Validate and clamp input values
  const safeMax = Math.max(max, 1); // Ensure max is at least 1
  const safeValue = Math.min(Math.max(value, 0), safeMax); // Clamp value between 0 and max
  const safeSize = Math.max(size, strokeWidth * 2); // Ensure size is at least twice strokeWidth
  const safeStrokeWidth = Math.min(Math.max(strokeWidth, 1), safeSize / 2); // Clamp strokeWidth between 1 and size/2

  const [progress, setProgress] = useState(0);
  const radius = (safeSize - safeStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / safeMax) * circumference;

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setProgress(safeValue);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, safeValue, safeMax]);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={safeSize} height={safeSize} className="-rotate-90">
        <circle
          className="stroke-muted"
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          strokeWidth={safeStrokeWidth}
          fill="none"
        />
        <circle
          className="stroke-pink-500 transition-all duration-1000 ease-out"
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          strokeWidth={safeStrokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-2xl font-bold text-yellow-400">{safeValue}</div>
    </div>
  );
};