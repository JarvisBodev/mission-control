'use client';

'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, Clock, Heart, Activity, CheckCircle, XCircle, RefreshCw, Users, TrendingUp, MapPin, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

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
  <motion.div whileHover={{ y: -5 }} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${color}`}><Icon size={20} /></div>
      <div className="text-xs text-zinc-500 font-mono">{unit}</div>
    </div>
    <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-3xl font-bold tracking-tighter">{value}</span>
      {subtitle && <span className="text-xs text-zinc-600 font-medium ml-2">{subtitle}</span>}
    </div>
  </motion.div>
);

export default function PersonalSection() {
  const [data, setData] = useState<PersonalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatTime = (dateString: string, isAllDay: boolean) => {
    if (isAllDay) return 'All day';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Personal Dashboard</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6 animate-pulse">
              <div className="h-8 bg-zinc-800/50 rounded w-32 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-zinc-800/50 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 animate-pulse">
                <div className="h-6 bg-zinc-800/50 rounded w-24 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-4 bg-zinc-800/50 rounded w-full"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Personal Dashboard</h2>
        <div className="bg-zinc-900/40 border border-red-500/20 p-8 rounded-3xl text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h3>
          <p className="text-zinc-400 mb-6">{error || 'Failed to load personal data'}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Personal Dashboard</h2>
        <button
          onClick={fetchData}
          className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 text-blue-500 transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Calendar Events */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-zinc-300">Calendar Events</h3>
              <span className="text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full">
                Next 7 days
              </span>
            </div>
            
            {!data.calendar.configured ? (
              <div className="p-6 text-center">
                <CalendarIcon className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-zinc-300 mb-2">Calendar Not Configured</h4>
                <p className="text-zinc-500">
                  GOG_KEYRING_PASSWORD environment variable is required to access Google Calendar.
                </p>
              </div>
            ) : data.calendar.events.length === 0 ? (
              <div className="p-6 text-center">
                <CalendarIcon className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-zinc-300 mb-2">No upcoming events</h4>
                <p className="text-zinc-500">You have no events scheduled for the next 7 days.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.calendar.events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="group bg-zinc-900/30 border border-white/5 p-4 rounded-2xl hover:bg-zinc-900/50 hover:border-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <h4 className="font-semibold text-zinc-200 group-hover:text-white">
                            {event.summary}
                          </h4>
                        </div>
                        
                        <div className="space-y-2 pl-5">
                          <div className="flex items-center gap-3 text-sm">
                            <Clock size={14} className="text-zinc-500" />
                            <span className="text-zinc-400">
                              {formatDate(event.start)} • {formatTime(event.start, event.isAllDay)}
                              {!event.isAllDay && ` – ${formatTime(event.end, false)}`}
                            </span>
                          </div>
                        
                          {event.location && (
                            <div className="flex items-center gap-3 text-sm">
                              <MapPin size={14} className="text-zinc-500" />
                              <span className="text-zinc-400 truncate">{event.location}</span>
                            </div>
                          )}
                          
                          {event.attendees.length > 0 && (
                            <div className="flex items-center gap-3 text-sm">
                              <Users size={14} className="text-zinc-500" />
                              <span className="text-zinc-400">
                                {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {data.calendar.configured && data.calendar.events.length > 5 && (
              <div className="pt-4 border-t border-white/5 text-center">
                <p className="text-sm text-zinc-500">
                  +{data.calendar.events.length - 5} more events
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column: Summary Cards */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <SectionCard 
              label="Next Event" 
              value={data.calendar.configured && data.calendar.events.length > 0 ? "Today" : "None"} 
              unit={data.calendar.configured && data.calendar.events.length > 0 ? formatTime(data.calendar.events[0].start, data.calendar.events[0].isAllDay) : ""} 
              icon={CalendarIcon} 
              color="text-blue-500" 
            />
            <SectionCard 
              label="Last Workout" 
              value={data.gymProgress.lastWorkoutDate ? data.gymProgress.lastWorkoutDate.split('-')[2] : "N/A"} 
              unit="Mar" 
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
              {data.familyRoutines.map((routine) => (
                <div key={routine.name} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">{routine.name}</span>
                  <span className="text-zinc-300">{routine.schedule}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
            <h3 className="font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-500" />
              Gym Progress
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Workouts (Mar)</span>
                <span className="text-zinc-300">{data.gymProgress.marchWorkouts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Latest PR</span>
                <span className="text-zinc-300 truncate">{data.gymProgress.latestPR}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Last workout</span>
                <span className="text-zinc-300">{data.gymProgress.lastWorkoutDate || 'Not recorded'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
            <h3 className="font-semibold text-zinc-300 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="mt-2 flex items-center justify-between">
                <span className="text-zinc-400">Events this week</span>
                <span className="text-zinc-300">{data.quickStats.eventsThisWeek}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-zinc-400">Family tasks pending</span>
                <span className="text-zinc-300">{data.quickStats.familyTasks}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}