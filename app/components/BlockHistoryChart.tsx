"use client";

import { motion } from "framer-motion";
import { useBlockHistory, type BlockHistoryItem } from "@/hooks/useMantle";
import { Loader2 } from "lucide-react";

export default function BlockHistoryChart() {
  const { history, isLoading, maxTxCount } = useBlockHistory(45);

  return (
    <div className="glass-panel rounded-xl p-3 col-span-2 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Block History (Tx Count)
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D9A5] animate-pulse"></span>
          <span className="text-[10px] text-[#00D9A5] font-bold">Live</span>
        </div>
      </div>

      {isLoading && history.length === 0 ? (
        <div className="flex items-center justify-center h-6 mb-1">
          <Loader2 className="w-4 h-4 text-[#00D9A5] animate-spin" />
          <span className="text-[10px] text-gray-500 ml-2">Loading blocks...</span>
        </div>
      ) : (
        <div className="flex gap-0.5 h-8 w-full mb-1 items-end">
          {history.map((block, i) => {
            // Normalize height based on max tx count
            const heightPercent = Math.max(10, (block.txCount / maxTxCount) * 100);
            // Color based on tx count (more txs = brighter)
            const opacity = 0.3 + (block.txCount / maxTxCount) * 0.7;
            
            return (
              <motion.div
                key={block.blockNumber}
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.3, delay: i * 0.01 }}
                className="flex-1 rounded-t-[2px] bg-[#00D9A5] cursor-pointer hover:bg-[#3B82F6] transition-colors"
                style={{ opacity }}
                title={`Block #${block.blockNumber.toLocaleString()}\n${block.txCount} transactions`}
                onClick={() => window.open(`https://explorer.mantle.xyz/block/${block.blockNumber}`, '_blank')}
              />
            );
          })}
        </div>
      )}

      <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-2">
        <span>
          {history.length > 0 
            ? `#${history[0]?.blockNumber.toLocaleString()} → #${history[history.length - 1]?.blockNumber.toLocaleString()}`
            : 'Loading...'
          }
        </span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#00D9A5] rounded-full opacity-40"></span>
            Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#00D9A5] rounded-full"></span>
            High
          </span>
        </div>
      </div>
      
      {/* Stats row */}
      {history.length > 0 && (
        <div className="flex justify-between text-[10px] mt-2 pt-2 border-t border-white/5">
          <div>
            <span className="text-gray-500">Total Txs: </span>
            <span className="text-white font-mono font-bold">
              {history.reduce((sum, b) => sum + b.txCount, 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Avg/Block: </span>
            <span className="text-[#00D9A5] font-mono font-bold">
              {Math.round(history.reduce((sum, b) => sum + b.txCount, 0) / history.length)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Max: </span>
            <span className="text-[#3B82F6] font-mono font-bold">{maxTxCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
