"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatGwei, formatEther } from 'viem';
import type { MantleBlock } from './useMantle';

// WebSocket URL for Mantle
const WS_URL = 'wss://ws.mantle.xyz';

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

// Hook for real-time block subscription via WebSocket
export function useBlockSubscription() {
  const [latestBlock, setLatestBlock] = useState<MantleBlock | null>(null);
  const [blocks, setBlocks] = useState<MantleBlock[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Clean up any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to Mantle');
        setIsConnected(true);
        setError(null);

        // Subscribe to new block headers
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_subscribe',
          params: ['newHeads']
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle subscription confirmation
          if (data.id === 1 && data.result) {
            console.log('Subscribed to newHeads:', data.result);
            return;
          }

          // Handle new block headers
          if (data.method === 'eth_subscription' && data.params?.result) {
            const header: BlockHeader = data.params.result;
            
            const newBlock: MantleBlock = {
              number: parseInt(header.number, 16),
              hash: header.hash,
              timestamp: parseInt(header.timestamp, 16),
              txCount: header.transactions?.length || 0,
              gasUsed: (parseInt(header.gasUsed, 16) / 1e9).toFixed(2),
            };

            setLatestBlock(newBlock);
            setBlocks(prev => [newBlock, ...prev].slice(0, 10));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };

    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to connect to WebSocket');
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    latestBlock,
    blocks,
    isConnected,
    error,
    reconnect: connect,
  };
}

// Hook for pending transactions (mempool)
export function usePendingTransactions() {
  const [pendingTxs, setPendingTxs] = useState<PendingTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        
        // Subscribe to pending transactions
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_subscribe',
          params: ['newPendingTransactions']
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.method === 'eth_subscription' && data.params?.result) {
            // This gives us just the tx hash, we'd need to fetch full tx details
            const txHash = data.params.result;
            
            setPendingTxs(prev => {
              const newTx: PendingTransaction = {
                hash: txHash,
                from: '0x...',
                to: null,
                value: '0',
                gasPrice: '0',
              };
              return [newTx, ...prev].slice(0, 20);
            });
          }
        } catch (err) {
          console.error('Error parsing pending tx:', err);
        }
      };

      ws.onerror = () => setIsConnected(false);
      ws.onclose = () => setIsConnected(false);

    } catch (err) {
      console.error('Failed to connect for pending txs:', err);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
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
        const response = await fetch('https://rpc.mantle.xyz', {
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
