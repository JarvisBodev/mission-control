
'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, FileText, Brain, Briefcase, LayoutGrid, Activity, 
  ShieldCheck, Zap, Cpu, LucideIcon, ChevronRight, PlusCircle,
  Calendar as CalendarIcon, Clock, Trash2, CheckCircle2, Circle,
  Terminal, RefreshCw, HardDrive, ChevronLeft, Bot, User, Target,
  TrendingUp, Home, Building2, Heart, Search, Hammer, Calculator, Plane, Eraser,
  BarChart3, ChevronDown, PieChart, Power, Dumbbell, Bell, AlertTriangle, Flag, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarEvents from '@/components/ui/CalendarEvents';
import JarvisSection from '@/components/sections/JarvisSection';
import PersonalSection from '@/components/sections/PersonalSection';
import BinbSection from '@/components/sections/BinbSection';

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
  <motion.div whileHover={{ y: -5 }} onClick={onClick} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm cursor-pointer group hover:border-white/20 transition-all shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${color}`}><Icon size={20} /></div>
      <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-colors" />
    </div>
    <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-3xl font-bold tracking-tighter">{value}</span>
      <span className="text-xs text-zinc-600 font-medium">{unit}</span>
    </div>
  </motion.div>
);

// --- PERSONAL SUBSECTIONS ---
const GymSection = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<number>>(new Set([0])); // Primeiro aberto por default

  useEffect(() => {
    fetch('/api/gym/workouts')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gym data fetch error:', err);
        setLoading(false);
      });
  }, []);

  const toggleWorkout = (idx: number) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedWorkouts(newExpanded);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500 mb-8">Ginásio</h2>
        <p className="text-zinc-500">A carregar dados...</p>
      </div>
    );
  }

  // Get current month name for display
  const currentMonth = "Março";
  const nextMonth = "Abril";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Ginásio</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-zinc-400">Mês atual: </span>
            <span className="font-bold text-blue-400">{currentMonth}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-zinc-400">
              <span className="text-emerald-500 font-bold">{data?.stats?.marchWorkouts || 0}</span> treinos
            </div>
            <div className="text-zinc-400">
              <span className="text-purple-500 font-bold">{data?.stats?.prCount || 0}</span> PRs
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SectionCard 
          label="Frequência" 
          value={data?.stats?.frequency || 'N/D'} 
          unit={`em ${currentMonth}`}
          icon={Activity} 
          color="text-emerald-500" 
        />
        <SectionCard 
          label="Último Treino" 
          value={data?.stats?.lastWorkout?.split('-')[2] || 'N/D'} 
          unit={currentMonth}
          icon={Dumbbell} 
          color="text-blue-500" 
        />
        <SectionCard 
          label="Volume Total" 
          value={data?.stats?.totalSets || 0} 
          unit={`sets (${currentMonth})`}
          icon={BarChart3} 
          color="text-purple-500" 
        />
        <SectionCard 
          label="Personal Records" 
          value={data?.stats?.prCount || 0} 
          unit={`PRs (${currentMonth})`}
          icon={TrendingUp} 
          color="text-orange-500" 
        />
      </div>

      {/* Monthly Info */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-zinc-300">Histórico de Treinos</h3>
          <div className="text-sm text-zinc-500">
            <span className="text-blue-400 font-bold">{currentMonth}</span> • Próximo mês: {nextMonth}
          </div>
        </div>
        <p className="text-zinc-400 text-sm mb-6">
          Os dados são sincronizados automaticamente do Discord Iron. Quando entrarmos em {nextMonth}, 
          esta secção mostrará automaticamente os treinos do novo mês, mantendo o histórico completo.
        </p>
        
        {/* Workouts List with Multi Accordion */}
        <div className="space-y-3">
          {data?.workouts?.map((workout: any, idx: number) => (
            <div 
              key={idx}
              className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all"
            >
              {/* Header */}
              <div 
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleWorkout(idx)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-zinc-300">{workout.date}</div>
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {workout.muscleGroup}
                  </div>
                  {workout.prNote && (
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      🏆 PR
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-zinc-500">{workout.exercises?.length || 0} exercícios</div>
                  <ChevronDown 
                    size={18} 
                    className={`text-zinc-500 transition-transform ${expandedWorkouts.has(idx) ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedWorkouts.has(idx) && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5">
                  {/* PR Note */}
                  {workout.prNote && (
                    <div className="mb-4 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                      <div className="text-xs font-bold text-orange-400">{workout.prNote}</div>
                    </div>
                  )}
                  
                  {/* Exercises */}
                  <div className="space-y-4">
                    {workout.exercises?.map((ex: any, i: number) => (
                      <div key={i} className="space-y-2">
                        <div className="text-sm font-semibold text-zinc-300">{ex.name}</div>
                        <div className="space-y-1 pl-4">
                          {ex.sets?.map((set: string, j: number) => (
                            <div key={j} className="text-xs text-zinc-400 font-mono">
                              {set}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Month Info */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-zinc-300 mb-3">Pronto para {nextMonth}?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-emerald-400">📊 Dados Automáticos</div>
            <p className="text-sm text-zinc-400">
              Quando começares a publicar treinos em {nextMonth}, a secção atualizará automaticamente. O histórico de {currentMonth} ficará arquivado.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-blue-400">🔄 Sincronização Contínua</div>
            <p className="text-sm text-zinc-400">
              Cada mensagem que publicares no canal Discord Iron será parseada e adicionada aqui em tempo real.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-purple-400">📈 Progresso Mensal</div>
            <p className="text-sm text-zinc-400">
              As estatísticas serão recalculadas para {nextMonth}, mantendo o histórico completo para análise de tendências.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarSection = () => {
  // Events for tomorrow (2026-03-17)
  const tomorrowEvents = [
    { time: '7:00', title: 'Ginásio', description: 'Treino matinal' },
    { time: '9:00', title: 'Lourenço colégio', description: 'Levar ao colégio' },
    { time: '10:00', title: 'Perfilago', description: 'Reunião/Visita' },
    { time: '11:00', title: 'Viana', description: 'Compromisso em Viana' },
    { time: '16:30', title: 'Lourenço colégio', description: 'Buscar do colégio' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Calendário</h2>
        <div className="text-sm text-zinc-400">
          <span className="text-blue-400 font-bold">17 de Março 2026</span> • Amanhã
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tomorrow's Schedule */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
          <h3 className="text-xl font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <CalendarIcon size={18} className="text-blue-500" />
            Agenda de Amanhã
          </h3>
          <div className="space-y-3">
            {tomorrowEvents.map((event, idx) => (
              <div 
                key={idx}
                className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-bold text-zinc-300">{event.time}</div>
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {event.title}
                  </div>
                </div>
                <div className="text-sm text-zinc-400">{event.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Integration Info */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
          <h3 className="text-xl font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <RefreshCw size={18} className="text-emerald-500" />
            Próximos Passos
          </h3>
          <p className="text-zinc-400 mb-4">
            Integração com Google Calendar em desenvolvimento. Eventos serão sincronizados automaticamente.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-zinc-500">
              <CheckCircle size={14} className="text-emerald-500" />
              <span>Eventos manuais já suportados</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Clock size={14} className="text-blue-500" />
              <span>Sincronização automática em desenvolvimento</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Bell size={14} className="text-orange-500" />
              <span>Notificações por push planeadas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FamilySection = () => (
  <div className="max-w-7xl mx-auto space-y-8">
    <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Rotinas Familiares</h2>
    <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
      <p className="text-zinc-500">Gestão de rotinas e tarefas familiares.</p>
    </div>
  </div>
);

const BinbRemindersSection = () => {
  const reminders = [
    { id: 1, title: 'Máquina de lavar', code: '223', description: 'Verificar/Reparar máquina de lavar' },
    { id: 2, title: 'Comprar e entregar fritadeiras', code: '43', description: 'Aquisição e entrega de fritadeiras' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">BINB - Lembretes</h2>
        <div className="text-sm text-zinc-400">
          <span className="text-blue-400 font-bold">{reminders.length}</span> lembretes ativos
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard 
          label="Lembretes Pendentes" 
          value={reminders.length} 
          unit="itens" 
          icon={Bell} 
          color="text-blue-500" 
        />
        <SectionCard 
          label="Prioridade" 
          value="Média" 
          unit="" 
          icon={AlertTriangle} 
          color="text-orange-500" 
        />
      </div>

      <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-zinc-300 mb-6">Lista de Lembretes</h3>
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div 
              key={reminder.id}
              className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-zinc-300">{reminder.title}</div>
                  <div className="text-sm text-zinc-500 mt-1">{reminder.description}</div>
                </div>
                <div className="px-4 py-2 rounded-full text-sm font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Código {reminder.code}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-500">
                  <CalendarIcon size={14} />
                  <span>Adicionado hoje</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <User size={14} />
                  <span>Responsável: Filipe</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Flag size={14} />
                  <span>Status: Pendente</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function MissionControl() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [expandedPersonal, setExpandedPersonal] = useState(false);
  const [expandedBinb, setExpandedBinb] = useState(false);

  // Data State
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (activeTab.startsWith('Personal/')) {
      setExpandedPersonal(true);
    }
  }, [activeTab]);

  const refreshData = async () => {
    try {
      const [dRes, hRes, fRes] = await Promise.all([
        fetch('/api/data'),
        fetch('/api/health'),
        fetch('/api/knowledge')
      ]);
      const [d, h, f] = await Promise.all([dRes.json(), hRes.json(), fRes.json()]);
      setTasks(d.tasks || []);
      setEvents(d.events || []);
      setHealthLogs(h.logs || []);
      setFiles(f.files || []);
    } catch (e) { console.error("Data fetch error", e); }
  };

  const filipeTasks = tasks.filter(t => t.owner !== 'jarvis');
  const jarvisTasks = tasks.filter(t => t.owner === 'jarvis');
  const latestHealth = healthLogs[0] || null;

  return (
    <div className="flex h-screen w-full bg-[#050506] text-zinc-100 font-sans overflow-hidden selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-4 gap-6 bg-black/20 backdrop-blur-2xl shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 px-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/40"><Zap size={18} className="text-white" /></div>
          <div className="flex flex-col"><span className="font-bold text-sm tracking-widest uppercase italic">Jarvis</span><span className="text-[10px] text-emerald-500 font-mono">v5.0 OPERATIONAL</span></div>
        </div>
        
        <nav className="flex flex-col gap-6">
          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block">Dashboard</span>
             <SidebarItem icon={LayoutGrid} label="Overview" active={activeTab === 'Dashboard'} onClick={() => {setActiveTab('Dashboard'); setSelectedFile(null);}} />
          </div>

          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block">Business</span>
             <SidebarItem 
               icon={Building2} 
               label="BINB" 
               active={activeTab.startsWith('BINB')}
               expanded={expandedBinb}
               hasSubmenu={true}
               onClick={() => {
                 if (expandedBinb && activeTab !== 'BINB') {
                   // Colapsar: voltar para BINB
                   setActiveTab('BINB');
                   setExpandedBinb(false);
                 } else if (!expandedBinb) {
                   // Expandir e ir para BINB
                   setActiveTab('BINB');
                   setExpandedBinb(true);
                 } else {
                   // Já está em BINB: só toggle
                   setExpandedBinb(!expandedBinb);
                 }
                 setSelectedFile(null);
               }}
             />
             
             {expandedBinb && (
               <div className="ml-4 pl-2 border-l border-white/5 space-y-1 mt-1">
                 <SidebarItem 
                   icon={Bell} 
                   label="Lembretes" 
                   active={activeTab === 'BINB/Reminders'} 
                   onClick={() => {setActiveTab('BINB/Reminders'); setSelectedFile(null);}}
                 />
               </div>
             )}
          </div>

          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block">Pessoal</span>
             <SidebarItem 
               icon={User} 
               label="Pessoal" 
               active={activeTab.startsWith('Personal')}
               expanded={expandedPersonal}
               hasSubmenu={true}
               onClick={() => {
                 if (expandedPersonal && activeTab !== 'Personal') {
                   // Colapsar: voltar para Personal
                   setActiveTab('Personal');
                   setExpandedPersonal(false);
                 } else if (!expandedPersonal) {
                   // Expandir e ir para Personal
                   setActiveTab('Personal');
                   setExpandedPersonal(true);
                 } else {
                   // Já está em Personal: só toggle
                   setExpandedPersonal(!expandedPersonal);
                 }
                 setSelectedFile(null);
               }}
             />
             
             {expandedPersonal && (
               <div className="ml-4 pl-2 border-l border-white/5 space-y-1 mt-1">
                 <SidebarItem 
                   icon={Dumbbell} 
                   label="Ginásio" 
                   active={activeTab === 'Personal/Gym'} 
                   onClick={() => {setActiveTab('Personal/Gym'); setSelectedFile(null);}}
                 />
                 <SidebarItem 
                   icon={CalendarIcon} 
                   label="Calendário" 
                   active={activeTab === 'Personal/Calendar'} 
                   onClick={() => {setActiveTab('Personal/Calendar'); setSelectedFile(null);}}
                 />
                 <SidebarItem 
                   icon={Heart} 
                   label="Rotinas Familiares" 
                   active={activeTab === 'Personal/Family'} 
                   onClick={() => {setActiveTab('Personal/Family'); setSelectedFile(null);}}
                 />
               </div>
             )}
          </div>

          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block">System</span>
             <SidebarItem icon={Bot} label="Jarvis" active={activeTab === 'Jarvis'} onClick={() => {setActiveTab('Jarvis'); setSelectedFile(null);}} />
          </div>

          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block">Projects</span>
             <SidebarItem icon={Briefcase} label="Projetos" active={activeTab === 'Projects'} onClick={() => {setActiveTab('Projects'); setSelectedFile(null);}} />
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
             <SidebarItem icon={Terminal} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
          </div>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden bg-black/20">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-black/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
             <ShieldCheck className="text-emerald-500" size={18} />
             <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">
               {selectedFile ? "DOCUMENT VIEW" : 
                activeTab === 'BINB' ? 'BINB - Asset Management' :
                activeTab === 'BINB/Reminders' ? 'BINB - Lembretes' :
                activeTab === 'Personal' ? 'Pessoal' : 
                activeTab === 'Personal/Gym' ? 'Ginásio' :
                activeTab === 'Personal/Calendar' ? 'Calendário' :
                activeTab === 'Personal/Family' ? 'Rotinas Familiares' :
                activeTab === 'Projects' ? 'Projetos' :
                activeTab === 'Settings' ? 'Definições' :
                activeTab}
             </h1>
          </div>
          <div onClick={refreshData} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-500/20 text-blue-500"><RefreshCw size={14} /></div>
        </header>

        <div className="flex-1 p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'Dashboard' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SectionCard label="Active Tasks" value={filipeTasks.filter(t => !t.completed).length} unit="Pending" icon={Target} color="text-blue-500" onClick={() => setActiveTab('Projects')} />
                    <SectionCard label="Net Worth" value="2.55" unit="M€ Equity" icon={TrendingUp} color="text-emerald-500" onClick={() => setActiveTab('BINB')} />
                    <SectionCard label="Calories" value={latestHealth?.nutrition?.est_calories || 0} unit="kCal Today" icon={PieChart} color="text-orange-500" onClick={() => setActiveTab('Personal')} />
                    <SectionCard label="System Health" value="100" unit="%" icon={Activity} color="text-blue-400" onClick={() => setActiveTab('Jarvis')} />
                 </div>
                 <div className="bg-zinc-900/10 border border-white/5 p-12 rounded-[4rem] text-center"><p className="text-xl font-serif italic text-zinc-400 tracking-wide">"Construir um ecossistema de ativos diversificado para liberdade financeira absoluta."</p></div>
              </motion.div>
            ) : activeTab === 'BINB' ? (
              <BinbSection />
            ) : activeTab === 'BINB/Reminders' ? (
              <BinbRemindersSection />
            ) : activeTab === 'Personal' ? (
              <PersonalSection />
            ) : activeTab === 'Personal/Gym' ? (
              <GymSection />
            ) : activeTab === 'Personal/Calendar' ? (
              <CalendarSection />
            ) : activeTab === 'Personal/Family' ? (
              <FamilySection />
            ) : activeTab === 'Jarvis' ? (
              <JarvisSection />
            ) : activeTab === 'Projects' ? (
              <div className="max-w-6xl mx-auto space-y-8">
                 <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Projects & Agents</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SectionCard label="Active Projects" value="2" unit="projects" icon={Briefcase} color="text-blue-500" />
                    <SectionCard label="Agents Online" value="1" unit="agent" icon={Bot} color="text-emerald-500" />
                    <SectionCard label="Commits Today" value="2" unit="commits" icon={FileText} color="text-orange-500" />
                 </div>
                 <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                    <p className="text-zinc-400">GitHub integration for project tracking, sub-agent status monitoring, and progress visualization.</p>
                 </div>
              </div>
            ) : activeTab === 'Settings' ? (
              <div className="max-w-3xl mx-auto bg-zinc-900/40 border border-white/5 rounded-[3rem] p-12 shadow-2xl">
                 <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest text-blue-500">Settings</h2>
                 <p className="text-zinc-400 mb-6">Dashboard configuration and preferences.</p>
                 <div className="space-y-4">
                    <div className="p-4 bg-zinc-900/60 rounded-2xl">
                       <h3 className="font-semibold mb-2">Theme</h3>
                       <p className="text-sm text-zinc-500">Dark mode (default)</p>
                    </div>
                    <div className="p-4 bg-zinc-900/60 rounded-2xl">
                       <h3 className="font-semibold mb-2">Data Sources</h3>
                       <p className="text-sm text-zinc-500">Configure API connections</p>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                 <Search size={40} className="text-zinc-800 mb-4" />
                 <h3 className="text-xl uppercase font-black tracking-widest">Section Active</h3>
                 <p className="text-xs italic">Data nodes synchronized. Select an option to view details.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
