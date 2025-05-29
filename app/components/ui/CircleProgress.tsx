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
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / max) * circumference;

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setProgress(value);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, value]);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className="stroke-muted"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className="stroke-pink-500 transition-all duration-1000 ease-out"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-2xl font-bold text-yellow-400">{value}</div>
    </div>
  );
};