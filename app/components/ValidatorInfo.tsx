"use client";

import { motion } from "framer-motion";
import { Globe, MapPin, Server } from "lucide-react";

interface ValidatorInfoProps {
  validators: number;
  countries: number;
  cities: number;
}

export default function ValidatorInfo({ validators, countries, cities }: ValidatorInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass rounded-xl px-5 py-3 flex items-center gap-6"
    >
      <div className="flex items-center gap-2">
        <Server className="w-4 h-4 text-zama-purple" />
        <span className="text-zinc-400 text-sm">validators</span>
        <span className="text-white font-bold font-mono">{validators}</span>
      </div>
      <div className="w-px h-4 bg-zinc-700" />
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-zama-purple" />
        <span className="text-zinc-400 text-sm">countries</span>
        <span className="text-white font-bold font-mono">{countries}</span>
      </div>
      <div className="w-px h-4 bg-zinc-700" />
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-zama-purple" />
        <span className="text-zinc-400 text-sm">cities</span>
        <span className="text-white font-bold font-mono">{cities}</span>
      </div>
    </motion.div>
  );
}
