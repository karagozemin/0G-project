"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";

interface EpochIndicatorProps {
  epoch: number;
  validator: string;
  location: string;
}

export default function EpochIndicator({ epoch, validator, location }: EpochIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass rounded-xl px-5 py-3 flex items-center gap-4"
    >
      {/* Epoch number */}
      <div className="flex items-center gap-2">
        <span className="text-zama-yellow font-bold font-mono text-lg">#{epoch}</span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-4 h-4 text-zama-purple" />
        </motion.div>
        <span className="text-zinc-500 text-sm">epoch</span>
      </div>

      <div className="w-px h-6 bg-zinc-700" />

      {/* Current validator */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-zama-purple/20">
          <ShieldCheck className="w-4 h-4 text-zama-purple" />
        </div>
        <div>
          <div className="text-white font-medium text-sm">{validator}</div>
          <div className="text-zinc-500 text-xs">{location}</div>
        </div>
      </div>
    </motion.div>
  );
}
