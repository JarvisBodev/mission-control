'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const BinbReservasSection = () => {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/binb')
      .then(res => res.json())
      .then(data => {
        setReservas(data.reservas || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  const getStatusColor = (status: string, depositoPago: boolean) => {
    if (depositoPago) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (status === 'Pendente') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (status === 'Cancelada') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-blue-500">Reservas</h2>
        <div className="text-xs md:text-sm text-zinc-400">
          <span className="text-blue-400 font-bold">{reservas.length}</span> reservas activas
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl">
          <div className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Total Reservas</div>
          <div className="text-2xl md:text-3xl font-bold">{reservas.length}</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl">
          <div className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Depósitos Pendentes</div>
          <div className="text-2xl md:text-3xl font-bold text-amber-400">{reservas.filter(r => !r.depositoPago).length}</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl">
          <div className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Valor Reservado</div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-400">€{reservas.reduce((sum, r) => sum + (r.valorTotal || 0), 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-zinc-900/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-zinc-300 mb-6">Lista de Reservas</h3>
        {loading ? (
          <div className="text-center py-8 text-zinc-500 animate-pulse">A carregar...</div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">Sem reservas activas</div>
        ) : (
          <div className="space-y-4">
            {reservas.map((reserva, idx) => (
              <div key={reserva.id || idx} className="bg-zinc-900/40 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-white/10 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-3">
                  <div>
                    <div className="text-lg md:text-xl font-bold text-zinc-200">{reserva.nome}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Apt {reserva.apartamento} • {reserva.quartos} quartos • {reserva.email}
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold border self-start md:self-auto ${getStatusColor(reserva.status, reserva.depositoPago)}`}>
                    {reserva.depositoPago ? '✓ Confirmada' : reserva.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
                  <div>
                    <div className="text-zinc-500 mb-1">Check-in</div>
                    <div className="font-semibold text-zinc-300">{formatDate(reserva.inicio)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 mb-1">Check-out</div>
                    <div className="font-semibold text-zinc-300">{formatDate(reserva.fim)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 mb-1">Renda Mensal</div>
                    <div className="font-semibold text-emerald-400">€{reserva.rendaMensal?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 mb-1">Valor Total</div>
                    <div className="font-semibold text-blue-400">€{reserva.valorTotal?.toLocaleString()}</div>
                  </div>
                </div>

                {!reserva.depositoPago && reserva.depositoDeadline && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                      <AlertTriangle size={14} />
                      Depósito pendente até {formatDate(reserva.depositoDeadline)}
                    </div>
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

export default BinbReservasSection;
