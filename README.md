<p align="center">
  <img src="public/GzSli3caYAAQ5UK.jpeg" alt="Manix Logo" width="180" style="border-radius: 50%;" />
</p>

<h1 align="center">🦉 Manix</h1>

<p align="center">
  <strong>AI-Powered Real-Time Mantle Network Explorer & Visualizer</strong>
</p>

<p align="center">
  <a href="https://mantle.xyz">
    <img src="https://img.shields.io/badge/Network-Mantle%20L2-00D9A5?style=for-the-badge&logo=ethereum" alt="Mantle Network" />
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  </a>
  <a href="https://groq.com">
    <img src="https://img.shields.io/badge/AI-Llama%203.1-8B5CF6?style=for-the-badge&logo=meta" alt="Llama 3.1" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge" alt="MIT License" />
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-ai-integration">AI Integration</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-hackathon">Hackathon</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🌟 Overview

**Manix** is a sophisticated, AI-powered real-time blockchain explorer and network visualizer for the **Mantle Network** - Ethereum's high-performance Layer 2 scaling solution. Built with modern web technologies, Manix provides an immersive experience for monitoring network activity through an interactive 3D globe, live transaction streams, AI-powered insights, and comprehensive analytics.

> **All data is 100% real** - fetched directly from Mantle RPC, DefiLlama APIs, and analyzed by Llama 3.1 AI. No mock data.

---

## 🏆 Hackathon Submission

### Mantle Global Hackathon 2025

| Track | Fit Level | Description |
|-------|-----------|-------------|
| **Infrastructure & Tooling** | ✅✅✅ Primary | Developer dashboard, monitoring, DevOps tools |
| **AI & Oracles** | ✅✅ Secondary | LLM-powered network analysis, data pipelines |

### Key Differentiators

- 🤖 **Real AI Integration** - Llama 3.1 (via Groq) for network insights
- 🌍 **3D Visualization** - Interactive globe with live transaction arcs
- ⚡ **100% Real Data** - No mock data, all live from Mantle RPC
- 🎨 **Production-Ready UI** - Glassmorphism design with Mantle branding

---

## ✨ Features

### 🤖 AI-Powered Network Intelligence

<table>
<tr>
<td width="60%">

**Real-time AI Analysis** powered by **Llama 3.1** (via Groq):

- 📊 Network condition analysis
- 💡 Actionable transaction timing insights
- ⚡ Gas price optimization suggestions
- 🔮 Congestion level predictions
- 🛡️ Smart rate limiting & caching

</td>
<td width="40%">

```
┌─────────────────────────────┐
│  🧠 AI Network Intelligence │
├─────────────────────────────┤
│  🤖 Powered by Llama 3.1    │
│                             │
│  "Network idle with ultra-  │
│   low gas. Optimal time     │
│   for batch operations."    │
│                             │
│  ● 5 insights • Real-time   │
└─────────────────────────────┘
```

</td>
</tr>
</table>

### 🌍 Interactive 3D Globe Visualization

- **Real-time network nodes** displayed across the globe
- **Animated transaction arcs** flowing between nodes with Mantle teal/green colors
- **360° orbit controls** with smooth auto-rotation
- **Atmospheric glow** effect with depth perception
- Built with **React Three Fiber** and **Three.js**

### 📊 Real-Time Dashboard

| Metric | Source | Update Interval |
|--------|--------|-----------------|
| **TPS (Transactions Per Second)** | Mantle RPC | 3 seconds |
| **Peak TPS** | localStorage + Live | Persistent |
| **Block Time** | Calculated from last 10 blocks | 3 seconds |
| **Gas Price** | `eth_gasPrice` RPC | 3 seconds |
| **Base Fee** | Block header data | 3 seconds |
| **TVL** | DefiLlama API | 60 seconds |
| **Chain Rank** | DefiLlama API | 60 seconds |
| **AI Insights** | Groq (Llama 3.1) | 60 seconds |

### 📦 Live Data Streams

- **Recent Blocks** - Live block feed with transaction counts
- **Recent Transactions** - Real-time transaction stream with type detection
- **TPS History Chart** - Rolling 30-point TPS graph
- **Gas History Chart** - Rolling 30-point gas price graph
- **Block History Chart** - Transaction count visualization for last 45 blocks

### 💰 DeFi Analytics

- **Total Value Locked (TVL)** from DefiLlama
- **24h TVL Change** percentage
- **Protocol Count** on Mantle
- **Chain Rank** among all blockchains (dynamic)
- **Top 5 Protocols** with TVL and 24h change

### 🎨 Visual Design

