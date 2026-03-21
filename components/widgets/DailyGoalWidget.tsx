'use client';

import { useState, useEffect } from 'react';
import { 
  Target, Zap, CheckCircle, Circle, Flame, Trophy,
  Plus, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyGoals {
  mainGoal: string;
  quickWins: Array<{ id: string; text: string; completed: boolean }>;
  streak: number;
  lastCompletedDate: string | null;
}

const LOCAL_STORAGE_KEY = 'mission-control-daily-goals';

export default function DailyGoalWidget() {
  const [goals, setGoals] = useState<DailyGoals>({
    mainGoal: '',
    quickWins: [],
    streak: 0,
    lastCompletedDate: null,
  });
  const [editingMain, setEditingMain] = useState(false);
  const [newMainGoal, setNewMainGoal] = useState('');
  const [addingWin, setAddingWin] = useState(false);
  const [newWin, setNewWin] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        
        // Check if it's a new day - reset if so
        if (parsed.lastCompletedDate !== today && parsed.lastCompletedDate) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const allCompleted = parsed.quickWins.every((w: any) => w.completed) && parsed.mainGoal;
          
          // Calculate streak
          let newStreak = parsed.streak || 0;
          if (parsed.lastCompletedDate === yesterday && allCompleted) {
            // Keep streak going
          } else if (parsed.lastCompletedDate < yesterday) {
            // Streak broken
            newStreak = 0;
          }
          
          // Reset for new day
          setGoals({
            mainGoal: '',
            quickWins: [],
            streak: newStreak,
            lastCompletedDate: null,
          });
        } else {
          setGoals(parsed);
        }
      } catch (e) {
        console.error('Error loading goals:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const handleSetMainGoal = () => {
    if (newMainGoal.trim()) {
      setGoals(prev => ({ ...prev, mainGoal: newMainGoal.trim() }));
      setNewMainGoal('');
      setEditingMain(false);
    }
  };

  const handleAddQuickWin = () => {
    if (newWin.trim() && goals.quickWins.length < 3) {
      setGoals(prev => ({
        ...prev,
        quickWins: [
          ...prev.quickWins,
          { id: Date.now().toString(), text: newWin.trim(), completed: false }
        ]
      }));
      setNewWin('');
      setAddingWin(false);
    }
  };

  const toggleQuickWin = (id: string) => {
    setGoals(prev => {
      const updated = {
        ...prev,
        quickWins: prev.quickWins.map(w =>
          w.id === id ? { ...w, completed: !w.completed } : w
        )
      };
      
      // Check if all completed
      const allWinsCompleted = updated.quickWins.every(w => w.completed);
      const hasMainGoal = !!updated.mainGoal;
      
      if (allWinsCompleted && hasMainGoal && updated.quickWins.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        if (updated.lastCompletedDate !== today) {
          updated.streak = (updated.streak || 0) + 1;
          updated.lastCompletedDate = today;
        }
      }
      
      return updated;
    });
  };

  const removeQuickWin = (id: string) => {
    setGoals(prev => ({
      ...prev,
      quickWins: prev.quickWins.filter(w => w.id !== id)
    }));
  };

  const completedCount = goals.quickWins.filter(w => w.completed).length;
  const totalWins = goals.quickWins.length;
  const allCompleted = totalWins > 0 && completedCount === totalWins && goals.mainGoal;

  return (
    <div className={`border rounded-2xl p-5 transition-all ${
      allCompleted 
        ? 'bg-emerald-500/10 border-emerald-500/20' 
        : 'bg-zinc-900/30 border-white/5'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={16} className={allCompleted ? 'text-emerald-500' : 'text-blue-500'} />
          <h3 className="text-sm font-bold text-zinc-300">Metas do Dia</h3>
        </div>
        {goals.streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
            <Flame size={12} className="text-orange-400" />
            <span className="text-[10px] font-bold text-orange-400">{goals.streak}</span>
          </div>
        )}
      </div>

      {/* Main Goal */}
      <div className="mb-4">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-2">
          Meta Principal
        </span>
        {goals.mainGoal && !editingMain ? (
          <div 
            onClick={() => setEditingMain(true)}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 cursor-pointer hover:bg-blue-500/20 transition-all"
          >
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-400" />
              <span className="text-sm font-semibold text-white">{goals.mainGoal}</span>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-3">
            <input
              type="text"
              placeholder="Qual é a tua meta principal hoje?"
              value={newMainGoal}
              onChange={(e) => setNewMainGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSetMainGoal()}
              className="w-full bg-transparent text-sm text-white outline-none placeholder-zinc-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              {editingMain && (
                <button
                  onClick={() => setEditingMain(false)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSetMainGoal}
                className="text-[10px] text-blue-400 font-semibold hover:text-blue-300"
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Wins */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
            Quick Wins ({completedCount}/{totalWins})
          </span>
          {totalWins < 3 && (
            <button
              onClick={() => setAddingWin(true)}
              className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all"
            >
              <Plus size={12} className="text-zinc-400" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {goals.quickWins.map((win) => (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                  win.completed
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-zinc-900/50 border-white/5'
                }`}
              >
                <button
                  onClick={() => toggleQuickWin(win.id)}
                  className="flex-shrink-0"
                >
                  {win.completed ? (
                    <CheckCircle size={16} className="text-emerald-500" />
                  ) : (
                    <Circle size={16} className="text-zinc-600 hover:text-blue-400 transition-colors" />
                  )}
                </button>
                <span className={`flex-1 text-xs ${
                  win.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'
                }`}>
                  {win.text}
                </span>
                <button
                  onClick={() => removeQuickWin(win.id)}
                  className="p-1 rounded hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={12} className="text-zinc-600" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Quick Win Input */}
          <AnimatePresence>
            {addingWin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
                  <Circle size={16} className="text-zinc-600 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Nova quick win..."
                    value={newWin}
                    onChange={(e) => setNewWin(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddQuickWin();
                      if (e.key === 'Escape') setAddingWin(false);
                    }}
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder-zinc-500"
                    autoFocus
                  />
                  <button
                    onClick={() => setAddingWin(false)}
                    className="p-1"
                  >
                    <X size={12} className="text-zinc-500" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {totalWins === 0 && !addingWin && (
            <button
              onClick={() => setAddingWin(true)}
              className="w-full py-3 border border-dashed border-white/10 rounded-xl text-xs text-zinc-500 hover:border-white/20 hover:text-zinc-400 transition-all"
            >
              + Adicionar quick wins
            </button>
          )}
        </div>
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 pt-4 border-t border-emerald-500/20 text-center"
          >
            <Trophy size={24} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-emerald-400 font-semibold">
              Dia completo! 🎉
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
