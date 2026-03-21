'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Globe, Bitcoin, Brain, Newspaper,
  RefreshCw, ExternalLink, AlertCircle, Zap, BarChart3, Activity,
  DollarSign, Fuel, Building2, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MacroData {
  eurusd: { value: number; change: number; changePercent: number };
  brent: { value: number; change: number; changePercent: number };
  sp500: { value: number; change: number; changePercent: number };
  treasury10y: { value: number; change: number; changePercent: number };
  updatedAt: string;
}

interface CryptoData {
  btc: { price: number; change24h: number; marketCap: number };
  eth: { price: number; change24h: number; marketCap: number };
  fearGreed: { value: number; classification: string };
  updatedAt: string;
}

interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
}

// Macro Tracker Widget
const MacroWidget = ({ data, loading }: { data: MacroData | null; loading: boolean }) => {
  const metrics = data ? [
    { label: 'EUR/USD', value: data.eurusd.value.toFixed(4), change: data.eurusd.changePercent, icon: DollarSign, color: 'text-blue-400' },
    { label: 'Brent', value: `$${data.brent.value.toFixed(2)}`, change: data.brent.changePercent, icon: Fuel, color: 'text-orange-400' },
    { label: 'S&P 500', value: data.sp500.value.toLocaleString(), change: data.sp500.changePercent, icon: Building2, color: 'text-purple-400' },
    { label: '10Y Treasury', value: `${data.treasury10y.value.toFixed(2)}%`, change: data.treasury10y.changePercent, icon: Percent, color: 'text-cyan-400' },
  ] : [];

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Globe size={16} className="text-blue-500" />
          Macro Tracker
        </h3>
        <span className="text-[10px] text-zinc-600 font-mono">
          {loading ? 'A carregar...' : 'Live'}
        </span>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-zinc-900/50 rounded-xl p-3 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isPositive = metric.change >= 0;
            return (
              <motion.div
                key={metric.label}
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900/50 border border-white/5 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className={metric.color} />
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    {metric.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-white">{metric.value}</span>
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(metric.change).toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Crypto Widget
const CryptoWidget = ({ data, loading }: { data: CryptoData | null; loading: boolean }) => {
  const getFearGreedColor = (value: number) => {
    if (value <= 25) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (value <= 45) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (value <= 55) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    if (value <= 75) return 'text-lime-500 bg-lime-500/10 border-lime-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Bitcoin size={16} className="text-orange-500" />
          Crypto
        </h3>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-zinc-900/50 rounded-xl" />
          <div className="h-16 bg-zinc-900/50 rounded-xl" />
          <div className="h-12 bg-zinc-900/50 rounded-xl" />
        </div>
      ) : data ? (
        <div className="space-y-3">
          {/* BTC */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-400 font-bold text-xs">₿</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-400">Bitcoin</span>
                <div className="text-lg font-bold text-white">
                  ${data.btc.price.toLocaleString()}
                </div>
              </div>
            </div>
            <span className={`text-sm font-bold flex items-center gap-1 ${data.btc.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.btc.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {data.btc.change24h.toFixed(2)}%
            </span>
          </div>

          {/* ETH */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold text-xs">Ξ</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-400">Ethereum</span>
                <div className="text-lg font-bold text-white">
                  ${data.eth.price.toLocaleString()}
                </div>
              </div>
            </div>
            <span className={`text-sm font-bold flex items-center gap-1 ${data.eth.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.eth.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {data.eth.change24h.toFixed(2)}%
            </span>
          </div>

          {/* Fear & Greed */}
          <div className={`border rounded-xl p-3 ${getFearGreedColor(data.fearGreed.value)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={14} />
                <span className="text-xs font-semibold">Fear & Greed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{data.fearGreed.value}</span>
                <span className="text-[10px] font-semibold uppercase">{data.fearGreed.classification}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-zinc-500 text-sm">
          Sem dados disponíveis
        </div>
      )}
    </div>
  );
};

// Headlines Widget
const HeadlinesWidget = ({ news, loading, category, setCategory }: { 
  news: NewsItem[]; 
  loading: boolean; 
  category: string;
  setCategory: (cat: string) => void;
}) => {
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'markets', label: 'Markets' },
    { id: 'tech', label: 'Tech' },
    { id: 'ai', label: 'AI' },
    { id: 'crypto', label: 'Crypto' },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Newspaper size={16} className="text-cyan-500" />
          Headlines
        </h3>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-zinc-900/50 text-zinc-500 border border-white/5 hover:text-zinc-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-zinc-900/50 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {news.slice(0, 8).map((item, index) => (
            <motion.a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 4 }}
              className="block bg-zinc-900/40 border border-white/5 rounded-xl p-3 hover:bg-zinc-900/60 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 line-clamp-2 group-hover:text-white">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-zinc-500 font-semibold">{item.source}</span>
                    <span className="text-[10px] text-zinc-600">•</span>
                    <span className="text-[10px] text-zinc-600">{formatTimeAgo(item.publishedAt)}</span>
                  </div>
                </div>
                <ExternalLink size={12} className="text-zinc-600 group-hover:text-blue-400 flex-shrink-0 mt-1" />
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
};

// AI/Tech News Widget
const TechNewsWidget = ({ news, loading }: { news: NewsItem[]; loading: boolean }) => {
  const techNews = news.filter(n => n.category === 'tech' || n.category === 'ai');

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Brain size={16} className="text-purple-500" />
          AI & Tech
        </h3>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-zinc-900/50 rounded-xl" />
          ))}
        </div>
      ) : techNews.length > 0 ? (
        <div className="space-y-2">
          {techNews.slice(0, 5).map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-zinc-900/40 border border-white/5 rounded-xl p-3 hover:bg-zinc-900/60 transition-all"
            >
              <p className="text-xs font-medium text-zinc-300 line-clamp-2 hover:text-white">
                {item.title}
              </p>
              <span className="text-[10px] text-zinc-500 mt-1 block">{item.source}</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-zinc-500 text-xs">
          A carregar notícias de tech...
        </div>
      )}
    </div>
  );
};

export default function IntelSection() {
  const [macroData, setMacroData] = useState<MacroData | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsCategory, setNewsCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [macroRes, cryptoRes, newsRes] = await Promise.all([
        fetch('/api/intel/macro'),
        fetch('/api/intel/crypto'),
        fetch(`/api/intel/news?category=${newsCategory}`),
      ]);

      const [macro, crypto, news] = await Promise.all([
        macroRes.json(),
        cryptoRes.json(),
        newsRes.json(),
      ]);

      setMacroData(macro);
      setCryptoData(crypto);
      setNewsData(news.news || []);
    } catch (error) {
      console.error('Error fetching intel data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Refetch news when category changes
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/intel/news?category=${newsCategory}`);
        const data = await res.json();
        setNewsData(data.news || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    if (!loading) fetchNews();
  }, [newsCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest text-blue-500">
            Intel
          </h2>
          <p className="text-zinc-500 text-[10px] md:text-xs mt-1">
            Market data • News • Analysis
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 hover:bg-blue-500/20 transition-all active:scale-95"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Macro & Crypto */}
        <div className="space-y-6">
          <MacroWidget data={macroData} loading={loading} />
          <CryptoWidget data={cryptoData} loading={loading} />
        </div>

        {/* Center Column - Headlines */}
        <div className="lg:col-span-1">
          <HeadlinesWidget 
            news={newsData} 
            loading={loading} 
            category={newsCategory}
            setCategory={setNewsCategory}
          />
        </div>

        {/* Right Column - AI/Tech */}
        <div className="space-y-6">
          <TechNewsWidget news={newsData} loading={loading} />
          
          {/* Daily Briefing Placeholder */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-blue-400" />
              <h3 className="text-sm font-bold text-zinc-300">Daily Briefing</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Briefings automáticos do Drive aparecerão aqui.
            </p>
            <div className="bg-black/30 border border-white/5 rounded-xl p-3">
              <p className="text-[10px] text-zinc-500 italic">
                Conecta o Google Drive para aceder aos últimos briefings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Data streams active
            </span>
          </div>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">
          Last update: {new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
