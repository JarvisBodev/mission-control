'use client';

import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap, Terminal, Cpu, AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Server, Users, BarChart3, Clock, CpuIcon, Power, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface JarvisData {
  gateway: {
    status: 'online' | 'offline' | 'error';
    reachable: boolean;
    latency: number;
    url: string;
    service: string;
  };
  tokens: {
    today: number;
    week: number;
    recentSessions: number;
  };
  sessions: {
    total: number;
    recent: Array<{
      id: string;
      agent: string;
      model: string;
      tokens: number;
      age: number;
      percentUsed: number;
      kind: string;
    }>;
  };
  system: {
    os: string;
    memory: {
      files: number;
      chunks: number;
      cacheEntries: number;
    };
    agents: Array<any>;
  };
  security: {
    critical: number;
    warnings: number;
    findings: Array<any>;
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

export default function JarvisSection() {
  const [data, setData] = useState<JarvisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restarting, setRestarting] = useState<string | null>(null);

  const handleRestart = async (target: 'jarvis' | 'gateway') => {
    if (!confirm(`Tens a certeza que queres fazer restart ao ${target}?`)) return;
    
    setRestarting(target);
    try {
      const response = await fetch('/api/jarvis/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const result = await response.json();
      if (result.success) {
        alert(`${target} restart iniciado com sucesso!`);
        // Wait a bit and refresh data
        setTimeout(fetchData, 5000);
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (err: any) {
      alert(`Erro ao fazer restart: ${err.message}`);
    } finally {
      setRestarting(null);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jarvis');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load Jarvis system data');
      console.error('Failed to fetch Jarvis data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (ms: number) => {
    if (ms < 60000) return `${Math.floor(ms / 1000)}s ago`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
    if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
    return `${Math.floor(ms / 86400000)}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Jarvis System Status</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/20 border border-white/5 p-6 rounded-[2rem] animate-pulse">
              <div className="h-6 bg-zinc-800/50 rounded w-24 mb-4"></div>
              <div className="h-10 bg-zinc-800/50 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Jarvis System Status</h2>
        <div className="bg-zinc-900/40 border border-red-500/20 p-8 rounded-3xl text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h3>
          <p className="text-zinc-400 mb-6">{error || 'Failed to load system data'}</p>
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase tracking-widest text-blue-500">Jarvis System Status</h2>
        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-500">
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 text-blue-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => handleRestart('gateway')}
            disabled={restarting !== null}
            className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 text-amber-500 transition-colors disabled:opacity-50"
            title="Restart Gateway"
          >
            <RotateCcw size={14} className={restarting === 'gateway' ? 'animate-spin' : ''} />
            <span className="text-xs font-medium">Gateway</span>
          </button>
          <button
            onClick={() => handleRestart('jarvis')}
            disabled={restarting !== null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors disabled:opacity-50"
            title="Restart Jarvis"
          >
            <Power size={14} className={restarting === 'jarvis' ? 'animate-pulse' : ''} />
            <span className="text-xs font-medium">Jarvis</span>
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SectionCard 
          label="Gateway Status" 
          value={data.gateway.reachable ? 'Online' : data.gateway.service?.includes('activating') ? 'Starting...' : 'Offline'} 
          unit={data.gateway.latency ? `${data.gateway.latency}ms` : ''}
          icon={data.gateway.reachable ? CheckCircle : data.gateway.service?.includes('activating') ? RefreshCw : XCircle}
          color={data.gateway.reachable ? 'text-emerald-500' : data.gateway.service?.includes('activating') ? 'text-amber-500' : 'text-red-500'}
          subtitle={data.gateway.reachable ? 'Operacional' : data.gateway.service?.includes('activating') ? 'A iniciar...' : 'Verificar serviço'}
        />
        
        <SectionCard 
          label="Tokens Today" 
          value={data.tokens.today.toLocaleString()} 
          unit="tokens"
          icon={Zap}
          color="text-blue-500"
          subtitle={`${data.tokens.recentSessions} sessions`}
        />
        
        <SectionCard 
          label="Active Sessions" 
          value={data.sessions.total} 
          unit="sessions"
          icon={Users}
          color="text-orange-500"
          subtitle={`${data.sessions.recent.length} recent`}
        />
        
        <SectionCard 
          label="Memory Files" 
          value={data.system.memory.files} 
          unit="files"
          icon={Database}
          color="text-purple-500"
          subtitle={`${data.system.memory.chunks} chunks`}
        />
        
        <SectionCard 
          label="Security" 
          value={data.security.critical} 
          unit="critical"
          icon={ShieldCheck}
          color={data.security.critical > 0 ? 'text-red-500' : 'text-emerald-500'}
          subtitle={`${data.security.warnings} warnings`}
        />
        
        <SectionCard 
          label="System" 
          value={data.system.agents.length} 
          unit="agents"
          icon={Server}
          color="text-cyan-500"
          subtitle={data.system.os.split(' ')[0]}
        />
      </div>

      {/* Active Sessions Table */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Terminal size={20} className="text-blue-500" />
          Recent Sessions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-white/5">
                <th className="pb-3 font-semibold">Session</th>
                <th className="pb-3 font-semibold">Model</th>
                <th className="pb-3 font-semibold">Tokens</th>
                <th className="pb-3 font-semibold">Usage</th>
                <th className="pb-3 font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {data.sessions.recent.map((session) => (
                <tr key={session.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${session.kind === 'direct' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                      <span className="text-sm font-medium">{session.agent}</span>
                      <span className="text-xs text-zinc-500">({session.kind})</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-zinc-300 font-mono">{session.model.split('/').pop()}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm font-medium">{session.tokens.toLocaleString()}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-zinc-800 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full ${session.percentUsed > 80 ? 'bg-red-500' : session.percentUsed > 50 ? 'bg-orange-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(session.percentUsed, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-zinc-400">{session.percentUsed}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-zinc-500" />
                      <span className="text-sm text-zinc-400">{formatTimeAgo(session.age)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Findings */}
      {data.security.findings.length > 0 && (
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
          <h3 className="text-xl font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            Security Findings
          </h3>
          <div className="space-y-3">
            {data.security.findings.slice(0, 3).map((finding: any, index: number) => (
              <div key={index} className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${finding.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                    {finding.severity.toUpperCase()}: {finding.title}
                  </span>
                  <span className="text-xs text-zinc-500">{finding.checkId}</span>
                </div>
                <p className="text-sm text-zinc-400">{finding.detail}</p>
                {finding.remediation && (
                  <div className="mt-2 text-sm text-zinc-500">
                    <span className="font-semibold">Fix:</span> {finding.remediation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
          <h3 className="text-xl font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <CpuIcon size={20} className="text-cyan-500" />
            System Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Operating System</span>
              <span className="text-zinc-300 font-mono">{data.system.os}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Memory Cache</span>
              <span className="text-zinc-300">{data.system.memory.cacheEntries} entries</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Active Agents</span>
              <span className="text-zinc-300">{data.system.agents.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
          <h3 className="text-xl font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-500" />
            Token Usage (7 days)
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold">{data.tokens.week.toLocaleString()}</span>
                <span className="text-xs text-zinc-500 ml-2">total tokens</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{data.tokens.today.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">today</div>
              </div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                style={{ width: `${Math.min((data.tokens.today / (data.tokens.week || 1)) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-zinc-500 text-center">
              Average: {Math.round(data.tokens.week / 7).toLocaleString()} tokens/day
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}