- **Mantle-inspired theme**: Teal (#00D9A5), Blue (#3B82F6), Purple (#8B5CF6)
- **Glassmorphism** UI components with backdrop blur
- **Framer Motion** animations throughout
- **Particle starfield** background
- **Responsive design** for all screen sizes

---

## 🤖 AI Integration

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI NETWORK INTELLIGENCE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Client (NetworkInsights.tsx)                                   │
│   │                                                              │
│   │  1. Collect metrics (TPS, Gas, Block Time, TVL)              │
│   │  2. POST to /api/ai-insight                                  │
│   ▼                                                              │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  API Route (app/api/ai-insight/route.ts)                │   │
│   │                                                          │   │
│   │  ┌─────────────────────────────────────────────────┐    │   │
│   │  │  Rate Limiting & Caching                        │    │   │
│   │  │  • 45s server-side cache                        │    │   │
│   │  │  • 10s minimum between API calls                │    │   │
│   │  │  • Graceful fallback on rate limit              │    │   │
│   │  └─────────────────────────────────────────────────┘    │   │
│   │                         │                                │   │
│   │                         ▼                                │   │
│   │  ┌─────────────────────────────────────────────────┐    │   │
│   │  │  Groq API (Llama 3.1 8B Instant)                │    │   │
│   │  │  • Ultra-fast inference (~300ms)                │    │   │
│   │  │  • Free tier: 30 req/min                        │    │   │
│   │  │  • Context-aware network analysis               │    │   │
│   │  └─────────────────────────────────────────────────┘    │   │
│   │                         │                                │   │
│   │                         ▼                                │   │
│   │  Response: { insight, source: 'groq', model: '...' }     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### AI Prompt Engineering

```typescript
const prompt = `You are an AI analyst for Mantle Network (Ethereum L2). 
Analyze these real-time metrics and provide ONE brief, actionable insight:

Network Metrics:
- Current TPS: ${tps} transactions/second
- Peak TPS: ${peakTps}
- Gas Price: ${gasPrice} Gwei
- Block Time: ${blockTime} seconds
- Total Value Locked: $${tvl}M

Consider:
1. Network congestion level
2. Transaction cost efficiency  
3. Best time for transactions
4. Any anomalies or notable patterns

Respond with ONLY the insight text (max 100 chars). Be specific and actionable.`;
```

### Fallback System

When AI is unavailable, rule-based insights kick in:

```typescript
function generateFallbackInsight(tps, gasPrice, blockTime) {
  if (tps === 0 && gas < 0.05) {
    return 'Ultra-low activity. Optimal for batch operations.';
  }
  if (tps > 5) {
    return `High throughput: ${tps} TPS. Network efficient.`;
  }
  // ... more rules
}
```

---

## 🔗 Data Sources

| Data | Source | Method |
|------|--------|--------|
| Blocks & Transactions | Mantle RPC | `viem` client |
| Gas Prices | Mantle RPC | `eth_gasPrice` |
| TVL & Protocols | DefiLlama | REST API |
| AI Insights | Groq | Llama 3.1 API |
| Connection Status | RPC health check | Polling |

### Mantle Network Details

```
Chain ID:     5000
RPC URL:      https://rpc.mantle.xyz
Native Token: MNT
Explorer:     https://explorer.mantle.xyz
Type:         Optimistic Rollup → ZK Validity L2
DA Layer:     EigenDA
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0+ or **yarn** 1.22+
- **Groq API Key** (free at https://console.groq.com/keys)

### Installation

```bash
# Clone the repository
git clone https://github.com/karagozemin/Manix.git

# Navigate to project directory
cd Manix

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Start development server
npm run dev
```

### Environment Variables

```bash
# .env
GROQ_API_KEY=gsk_your_api_key_here
```

### Open in Browser

```
http://localhost:3000
```

### Build for Production

```bash
# Create optimized build
npm run build

# Start production server
npm run start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable in Vercel dashboard:
# GROQ_API_KEY=gsk_your_api_key_here
```

---

## 📁 Project Structure

```
Manix/
├── app/
│   ├── api/
│   │   └── ai-insight/
│   │       └── route.ts          # AI endpoint with Groq/Llama 3.1
│   ├── components/
│   │   ├── Globe.tsx             # 3D Earth with nodes & transaction arcs
│   │   ├── Header.tsx            # Navigation with connection status
│   │   ├── NetworkInsights.tsx   # AI-powered insights panel
│   │   ├── BlockHistoryChart.tsx # 45-block tx count visualization
│   │   ├── LiveChart.tsx         # TPS & Gas price charts
│   │   ├── RecentTransactions.tsx# Live transaction feed
│   │   ├── TVLPanel.tsx          # DeFi metrics from DefiLlama
│   │   ├── ConnectionStatus.tsx  # RPC connection indicator
│   │   ├── StatsCard.tsx         # Reusable stat display
│   │   ├── Particles.tsx         # WebGL particle system
│   │   └── StarField.tsx         # CSS star background
│   ├── globals.css               # Theme & glassmorphism styles
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main dashboard
├── hooks/
│   ├── useMantle.ts              # Core Mantle data hooks
│   ├── useDefiLlama.ts           # TVL & protocol hooks
│   └── useMantleWebSocket.ts     # Connection status hook
├── lib/
│   ├── mantle.ts                 # Mantle RPC client & utilities
│   └── defillama.ts              # DefiLlama API client
├── public/
│   ├── GzSli3caYAAQ5UK.jpeg      # Manix owl logo
│   └── mantle-logo.png           # Mantle logo
├── ARCHITECTURE.md               # System architecture docs
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework with App Router |
| **React** | 19.x | UI component library |
| **TypeScript** | 5.x | Type-safe development |

### AI & Data
| Technology | Purpose |
|------------|---------|
| **Groq SDK** | Llama 3.1 inference API |
| **viem** | Type-safe Ethereum client |
| **DefiLlama API** | TVL & DeFi protocol data |

### Styling & Animation
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Declarative animations |
| **CSS Variables** | Theme customization |

### 3D Graphics
| Technology | Purpose |
|------------|---------|
| **Three.js** | WebGL 3D rendering |
| **React Three Fiber** | React renderer for Three.js |
| **@react-three/drei** | Useful helpers & abstractions |

---

## 📚 API Reference

### AI Insight Endpoint

#### `POST /api/ai-insight`

Generates AI-powered network insights.

**Request Body:**
```json
{
  "tps": 3,
  "gasPrice": "0.0234",
  "blockTime": 2100,
  "tvl": 331,
  "peakTps": 15
}
```

**Response:**
```json
{
  "insight": "Network idle with ultra-low gas. Optimal time for batch operations.",
  "source": "groq",
  "model": "llama-3.1-8b-instant",
  "cached": false
}
```

**Rate Limiting:**
- 45 second server-side cache
- 10 second minimum between API calls
- Graceful fallback to rule-based insights

### Custom Hooks

#### `useMantle(pollInterval?: number)`
Main hook for fetching Mantle network data.

```typescript
const { blocks, stats, isLoading, error } = useMantle(3000);
```

#### `useRealBlockTime()`
Calculates average block time from recent blocks.

```typescript
const { blockTime, isCalculating } = useRealBlockTime();
```

#### `usePersistentPeakTPS()`
Stores peak TPS in localStorage.

```typescript
const { peakTps, peakTimestamp, updatePeak } = usePersistentPeakTPS();
```

#### `useMantleTVL()`
Fetches TVL data from DefiLlama.

```typescript
const { tvlData, isLoading } = useMantleTVL();
```

---

## 🎨 Theme Configuration

### Color Palette

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Mantle Teal | `#00D9A5` | `--accent-primary` | Primary accent |
| Electric Blue | `#3B82F6` | `--accent-secondary` | Secondary accent |
| Purple | `#8B5CF6` | `--accent-tertiary` | AI & tertiary accent |
| Deep Space | `#0a0a12` | `--deep-space` | Background |
| Glass | `rgba(25,22,35,0.75)` | `--card-bg` | Panel backgrounds |

### Customization

Edit `app/globals.css` to customize the theme:

```css
:root {
  --accent-primary: #00D9A5;
  --accent-secondary: #3B82F6;
  --accent-tertiary: #8B5CF6;
  --deep-space: #0a0a12;
}
```

---

## 🗺️ Roadmap

### ✅ Phase 1 - Foundation (Complete)
- [x] Interactive 3D globe with transaction arcs
- [x] Real-time block & transaction feeds
- [x] Live TPS, gas price, block time metrics
- [x] DefiLlama TVL integration
- [x] Responsive glassmorphism design
- [x] Mantle-themed color scheme

### ✅ Phase 2 - AI Integration (Complete)
- [x] Groq/Llama 3.1 integration
- [x] Real-time network insights
- [x] Rate limiting & caching
- [x] Fallback rule-based system

### 🚧 Phase 3 - Enhanced Analytics (In Progress)
- [ ] Historical TPS/Gas charts (24h, 7d, 30d)
- [ ] Transaction detail pages
- [ ] Address lookup functionality
- [ ] Block detail pages
- [ ] Token transfers tracking

### 📋 Phase 4 - Advanced Features
- [ ] Wallet connection (Connect to view your txs)
- [ ] Gas price predictions (AI-powered)
- [ ] Network alerts & notifications
- [ ] Comparison with other L2s
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Use **TypeScript** for all new code
- Follow existing **code style** and patterns
- Write **meaningful commit messages**
- Update **documentation** for new features
- Add **types** for all new interfaces

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Mantle Network](https://mantle.xyz) - High-performance Ethereum L2
- [Groq](https://groq.com) - Ultra-fast LLM inference
- [Meta Llama](https://llama.meta.com) - Llama 3.1 model
- [DefiLlama](https://defillama.com) - DeFi TVL data
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D rendering
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [viem](https://viem.sh) - Ethereum client
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

## 📞 Contact

- **GitHub**: [@karagozemin](https://github.com/karagozemin)
- **Project**: [Manix Repository](https://github.com/karagozemin/Manix)

---

<p align="center">
  <img src="public/mantle-logo.png" alt="Mantle" width="32" />
</p>

<p align="center">
  <strong>Built with 💚 for the Mantle Ecosystem</strong>
</p>

<p align="center">
  <sub>Manix © 2026 | AI-Powered Mantle Network Explorer</sub>
</p>

<p align="center">
  <sub>🏆 Mantle Global Hackathon 2025 Submission</sub>
</p>
