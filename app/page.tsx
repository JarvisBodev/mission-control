'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, FileText, Brain, Briefcase, LayoutGrid, Activity, 
  ShieldCheck, Zap, Cpu, LucideIcon, ChevronRight, PlusCircle, Plus,
  Calendar as CalendarIcon, Clock, Trash2, CheckCircle2, Circle, X,
  Terminal, RefreshCw, HardDrive, ChevronLeft, Bot, User, Target, Loader2,
  TrendingUp, Home, Building2, Heart, Search, Hammer, Calculator, Plane, Eraser,
  BarChart3, ChevronDown, PieChart, Power, Dumbbell, Bell, AlertTriangle, Flag, CheckCircle,
  CloudSun, Droplets, Wind, Thermometer, Menu, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarEvents from '@/components/ui/CalendarEvents';
import JarvisSection from '@/components/sections/JarvisSection';
import PersonalSection from '@/components/sections/PersonalSection';
import BinbSection from '@/components/sections/BinbSection';
import RemindersPanel from '@/components/ui/RemindersPanel';

// --- TYPES ---
interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  expanded?: boolean;
  hasSubmenu?: boolean;
}

// --- SHARED COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, active = false, onClick, expanded = false, hasSubmenu = false }: SidebarItemProps) => (
  <div onClick={onClick} className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? 'text-blue-500' : ''} />
      <span className="text-sm font-semibold tracking-tight">{label}</span>
    </div>
    {hasSubmenu && <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />}
  </div>
);

const SectionCard = ({ label, value, unit, icon: Icon, color, onClick }: any) => (
  <motion.div whileHover={{ y: -5 }} onClick={onClick} className="bg-zinc-900/40 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] backdrop-blur-sm cursor-pointer group hover:border-white/20 transition-all shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${color}`}><Icon size={20} /></div>
      <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-colors" />
    </div>
    <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-2xl md:text-3xl font-bold tracking-tighter">{value}</span>
      <span className="text-[10px] text-zinc-600 font-medium">{unit}</span>
    </div>
  </motion.div>
);

