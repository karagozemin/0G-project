import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Server-side cache to prevent excessive API calls
let cachedInsight: { insight: string; timestamp: number; source: string } | null = null;
const CACHE_DURATION = 45000; // 45 seconds cache

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 10000; // Minimum 10 seconds between requests

export async function POST(request: Request) {
  try {
    const { tps, gasPrice, blockTime, tvl, peakTps } = await request.json();
    const now = Date.now();

    // Check cache first - return cached insight if still valid
    if (cachedInsight && (now - cachedInsight.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        insight: cachedInsight.insight,
        source: cachedInsight.source,
        cached: true
      });
    }

    // Rate limiting - if too soon, return fallback
    if ((now - lastRequestTime) < MIN_REQUEST_INTERVAL) {
      return NextResponse.json({
        insight: generateFallbackInsight(tps, gasPrice, blockTime),
        source: 'rate-limited',
        cached: false
      });
    }

    // If no API key, return rule-based fallback
    if (!process.env.GROQ_API_KEY) {
      const insight = generateFallbackInsight(tps, gasPrice, blockTime);
      cachedInsight = { insight, timestamp: now, source: 'rule-based' };
      return NextResponse.json({
        insight,
        source: 'rule-based'
      });
    }

    // Update last request time
    lastRequestTime = now;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const prompt = `You are an AI analyst for Mantle Network (Ethereum L2). Analyze these real-time metrics and provide ONE brief, actionable insight (max 100 chars):

Network Metrics:
- Current TPS: ${tps} transactions/second
- Peak TPS: ${peakTps}
- Gas Price: ${gasPrice} Gwei
- Block Time: ${(blockTime / 1000).toFixed(1)} seconds
- Total Value Locked: $${tvl}M

Consider:
1. Network congestion level
2. Transaction cost efficiency  
3. Best time for transactions
4. Any anomalies or notable patterns

Respond with ONLY the insight text, no quotes or explanation. Be specific and actionable.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a blockchain network analyst. Give brief, technical insights about network conditions. Be concise and actionable.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 60,
      temperature: 0.7,
    });

    const insight = completion.choices[0]?.message?.content?.trim() || 
      generateFallbackInsight(tps, gasPrice, blockTime);

    // Cache the result
    cachedInsight = { insight, timestamp: now, source: 'groq' };

    return NextResponse.json({
      insight,
      source: 'groq',
      model: 'llama-3.1-8b-instant',
      cached: false
    });

  } catch (error) {
    console.error('AI Insight Error:', error);
    
    // Return fallback on error
    const fallbackInsight = 'Network operating normally. Mantle L2 ready for transactions.';
    
    // Cache error fallback too
    cachedInsight = { insight: fallbackInsight, timestamp: Date.now(), source: 'fallback' };
    
    return NextResponse.json({
      insight: fallbackInsight,
      source: 'fallback',
      error: true
    });
  }
}

function generateFallbackInsight(tps: number, gasPrice: string, blockTime: number): string {
  const gas = parseFloat(gasPrice);
  
  if (tps === 0 && gas < 0.05) {
    return 'Ultra-low activity detected. Optimal conditions for batch operations.';
  }
  if (tps > 5) {
    return `High throughput: ${tps} TPS. Network handling load efficiently.`;
  }
  if (gas < 0.02) {
    return `Gas at ${gas.toFixed(4)} Gwei. Excellent time for contract deployments.`;
  }
  if (blockTime < 2000) {
    return 'Fast block times. Transactions confirming quickly.';
  }
  
  return 'Network stable. Standard conditions for all transaction types.';
}
