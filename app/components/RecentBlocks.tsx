"use client";

import { motion } from "framer-motion";
import { Blocks, ShieldCheck } from "lucide-react";

interface Block {
  number: number;
  validator: string;
  transactions: number;
  time: string;
}

interface RecentBlocksProps {
  blocks: Block[];
}

export default function RecentBlocks({ blocks }: RecentBlocksProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass rounded-2xl p-5 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Recent Blocks
        </h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <motion.div
            key={block.number}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zama-purple/20 group-hover:bg-zama-purple/30 transition-colors">
                <Blocks className="w-4 h-4 text-zama-purple" />
              </div>
              <div>
                <div className="text-sm font-mono font-semibold text-white">
                  #{block.number.toLocaleString("en-US")}
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{block.validator}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-zama-yellow">
                {block.transactions} txs
              </div>
              <div className="text-xs text-zinc-500">{block.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