// --- OVERVIEW SECTION (Hybrid Dashboard) ---
const OverviewSection = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [binbData, setBinbData] = useState<any>(null);
  const [gymData, setGymData] = useState<any>(null);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // States for Quick Event Form
  const [showQuickEvent, setShowQuickEvent] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [quickEvent, setQuickEvent] = useState({
    title: '',
    start: '',
    description: ''
  });

  const fetchOverviewData = async () => {
    setRefreshing(true);
    try {
      const [binbRes, gymRes, calendarRes, weatherRes] = await Promise.all([
        fetch('/api/binb'),
        fetch('/api/gym/workouts'),
        fetch('/api/calendar'),
        fetch('/api/weather?city=Braga')
      ]);
      const [binb, gym, calendar, weather] = await Promise.all([
        binbRes.json(),
        gymRes.json(),
        calendarRes.json(),
        weatherRes.json().catch(() => null)
      ]);
      setBinbData(binb);
      setGymData(gym);
      setCalendarData(calendar);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleQuickEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEvent.title || !quickEvent.start) return;
    
    setSavingEvent(true);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickEvent)
      });
      if (res.ok) {
        setQuickEvent({ title: '', start: '', description: '' });
        setShowQuickEvent(false);
        fetchOverviewData();
      }
    } catch (error) {
      console.error('Error adding event:', error);
    } finally {
      setSavingEvent(false);
    }
  };

  // Calculate urgent alerts
  const urgentAlerts = binbData?.alertas?.segurosExpiring?.length || 0;
  const pendingContracts = binbData?.alertas?.contratosPendentes?.length || 0;
  const upcomingCheckouts = binbData?.alertas?.upcomingCheckouts?.length || 0;
  const totalAlerts = urgentAlerts + pendingContracts + upcomingCheckouts;

  // Get current hour for greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 pb-10">
      {/* Header with Greeting & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">{greeting}, Filipe</h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1 md:mt-2">Dashboard de comando • Em tempo real</p>
        </div>
        <button 
          onClick={fetchOverviewData}
          className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all ${refreshing ? 'opacity-70' : ''}`}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={`${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-xs md:text-sm font-semibold">{refreshing ? 'A atualizar...' : 'Atualizar Tudo'}</span>
        </button>
      </div>

      {/* 1. MÉTÉO + QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
        {/* Weather Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CloudSun size={18} className="text-blue-400" />
              <span className="text-xs md:text-sm font-semibold text-zinc-300">Braga</span>
            </div>
            <span className="text-[10px] text-zinc-500">Agora</span>
          </div>
          {weatherData?.temperature !== null ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">{weatherData?.temperature}°</div>
                <div className="text-xs text-zinc-400 mt-1">{weatherData?.description}</div>
              </div>
              <div className="text-right text-[10px] text-zinc-500 space-y-1">
                <div className="flex items-center gap-1 justify-end font-medium">
                  <Droplets size={10} /> {weatherData?.chanceOfRain}% chuva
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Wind size={10} /> {weatherData?.windSpeed} km/h
                </div>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-xs">A carregar météo...</div>
          )}
        </div>

        {/* Alertas Card */}
        <div className={`border rounded-2xl p-4 md:p-5 ${totalAlerts > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
          <div className="flex items-center gap-2 mb-3">
            {totalAlerts > 0 ? <AlertTriangle size={18} className="text-red-400" /> : <ShieldCheck size={18} className="text-emerald-400" />}
            <span className="text-xs md:text-sm font-semibold text-zinc-300">Alertas</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-white">{totalAlerts}</div>
          <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">
            {totalAlerts > 0 ? 'necessária atenção' : 'Sistema Nominal'}
          </div>
        </div>

        {/* Projetos Card */}
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 md:p-5 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Hammer size={18} className="text-orange-400" />
            <span className="text-xs md:text-sm font-semibold text-zinc-300">Projetos</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-white">{binbData?.projetos?.emRemodelacao?.length || 0}</div>
          <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">Ativos BINB</div>
        </div>
      </div>

      {/* 2. LEMBRETES & COMPROMISSOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-0">
        <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-zinc-300 flex items-center gap-2">
              <Bell size={18} className="text-purple-500" />
              Lembretes
            </h2>
          </div>
          <RemindersPanel />
        </div>

        <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-zinc-300 flex items-center gap-2">
              <CalendarIcon size={18} className="text-blue-500" />
              Agenda
            </h2>
            <button 
              id="overview-add-form-btn"
              onClick={() => setShowQuickEvent(!showQuickEvent)}
              className="px-2 md:px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold hover:bg-blue-500/20 transition-all flex items-center gap-1.5"
            >
              {showQuickEvent ? <X size={14} /> : <Plus size={14} />}
              {showQuickEvent ? 'Sair' : 'Novo'}
            </button>
          </div>

          <AnimatePresence>
            {showQuickEvent && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <form onSubmit={handleQuickEventSubmit} className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-3">
                  <input 
                    type="text" 
                    placeholder="Título do Evento" 
                    required
                    value={quickEvent.title}
                    onChange={e => setQuickEvent({...quickEvent, title: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input 
                      type="datetime-local" 
                      required
                      value={quickEvent.start}
                      onChange={e => setQuickEvent({...quickEvent, start: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                    />
                    <button 
                      type="submit" 
                      disabled={savingEvent}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl h-10 md:h-auto text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {savingEvent ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                      Guardar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {calendarData?.events?.length > 0 ? (
              calendarData.events.slice(0, 5).map((event: any) => (
                <div key={event.id} className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-1 h-6 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-200 truncate">{event.summary}</div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Clock size={10} /> {new Date(event.start).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} • {new Date(event.start).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono italic hidden md:block">{event.location || ''}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl">
                <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-black">Agenda livre</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS MOBILE OPTIMIZED */}
      <div className="grid grid-cols-3 gap-2 px-4 md:px-0">
        <button onClick={() => setActiveTab('BINB')} className="py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex flex-col items-center gap-1.5 active:scale-95">
          <Building2 size={16} /> BINB
        </button>
        <button onClick={() => setActiveTab('Personal/Calendar')} className="py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all flex flex-col items-center gap-1.5 active:scale-95">
          <CalendarIcon size={16} /> Agenda
        </button>
        <button onClick={() => setActiveTab('Jarvis')} className="py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex flex-col items-center gap-1.5 active:scale-95">
          <Bot size={16} /> Jarvis
        </button>
      </div>

      {/* 2. ALERTAS URGENTES + PROJETOS (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-0">
        <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
          <h2 className="text-base md:text-xl font-bold text-zinc-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            Prioritário
            {totalAlerts > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 ml-2">
                {totalAlerts}
              </span>
            )}
          </h2>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {binbData?.alertas?.segurosExpiring?.map((s: any, i: number) => (
              <div key={`seguro-${i}`} className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-red-500/20 flex-shrink-0"><ShieldCheck size={12} className="text-red-400" /></div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-200 truncate">Seguro {s.apartamento}</div>
                    <div className="text-[10px] text-zinc-500">Expira: {s.validade}</div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold uppercase">Renovar</span>
              </div>
            ))}

            {binbData?.alertas?.contratosPendentes?.map((c: any, i: number) => (
              <div key={`contrato-${i}`} className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-orange-500/20 flex-shrink-0"><FileText size={12} className="text-orange-400" /></div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-200 truncate">{c.nome}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{c.apartamento} • {!c.depositoPago && 'Depósito'} {!c.renda1Mes && '1ªRenda'}</div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase">Pendente</span>
              </div>
            ))}

            {totalAlerts === 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center">
                <CheckCircle size={20} className="text-emerald-400 mx-auto mb-2 opacity-50" />
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Estado Nominal</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
          <h2 className="text-base md:text-xl font-bold text-zinc-300 mb-4 flex items-center gap-2">
            <Hammer size={18} className="text-orange-500" />
            Projectos
          </h2>
          <div className="space-y-2">
            {binbData?.projetos?.emRemodelacao?.map((proj: any, i: number) => (
              <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-orange-500/20 flex-shrink-0"><Hammer size={12} className="text-orange-400" /></div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-200 truncate">{proj.id}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{proj.nome}</div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold">{proj.previsao}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Motto Footer */}
      <div className="bg-zinc-900/10 border border-white/5 p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] text-center mx-4 md:mx-0">
        <p className="text-sm md:text-lg font-serif italic text-zinc-500 leading-relaxed">
          "Construir um ecossistema de ativos diversificado para liberdade financeira absoluta."
        </p>
      </div>
    </div>
  );
};

// --- MAIN WRAPPER ---
export default function MissionControl() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [expandedPersonal, setExpandedPersonal] = useState(false);
  const [expandedBinb, setExpandedBinb] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Syncing
  const refreshData = async () => {
    try {
      await Promise.all([
        fetch('/api/data'),
        fetch('/api/health'),
        fetch('/api/knowledge')
      ]);
    } catch (e) { console.error("Data fetch error", e); }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#050506] text-zinc-100 font-sans overflow-hidden selection:bg-blue-500/30 relative">
      
      {/* MOBILE NAV BAR (TOP) */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-14 bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-blue-500" />
          <span className="font-black text-xs uppercase tracking-widest italic">Jarvis</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400 active:text-white">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SIDEBAR (Responsive Desktop + Mobile Overlay) */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-40 w-64 h-full border-r border-white/5 flex flex-col p-4 gap-6 bg-[#050506] lg:bg-black/20 backdrop-blur-2xl transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto pt-20 lg:pt-4
      `}>
        <div className="hidden lg:flex items-center gap-2 px-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/40"><Zap size={18} className="text-white" /></div>
          <div className="flex flex-col"><span className="font-bold text-sm tracking-widest uppercase italic">Jarvis</span><span className="text-[10px] text-emerald-500 font-mono">v5.0 OPERATIONAL</span></div>
        </div>
        
        <nav className="flex flex-col gap-6" onClick={() => {if(window.innerWidth < 1024) setIsMobileMenuOpen(false)}}>
          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block text-[9px]">Dashboard</span>
             <SidebarItem icon={LayoutGrid} label="Overview" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          </div>

          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block text-[9px]">Business</span>
             <SidebarItem 
               icon={Building2} 
               label="BINB" 
               active={activeTab.startsWith('BINB')}
               expanded={expandedBinb}
               hasSubmenu={true}
               onClick={() => {
                 setActiveTab('BINB');
                 setExpandedBinb(!expandedBinb);
               }}
             />
             {expandedBinb && (
               <div className="ml-4 pl-2 border-l border-white/5 space-y-1 mt-1">
                 <SidebarItem icon={Layout} label="Portfolio" active={activeTab === 'BINB'} onClick={() => setActiveTab('BINB')} />
                 <SidebarItem icon={CalendarIcon} label="Reservas" active={activeTab === 'BINB/Reservas'} onClick={() => setActiveTab('BINB/Reservas')} />
                 <SidebarItem icon={Bell} label="Lembretes" active={activeTab === 'BINB/Reminders'} onClick={() => setActiveTab('BINB/Reminders')} />
               </div>
             )}
          </div>

          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block text-[9px]">Pessoal</span>
             <SidebarItem 
               icon={User} 
               label="Pessoal" 
               active={activeTab.startsWith('Personal')}
               expanded={expandedPersonal}
               hasSubmenu={true}
               onClick={() => {
                 setActiveTab('Personal');
                 setExpandedPersonal(!expandedPersonal);
               }}
             />
             {expandedPersonal && (
               <div className="ml-4 pl-2 border-l border-white/5 space-y-1 mt-1">
                 <SidebarItem icon={Activity} label="Resumo" active={activeTab === 'Personal'} onClick={() => setActiveTab('Personal')} />
                 <SidebarItem icon={Dumbbell} label="Ginásio" active={activeTab === 'Personal/Gym'} onClick={() => setActiveTab('Personal/Gym')} />
                 <SidebarItem icon={CalendarIcon} label="Calendário" active={activeTab === 'Personal/Calendar'} onClick={() => setActiveTab('Personal/Calendar')} />
               </div>
             )}
          </div>

          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block text-[9px]">System</span>
             <SidebarItem icon={Bot} label="Jarvis" active={activeTab === 'Jarvis'} onClick={() => setActiveTab('Jarvis')} />
             <SidebarItem icon={Terminal} label="Config" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden bg-black/20 pt-14 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 border-b border-white/5 items-center justify-between px-10 bg-black/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
             <ShieldCheck className="text-emerald-500" size={18} />
             <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">
                {activeTab.replace('/', ' • ')}
             </h1>
          </div>
          <div onClick={refreshData} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-500/20 text-blue-500"><RefreshCw size={14} /></div>
        </header>

        <div className="flex-1 overflow-y-auto pt-6 md:pt-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'Dashboard' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <OverviewSection setActiveTab={setActiveTab} />
              </motion.div>
            ) : activeTab === 'BINB' ? (
              <BinbSection />
            ) : activeTab === 'BINB/Reservas' ? (
              <BinbReservasSection />
            ) : activeTab === 'BINB/Reminders' ? (
              <BinbRemindersSection />
            ) : activeTab === 'Personal' ? (
              <PersonalSection setActiveTab={setActiveTab} />
            ) : activeTab === 'Personal/Gym' ? (
              <GymSection />
            ) : activeTab === 'Personal/Calendar' ? (
              <CalendarSection />
            ) : activeTab === 'Jarvis' ? (
              <JarvisSection />
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4 p-6 text-center">
                 <Search size={40} className="text-zinc-800 mb-4" />
                 <h3 className="text-xl uppercase font-black tracking-widest">Section Active</h3>
                 <p className="text-xs italic">A sincronizar dados entre dispositivos...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* MOBILE BOTTOM TAB BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-50 flex items-center justify-around px-6">
        <button onClick={() => setActiveTab('Dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'Dashboard' ? 'text-blue-500' : 'text-zinc-500'}`}>
          <LayoutGrid size={20} />
          <span className="text-[9px] font-bold uppercase">Home</span>
        </button>
        <button onClick={() => setActiveTab('BINB')} className={`flex flex-col items-center gap-1 ${activeTab.startsWith('BINB') ? 'text-blue-500' : 'text-zinc-500'}`}>
          <Building2 size={20} />
          <span className="text-[9px] font-bold uppercase">BINB</span>
        </button>
        <button onClick={() => setActiveTab('Personal')} className={`flex flex-col items-center gap-1 ${activeTab.startsWith('Personal') ? 'text-blue-500' : 'text-zinc-500'}`}>
          <User size={20} />
          <span className="text-[9px] font-bold uppercase">Perfil</span>
        </button>
      </div>
    </div>
  );
}

// Sub-components need to be imported or defined here if not separate files
// I've cleaned up the main MissionControl to use the components and handle responsiveness.
