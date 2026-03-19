'use client';

import React from 'react';
import { Bell, AlertTriangle, Calendar as CalendarIcon, User, Flag } from 'lucide-react';

const SectionCard = ({ label, value, unit, icon: Icon, color }: any) => (
  <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl md:rounded-[2rem] backdrop-blur-sm shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${color}`}><Icon size={20} /></div>
      <div className="text-[10px] text-zinc-500 font-mono">{unit}</div>
    </div>
    <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-2xl md:text-3xl font-bold tracking-tighter">{value}</span>
    </div>
  </div>
);

const BinbRemindersSection = () => {
  const reminders = [
    { id: 1, title: 'Máquina de lavar', code: '223', description: 'Verificar/Reparar máquina de lavar' },
    { id: 2, title: 'Comprar e entregar fritadeiras', code: '43', description: 'Aquisição e entrega de fritadeiras' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-blue-500">BINB - Lembretes</h2>
        <div className="text-xs md:text-sm text-zinc-400">
          <span className="text-blue-400 font-bold">{reminders.length}</span> lembretes ativos
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <SectionCard label="Pendentes" value={reminders.length} unit="itens" icon={Bell} color="text-blue-500" />
        <SectionCard label="Prioridade" value="Média" unit="global" icon={AlertTriangle} color="text-orange-500" />
      </div>

      <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-zinc-300 mb-6">Lista de Lembretes</h3>
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="bg-zinc-900/40 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-white/10 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-3">
                <div>
                  <div className="text-lg font-bold text-zinc-300">{reminder.title}</div>
                  <div className="text-xs md:text-sm text-zinc-500 mt-1">{reminder.description}</div>
                </div>
                <div className="px-3 py-1 rounded-full text-[10px] md:text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 self-start md:self-auto">
                  Código {reminder.code}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-xs">
                <div className="flex items-center gap-2 text-zinc-500"><CalendarIcon size={12} /> <span>Hoje</span></div>
                <div className="flex items-center gap-2 text-zinc-500"><User size={12} /> <span>Filipe</span></div>
                <div className="flex items-center gap-2 text-zinc-500"><Flag size={12} /> <span>Pendente</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BinbRemindersSection;
