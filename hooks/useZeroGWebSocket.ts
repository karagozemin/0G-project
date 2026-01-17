"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatGwei, formatEther } from 'viem';
import type { ZeroGBlock } from './useZeroG';

// RPC URL for 0G (WebSocket not available, using HTTP polling)
const RPC_URL = 'https://evmrpc.0g.ai';

interface BlockHeader {
  number: string;
  hash: string;
  timestamp: string;
  gasUsed: string;
  baseFeePerGas?: string;
  transactions?: string[];
}

interface PendingTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
}

// Hook for real-time block subscription via HTTP polling (0G doesn't have WebSocket)
export function useBlockSubscription() {
  const [latestBlock, setLatestBlock] = useState<ZeroGBlock | null>(null);
  const [blocks, setBlocks] = useState<ZeroGBlock[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastBlockNumber = useRef<number>(0);

  const fetchLatestBlock = useCallback(async () => {
    try {
      // Get latest block number
      const blockNumResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_blockNumber',
          params: []
        })
      });

      const blockNumData = await blockNumResponse.json();
      const blockNumber = parseInt(blockNumData.result, 16);

      // Only fetch if new block
      if (blockNumber === lastBlockNumber.current) {
        return;
      }

      // Get block details
      const blockResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_getBlockByNumber',
          params: [blockNumData.result, false]
        })
      });

      const blockData = await blockResponse.json();
      
      if (blockData.result) {
        const header: BlockHeader = blockData.result;
        
        const newBlock: ZeroGBlock = {
          number: parseInt(header.number, 16),
          hash: header.hash,
          timestamp: parseInt(header.timestamp, 16),
          txCount: header.transactions?.length || 0,
          gasUsed: (parseInt(header.gasUsed, 16) / 1e9).toFixed(2),
        };

        lastBlockNumber.current = newBlock.number;
        setLatestBlock(newBlock);
        setBlocks(prev => [newBlock, ...prev].slice(0, 10));
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching block:', err);
      setError('Failed to fetch latest block');
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    console.log('Polling connected to 0G Network');
    fetchLatestBlock();
    
    // Poll every 2 seconds
    const interval = setInterval(fetchLatestBlock, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, [fetchLatestBlock]);

  return {
    latestBlock,
    blocks,
    isConnected,
    error,
    reconnect: fetchLatestBlock,
  };
}

// Hook for pending transactions (simplified for HTTP-only)
export function usePendingTransactions() {
  const [pendingTxs, setPendingTxs] = useState<PendingTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 0G doesn't expose pending transactions via public RPC
    // This is a placeholder for future implementation
    setIsConnected(true);
    
    return () => {
      setIsConnected(false);
    };
  }, []);

  return { pendingTxs, isConnected };
}

// Connection status component hook
export function useConnectionStatus() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const checkConnection = async () => {
      const start = Date.now();
      try {
        const response = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_blockNumber',
            params: []
          })
        });
        
        if (response.ok) {
          setStatus('connected');
          setLatency(Date.now() - start);
        } else {
          setStatus('disconnected');
        }
      } catch {
        setStatus('disconnected');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  return { status, latency };
}
