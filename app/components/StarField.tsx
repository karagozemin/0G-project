"use client";

import { useState, useEffect } from "react";

interface Star {
  id: number;
  top: string;
  left: string;
  width: string;
  height: string;
  color: string;
  opacity: number;
  glow: string;
  duration: string;
}

// Generate stars only on client side
function generateStars(): Star[] {
  const colors = ["#00D9A5", "#3B82F6", "#8B5CF6"];
  const bigStars: Star[] = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 2 + 2}px`,
    height: `${Math.random() * 2 + 2}px`,
    color: colors[i % 3],
    opacity: Math.random() * 0.5 + 0.2,
    glow: `0 0 ${Math.random() * 6 + 4}px rgba(0, 217, 165, 0.6)`,
    duration: `${Math.random() * 5 + 3}s`,
  }));

  const smallStars: Star[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 35,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 1.5 + 1}px`,
    height: `${Math.random() * 1.5 + 1}px`,
    color: "#ffffff",
    opacity: Math.random() * 0.4 + 0.15,
    glow: "none",
    duration: `${Math.random() * 6 + 4}s`,
  }));

  return [...bigStars, ...smallStars];
}

export default function StarField() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(generateStars());
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.width,
            height: star.height,
            backgroundColor: star.color,
            opacity: star.opacity,
            boxShadow: star.glow,
            animation: `twinkle ${star.duration} infinite ease-in-out`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}
