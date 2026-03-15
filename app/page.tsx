'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, FileText, Brain, Briefcase, LayoutGrid, Activity, 
  ShieldCheck, Zap, Cpu, LucideIcon, ChevronRight, PlusCircle,
  Calendar as CalendarIcon, Clock, Trash2, CheckCircle2, Circle,
  Terminal, RefreshCw, HardDrive, ChevronLeft, Bot, User, Target,
  TrendingUp, Home, Building2, Heart, Search, Hammer, Calculator, Plane, Eraser,
  BarChart3, ChevronDown, PieChart, Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarEvents from '../components/ui/CalendarEvents';

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

export default function MissionControl() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mounted, setMounted] = useState(false);

  // Data State
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    refreshData();
  }, []);

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

  if (!mounted) return <div className="bg-black h-screen w-full" />;

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
             <SidebarItem icon={Building2} label="BINB" active={activeTab === 'BINB'} onClick={() => {setActiveTab('BINB'); setSelectedFile(null);}} />
          </div>

          <div className="space-y-1">
             <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2 block">Personal</span>
             <SidebarItem icon={User} label="Pessoal" active={activeTab === 'Personal'} onClick={() => {setActiveTab('Personal'); setSelectedFile(null);}} />
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
             <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">{selectedFile ? "DOCUMENT VIEW" : activeTab}</h1>
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
              <div className="max-w-6xl mx-auto space-y-8">
                 <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">BINB - Asset Management</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SectionCard label="Apartments" value="6" unit="Units" icon={Building2} color="text-blue-500" />
                    <SectionCard label="Occupancy" value="83%" unit="Rate" icon={TrendingUp} color="text-emerald-500" />
                    <SectionCard label="Monthly Rent" value="€3,850" unit="Total" icon={Calculator} color="text-orange-500" />
                 </div>
                 <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                    <p className="text-zinc-400">Integration with Google Sheets for real-time apartment data, rent tracking, and contract management.</p>
                 </div>
              </div>
            ) : activeTab === 'Personal' ? (
              <div className="max-w-7xl mx-auto space-y-8">
                 <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Personal Dashboard</h2>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Left column: Calendar Events */}
                   <div className="lg:col-span-2">
                     <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
                       <CalendarEvents />
                     </div>
                   </div>
                   
                   {/* Right column: Summary Cards */}
                   <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                       <SectionCard 
                         label="Next Event" 
                         value="Today" 
                         unit="14:30" 
                         icon={CalendarIcon} 
                         color="text-blue-500" 
                         onClick={() => {/* TODO: Scroll to events */}}
                       />
                       <SectionCard 
                         label="Last Workout" 
                         value="Pernas" 
                         unit="12/03" 
                         icon={Activity} 
                         color="text-emerald-500"
                       />
                     </div>
                     
                     <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
                       <h3 className="font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                         <Heart size={16} className="text-orange-500" />
                         Family Routines
                       </h3>
                       <div className="space-y-3">
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-zinc-400">Lourenço</span>
                           <span className="text-zinc-300">09:00-16:45</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-zinc-400">Bia (Treino)</span>
                           <span className="text-zinc-300">Qua 13:45</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-zinc-400">Bia (Massagem)</span>
                           <span className="text-zinc-300">Qua 11:30</span>
                         </div>
                       </div>
                     </div>
                     
                     <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
                       <h3 className="font-semibold text-zinc-300 mb-3">Quick Stats</h3>
                       <div className="space-y-2 text-sm">
                         <div className="flex items-center justify-between">
                           <span className="text-zinc-400">Events this week</span>
                           <span className="text-zinc-300">5</span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-zinc-400">Workouts (Mar)</span>
                           <span className="text-zinc-300">8</span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-zinc-400">Family tasks</span>
                           <span className="text-zinc-300">3 pending</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            ) : activeTab === 'Jarvis' ? (
              <div className="max-w-6xl mx-auto space-y-8">
                 <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Jarvis System Status</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SectionCard label="Gateway" value="Online" unit="" icon={ShieldCheck} color="text-emerald-500" />
                    <SectionCard label="Tokens Today" value="842" unit="tokens" icon={Zap} color="text-blue-500" />
                    <SectionCard label="Active Sessions" value="1" unit="session" icon={Terminal} color="text-orange-500" />
                 </div>
                 <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                    <p className="text-zinc-400">Real-time monitoring of Clawdbot Gateway, token usage analytics, and system health metrics.</p>
                 </div>
              </div>
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
