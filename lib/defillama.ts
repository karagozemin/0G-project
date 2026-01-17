// DeFiLlama API for 0G TVL and protocol data
// Note: 0G may not be listed on DeFiLlama yet, this is prepared for future integration

const DEFILLAMA_BASE = 'https://api.llama.fi';

export interface TVLData {
  tvl: number;
  change24h: number;
  protocols: number;
  rank: number;
}

export interface ProtocolData {
  name: string;
  tvl: number;
  logo: string;
  category: string;
  change24h: number;
}

// Get 0G chain TVL with rank
export async function getZeroGTVL(): Promise<TVLData | null> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE}/v2/chains`);
    const chains = await response.json();
    
    // Sort chains by TVL to get rank
    const sortedChains = [...chains].sort((a: any, b: any) => (b.tvl || 0) - (a.tvl || 0));
    
    // Try to find 0G chain (may be listed as '0G', '0g', 'ZeroG', etc.)
    const zeroGIndex = sortedChains.findIndex((c: any) => 
      c.name.toLowerCase() === '0g' || 
      c.name.toLowerCase() === 'zerog' ||
      c.gecko_id === '0g'
    );
    
    const zeroG = sortedChains[zeroGIndex];
    
    if (zeroG) {
      return {
        tvl: zeroG.tvl || 0,
        change24h: zeroG.change_1d || 0,
        protocols: zeroG.protocols || 0,
        rank: zeroGIndex + 1, // 1-indexed rank
      };
    }
    // Return placeholder data if 0G not found on DeFiLlama
    return {
      tvl: 0,
      change24h: 0,
      protocols: 0,
      rank: 0,
    };
  } catch (error) {
    console.error('Error fetching 0G TVL:', error);
    return null;
  }
}

// Get top protocols on 0G
export async function getZeroGProtocols(limit: number = 10): Promise<ProtocolData[]> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE}/protocols`);
    const protocols = await response.json();
    
    // Filter protocols that are on 0G chain
    const zeroGProtocols = protocols
      .filter((p: any) => p.chains?.includes('0G') || p.chains?.includes('ZeroG'))
      .sort((a: any, b: any) => (b.tvl || 0) - (a.tvl || 0))
      .slice(0, limit)
      .map((p: any) => ({
        name: p.name,
        tvl: p.tvl || 0,
        logo: p.logo,
        category: p.category || 'Unknown',
        change24h: p.change_1d || 0,
      }));
    
    return zeroGProtocols;
  } catch (error) {
    console.error('Error fetching 0G protocols:', error);
    return [];
  }
}

// Get 0G historical TVL
export async function getZeroGTVLHistory(): Promise<{ date: number; tvl: number }[]> {
  try {
    // Try different possible chain names
    const response = await fetch(`${DEFILLAMA_BASE}/v2/historicalChainTvl/0G`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      // Return last 30 days
      return data.slice(-30).map((d: any) => ({
        date: d.date * 1000,
        tvl: d.tvl,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching 0G TVL history:', error);
    return [];
  }
}

// Format TVL for display
export function formatTVL(tvl: number): string {
  if (tvl >= 1_000_000_000) {
    return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
  }
  if (tvl >= 1_000_000) {
    return `$${(tvl / 1_000_000).toFixed(2)}M`;
  }
  if (tvl >= 1_000) {
    return `$${(tvl / 1_000).toFixed(2)}K`;
  }
  return `$${tvl.toFixed(2)}`;
}

// Format percentage change
export function formatChange(change: number): string {
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change.toFixed(2)}%`;
}
