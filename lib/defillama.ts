// DeFiLlama API for Mantle TVL and protocol data

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

// Get Mantle chain TVL with rank
export async function getMantleTVL(): Promise<TVLData | null> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE}/v2/chains`);
    const chains = await response.json();
    
    // Sort chains by TVL to get rank
    const sortedChains = [...chains].sort((a: any, b: any) => (b.tvl || 0) - (a.tvl || 0));
    
    const mantleIndex = sortedChains.findIndex((c: any) => 
      c.name.toLowerCase() === 'mantle' || c.gecko_id === 'mantle'
    );
    
    const mantle = sortedChains[mantleIndex];
    
    if (mantle) {
      return {
        tvl: mantle.tvl || 0,
        change24h: mantle.change_1d || 0,
        protocols: mantle.protocols || 0,
        rank: mantleIndex + 1, // 1-indexed rank
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching Mantle TVL:', error);
    return null;
  }
}

// Get top protocols on Mantle
export async function getMantleProtocols(limit: number = 10): Promise<ProtocolData[]> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE}/protocols`);
    const protocols = await response.json();
    
    // Filter protocols that are on Mantle chain
    const mantleProtocols = protocols
      .filter((p: any) => p.chains?.includes('Mantle'))
      .sort((a: any, b: any) => (b.tvl || 0) - (a.tvl || 0))
      .slice(0, limit)
      .map((p: any) => ({
        name: p.name,
        tvl: p.tvl || 0,
        logo: p.logo,
        category: p.category || 'Unknown',
        change24h: p.change_1d || 0,
      }));
    
    return mantleProtocols;
  } catch (error) {
    console.error('Error fetching Mantle protocols:', error);
    return [];
  }
}

// Get Mantle historical TVL
export async function getMantleTVLHistory(): Promise<{ date: number; tvl: number }[]> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE}/v2/historicalChainTvl/Mantle`);
    const data = await response.json();
    
    // Return last 30 days
    return data.slice(-30).map((d: any) => ({
      date: d.date * 1000,
      tvl: d.tvl,
    }));
  } catch (error) {
    console.error('Error fetching Mantle TVL history:', error);
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
