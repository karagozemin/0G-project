"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  getZeroGTVL, 
  getZeroGProtocols, 
  getZeroGTVLHistory,
  type TVLData, 
  type ProtocolData 
} from '@/lib/defillama';

// Hook for 0G TVL data
export function useZeroGTVL(refreshInterval: number = 60000) {
  const [tvlData, setTvlData] = useState<TVLData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTVL = useCallback(async () => {
    try {
      const data = await getZeroGTVL();
      setTvlData(data);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch TVL');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTVL();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchTVL, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchTVL, refreshInterval]);

  return { tvlData, isLoading, error, refetch: fetchTVL };
}

// Hook for top protocols
export function useZeroGProtocols(limit: number = 5, refreshInterval: number = 120000) {
  const [protocols, setProtocols] = useState<ProtocolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProtocols = useCallback(async () => {
    try {
      const data = await getZeroGProtocols(limit);
      setProtocols(data);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch protocols');
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProtocols();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchProtocols, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchProtocols, refreshInterval]);

  return { protocols, isLoading, error, refetch: fetchProtocols };
}

// Hook for TVL history (for charts)
export function useTVLHistory() {
  const [history, setHistory] = useState<{ date: number; tvl: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getZeroGTVLHistory();
        setHistory(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching TVL history:', err);
        setIsLoading(false);
      }
    };

    fetchHistory();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHistory, 300000);
    return () => clearInterval(interval);
  }, []);

  return { history, isLoading };
}
