'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Trash2, RefreshCw, Plus, X, Loader2, CheckCircle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarSection = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    location: ''
  });

  const fetchEvents = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/calendar?days=7');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
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
        setNewEvent({ title: '', description: '', start: '', location: '' });
        setShowAddForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error adding event:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Tens a certeza que queres eliminar este evento do Google Calendar?')) return;
    
    try {
      const res = await fetch(`/api/calendar?eventId=${eventId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    return date.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'short' });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-blue-500">Calendário</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 md:px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-semibold hover:bg-blue-500/20 transition-all flex items-center gap-2"
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Sair' : 'Novo'}
          </button>
          <button 
            onClick={fetchEvents}
            className="p-2 bg-zinc-900/40 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-all"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-zinc-900/40 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl">
            <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Título do Evento" required
                  value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none text-sm md:text-base"
                />
                <textarea 
                  placeholder="Descrição (opcional)" 
                  value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none h-24 md:h-32 resize-none text-sm"
                />
              </div>
              <div className="space-y-4">
                <input 
                  type="datetime-local" required
                  value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none text-sm"
                />
                <input 
                  type="text" placeholder="Localização" 
                  value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none text-sm"
                />
                <button type="submit" disabled={saving} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  Guardar no Google
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="uppercase tracking-widest text-[10px] font-black">Sincronizando com o Google...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-12 text-center">
            <p className="text-zinc-500 uppercase tracking-widest text-sm font-black">Sem eventos nos próximos 7 dias</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div key={event.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                    {formatDate(event.start)}
                  </div>
                  <button onClick={() => handleDeleteEvent(event.id)} className="p-1.5 text-zinc-600 hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="text-base md:text-lg font-bold text-white mb-1 truncate">{event.summary}</h3>
                <div className="flex items-center gap-2 text-zinc-400 text-xs md:text-sm mb-3">
                  <Clock size={14} />
                  <span>{formatTime(event.start)}</span>
                </div>
                
                {event.description && <p className="text-xs md:text-sm text-zinc-500 line-clamp-2 mb-3 leading-relaxed">{event.description}</p>}
                {event.location && (
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600 italic">
                    <MapPin size={12} />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSection;
