"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Zap, AlertTriangle, CheckCircle, Activity, Fuel, Sparkles, RefreshCw } from "lucide-react";

interface NetworkInsightsProps {
  tps: number;
  gasPrice: string;
  blockTime: number;
  peakTps: number;
  tvl?: number;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'alert' | 'ai';
  icon: React.ReactNode;
  title: string;
  message: string;
  priority: number;
}

interface AIInsightResponse {
  insight: string;
  source: 'groq' | 'rule-based' | 'fallback';
  model?: string;
}

export default function NetworkInsights({ tps, gasPrice, blockTime, peakTps, tvl = 331 }: NetworkInsightsProps) {
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string>('loading');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Fetch AI insight
  const fetchAIInsight = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tps,
          gasPrice,
          blockTime,
          tvl,
          peakTps
        })
      });
      
      if (response.ok) {
        const data: AIInsightResponse = await response.json();
        setAiInsight(data.insight);
        setAiSource(data.source);
      }
    } catch (error) {
      console.error('Failed to fetch AI insight:', error);
      setAiSource('error');
    } finally {
      setIsLoadingAI(false);
    }
  }, [tps, gasPrice, blockTime, tvl, peakTps]);

  // Fetch AI insight on mount and every 60 seconds (rate-limit friendly)
  useEffect(() => {
    fetchAIInsight();
    const interval = setInterval(fetchAIInsight, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, [fetchAIInsight]);

  // Rule-based insights (always available)
  const ruleBasedInsights = useMemo(() => {
    const results: Insight[] = [];
    const gas = parseFloat(gasPrice);
    
    // TPS Analysis
    if (tps === 0) {
      results.push({
        id: 'tps-idle',
        type: 'info',
        icon: <Activity className="w-4 h-4" />,
        title: 'Network Idle',
        message: 'Very low activity detected. Excellent time for transactions.',
        priority: 1
      });
    } else if (tps >= peakTps * 0.8 && peakTps > 0) {
      results.push({
        id: 'tps-peak',
        type: 'alert',
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Near Peak Activity',
        message: `TPS at ${Math.round((tps / peakTps) * 100)}% of peak. High network usage detected.`,
        priority: 5
      });
    } else if (tps > 5) {
      results.push({
        id: 'tps-high',
        type: 'warning',
        icon: <Zap className="w-4 h-4" />,
        title: 'Elevated Activity',
        message: `Processing ${tps} transactions per second. Network is busy.`,
        priority: 3
      });
    } else if (tps >= 1) {
      results.push({
        id: 'tps-normal',
        type: 'success',
        icon: <CheckCircle className="w-4 h-4" />,
        title: 'Healthy Network',
        message: 'Normal transaction flow. Good conditions for operations.',
        priority: 2
      });
    }

    // Gas Price Analysis
    if (gas < 0.01) {
      results.push({
        id: 'gas-ultra-low',
        type: 'success',
        icon: <Fuel className="w-4 h-4" />,
        title: 'Ultra-Low Gas',
        message: 'Gas fees are extremely low. Optimal time for batch transactions.',
        priority: 4
      });
    } else if (gas < 0.05) {
      results.push({
        id: 'gas-low',
        type: 'success',
        icon: <TrendingDown className="w-4 h-4" />,
        title: 'Low Gas Fees',
        message: `Only ${gas.toFixed(4)} Gwei. Cost-effective transactions available.`,
        priority: 2
      });
    } else if (gas > 0.1) {
      results.push({
        id: 'gas-elevated',
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Elevated Gas',
        message: 'Gas prices above average. Consider waiting for lower fees.',
        priority: 3
      });
    }

    // Block Time Analysis
    if (blockTime > 0 && blockTime < 1500) {
      results.push({
        id: 'blocktime-fast',
        type: 'success',
        icon: <Zap className="w-4 h-4" />,
        title: 'Fast Finality',
        message: `${(blockTime / 1000).toFixed(1)}s block time. Quick confirmations expected.`,
        priority: 1
      });
    } else if (blockTime > 3000) {
      results.push({
        id: 'blocktime-slow',
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Slower Blocks',
        message: 'Block time elevated. Confirmations may take longer.',
        priority: 3
      });
    }

    return results.sort((a, b) => b.priority - a.priority);
  }, [tps, gasPrice, blockTime, peakTps]);

  // Combine AI insight with rule-based insights
  const allInsights = useMemo(() => {
    const insights: Insight[] = [];
    
    // Add AI insight at the top if available
    if (aiInsight) {
      insights.push({
        id: 'ai-insight',
        type: 'ai',
        icon: <Sparkles className="w-4 h-4" />,
        title: aiSource === 'groq' ? 'AI Analysis' : 'Smart Analysis',
        message: aiInsight,
        priority: 10 // Highest priority
      });
    }
    
    // Add rule-based insights
    insights.push(...ruleBasedInsights);
    
    return insights;
  }, [aiInsight, aiSource, ruleBasedInsights]);

  // Rotate through insights
  useEffect(() => {
    if (allInsights.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentInsightIndex(prev => (prev + 1) % allInsights.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [allInsights.length]);

  const currentInsight = allInsights[currentInsightIndex] || allInsights[0];

  const getTypeStyles = (type: Insight['type']) => {
    switch (type) {
      case 'ai':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          icon: 'text-purple-400',
          title: 'text-purple-400',
          glow: 'shadow-purple-500/20'
        };
      case 'success':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: 'text-emerald-400',
          title: 'text-emerald-400',
          glow: 'shadow-emerald-500/20'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: 'text-amber-400',
          title: 'text-amber-400',
          glow: 'shadow-amber-500/20'
        };
      case 'alert':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: 'text-red-400',
          title: 'text-red-400',
          glow: 'shadow-red-500/20'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: 'text-blue-400',
          title: 'text-blue-400',
          glow: 'shadow-blue-500/20'
        };
    }
  };

  if (!currentInsight) return null;

  const styles = getTypeStyles(currentInsight.type);

  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#8B5CF6]/20 rounded-lg">
            <Brain className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              AI Network Intelligence
            </span>
            <span className="text-[9px] text-gray-500">
              {aiSource === 'groq' ? '🤖 Powered by Llama 3.1' : aiSource === 'rule-based' ? '⚡ Smart Analysis' : '📊 Analyzing...'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAIInsight}
            disabled={isLoadingAI}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Refresh AI insight"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${isLoadingAI ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1">
            {allInsights.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentInsightIndex 
                    ? idx === 0 && aiInsight ? 'bg-purple-500 w-3' : 'bg-[#00D9A5] w-3' 
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentInsight.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`${styles.bg} ${styles.border} border rounded-lg p-3 shadow-lg ${styles.glow}`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${styles.bg} ${styles.icon}`}>
              {currentInsight.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${styles.title}`}>
                  {currentInsight.title}
                </span>
                {currentInsight.type === 'ai' && (
                  <span className="px-1.5 py-0.5 text-[8px] font-bold bg-purple-500/20 text-purple-400 rounded uppercase">
                    AI
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 leading-relaxed mt-0.5">
                {currentInsight.message}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
            {allInsights.length} insights • Real-time analysis
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            {aiSource === 'groq' ? 'Llama 3.1 (Groq)' : 'Heuristic Engine'}
          </span>
        </div>
      </div>
    </div>
  );
}
