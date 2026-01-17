import { createPublicClient, http, formatEther, formatGwei, type Chain } from 'viem';

// 0G Mainnet Chain Definition
export const zeroGMainnet: Chain = {
  id: 16661,
  name: '0G Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
    public: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan.0g.ai' },
  },
};

// 0G Mainnet Public Client
export const zeroGClient = createPublicClient({
  chain: zeroGMainnet,
  transport: http('https://evmrpc.0g.ai'),
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
  const blockNumber = await zeroGClient.getBlockNumber();
  return Number(blockNumber);
}

// Get block by number
export async function getBlock(blockNumber?: bigint): Promise<BlockData | null> {
  try {
    const block = await zeroGClient.getBlock({
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
  const latestBlockNumber = await zeroGClient.getBlockNumber();
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
  const gasPrice = await zeroGClient.getGasPrice();
  return formatGwei(gasPrice);
}

// Get network stats
export async function getNetworkStats(): Promise<NetworkStats> {
  const [blockNumber, gasPrice, block] = await Promise.all([
    zeroGClient.getBlockNumber(),
    zeroGClient.getGasPrice(),
    zeroGClient.getBlock(),
  ]);

  // Calculate approximate TPS from latest block
  const txCount = Array.isArray(block.transactions) ? block.transactions.length : 0;
  // 0G block time - will be calculated dynamically
  const tps = Math.round(txCount / 2);

  return {
    blockNumber: Number(blockNumber),
    gasPrice: formatGwei(gasPrice),
    baseFee: block.baseFeePerGas ? formatGwei(block.baseFeePerGas) : '0',
    blockTime: 2000, // Default, will be calculated dynamically
    tps,
  };
}

// Get transaction count for a block
export async function getBlockTransactionCount(blockNumber: bigint): Promise<number> {
  const count = await zeroGClient.getBlockTransactionCount({
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

// 0G Storage Contract Addresses (for event filtering)
const ZEROG_CONTRACTS = {
  flow: '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526' as const,
  mine: '0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe' as const,
  reward: '0x457aC76B58ffcDc118AABD6DbC63ff9072880870' as const,
  staking: '0xc545f6ee41cee5a0e07d12033dc037a08073f626' as const,
};

// Get latest transactions using eth_getLogs (0G uses event-based transaction tracking)
export async function getLatestTransactions(count: number = 10): Promise<TransactionData[]> {
  try {
    const latestBlock = await zeroGClient.getBlockNumber();
    const fromBlock = latestBlock - BigInt(500); // Look back ~500 blocks to avoid 10k log limit
    
    // Fetch logs from all contracts
    const logs = await zeroGClient.getLogs({
      fromBlock,
      toBlock: 'latest',
    });
    
    if (logs.length === 0) {
      return [];
    }
    
    // Get unique transaction hashes (most recent first)
    const uniqueTxHashes = [...new Set(logs.map(log => log.transactionHash).filter(Boolean))].reverse();
    const transactions: TransactionData[] = [];
    
    // Fetch transaction details in parallel (batch of 5)
    const batchSize = 5;
    for (let i = 0; i < Math.min(count, uniqueTxHashes.length); i += batchSize) {
      const batch = uniqueTxHashes.slice(i, Math.min(i + batchSize, Math.min(count, uniqueTxHashes.length)));
      
      const txPromises = batch.map(async (txHash): Promise<TransactionData | null> => {
        if (!txHash) return null;
        try {
          const tx = await zeroGClient.getTransaction({ hash: txHash });
          const block = await zeroGClient.getBlock({ blockNumber: tx.blockNumber! });
          
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
            timestamp: Number(block.timestamp),
          } as TransactionData;
        } catch (err) {
          console.error('Error fetching tx details:', err);
          return null;
        }
      });
      
      const results = await Promise.all(txPromises);
      const validResults = results.filter((tx): tx is TransactionData => tx !== null);
      transactions.push(...validResults);
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
    const tx = await zeroGClient.getTransaction({ hash });
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
    return await zeroGClient.getTransactionReceipt({ hash });
  } catch (error) {
    console.error('Error fetching transaction receipt:', error);
    return null;
  }
}

// Format transaction value to 0G
export function format0G(value: bigint): string {
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
export const ZEROG_CHAIN_INFO = {
  id: 16661,
  name: '0G Mainnet',
  network: '0g',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
    public: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan.0g.ai' },
  },
  contracts: {
    storage: {
      flow: '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526',
      mine: '0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe',
      reward: '0x457aC76B58ffcDc118AABD6DbC63ff9072880870',
    },
  },
};
