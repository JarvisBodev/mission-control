'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Check, X, Calendar, Clock, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  type: 'reminder' | 'appointment' | 'task';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

interface RemindersData {
  reminders: Reminder[];
  completed: Reminder[];
  calendarEvents: any[];
  total: number;
}

export default function RemindersPanel() {
  const [data, setData] = useState<RemindersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    type: 'reminder' as const
  });

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async () => {
    if (!newReminder.title.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReminder)
      });
      const result = await response.json();
      if (result.success) {
        setNewReminder({ title: '', description: '', dueDate: '', dueTime: '', type: 'reminder' });
        setShowAddForm(false);
        await fetchReminders();
      }
    } catch (error) {
      console.error('Failed to add reminder:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await fetch('/api/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'complete' })
      });
      await fetchReminders();
    } catch (error) {
      console.error('Failed to complete reminder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres apagar este lembrete?')) return;
    try {
      await fetch(`/api/reminders?id=${id}`, { method: 'DELETE' });
      await fetchReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-purple-500" />
          <span className="font-semibold">Lembretes & Agenda</span>
          {data && data.reminders.length > 0 && (
            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
              {data.reminders.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReminders}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={14} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
            title="Adicionar"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-3 space-y-3">
              <input
                type="text"
                placeholder="Título do lembrete..."
                value={newReminder.title}
                onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={newReminder.description}
                onChange={e => setNewReminder({ ...newReminder, description: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500 resize-none"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={newReminder.dueDate}
                  onChange={e => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                  className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
                <input
                  type="time"
                  value={newReminder.dueTime}
                  onChange={e => setNewReminder({ ...newReminder, dueTime: e.target.value })}
                  className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newReminder.type}
                  onChange={e => setNewReminder({ ...newReminder, type: e.target.value as any })}
                  className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="reminder">Lembrete</option>
                  <option value="appointment">Compromisso</option>
                  <option value="task">Tarefa</option>
                </select>
                <button
                  onClick={handleAdd}
                  disabled={saving || !newReminder.title.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Adicionar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminders List */}
      {loading && !data ? (
        <div className="text-center py-4">
          <Loader2 size={20} className="animate-spin text-zinc-500 mx-auto" />
        </div>
      ) : data?.reminders.length === 0 ? (
        <div className="text-center py-4 text-zinc-500 text-sm">
          Sem lembretes pendentes
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data?.reminders.map(reminder => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 border border-white/5 rounded-lg p-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      reminder.type === 'appointment' ? 'bg-blue-500/20 text-blue-400' :
                      reminder.type === 'task' ? 'bg-green-500/20 text-green-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {reminder.type === 'appointment' ? 'Compromisso' : 
                       reminder.type === 'task' ? 'Tarefa' : 'Lembrete'}
                    </span>
                    {reminder.dueDate && (
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(reminder.dueDate)}
                        {reminder.dueTime && (
                          <>
                            <Clock size={10} className="ml-1" />
                            {reminder.dueTime}
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">{reminder.title}</p>
                  {reminder.description && (
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{reminder.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleComplete(reminder.id)}
                    className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-500 transition-colors"
                    title="Marcar como completo"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                    title="Apagar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Calendar Events Preview */}
      {data?.calendarEvents && data.calendarEvents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
            <Calendar size={12} />
            Próximos eventos do Google Calendar
          </div>
          <div className="space-y-1">
            {data.calendarEvents.slice(0, 3).map((event: any, idx: number) => (
              <div key={idx} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                {event.summary || event.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
