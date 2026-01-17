"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTPSHistory, useGasPriceHistory, type HistoryPoint } from "@/hooks/useMantle";
import { Activity, Fuel, Loader2 } from "lucide-react";

interface MiniChartProps {
  data: HistoryPoint[];
  color: string;
  height?: number;
}

// Pre-generated placeholder heights to avoid hydration mismatch
const PLACEHOLDER_HEIGHTS = [
  35, 42, 28, 55, 38, 45, 32, 48, 40, 52,
  30, 58, 36, 44, 50, 33, 47, 41, 53, 29
];

function MiniChart({ data, color, height = 40 }: MiniChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show placeholder until client-side hydration
  if (!isClient || data.length < 2) {
    return (
      <div className="flex items-end gap-[2px] h-full">
        {PLACEHOLDER_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm opacity-20"
            style={{ 
              backgroundColor: color, 
              height: `${h}%` 
            }}
          />
        ))}
      </div>
    );
  }

  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);

  return (
    <div className="flex items-end gap-[2px] h-full">
      {data.map((point, i) => {
        const normalizedHeight = ((point.value - min) / (max - min || 1)) * 100;
        const heightPercent = Math.max(10, Math.min(100, normalizedHeight));
        
        return (
          <motion.div
            key={point.timestamp}
            initial={{ height: 0 }}
            animate={{ height: `${heightPercent}%` }}
            transition={{ duration: 0.3 }}
            className="flex-1 rounded-t-sm"
            style={{ 
              backgroundColor: color,
              opacity: 0.3 + (i / data.length) * 0.7
            }}
          />
        );
      })}
    </div>
  );
}

export function TPSChart() {
  const history = useTPSHistory(30);
  const currentTPS = history.length > 0 ? history[history.length - 1].value : 0;
  const avgTPS = history.length > 0 
    ? Math.round(history.reduce((sum, p) => sum + p.value, 0) / history.length)
    : 0;

  return (
    <div className="glass-panel rounded-xl p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00D9A5]" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">TPS History</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D9A5] animate-pulse"></span>
          <span className="text-[10px] text-[#00D9A5] font-bold">Live</span>
        </div>
      </div>
      
      <div className="h-[60px] mb-2">
        <MiniChart data={history} color="#00D9A5" />
      </div>
      
      <div className="flex justify-between text-[10px]">
        <div>
          <span className="text-gray-500">Current: </span>
          <span className="font-mono font-bold text-white">{currentTPS}</span>
        </div>
        <div>
          <span className="text-gray-500">Avg: </span>
          <span className="font-mono font-bold text-[#00D9A5]">{avgTPS}</span>
        </div>
        <div>
          <span className="text-gray-500">Peak: </span>
          <span className="font-mono font-bold text-[#3B82F6]">
            {history.length > 0 ? Math.max(...history.map(p => p.value)) : 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export function GasPriceChart() {
  const history = useGasPriceHistory(30);
  const currentGas = history.length > 0 ? history[history.length - 1].value : 0;
  const avgGas = history.length > 0 
    ? (history.reduce((sum, p) => sum + p.value, 0) / history.length).toFixed(4)
    : '0';

  return (
    <div className="glass-panel rounded-xl p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-[#3B82F6]" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gas History</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></span>
          <span className="text-[10px] text-[#3B82F6] font-bold">Live</span>
        </div>
      </div>
      
      <div className="h-[60px] mb-2">
        <MiniChart data={history} color="#3B82F6" />
      </div>
      
      <div className="flex justify-between text-[10px]">
        <div>
          <span className="text-gray-500">Current: </span>
          <span className="font-mono font-bold text-white">{currentGas.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-gray-500">Avg: </span>
          <span className="font-mono font-bold text-[#3B82F6]">{avgGas}</span>
        </div>
        <div className="text-gray-500">
          <span>Gwei</span>
        </div>
      </div>
    </div>
  );
}

export default function LiveCharts() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TPSChart />
      <GasPriceChart />
    </div>
  );
}
