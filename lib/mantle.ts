import { createPublicClient, http, formatEther, formatGwei, webSocket } from 'viem';
import { mantle } from 'viem/chains';

// Mantle Mainnet Public Client
export const mantleClient = createPublicClient({
  chain: mantle,
  transport: http('https://rpc.mantle.xyz'),
});

// WebSocket Client for real-time subscriptions
export const mantleWsClient = createPublicClient({
  chain: mantle,
  transport: webSocket('wss://ws.mantle.xyz'),
});

// Types
export interface BlockData {
  number: bigint;
  hash: string;
  timestamp: bigint;
  transactions: string[] | object[];
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas?: bigint;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string | null;
  value: bigint;
  gasPrice?: bigint;
  gas: bigint;
  input: string;
  blockNumber: bigint;
  blockHash: string;
  transactionIndex: number;
  timestamp?: number;
}

export interface NetworkStats {
  blockNumber: number;
  gasPrice: string;
  baseFee: string;
  blockTime: number;
  tps: number;
}

// Get latest block number
export async function getBlockNumber(): Promise<number> {
  const blockNumber = await mantleClient.getBlockNumber();
  return Number(blockNumber);
}

// Get block by number
export async function getBlock(blockNumber?: bigint): Promise<BlockData | null> {
  try {
    const block = await mantleClient.getBlock({
      blockNumber,
      includeTransactions: false,
    });
    return block as BlockData;
  } catch (error) {
    console.error('Error fetching block:', error);
    return null;
  }
}

// Get latest blocks
export async function getLatestBlocks(count: number = 5): Promise<BlockData[]> {
  const latestBlockNumber = await mantleClient.getBlockNumber();
  const blocks: BlockData[] = [];

  for (let i = 0; i < count; i++) {
    const blockNumber = latestBlockNumber - BigInt(i);
    const block = await getBlock(blockNumber);
    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
}

// Get current gas price
export async function getGasPrice(): Promise<string> {
  const gasPrice = await mantleClient.getGasPrice();
  return formatGwei(gasPrice);
}

// Get network stats
export async function getNetworkStats(): Promise<NetworkStats> {
  const [blockNumber, gasPrice, block] = await Promise.all([
    mantleClient.getBlockNumber(),
    mantleClient.getGasPrice(),
    mantleClient.getBlock(),
  ]);

  // Calculate approximate TPS from latest block
  const txCount = Array.isArray(block.transactions) ? block.transactions.length : 0;
  // Mantle has ~2 second block time
  const tps = Math.round(txCount / 2);

  return {
    blockNumber: Number(blockNumber),
    gasPrice: formatGwei(gasPrice),
    baseFee: block.baseFeePerGas ? formatGwei(block.baseFeePerGas) : '0',
    blockTime: 2000, // Mantle ~2s block time
    tps,
  };
}

// Get transaction count for a block
export async function getBlockTransactionCount(blockNumber: bigint): Promise<number> {
  const count = await mantleClient.getBlockTransactionCount({
    blockNumber,
  });
  return count;
}

// Format block for display
export function formatBlockForDisplay(block: BlockData) {
  return {
    number: Number(block.number),
    hash: block.hash,
    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
    txCount: Array.isArray(block.transactions) ? block.transactions.length : 0,
    gasUsed: formatEther(block.gasUsed),
    gasLimit: formatEther(block.gasLimit),
  };
}

// Get latest transactions from recent blocks
export async function getLatestTransactions(count: number = 10): Promise<TransactionData[]> {
  try {
    const block = await mantleClient.getBlock({
      includeTransactions: true,
    });
    
    const transactions: TransactionData[] = [];
    const txs = block.transactions as any[];
    
    for (let i = 0; i < Math.min(count, txs.length); i++) {
      const tx = txs[i];
      if (typeof tx === 'object') {
        transactions.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gasPrice: tx.gasPrice,
          gas: tx.gas,
          input: tx.input,
          blockNumber: block.number,
          blockHash: block.hash,
          transactionIndex: tx.transactionIndex,
          timestamp: Number(block.timestamp),
        });
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

// Get transaction by hash
export async function getTransaction(hash: `0x${string}`): Promise<TransactionData | null> {
  try {
    const tx = await mantleClient.getTransaction({ hash });
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gasPrice: tx.gasPrice,
      gas: tx.gas,
      input: tx.input,
      blockNumber: tx.blockNumber!,
      blockHash: tx.blockHash!,
      transactionIndex: tx.transactionIndex!,
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

// Get transaction receipt
export async function getTransactionReceipt(hash: `0x${string}`) {
  try {
    return await mantleClient.getTransactionReceipt({ hash });
  } catch (error) {
    console.error('Error fetching transaction receipt:', error);
    return null;
  }
}

// Format transaction value to MNT
export function formatMNT(value: bigint): string {
  return formatEther(value);
}

// Truncate address
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Truncate hash
export function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

// Chain info
export const MANTLE_CHAIN_INFO = {
  id: 5000,
  name: 'Mantle',
  network: 'mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mantle.xyz'] },
    public: { http: ['https://rpc.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://explorer.mantle.xyz' },
  },
};
