'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, CheckCircle, Circle, Flame, Trophy, ChevronRight,
  RefreshCw, Plus, Clock, Target, Brain, Sparkles, ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MicroSession {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  completedAt?: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  weekOf: string;
  microSessions: MicroSession[];
  resources: string[];
  notes: string;
}

interface LearningData {
  currentTopic: Topic | null;
  backlog: Array<{ id: string; name: string; priority: number; estimatedWeeks: number }>;
  completedTopics: Array<{ id: string; name: string; completedAt: string }>;
  progress: number;
  completedSessions: number;
  totalSessions: number;
  streak: number;
  lastSessionDate: string | null;
}

// Progress Bar Component
const ProgressBar = ({ progress, label, color = 'blue' }: { progress: number; label?: string; color?: string }) => {
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{label}</span>
          <span className="text-xs font-bold text-zinc-300">{progress}%</span>
        </div>
      )}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${colorClasses[color] || colorClasses.blue} rounded-full`}
        />
      </div>
    </div>
  );
};

// Streak Widget
const StreakWidget = ({ streak, lastSessionDate }: { streak: number; lastSessionDate: string | null }) => {
  const today = new Date().toISOString().split('T')[0];
  const isActiveToday = lastSessionDate === today;

  return (
    <div className={`border rounded-2xl p-5 ${
      streak > 0 
        ? 'bg-orange-500/10 border-orange-500/20' 
        : 'bg-zinc-900/30 border-white/5'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame size={18} className={streak > 0 ? 'text-orange-500' : 'text-zinc-500'} />
          <span className="text-sm font-semibold text-zinc-300">Streak</span>
        </div>
        {isActiveToday && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
            HOJE ✓
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-black ${streak > 0 ? 'text-orange-400' : 'text-zinc-600'}`}>
          {streak}
        </span>
        <span className="text-xs text-zinc-500">dias consecutivos</span>
      </div>
      {streak >= 7 && (
        <p className="text-[10px] text-orange-400/70 mt-2">
          🔥 Uma semana completa! Continua assim.
        </p>
      )}
    </div>
  );
};

// Micro Session Item
const SessionItem = ({ 
  session, 
  onComplete,
  disabled 
}: { 
  session: MicroSession; 
  onComplete: () => void;
  disabled: boolean;
}) => {
  return (
    <motion.div
      whileHover={{ x: session.completed ? 0 : 4 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        session.completed
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
      }`}
    >
      <button
        onClick={onComplete}
        disabled={disabled || session.completed}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          session.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-zinc-600 hover:border-blue-500'
        }`}
      >
        {session.completed && <CheckCircle size={14} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${session.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
          {session.title}
        </p>
      </div>
      <div className="flex items-center gap-1 text-zinc-500">
        <Clock size={12} />
        <span className="text-[10px] font-semibold">{session.duration}</span>
      </div>
    </motion.div>
  );
};

// Backlog Item
const BacklogItem = ({ topic }: { topic: { id: string; name: string; priority: number; estimatedWeeks: number } }) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-zinc-900/30 border border-white/5 rounded-xl">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
          {topic.priority}
        </span>
        <span className="text-xs font-medium text-zinc-300">{topic.name}</span>
      </div>
      <span className="text-[10px] text-zinc-500">
        {topic.estimatedWeeks} sem
      </span>
    </div>
  );
};

export default function LearningSection() {
  const [data, setData] = useState<LearningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showAddBacklog, setShowAddBacklog] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', estimatedWeeks: 1 });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/learning');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompleteSession = async (sessionId: string) => {
    if (!data?.currentTopic) return;
    
    setCompleting(sessionId);
    try {
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete-session', sessionId }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setCompleting(null);
    }
  };

  const handleAddBacklog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.name) return;

    try {
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'add-backlog', 
          name: newTopic.name,
          estimatedWeeks: newTopic.estimatedWeeks 
        }),
      });
      if (res.ok) {
        setNewTopic({ name: '', estimatedWeeks: 1 });
        setShowAddBacklog(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error adding to backlog:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
        <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest text-blue-500">
          Learning Hub
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6 animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest text-blue-500">
            Learning Hub
          </h2>
          <p className="text-zinc-500 text-[10px] md:text-xs mt-1">
            Micro-learning sessions • Track progress
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 hover:bg-blue-500/20 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-blue-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Progresso</span>
          </div>
          <div className="text-2xl font-bold text-white">{data?.progress || 0}%</div>
        </div>
        
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Sessões</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.completedSessions || 0}/{data?.totalSessions || 0}
          </div>
        </div>
        
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={14} className="text-orange-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">{data?.streak || 0} dias</div>
        </div>
        
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={14} className="text-purple-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Completos</span>
          </div>
          <div className="text-2xl font-bold text-white">{data?.completedTopics?.length || 0}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Topic */}
        <div className="lg:col-span-2 bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain size={18} className="text-purple-500" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                  Tópico da Semana
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {data?.currentTopic?.name || 'Nenhum tópico ativo'}
              </h3>
              {data?.currentTopic?.description && (
                <p className="text-xs text-zinc-400 mt-2 max-w-md">
                  {data.currentTopic.description}
                </p>
              )}
            </div>
            {data?.currentTopic && (
              <div className="text-right">
                <span className="text-3xl font-black text-blue-500">{data.progress}%</span>
                <p className="text-[10px] text-zinc-500">completo</p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {data?.currentTopic && (
            <div className="mb-6">
              <ProgressBar progress={data.progress} color="purple" />
            </div>
          )}

          {/* Micro Sessions */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <ListTodo size={14} className="text-blue-400" />
              Micro-Sessões
            </h4>
            <div className="space-y-2">
              {data?.currentTopic?.microSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  onComplete={() => handleCompleteSession(session.id)}
                  disabled={completing === session.id}
                />
              ))}
            </div>
          </div>

          {/* Resources */}
          {data?.currentTopic?.resources && data.currentTopic.resources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <BookOpen size={14} className="text-cyan-400" />
                Recursos
              </h4>
              <div className="space-y-1">
                {data.currentTopic.resources.map((resource, i) => (
                  <div key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                    <ChevronRight size={12} className="text-zinc-600" />
                    {resource}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Streak Widget */}
          <StreakWidget streak={data?.streak || 0} lastSessionDate={data?.lastSessionDate || null} />

          {/* Backlog */}
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-500" />
                Backlog
              </h4>
              <button
                onClick={() => setShowAddBacklog(!showAddBacklog)}
                className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>

            <AnimatePresence>
              {showAddBacklog && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddBacklog}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Nome do tópico"
                      value={newTopic.name}
                      onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newTopic.estimatedWeeks}
                        onChange={(e) => setNewTopic({ ...newTopic, estimatedWeeks: parseInt(e.target.value) || 1 })}
                        className="w-20 bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                      />
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg py-2 transition-all"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {data?.backlog && data.backlog.length > 0 ? (
                data.backlog.map((topic) => (
                  <BacklogItem key={topic.id} topic={topic} />
                ))
              ) : (
                <p className="text-xs text-zinc-500 text-center py-4">
                  Backlog vazio. Adiciona novos tópicos!
                </p>
              )}
            </div>
          </div>

          {/* Completed Topics */}
          {data?.completedTopics && data.completedTopics.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-4">
                <Trophy size={14} className="text-emerald-500" />
                Completados
              </h4>
              <div className="space-y-2">
                {data.completedTopics.slice(0, 5).map((topic) => (
                  <div key={topic.id} className="flex items-center gap-2 text-xs">
                    <CheckCircle size={12} className="text-emerald-500" />
                    <span className="text-zinc-300">{topic.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
