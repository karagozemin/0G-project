"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, Signal, Clock } from "lucide-react";
import { useConnectionStatus } from "@/hooks/useZeroGWebSocket";

export default function ConnectionStatus() {
  const { status, latency } = useConnectionStatus();

  const statusConfig = {
    connecting: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
      icon: Signal,
      label: 'Connecting...',
    },
    connected: {
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      icon: Wifi,
      label: 'Connected',
    },
    disconnected: {
      color: 'text-red-400',
      bgColor: 'bg-red-400/20',
      icon: WifiOff,
      label: 'Disconnected',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border border-white/5`}
    >
      {status === 'connecting' ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        </motion.div>
      ) : (
        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      )}
      
      <span className={`text-[10px] font-medium ${config.color}`}>
        {config.label}
      </span>

      {status === 'connected' && latency > 0 && (
        <>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-gray-500" />
            <span className="text-[10px] text-gray-400 font-mono">{latency}ms</span>
          </div>
        </>
      )}
    </motion.div>
  );
}
