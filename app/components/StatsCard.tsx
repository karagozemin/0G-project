"use client";

import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  sparkline?: boolean;
}

// Pre-generated heights to avoid hydration mismatch
const sparklineHeights = [12, 8, 16, 10, 14, 6, 18, 11, 9, 15, 7, 13, 10, 17, 8, 12];

export default function StatsCard({ title, value, unit, icon, sparkline }: StatsCardProps) {
  return (
    <div className="glass-panel rounded-xl p-3 flex flex-col justify-between min-h-[85px] hover:border-[#00D9A5]/30 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-4 text-gray-400">
           {icon && <span className="w-4 h-4 opacity-70 group-hover:text-[#00D9A5] transition-colors">{icon}</span>}
           <span className="text-[10px] uppercase font-semibold tracking-wide mt-0.5">{title}</span>
          </div>
        {unit && <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{unit}</span>}
      </div>

      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {value}
          {title.includes("Staked") && <span className="text-xs text-gray-500 ml-1 font-sans">MNT</span>}
        </div>
      </div>

      {sparkline && (
        <div className="flex gap-[3px] items-end h-4 mt-3 w-full opacity-60">
          {sparklineHeights.map((height, i) => (
        <motion.div
               key={i}
               className="flex-1 bg-[#00D9A5] rounded-[1px]"
               initial={{ height: 4 }}
               animate={{ height }}
               transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
             />
          ))}
        </div>
      )}
      
      {!sparkline && (
         <div className="w-full h-1 bg-gradient-to-r from-[#00D9A5]/20 to-[#3B82F6]/20 mt-3 rounded-full" />
      )}
      </div>
  );
}
