'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, Target, Building2, Percent,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FinanceData {
  monthlyExpectedRent: number;
  monthlyReceivedRent: number;
  cashflowProgress: number;
  totalAssetValue: number;
  totalDebt: number;
  nav: number;
  ltv: number;
  savingsGoal: number;
  currentSavings: number;
  savingsProgress: number;
}

const ProgressBar = ({ progress, color = 'blue' }: { progress: number; color?: string }) => {
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full ${colorClasses[color]} rounded-full`}
      />
    </div>
  );
};

export default function FinanceWidget() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/finance');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching finance data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-24 mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-zinc-800/50 rounded-xl" />
          <div className="h-16 bg-zinc-800/50 rounded-xl" />
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wallet size={16} className="text-emerald-500" />
        <h3 className="text-sm font-bold text-zinc-300">Finanças</h3>
      </div>

      <div className="space-y-4">
        {/* Monthly Cashflow */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Cashflow Mensal
            </span>
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
              (data?.cashflowProgress || 0) >= 100 ? 'text-emerald-400' : 'text-orange-400'
            }`}>
              {(data?.cashflowProgress || 0) >= 100 ? (
                <ArrowUpRight size={10} />
              ) : (
                <ArrowDownRight size={10} />
              )}
              {data?.cashflowProgress || 0}%
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-lg font-bold text-white">
              {formatCurrency(data?.monthlyReceivedRent || 0)}
            </span>
            <span className="text-xs text-zinc-500">
              / {formatCurrency(data?.monthlyExpectedRent || 0)}
            </span>
          </div>
          <ProgressBar progress={data?.cashflowProgress || 0} color="emerald" />
        </div>

        {/* NAV/LTV */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <Building2 size={12} className="text-blue-400" />
              <span className="text-[9px] text-zinc-500 uppercase">NAV</span>
            </div>
            <span className="text-sm font-bold text-white">
              {formatCurrency(data?.nav || 0)}
            </span>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <Percent size={12} className="text-orange-400" />
              <span className="text-[9px] text-zinc-500 uppercase">LTV</span>
            </div>
            <span className={`text-sm font-bold ${
              (data?.ltv || 0) > 70 ? 'text-red-400' : 
              (data?.ltv || 0) > 50 ? 'text-orange-400' : 
              'text-emerald-400'
            }`}>
              {data?.ltv || 0}%
            </span>
          </div>
        </div>

        {/* 50k Goal */}
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-purple-400" />
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                Meta 50k
              </span>
            </div>
            <span className="text-xs font-bold text-purple-400">
              {data?.savingsProgress || 0}%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-white">
              {formatCurrency(data?.currentSavings || 0)}
            </span>
            <span className="text-xs text-zinc-500">
              / {formatCurrency(data?.savingsGoal || 50000)}
            </span>
          </div>
          <ProgressBar progress={data?.savingsProgress || 0} color="purple" />
        </div>
      </div>
    </div>
  );
}
