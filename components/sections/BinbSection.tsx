'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, Users, TrendingUp, AlertTriangle, Calendar, 
  CheckCircle, XCircle, RefreshCw, Home, Euro, PieChart,
  Clock, FileText, Hammer, ChevronDown, ChevronRight, Edit2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditModal from '@/components/ui/EditModal';

interface BinbData {
  summary: {
    totalApartamentos: number;
    totalQuartos: number;
    quartosOcupados: number;
    taxaOcupacao: number;
    receitaMensal: number;
    custosMensais: number;
    cashflowMensal: number;
    margemMedia: number;
  };
  apartamentos: Array<{
    id: string;
    morada: string;
    andar: string;
    lado: string;
    quartos: number;
    comodato: boolean;
  }>;
  ocupacao: Record<string, { occupied: number; total: number; revenue: number }>;
  analise: Array<{
    apartamento: string;
    receitaBruta: number;
    quartosOcupados?: number;
    totalQuartos?: number;
    custosFixos?: number;
    cashflow?: number;
    margem?: number;
  }>;
  alertas: {
    segurosExpiring: Array<{
      apartamento: string;
      morada: string;
      empresa: string;
      valor: string;
      validade: string;
    }>;
    upcomingCheckouts: Array<{
      apartamento: string;
      quarto: string;
      nome: string;
      checkOut: string;
    }>;
    contratosPendentes: Array<{
      apartamento: string;
      quarto: string;
      nome: string;
      depositoPago: boolean;
      renda1Mes: boolean;
      contratoAssinado: boolean;
    }>;
  };
  projetos: {
    emRemodelacao: Array<{
      id: string;
      nome: string;
      previsao: string;
      tipo: string;
    }>;
  };
}

const StatCard = ({ label, value, icon: Icon, color, subtitle }: any) => (
  <motion.div whileHover={{ y: -3 }} className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-2xl font-bold tracking-tighter">{value}</span>
      {subtitle && <span className="text-xs text-zinc-600 font-medium ml-1">{subtitle}</span>}
    </div>
  </motion.div>
);

