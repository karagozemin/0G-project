"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Layers, Loader2, ExternalLink } from "lucide-react";
import { useZeroGTVL, useZeroGProtocols } from "@/hooks/useDefiLlama";
import { formatTVL, formatChange } from "@/lib/defillama";

function ProtocolRow({ protocol, index }: { protocol: any; index: number }) {
  const formattedTVL = formatTVL(protocol.tvl);
  const isPositive = protocol.change24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between py-1.5 px-2 hover:bg-white/5 rounded transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500 w-4">{index + 1}</span>
        {protocol.logo && (
          <img 
            src={protocol.logo} 
            alt={protocol.name}
            className="w-5 h-5 rounded-full bg-white/10"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-white">{protocol.name}</span>
          <span className="text-[9px] text-gray-500">{protocol.category}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-mono font-bold text-white">{formattedTVL}</div>
        <div className={`text-[10px] font-mono flex items-center justify-end gap-0.5 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {formatChange(protocol.change24h)}
        </div>
      </div>
    </motion.div>
  );
}

export default function TVLPanel() {
  const { tvlData, isLoading: tvlLoading } = useZeroGTVL();
  const { protocols, isLoading: protocolsLoading } = useZeroGProtocols(5);

  const isPositive = (tvlData?.change24h ?? 0) >= 0;

  return (
    <div className="glass-panel rounded-xl p-3 col-span-2">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#00D9A5]" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Value Locked
          </h3>
        </div>
        <a 
          href="https://defillama.com/chain/0G" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-gray-500 hover:text-[#00D9A5] flex items-center gap-1 transition-colors"
        >
          DefiLlama <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {tvlLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-[#00D9A5] animate-spin" />
        </div>
      ) : tvlData ? (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-2xl font-mono font-bold text-white">
              {formatTVL(tvlData.tvl)}
            </div>
            <div className={`text-xs font-mono flex items-center gap-1 mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatChange(tvlData.change24h)} (24h)
            </div>
          </div>
          <div className="border-l border-white/10 pl-4">
            <div className="text-[10px] text-gray-500 uppercase mb-1">Protocols</div>
            <div className="text-xl font-mono font-bold text-[#00D9A5]">{tvlData.protocols}</div>
          </div>
          <div className="border-l border-white/10 pl-4">
            <div className="text-[10px] text-gray-500 uppercase mb-1">Chain Rank</div>
            <div className="text-xl font-mono font-bold text-[#3B82F6]">
              #{tvlData.rank}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">Unable to load TVL data</div>
      )}

      {/* Top Protocols */}
      <div className="border-t border-white/5 pt-3">
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Top Protocols</h4>
        {protocolsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 text-[#00D9A5] animate-spin" />
          </div>
        ) : protocols.length > 0 ? (
          <div className="flex flex-col">
            {protocols.map((p, i) => (
              <ProtocolRow key={p.name} protocol={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-gray-500 text-xs">No protocols found</div>
        )}
      </div>
    </div>
  );
}
