'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, Clock, Heart, Activity, CheckCircle, XCircle, RefreshCw, Users, TrendingUp, MapPin, Dumbbell, Plus, X, Loader2, ChevronRight, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalData {
  familyRoutines: Array<{
    name: string;
    schedule: string;
    description: string;
  }>;
  gymProgress: {
    lastWorkoutDate: string | null;
    marchWorkouts: number;
    latestPR: string;
    muscleGroup: string;
    workoutDetails: string;
    recentWorkouts: Array<{date: string, muscleGroup: string, details: string}>;
    hasData: boolean;
  };
  calendar: {
    events: Array<{
      id: string;
      summary: string;
      description: string;
      start: string;
      end: string;
      location: string;
      attendees: string[];
      isAllDay: boolean;
    }>;
    configured: boolean;
  };
  quickStats: {
    eventsThisWeek: number;
    workoutsMarch: number;
    familyTasks: number;
    nextEvent: any;
  };
  error?: string;
}

const SectionCard = ({ label, value, unit, icon: Icon, color, subtitle }: any) => (
  <motion.div whileHover={{ y: -5 }} className="bg-zinc-900/40 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] backdrop-blur-sm shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${color}`}><Icon size={20} /></div>
      <div className="text-[10px] text-zinc-500 font-mono">{unit}</div>
    </div>
    <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-2xl md:text-3xl font-bold tracking-tighter">{value}</span>
      {subtitle && <span className="text-[10px] text-zinc-600 font-medium ml-2">{subtitle}</span>}
    </div>
  </motion.div>
);

export default function PersonalSection({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [data, setData] = useState<PersonalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for In-Place Event Creation
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', description: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/personal');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load personal data');
      console.error('Failed to fetch personal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        setNewEvent({ title: '', start: '', description: '' });
        setShowAddForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error adding event:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteEvent = async (eventId: string) => {
    if (!confirm('Marcar este compromisso como concluído (eliminar do calendário)?')) return;
    
    try {
      const res = await fetch(`/api/calendar?eventId=${eventId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error completing event:', error);
    }
  };

  const formatTime = (dateString: string, isAllDay: boolean) => {
    if (isAllDay) return 'Dia inteiro';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    
    return date.toLocaleDateString('pt-PT', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFilteredEvents = () => {
    if (!data?.calendar?.events) return [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    return data.calendar.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= today && eventDate < dayAfterTomorrow;
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-blue-500">Dashboard Pessoal</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-6 animate-pulse h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 px-4">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-blue-500 text-center md:text-left">Dashboard Pessoal</h2>
        <div className="bg-zinc-900/40 border border-red-500/20 p-8 rounded-2xl text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-red-400 mb-2">Erro de Ligação</h3>
          <button onClick={fetchData} className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-0">
      {/* Mobile Header Optimization */}
      <div className="flex items-center justify-between px-4 md:px-0">
        <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest text-blue-500 truncate mr-2">Pessoal</h2>
        <div className="flex items-center gap-2">
           <button onClick={fetchData} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500 transition-all active:scale-95">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base md:text-xl font-semibold text-zinc-300">Agenda: Hoje e Amanhã</h3>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-2 md:px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold hover:bg-blue-500/20 transition-all flex items-center gap-1.5"
              >
                {showAddForm ? <X size={14} /> : <Plus size={14} />}
                {showAddForm ? 'Sair' : 'Adicionar'}
              </button>
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                  <form onSubmit={handleAddEvent} className="bg-black/40 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl space-y-4">
                    <input 
                      type="text" placeholder="O que tens agendado?" required
                      value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="datetime-local" required
                        value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                      />
                      <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl h-12 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        Guardar
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!data.calendar.configured ? (
              <div className="py-10 text-center">
                <CalendarIcon className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                <h4 className="text-sm font-semibold text-zinc-400">Calendário Não Configurado</h4>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-12 text-center bg-zinc-900/10 border border-white/5 rounded-2xl md:rounded-3xl px-4">
                <CalendarIcon className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                <h4 className="text-base font-semibold text-zinc-300 mb-1">Agenda livre</h4>
                <p className="text-xs text-zinc-500">Nada marcado para hoje ou amanhã.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="group bg-zinc-900/30 border border-white/5 p-4 rounded-xl md:rounded-2xl hover:bg-zinc-900/50 hover:border-white/10 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                          <h4 className="font-semibold text-zinc-200 text-sm md:text-base group-hover:text-white truncate">{event.summary}</h4>
                        </div>
                        <div className="pl-3.5">
                          <div className="flex items-center gap-2 text-[11px] md:text-sm">
                            <Clock size={12} className="text-zinc-500 flex-shrink-0" />
                            <span className="text-zinc-400 truncate">{formatDate(event.start)} • {formatTime(event.start, event.isAllDay)}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCompleteEvent(event.id)}
                        className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 md:opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                        title="Concluir"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-6 mt-6 border-t border-white/5 text-center">
              <button 
                onClick={() => setActiveTab?.('Personal/Calendar')}
                className="text-[10px] md:text-xs text-zinc-500 hover:text-blue-400 transition-colors uppercase font-black tracking-widest flex items-center justify-center gap-2 mx-auto"
              >
                Vista Completa
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Sidebar Cards Stack on Mobile */}
        <div className="space-y-6 order-1 lg:order-2">
          <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            <SectionCard label="Próximo" value={filteredEvents.length > 0 ? "Hoje" : "Nenhum"} unit={filteredEvents.length > 0 ? formatTime(filteredEvents[0].start, filteredEvents[0].isAllDay) : ""} icon={CalendarIcon} color="text-blue-500" />
            <SectionCard label="Treino" value={data.gymProgress.lastWorkoutDate ? data.gymProgress.lastWorkoutDate.split('-')[2] : "N/D"} unit="Março" icon={Activity} color="text-emerald-500" />
          </div>
          
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><Heart size={16} className="text-orange-500" /> Rotinas</h3>
            <div className="space-y-4">
              {data.familyRoutines.map((routine) => (
                <div key={routine.name} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">{routine.name}</span>
                  <span className="text-zinc-300 bg-white/5 px-2 py-0.5 rounded text-[10px]">{routine.schedule}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-purple-500" /> Ginásio</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between"><span className="text-zinc-400">Total (Mar)</span><span className="text-zinc-200 font-bold">{data.gymProgress.marchWorkouts} sessões</span></div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Último destaque:</p>
                <p className="text-zinc-300 italic line-clamp-2 leading-relaxed">{data.gymProgress.workoutDetails || 'Nenhum registo'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
