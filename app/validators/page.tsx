"use client";

import { motion } from "framer-motion";
import Header from "../components/Header";
import StarField from "../components/StarField";
import { Shield, Clock, Sparkles } from "lucide-react";

export default function ValidatorsPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a12] text-white selection:bg-[#FFD15C]/30 overflow-hidden">
      <StarField />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        {/* Centered Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-lg"
          >
            {/* Icon */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-8 w-24 h-24 rounded-full bg-gradient-to-tr from-[#FFD15C]/20 to-[#FFA726]/20 border border-[#FFD15C]/30 flex items-center justify-center"
            >
              <Shield className="w-12 h-12 text-[#FFD15C]" />
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold mb-4"
            >
              Validators
            </motion.h1>

            {/* Coming Soon Badge */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD15C]/10 border border-[#FFD15C]/30 mb-6"
            >
              <Clock className="w-4 h-4 text-[#FFD15C]" />
              <span className="text-sm font-semibold text-[#FFD15C]">Coming Soon</span>
            </motion.div>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-lg mb-8 leading-relaxed"
            >
              Explore all sequencers and validators on the Mantle Network
              <span className="text-[#FFD15C]"> in real-time</span>.
            </motion.p>

            {/* Features Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-panel rounded-xl p-6 text-left"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#FFD15C]" />
                <span className="font-semibold">What you&apos;ll see</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD15C]"></span>
                  Sequencer and validator rankings
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD15C]"></span>
                  Real-time uptime and performance metrics
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD15C]"></span>
                  Geographic distribution map
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD15C]"></span>
                  MNT transaction statistics
                </li>
              </ul>
            </motion.div>

            {/* Animated dots */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex justify-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#FFD15C]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
