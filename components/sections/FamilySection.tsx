'use client';

import { useState, useEffect } from 'react';
import { 
  Heart, Calendar, Clock, Users, Phone, MapPin, Bell,
  RefreshCw, ChevronRight, Baby, Dumbbell, Sparkles, Home
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Routine {
  id: string;
  person: string;
  activity: string;
  time: string;
  days: string[];
  icon: 'school' | 'gym' | 'spa' | 'other';
  color: string;
}

interface Contact {
  name: string;
  relation: string;
  phone: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  person?: string;
  type: 'family' | 'school' | 'activity' | 'appointment';
}

// Predefined family data
const familyRoutines: Routine[] = [
  {
    id: 'lourenco-colegio',
    person: 'Lourenço',
    activity: 'Colégio',
    time: '09:00 - 16:45',
    days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    icon: 'school',
    color: 'blue',
  },
  {
    id: 'bia-treino',
    person: 'Bia',
    activity: 'Treino',
    time: '13:45',
    days: ['Quarta'],
    icon: 'gym',
    color: 'emerald',
  },
  {
    id: 'bia-massagem',
    person: 'Bia',
    activity: 'Massagem',
    time: '11:30',
    days: ['Quarta'],
    icon: 'spa',
    color: 'purple',
  },
];

const quickContacts: Contact[] = [
  { name: 'Bia', relation: 'Esposa', phone: '+351 9XX XXX XXX' },
  { name: 'Lourenço', relation: 'Filho', phone: 'N/A' },
  { name: 'Mãe', relation: 'Mãe', phone: '+351 9XX XXX XXX' },
  { name: 'Colégio', relation: 'Escola', phone: '+351 2XX XXX XXX' },
];

const getIconForRoutine = (icon: string) => {
  switch (icon) {
    case 'school': return Baby;
    case 'gym': return Dumbbell;
    case 'spa': return Sparkles;
    default: return Clock;
  }
};

const getColorClasses = (color: string) => {
  const colors: { [key: string]: { bg: string; border: string; text: string } } = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  };
  return colors[color] || colors.blue;
};

// Routine Card Component
const RoutineCard = ({ routine }: { routine: Routine }) => {
  const Icon = getIconForRoutine(routine.icon);
  const colors = getColorClasses(routine.color);
  const today = new Date().toLocaleDateString('pt-PT', { weekday: 'long' });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
  const isToday = routine.days.some(d => d.toLowerCase() === todayCapitalized.toLowerCase());

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${colors.bg} border ${colors.border} rounded-2xl p-4 relative overflow-hidden`}
    >
      {isToday && (
        <div className="absolute top-2 right-2">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">
            Hoje
          </span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border}`}>
          <Icon size={18} className={colors.text} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-white">{routine.person}</span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">{routine.activity}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock size={12} />
            <span>{routine.time}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {routine.days.map((day) => (
              <span
                key={day}
                className={`text-[9px] px-1.5 py-0.5 rounded ${
                  day.toLowerCase() === todayCapitalized.toLowerCase()
                    ? `${colors.bg} ${colors.text} font-bold`
                    : 'bg-zinc-900/50 text-zinc-500'
                }`}
              >
                {day.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Weekly Calendar Widget
const WeeklyCalendar = () => {
  const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const res = await fetch('/api/calendar');
        if (res.ok) {
          const data = await res.json();
          setWeekEvents(data.events?.slice(0, 7) || []);
        }
      } catch (error) {
        console.error('Error fetching calendar:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarEvents();
  }, []);

  const getDaysOfWeek = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date,
        dayName: date.toLocaleDateString('pt-PT', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  };

  const days = getDaysOfWeek();

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-blue-500" />
        <h3 className="text-sm font-bold text-zinc-300">Semana Família</h3>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((day, i) => (
          <div
            key={i}
            className={`text-center p-2 rounded-xl ${
              day.isToday
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'bg-zinc-900/50'
            }`}
          >
            <span className="text-[10px] text-zinc-500 uppercase block">{day.dayName}</span>
            <span className={`text-sm font-bold ${day.isToday ? 'text-blue-400' : 'text-zinc-300'}`}>
              {day.dayNumber}
            </span>
          </div>
        ))}
      </div>

      {/* Events */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-12 bg-zinc-900/50 rounded-xl" />
          ))}
        </div>
      ) : weekEvents.length > 0 ? (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {weekEvents.slice(0, 5).map((event) => (
            <div
              key={event.id}
              className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-full bg-blue-500" />
                <div>
                  <p className="text-xs font-medium text-zinc-200">{event.title}</p>
                  <p className="text-[10px] text-zinc-500">
                    {new Date(event.date).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric' })}
                    {event.time && ` • ${event.time}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-zinc-500 text-xs">
          Nenhum evento esta semana
        </div>
      )}
    </div>
  );
};

// Quick Contacts Widget
const QuickContactsWidget = () => {
  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Phone size={16} className="text-emerald-500" />
        <h3 className="text-sm font-bold text-zinc-300">Contactos Rápidos</h3>
      </div>

      <div className="space-y-2">
        {quickContacts.map((contact) => (
          <div
            key={contact.name}
            className="flex items-center justify-between bg-zinc-900/50 border border-white/5 rounded-xl p-3 hover:bg-zinc-900/70 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-xs font-bold text-zinc-400">
                  {contact.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-200">{contact.name}</p>
                <p className="text-[10px] text-zinc-500">{contact.relation}</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-zinc-600" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function FamilySection() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Get today's routines
  const today = new Date().toLocaleDateString('pt-PT', { weekday: 'long' });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
  const todayRoutines = familyRoutines.filter(r => 
    r.days.some(d => d.toLowerCase() === todayCapitalized.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest text-blue-500 flex items-center gap-3">
            <Heart className="text-red-500" size={28} />
            Família
          </h2>
          <p className="text-zinc-500 text-[10px] md:text-xs mt-1">
            Rotinas • Calendário • Contactos
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 hover:bg-blue-500/20 transition-all"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Today's Summary */}
      {todayRoutines.length > 0 && (
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-orange-400" />
            <span className="text-sm font-bold text-zinc-300">Hoje - {todayCapitalized}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {todayRoutines.map((routine) => {
              const Icon = getIconForRoutine(routine.icon);
              const colors = getColorClasses(routine.color);
              return (
                <div
                  key={routine.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colors.bg} border ${colors.border}`}
                >
                  <Icon size={14} className={colors.text} />
                  <span className="text-xs font-semibold text-zinc-300">
                    {routine.person} - {routine.activity}
                  </span>
                  <span className="text-[10px] text-zinc-500">{routine.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routines Column */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users size={18} className="text-purple-500" />
              <h3 className="text-lg font-bold text-zinc-300">Rotinas Semanais</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyRoutines.map((routine) => (
                <RoutineCard key={routine.id} routine={routine} />
              ))}
            </div>

            {/* Add New Routine Placeholder */}
            <div className="mt-4 border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-all cursor-pointer">
              <Home size={24} className="text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Adicionar nova rotina</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <WeeklyCalendar />
          <QuickContactsWidget />
        </div>
      </div>

      {/* Family Quote */}
      <div className="bg-zinc-900/10 border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl text-center">
        <Heart size={24} className="text-red-500/50 mx-auto mb-3" />
        <p className="text-sm md:text-base font-serif italic text-zinc-500 leading-relaxed">
          "A família é onde a vida começa e o amor nunca acaba."
        </p>
      </div>
    </div>
  );
}
