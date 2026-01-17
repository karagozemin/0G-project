"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Header from "./components/Header";
import StatsCard from "./components/StatsCard";
import StarField from "./components/StarField";
import Particles from "./components/Particles";
import RecentTransactions from "./components/RecentTransactions";
import TVLPanel from "./components/TVLPanel";
import BlockHistoryChart from "./components/BlockHistoryChart";
import { TPSChart, GasPriceChart } from "./components/LiveChart";
import NetworkInsights from "./components/NetworkInsights";
import { Clock, TrendingUp, Activity, Blocks, Fuel, Loader2 } from "lucide-react";
import { useMantle, useRealBlockTime, usePersistentPeakTPS, type MantleBlock } from "@/hooks/useMantle";

const Globe = dynamic(() => import("./components/Globe"), { ssr: false });

function RecentBlockRow({ block, index }: { block: MantleBlock; index: number }) {
  const formatTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const shortHash = `${block.hash.slice(0, 6)}...${block.hash.slice(-4)}`;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors cursor-pointer"
      onClick={() => window.open(`https://explorer.mantle.xyz/block/${block.number}`, '_blank')}
    >
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-[#8B5CF6]/10 rounded-lg">
          <Blocks className="w-3.5 h-3.5 text-[#8B5CF6]" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white font-mono">#{block.number.toLocaleString('en-US')}</span>
          <span className="text-[10px] text-gray-400 font-mono">{shortHash}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-gray-500 font-mono">{formatTime(block.timestamp)}</div>
        <div className="text-xs font-mono text-[#3B82F6]">{block.txCount} txs</div>
      </div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 text-[#00D9A5] animate-spin" />
      <span className="ml-2 text-sm text-gray-400">Connecting to Mantle...</span>
    </div>
  );
}

export default function Home() {
  const { blocks, stats, isLoading, error } = useMantle(3000);
  const { blockTime, isCalculating } = useRealBlockTime();
  const { peakTps, peakTimestamp, updatePeak } = usePersistentPeakTPS();

  // Update peak TPS whenever current TPS changes
  useEffect(() => {
    if (stats.tps > 0) {
      updatePeak(stats.tps);
    }
  }, [stats.tps, updatePeak]);

  // Format block time for display
  const formatBlockTime = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}`;
    }
    return `${ms}`;
  };

  // Format peak timestamp
  const formatPeakTime = (timestamp: number) => {
    if (!timestamp) return 'Session';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a12] text-white selection:bg-[#00D9A5]/30 overflow-hidden">
      
      {/* 1. LAYER: Background Starfield */}
      <StarField />
      
      {/* 2. LAYER: Particles Effect */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <Particles
          particleColors={['#ffffff', '#ffffff', '#00D9A5']}
          particleCount={400}
          particleSpread={25}
          speed={0.1}
          particleBaseSize={150}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
          cameraDistance={18}
          sizeRandomness={1.5}
        />
      </div>
      
      {/* 3. LAYER: Globe */}
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        <div className="w-full h-full -translate-y-30">
          <Globe />
        </div>
      </div>

      {/* 4. LAYER: UI Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        <div className="pointer-events-auto">
          <Header />
        </div>
        
        {/* Spacer for Globe visibility */}
        <div className="flex-1 min-h-[45vh]"></div>

        {/* Floating Info Pills */}
        <div className="container mx-auto px-6 mb-3 flex items-center justify-between pointer-events-none">
           <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="pointer-events-auto glass-panel rounded-full px-5 py-2 flex items-center gap-3 border border-[#00D9A5]/20 bg-black/40 backdrop-blur-xl"
          >
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Block</span>
              <motion.span 
                key={stats.blockNumber}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-mono font-bold text-white"
              >
                #{stats.blockNumber.toLocaleString('en-US')}
              </motion.span>
            </div>
            <div className="h-7 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <img 
                src="/mantle-logo.png" 
                alt="Mantle" 
                className="w-7 h-7 rounded-full object-contain"
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold">Mantle L2</span>
                <span className="text-[9px] text-gray-400">Sequencer</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
             initial={{ x: 50, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="pointer-events-auto glass-panel rounded-full px-5 py-2 flex items-center gap-4 border border-white/5 bg-black/40 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-gray-500 uppercase">Chain ID</span>
              <span className="text-xs font-bold font-mono">5000</span>
            </div>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-gray-500 uppercase">Network</span>
              <span className="text-xs font-bold font-mono">Mainnet</span>
            </div>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-gray-500 uppercase">Status</span>
              <span className="text-xs font-bold font-mono text-green-400">● Live</span>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Grid */}
        <div className="container mx-auto px-6 pb-4 pointer-events-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            
            {/* Row 1: Block History Chart (REAL DATA) + Recent Blocks */}
            <BlockHistoryChart />
            
            <div className="glass-panel rounded-xl p-3 col-span-2 h-[180px]">
               <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Blocks</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                  <span className="text-[10px] text-[#8B5CF6] font-bold">Live from Mantle</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                {isLoading ? (
                  <LoadingState />
                ) : error ? (
                  <div className="text-center py-4 text-red-400 text-sm">{error}</div>
                ) : (
                  blocks.map((b, i) => <RecentBlockRow key={b.number} block={b} index={i} />)
                )}
              </div>
            </div>

            {/* Row 2: Recent Transactions */}
            <RecentTransactions />
            
            {/* Row 2 continued: Live Charts */}
            <TPSChart />
            <GasPriceChart />

            {/* Row 3: Stats Cards */}
            <StatsCard 
              title="TPS" 
              value={isLoading ? "..." : stats.tps.toString()} 
              unit="Live (3s)" 
              icon={<Activity />} 
              sparkline 
            />
            <StatsCard 
              title="Peak TPS" 
              value={peakTps > 0 ? peakTps.toString() : (isLoading ? "..." : stats.peakTps.toString())} 
              unit={formatPeakTime(peakTimestamp)} 
              icon={<TrendingUp />} 
            />
            
            {/* Gas Info Panel - REAL dynamic progress bars */}
            <div className="glass-panel rounded-xl p-3 col-span-2 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-gray-500 uppercase mb-1 flex justify-between">
                  <span>Base Fee</span>
                  <span>Live</span>
                </div>
                <motion.div 
                  key={stats.baseFee}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-mono font-bold"
                >
                  {isLoading ? "..." : parseFloat(stats.baseFee).toFixed(4)} 
                  <span className="text-xs text-gray-500 font-sans ml-1">Gwei</span>
                </motion.div>
                <div className="h-1 w-full bg-[#00D9A5]/20 mt-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#00D9A5]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(5, parseFloat(stats.baseFee || '0') * 100))}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div className="border-l border-white/10 pl-4">
                <div className="text-[10px] text-gray-500 uppercase mb-1 flex justify-between">
                  <span>Gas Price</span>
                  <span>Live</span>
                </div>
                <motion.div 
                  key={stats.gasPrice}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-mono font-bold text-[#3B82F6]"
                >
                  {isLoading ? "..." : parseFloat(stats.gasPrice).toFixed(4)} 
                  <span className="text-xs text-gray-500 font-sans ml-1">Gwei</span>
                </motion.div>
                <div className="h-1 w-full bg-[#3B82F6]/20 mt-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#3B82F6]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(5, parseFloat(stats.gasPrice || '0') * 100))}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Row 4: TVL Panel + Network Stats Grid */}
            <TVLPanel />

            {/* 2x2 Grid for Block Time, Latest Block, Gas Token, Layer */}
            <div className="glass-panel rounded-xl p-3 col-span-2 grid grid-cols-2 gap-2">
              {/* Block Time */}
              <div className="bg-white/5 rounded-lg p-3 flex flex-col justify-center items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[10px] text-gray-500 uppercase">Block Time</span>
                </div>
                <span className="text-xl font-mono font-bold text-white">
                  {isCalculating ? "..." : formatBlockTime(blockTime)}
                </span>
                <span className="text-[9px] text-gray-500">sec</span>
              </div>

              {/* Latest Block */}
              <div className="bg-white/5 rounded-lg p-3 flex flex-col justify-center items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <Blocks className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[10px] text-gray-500 uppercase">Latest Block</span>
                </div>
                <span className="text-xl font-mono font-bold text-white">
                  {isLoading ? "..." : blocks[0]?.txCount.toString() || "0"}
                </span>
                <span className="text-[9px] text-gray-500">txs</span>
              </div>

              {/* Gas Token */}
              <div className="bg-white/5 rounded-lg p-3 flex flex-col justify-center items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <Fuel className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[10px] text-gray-500 uppercase">Gas Token</span>
                </div>
                <span className="text-xl font-mono font-bold text-[#00D9A5]">MNT</span>
                <span className="text-[9px] text-gray-500">Native</span>
              </div>

              {/* Layer */}
              <div className="bg-white/5 rounded-lg p-3 flex flex-col justify-center items-center">
                <span className="text-[10px] text-gray-500 uppercase mb-1">Layer</span>
                <span className="text-xl font-mono font-bold text-[#3B82F6]">L2</span>
                <span className="text-[9px] text-gray-500">Ethereum Rollup</span>
              </div>
            </div>

            {/* Row 5: AI Network Insights */}
            <div className="col-span-4">
              <NetworkInsights 
                tps={stats.tps}
                gasPrice={stats.gasPrice}
                blockTime={blockTime}
                peakTps={peakTps > 0 ? peakTps : stats.peakTps}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}