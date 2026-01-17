"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { zeroGClient, type BlockData, type TransactionData, getLatestTransactions, truncateAddress, truncateHash, format0G } from '@/lib/zerog';
import { formatGwei, formatEther } from 'viem';

// Types
export interface ZeroGBlock {
  number: number;
  hash: string;
  timestamp: number;
  txCount: number;
  gasUsed: string;
}

export interface ZeroGStats {
  blockNumber: number;
  gasPrice: string;
  baseFee: string;
  tps: number;
  peakTps: number;
}

export interface ZeroGTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  timestamp: number;
  type: 'transfer' | 'contract' | 'deploy';
}

// TPS/Gas history for charts
export interface HistoryPoint {
  timestamp: number;
  value: number;
}

// Hook for real-time 0G network data
export function useZeroG(refreshInterval: number = 3000) {
  const [blocks, setBlocks] = useState<ZeroGBlock[]>([]);
  const [stats, setStats] = useState<ZeroGStats>({
    blockNumber: 0,
    gasPrice: '0',
    baseFee: '0',
    tps: 0,
    peakTps: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track TPS history for peak calculation
  const [tpsHistory, setTpsHistory] = useState<number[]>([]);

  const fetchData = useCallback(async () => {
    try {
      // Fetch latest block number
      const blockNumber = await zeroGClient.getBlockNumber();
      
      // Fetch gas price
      const gasPrice = await zeroGClient.getGasPrice();
      
      // Fetch latest 3 blocks
      const blockPromises: Promise<BlockData | null>[] = [];
      for (let i = 0; i < 3; i++) {
        const num = blockNumber - BigInt(i);
        blockPromises.push(
          zeroGClient.getBlock({ blockNumber: num, includeTransactions: false })
            .then(b => b as BlockData)
            .catch(() => null)
        );
      }
      
      const fetchedBlocks = await Promise.all(blockPromises);
      const validBlocks = fetchedBlocks.filter((b): b is BlockData => b !== null);
      
      // Get event logs from last 50 blocks to count transactions per block
      const fromBlock = blockNumber - 50n;
      let blockTxMap = new Map<number, number>();
      try {
        const logs = await zeroGClient.getLogs({
          fromBlock,
          toBlock: 'latest',
        });
        
        // Count unique transactions per block
        const tempMap = new Map<number, Set<string>>();
        for (const log of logs) {
          const blockNum = Number(log.blockNumber);
          if (!tempMap.has(blockNum)) {
            tempMap.set(blockNum, new Set());
          }
          if (log.transactionHash) {
            tempMap.get(blockNum)!.add(log.transactionHash);
          }
        }
        blockTxMap = new Map([...tempMap.entries()].map(([k, v]) => [k, v.size]));
      } catch (e) {
        console.error('Error fetching logs:', e);
      }
      
      // Format blocks for display with tx count from logs
      const formattedBlocks: ZeroGBlock[] = validBlocks.map(block => ({
        number: Number(block.number),
        hash: block.hash,
        timestamp: Number(block.timestamp),
        txCount: blockTxMap.get(Number(block.number)) || 0,
        gasUsed: (Number(block.gasUsed) / 1e9).toFixed(2),
      }));

      setBlocks(formattedBlocks);

      // Calculate TPS from recent logs
      const recentTxCounts = Array.from(blockTxMap.values());
      const totalRecentTx = recentTxCounts.reduce((sum, count) => sum + count, 0);
      const currentTps = recentTxCounts.length > 0 
        ? Math.round((totalRecentTx / Math.max(recentTxCounts.length * 2, 1)) * 10) / 10
        : 0;

      // Update TPS history and calculate peak
      setTpsHistory(prev => {
        const newHistory = [...prev, currentTps].slice(-100); // Keep last 100 readings
        return newHistory;
      });

      const peakTps = Math.max(...tpsHistory, currentTps, 1);

      // Get base fee from latest block
      const latestBlock = validBlocks[0];
      const baseFee = latestBlock?.baseFeePerGas 
        ? formatGwei(latestBlock.baseFeePerGas) 
        : '0';

      setStats({
        blockNumber: Number(blockNumber),
        gasPrice: formatGwei(gasPrice),
        baseFee,
        tps: currentTps,
        peakTps,
      });

      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching 0G data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setIsLoading(false);
    }
  }, [tpsHistory]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Polling interval
  useEffect(() => {
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    blocks,
    stats,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Hook for just block number (lightweight)
export function useBlockNumber(refreshInterval: number = 2000) {
  const [blockNumber, setBlockNumber] = useState<number>(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const num = await zeroGClient.getBlockNumber();
        setBlockNumber(Number(num));
      } catch (err) {
        console.error('Error fetching block number:', err);
      }
    };

    fetch();
    const interval = setInterval(fetch, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return blockNumber;
}

// Hook for gas price only
export function useGasPrice(refreshInterval: number = 5000) {
  const [gasPrice, setGasPrice] = useState<string>('0');

  useEffect(() => {
    const fetch = async () => {
      try {
        const price = await zeroGClient.getGasPrice();
        setGasPrice(formatGwei(price));
      } catch (err) {
        console.error('Error fetching gas price:', err);
      }
    };

    fetch();
    const interval = setInterval(fetch, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return gasPrice;
}

// Hook for recent transactions
export function useTransactions(refreshInterval: number = 5000) {
  const [transactions, setTransactions] = useState<ZeroGTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const txs = await getLatestTransactions(10);
      
      const formatted: ZeroGTransaction[] = txs.map(tx => {
        // Determine transaction type
        let type: 'transfer' | 'contract' | 'deploy' = 'transfer';
        if (!tx.to) {
          type = 'deploy';
        } else if (tx.input && tx.input !== '0x') {
          type = 'contract';
        }
        
        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: formatEther(tx.value),
          timestamp: tx.timestamp || Math.floor(Date.now() / 1000),
          type,
        };
      });
      
      setTransactions(formatted);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchTransactions, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchTransactions, refreshInterval]);

  return { transactions, isLoading, error, refetch: fetchTransactions };
}

// Hook for TPS history (for charts) - uses event logs
export function useTPSHistory(maxPoints: number = 30) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const lastBlockRef = useRef<number>(0);

  useEffect(() => {
    const fetchTPS = async () => {
      try {
        const latestBlockNumber = await zeroGClient.getBlockNumber();
        const blockNum = Number(latestBlockNumber);
        
        // Only add new point if block changed
        if (blockNum !== lastBlockRef.current) {
          lastBlockRef.current = blockNum;
          
          // Get logs from last 10 blocks to calculate TPS
          const fromBlock = latestBlockNumber - 10n;
          const logs = await zeroGClient.getLogs({
            fromBlock,
            toBlock: 'latest',
          });
          
          // Count unique transactions
          const uniqueTxs = new Set(logs.map(log => log.transactionHash));
          const txCount = uniqueTxs.size;
          
          // Get block time span
          const [latestBlock, olderBlock] = await Promise.all([
            zeroGClient.getBlock({ blockNumber: latestBlockNumber }),
            zeroGClient.getBlock({ blockNumber: fromBlock }),
          ]);
          
          const timeSpan = Number(latestBlock.timestamp) - Number(olderBlock.timestamp);
          const tps = timeSpan > 0 ? Math.round((txCount / timeSpan) * 10) / 10 : 0;
          
          setHistory(prev => {
            const newPoint = { timestamp: Date.now(), value: tps };
            return [...prev, newPoint].slice(-maxPoints);
          });
        }
      } catch (err) {
        console.error('Error fetching TPS:', err);
      }
    };

    fetchTPS();
    const interval = setInterval(fetchTPS, 2000);
    return () => clearInterval(interval);
  }, [maxPoints]);

  return history;
}

// Hook for Gas Price history (for charts)
export function useGasPriceHistory(maxPoints: number = 30) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    const fetchGas = async () => {
      try {
        const gasPrice = await zeroGClient.getGasPrice();
        const gweiValue = Number(formatGwei(gasPrice));
        
        setHistory(prev => {
          const newPoint = { timestamp: Date.now(), value: gweiValue };
          return [...prev, newPoint].slice(-maxPoints);
        });
      } catch (err) {
        console.error('Error fetching gas price:', err);
      }
    };

    fetchGas();
    const interval = setInterval(fetchGas, 5000);
    return () => clearInterval(interval);
  }, [maxPoints]);

  return history;
}

// Block history data for bar chart
export interface BlockHistoryItem {
  blockNumber: number;
  txCount: number;
  timestamp: number;
}

// Hook for Block History (last N blocks with tx counts from event logs)
export function useBlockHistory(blockCount: number = 45) {
  const [history, setHistory] = useState<BlockHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxTxCount, setMaxTxCount] = useState(1);
  const lastFetchedBlock = useRef<number>(0);

  useEffect(() => {
    const fetchBlockHistory = async () => {
      try {
        const latestBlockNumber = await zeroGClient.getBlockNumber();
        const latestNum = Number(latestBlockNumber);
        
        // Only fetch new blocks
        if (lastFetchedBlock.current === latestNum) return;
        
        // Calculate from block (look back enough to cover blockCount blocks)
        const fromBlock = latestBlockNumber - BigInt(blockCount);
        
        // Get event logs to count transactions per block
        const logs = await zeroGClient.getLogs({
          fromBlock,
          toBlock: 'latest',
        });
        
        // Count unique transactions per block
        const blockTxMap = new Map<number, Set<string>>();
        
        for (const log of logs) {
          const blockNum = Number(log.blockNumber);
          if (!blockTxMap.has(blockNum)) {
            blockTxMap.set(blockNum, new Set());
          }
          if (log.transactionHash) {
            blockTxMap.get(blockNum)!.add(log.transactionHash);
          }
        }
        
        // Fetch block timestamps in batches
        const blocks: BlockHistoryItem[] = [];
        const batchSize = 15;
        
        for (let i = 0; i < blockCount; i += batchSize) {
          const batchPromises = [];
          for (let j = i; j < Math.min(i + batchSize, blockCount); j++) {
            const blockNum = latestBlockNumber - BigInt(j);
            const blockNumInt = Number(blockNum);
            batchPromises.push(
              zeroGClient.getBlock({ blockNumber: blockNum, includeTransactions: false })
                .then(block => ({
                  blockNumber: Number(block.number),
                  txCount: blockTxMap.get(blockNumInt)?.size || 0,
                  timestamp: Number(block.timestamp),
                }))
                .catch(() => null)
            );
          }
          const batchResults = await Promise.all(batchPromises);
          blocks.push(...batchResults.filter((b): b is BlockHistoryItem => b !== null));
        }
        
        // Sort by block number (oldest first for chart)
        blocks.sort((a, b) => a.blockNumber - b.blockNumber);
        
        setHistory(blocks);
        setMaxTxCount(Math.max(...blocks.map(b => b.txCount), 1));
        lastFetchedBlock.current = latestNum;
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching block history:', err);
        setIsLoading(false);
      }
    };

    fetchBlockHistory();
    const interval = setInterval(fetchBlockHistory, 5000);
    return () => clearInterval(interval);
  }, [blockCount]);

  return { history, isLoading, maxTxCount };
}

// Hook for real block time calculation
export function useRealBlockTime() {
  const [blockTime, setBlockTime] = useState<number>(2000); // Default 2s
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    const calculateBlockTime = async () => {
      try {
        const latestBlockNumber = await zeroGClient.getBlockNumber();
        
        // Get last 10 blocks to calculate average
        const blocks = await Promise.all([
          zeroGClient.getBlock({ blockNumber: latestBlockNumber }),
          zeroGClient.getBlock({ blockNumber: latestBlockNumber - 10n }),
        ]);
        
        const latestTimestamp = Number(blocks[0].timestamp);
        const olderTimestamp = Number(blocks[1].timestamp);
        
        // Calculate average block time in ms
        const avgBlockTime = ((latestTimestamp - olderTimestamp) / 10) * 1000;
        
        setBlockTime(Math.round(avgBlockTime));
        setIsCalculating(false);
      } catch (err) {
        console.error('Error calculating block time:', err);
        setIsCalculating(false);
      }
    };

    calculateBlockTime();
    const interval = setInterval(calculateBlockTime, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  return { blockTime, isCalculating };
}

// Hook for persistent Peak TPS (stored in localStorage)
const PEAK_TPS_KEY = 'zerix_peak_tps';
const PEAK_TPS_TIMESTAMP_KEY = 'zerix_peak_tps_timestamp';

export function usePersistentPeakTPS() {
  const [peakTps, setPeakTps] = useState<number>(0);
  const [peakTimestamp, setPeakTimestamp] = useState<number>(0);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PEAK_TPS_KEY);
      const storedTimestamp = localStorage.getItem(PEAK_TPS_TIMESTAMP_KEY);
      
      if (stored) {
        setPeakTps(parseInt(stored, 10));
      }
      if (storedTimestamp) {
        setPeakTimestamp(parseInt(storedTimestamp, 10));
      }
    }
  }, []);

  // Function to update peak if current TPS is higher
  const updatePeak = useCallback((currentTps: number) => {
    if (currentTps > peakTps) {
      setPeakTps(currentTps);
      setPeakTimestamp(Date.now());
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(PEAK_TPS_KEY, currentTps.toString());
        localStorage.setItem(PEAK_TPS_TIMESTAMP_KEY, Date.now().toString());
      }
    }
  }, [peakTps]);

  // Reset peak
  const resetPeak = useCallback(() => {
    setPeakTps(0);
    setPeakTimestamp(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PEAK_TPS_KEY);
      localStorage.removeItem(PEAK_TPS_TIMESTAMP_KEY);
    }
  }, []);

  return { peakTps, peakTimestamp, updatePeak, resetPeak };
}
