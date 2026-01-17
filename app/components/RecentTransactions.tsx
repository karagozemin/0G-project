"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileCode, Rocket, Loader2, ExternalLink } from "lucide-react";
import { useTransactions, type ZeroGTransaction } from "@/hooks/useZeroG";
import { truncateAddress, truncateHash } from "@/lib/zerog";

function TransactionRow({ tx, index }: { tx: ZeroGTransaction; index: number }) {
  const formatTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getTypeIcon = () => {
    switch (tx.type) {
      case 'deploy':
        return <Rocket className="w-3 h-3 text-green-400" />;
      case 'contract':
        return <FileCode className="w-3 h-3 text-purple-400" />;
      default:
        return <ArrowRight className="w-3 h-3 text-[#00D9A5]" />;
    }
  };

  const getTypeLabel = () => {
    switch (tx.type) {
      case 'deploy':
        return 'Deploy';
      case 'contract':
        return 'Contract';
      default:
        return 'Transfer';
    }
  };

  const value = parseFloat(tx.value);
  const displayValue = value > 0 ? (value > 1 ? value.toFixed(2) : value.toFixed(4)) : '0';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="flex items-center justify-between py-2 px-2 border-b border-white/5 last:border-0 hover:bg-white/5 rounded transition-colors cursor-pointer group"
      onClick={() => window.open(`https://chainscan.0g.ai/tx/${tx.hash}`, '_blank')}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-1.5 bg-white/5 rounded-lg">
          {getTypeIcon()}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#00D9A5]">
              {truncateHash(tx.hash)}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
              {getTypeLabel()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="font-mono">{truncateAddress(tx.from)}</span>
            <ArrowRight className="w-2.5 h-2.5" />
            <span className="font-mono">
              {tx.to ? truncateAddress(tx.to) : 'Contract Create'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs font-mono font-bold text-white">
            {displayValue} <span className="text-gray-500 text-[10px]">0G</span>
          </div>
          <div className="text-[10px] text-gray-500">{formatTime(tx.timestamp)}</div>
        </div>
        <ExternalLink className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

export default function RecentTransactions() {
  const { transactions, isLoading, error } = useTransactions(5000);

  return (
    <div className="glass-panel rounded-xl p-3 col-span-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Recent Transactions
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D9A5] animate-pulse"></span>
          <span className="text-[10px] text-[#00D9A5] font-bold">Live</span>
        </div>
      </div>
      
      <div className="flex flex-col max-h-[200px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-[#00D9A5] animate-spin" />
            <span className="ml-2 text-sm text-gray-400">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-400 text-sm">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">No transactions found</div>
        ) : (
          transactions.map((tx, i) => (
            <TransactionRow key={tx.hash} tx={tx} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
