'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Dumbbell, BarChart3, TrendingUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const SectionCard = ({ label, value, unit, icon: Icon, color }: any) => (
  <motion.div whileHover={{ y: -5 }} className="bg-zinc-900/40 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] backdrop-blur-sm shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${color}`}><Icon size={20} /></div>
      <div className="text-[10px] text-zinc-500 font-mono">{unit}</div>
    </div>
    <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-2xl md:text-3xl font-bold tracking-tighter">{value}</span>
    </div>
  </motion.div>
);

const GymSection = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<number>>(new Set([0]));

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
      <div className="max-w-7xl mx-auto px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-blue-500 mb-8">Ginásio</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-zinc-900/40 rounded-3xl"></div>
          <div className="h-64 bg-zinc-900/20 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const currentMonth = "Março";
  const nextMonth = "Abril";

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-blue-500">Ginásio</h2>
        <div className="flex items-center gap-4 text-xs md:text-sm">
          <div className="text-zinc-400">
            <span className="font-bold text-blue-400">{currentMonth}</span>
          </div>
          <div className="text-zinc-400">
            <span className="text-emerald-500 font-bold">{data?.stats?.marchWorkouts || 0}</span> treinos
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <SectionCard label="Frequência" value={data?.stats?.frequency || 'N/D'} unit={`em ${currentMonth}`} icon={Activity} color="text-emerald-500" />
        <SectionCard label="Último" value={data?.stats?.lastWorkout?.split('-')[2] || 'N/D'} unit={currentMonth} icon={Dumbbell} color="text-blue-500" />
        <SectionCard label="Volume" value={data?.stats?.totalSets || 0} unit="sets" icon={BarChart3} color="text-purple-500" />
        <SectionCard label="PRs" value={data?.stats?.prCount || 0} unit="Personal Records" icon={TrendingUp} color="text-orange-500" />
      </div>

      <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-zinc-300 mb-4">Histórico de Treinos</h3>
        
        <div className="space-y-3">
          {data?.workouts?.map((workout: any, idx: number) => (
            <div key={idx} className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
              <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => toggleWorkout(idx)}>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-zinc-300">{workout.date}</div>
                  <div className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {workout.muscleGroup}
                  </div>
                  {workout.prNote && (
                    <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      🏆 PR
                    </div>
                  )}
                </div>
                <ChevronDown size={18} className={`text-zinc-500 transition-transform ${expandedWorkouts.has(idx) ? 'rotate-180' : ''}`} />
              </div>

              {expandedWorkouts.has(idx) && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5">
                  <div className="space-y-4">
                    {workout.exercises?.map((ex: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="text-sm font-semibold text-zinc-300">{ex.name}</div>
                        <div className="space-y-0.5 pl-4">
                          {ex.sets?.map((set: string, j: number) => (
                            <div key={j} className="text-xs text-zinc-400 font-mono">{set}</div>
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
    </div>
  );
};

export default GymSection;