const AlertCard = ({ title, items, icon: Icon, color, emptyText }: any) => (
  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} className={color} />
      <span className="text-sm font-semibold">{title}</span>
      {items.length > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${color.includes('red') ? 'bg-red-500/20 text-red-400' : color.includes('amber') ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {items.length}
        </span>
      )}
    </div>
    {items.length === 0 ? (
      <p className="text-zinc-600 text-xs">{emptyText}</p>
    ) : (
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="bg-black/20 rounded-lg p-2 text-xs">
            {item}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function BinbSection() {
  const [data, setData] = useState<BinbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedApt, setExpandedApt] = useState<string | null>(null);
  
  // Edit modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    title: string;
    fields: any[];
    onSave: (values: any) => Promise<{ success: boolean; message: string }>;
  }>({ isOpen: false, title: '', fields: [], onSave: async () => ({ success: false, message: '' }) });

  // API update function
  const updateBinb = async (action: string, data: any) => {
    try {
      const response = await fetch('/api/binb/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      });
      const result = await response.json();
      if (result.success) {
        // Refresh data after successful update
        await fetchData();
      }
      return result;
    } catch (error: any) {
      return { success: false, message: error.message || 'Update failed' };
    }
  };

  // Open edit modal for contract pending items
  const openMarkPaidModal = (contract: any, field: string) => {
    const fieldLabels: Record<string, string> = {
      deposit: 'Depósito Pago',
      firstMonth: '1ª Renda Paga',
      signed: 'Contrato Assinado'
    };
    setEditModal({
      isOpen: true,
      title: `Marcar como Completo`,
      fields: [
        { name: 'confirm', label: `Confirmar: ${fieldLabels[field]} para ${contract.nome}?`, type: 'select', value: 'yes', options: [{ value: 'yes', label: 'Sim, confirmar' }, { value: 'no', label: 'Não' }] }
      ],
      onSave: async (values) => {
        if (values.confirm === 'yes') {
          return await updateBinb('mark_paid', { contractId: `C${contract.apartamento}_${contract.quarto}`, field });
        }
        return { success: false, message: 'Cancelado' };
      }
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/binb');
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load BINB data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase tracking-widest text-emerald-500">BINB</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-3xl font-black uppercase tracking-widest text-emerald-500">BINB</h2>
        <div className="bg-zinc-900/40 border border-red-500/20 p-8 rounded-3xl text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Erro ao carregar dados</h3>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const { summary, apartamentos, ocupacao, analise, alertas, projetos } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-emerald-500">BINB</h2>
          <p className="text-zinc-500 text-sm mt-1">Student Housing • Braga</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 text-emerald-500 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Ocupação" 
          value={`${summary.taxaOcupacao}%`}
          icon={Users}
          color="text-emerald-500"
          subtitle={`${summary.quartosOcupados}/${summary.totalQuartos}`}
        />
        <StatCard 
          label="Receita Mensal" 
          value={formatCurrency(summary.receitaMensal)}
          icon={Euro}
          color="text-blue-500"
        />
        <StatCard 
          label="Cashflow" 
          value={formatCurrency(summary.cashflowMensal)}
          icon={TrendingUp}
          color="text-green-500"
        />
        <StatCard 
          label="Margem Média" 
          value={`${summary.margemMedia}%`}
          icon={PieChart}
          color="text-purple-500"
        />
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contratos Pendentes - Interactive */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-red-500" />
            <span className="text-sm font-semibold">Contratos Pendentes</span>
            {alertas.contratosPendentes.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                {alertas.contratosPendentes.length}
              </span>
            )}
          </div>
          {alertas.contratosPendentes.length === 0 ? (
            <p className="text-zinc-600 text-xs">Todos os contratos estão completos ✓</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alertas.contratosPendentes.map(c => (
                <div key={`${c.apartamento}-${c.quarto}`} className="bg-black/20 rounded-lg p-2 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{c.nome}</span>
                    <span className="text-zinc-500">{c.apartamento}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {!c.depositoPago && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openMarkPaidModal(c, 'deposit'); }}
                        className="text-red-400 text-[10px] bg-red-500/20 px-2 py-1 rounded hover:bg-red-500/30 transition-colors flex items-center gap-1"
                      >
                        <Check size={10} /> Depósito
                      </button>
                    )}
                    {!c.renda1Mes && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openMarkPaidModal(c, 'firstMonth'); }}
                        className="text-amber-400 text-[10px] bg-amber-500/20 px-2 py-1 rounded hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                      >
                        <Check size={10} /> 1ª Renda
                      </button>
                    )}
                    {!c.contratoAssinado && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openMarkPaidModal(c, 'signed'); }}
                        className="text-blue-400 text-[10px] bg-blue-500/20 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                      >
                        <Check size={10} /> Contrato
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <AlertCard
          title="Check-outs (30 dias)"
          icon={Calendar}
          color="text-amber-500"
          emptyText="Sem check-outs próximos"
          items={alertas.upcomingCheckouts.map(c => (
            <div key={`${c.apartamento}-${c.quarto}`} className="flex justify-between items-center">
              <span>{c.nome}</span>
              <span className="text-zinc-500">{c.apartamento} Q{c.quarto} • {formatDate(c.checkOut)}</span>
            </div>
          ))}
        />
        <AlertCard
          title="Seguros a Renovar"
          icon={AlertTriangle}
          color="text-blue-500"
          emptyText="Sem seguros a vencer em 60 dias"
          items={alertas.segurosExpiring.map(s => (
            <div key={s.apartamento} className="flex justify-between items-center">
              <span>{s.apartamento}</span>
              <span className="text-zinc-500">{s.empresa} • {formatDate(s.validade)}</span>
            </div>
          ))}
        />
      </div>

      {/* Apartments Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-emerald-500" />
          Imóveis Ativos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {analise.filter(a => a.receitaBruta > 0).map(apt => {
            const aptInfo = apartamentos.find(a => a.id === apt.apartamento);
            const occ = ocupacao[apt.apartamento];
            const isExpanded = expandedApt === apt.apartamento;
            const margem = apt.margem ?? (apt.totalQuartos && apt.quartosOcupados ? Math.round((apt.quartosOcupados / apt.totalQuartos) * 100) : 100);
            const cashflow = apt.cashflow ?? apt.receitaBruta;
            
            return (
              <motion.div
                key={apt.apartamento}
                className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setExpandedApt(isExpanded ? null : apt.apartamento)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-lg font-bold">{apt.apartamento}</span>
                      {aptInfo && (
                        <p className="text-xs text-zinc-500 truncate max-w-[180px]">{aptInfo.morada}</p>
                      )}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${margem >= 80 ? 'bg-green-500/20 text-green-400' : margem >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {margem}%
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-zinc-500" />
                      <span>{occ?.occupied || apt.quartosOcupados || 0}/{occ?.total || apt.totalQuartos || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro size={12} className="text-zinc-500" />
                      <span className="text-green-400">{formatCurrency(cashflow)}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} className="ml-auto text-zinc-500" /> : <ChevronRight size={14} className="ml-auto text-zinc-500" />}
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/20"
                    >
                      <div className="p-4 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-zinc-500">Receita</span>
                          <p className="font-semibold">{formatCurrency(apt.receitaBruta)}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Quartos</span>
                          <p className="font-semibold">{apt.quartosOcupados || occ?.occupied || 0}/{apt.totalQuartos || occ?.total || 0}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Cashflow</span>
                          <p className="font-semibold text-green-400">{formatCurrency(cashflow)}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Ocupação</span>
                          <p className="font-semibold">{margem}%</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Projects in Progress */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Hammer size={18} className="text-amber-500" />
          Em Remodelação / Projetos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {projetos.emRemodelacao.map(proj => (
            <div key={proj.id} className="bg-zinc-900/30 border border-amber-500/20 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold">{proj.id}</span>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{proj.previsao}</span>
              </div>
              <p className="text-sm text-zinc-400">{proj.nome}</p>
              <p className="text-xs text-zinc-500 mt-1">{proj.tipo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        title={editModal.title}
        fields={editModal.fields}
        onSave={editModal.onSave}
      />
    </div>
  );
}
