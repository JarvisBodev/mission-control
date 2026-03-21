'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, Brain, Clock, CheckCircle, AlertCircle,
  ChevronRight, Lightbulb, ListTodo, Database
} from 'lucide-react';
import { motion } from 'framer-motion';

interface JarvisInsight {
  suggestion: string;
  category: 'productivity' | 'finance' | 'health' | 'learning' | 'family';
  priority: 'high' | 'medium' | 'low';
}

interface PendingAction {
  id: string;
  title: string;
  source: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
}

interface MemorySummary {
  recentTopics: string[];
  lastInteraction: string;
  activeProjects: number;
}

// Simulated insights - in production, this would come from Jarvis AI
const generateDailySuggestion = (): JarvisInsight => {
  const suggestions: JarvisInsight[] = [
    {
      suggestion: 'Agenda review: tens 3 eventos esta semana que podem conflitar. Considera reagendar o meeting de quarta.',
      category: 'productivity',
      priority: 'high',
    },
    {
      suggestion: 'O teu streak de learning está em 5 dias! Completa a sessão de hoje sobre Private Equity para mantê-lo.',
      category: 'learning',
      priority: 'medium',
    },
    {
      suggestion: 'Cashflow update: 2 rendas por receber este mês. Considera enviar um reminder aos inquilinos.',
      category: 'finance',
      priority: 'high',
    },
    {
      suggestion: 'É quarta-feira - a Bia tem treino às 13:45 e massagem às 11:30. Não marques nada nesse período.',
      category: 'family',
      priority: 'medium',
    },
    {
      suggestion: 'Revisão semanal: completa o resumo de Private Equity e prepara o próximo tópico do Learning Hub.',
      category: 'learning',
      priority: 'low',
    },
  ];
  
  // Return a suggestion based on day of week or random
  const dayOfWeek = new Date().getDay();
  return suggestions[dayOfWeek % suggestions.length];
};

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    productivity: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    finance: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    health: 'text-red-400 bg-red-500/10 border-red-500/20',
    learning: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    family: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  };
  return colors[category] || colors.productivity;
};

const getPriorityIndicator = (priority: string) => {
  switch (priority) {
    case 'high':
      return <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />;
    case 'medium':
      return <div className="w-2 h-2 rounded-full bg-orange-500" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-zinc-500" />;
  }
};

export default function JarvisInsightsWidget({ compact = false }: { compact?: boolean }) {
  const [insight, setInsight] = useState<JarvisInsight | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [memorySummary, setMemorySummary] = useState<MemorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading insights
    const loadInsights = async () => {
      setLoading(true);
      
      // Generate daily suggestion
      setInsight(generateDailySuggestion());
      
      // Simulate pending actions (would come from various sources)
      setPendingActions([
        {
          id: '1',
          title: 'Renovar seguro apt. Rua da Paz',
          source: 'BINB Alertas',
          dueDate: '2024-03-25',
          priority: 'high',
        },
        {
          id: '2',
          title: 'Completar sessão PE: Valuation',
          source: 'Learning Hub',
          priority: 'medium',
        },
        {
          id: '3',
          title: 'Verificar cashflow mensal',
          source: 'Finance',
          dueDate: 'End of month',
          priority: 'low',
        },
      ]);
      
      // Simulate memory summary
      setMemorySummary({
        recentTopics: ['Private Equity', 'Cashflow', 'BINB Portfolio'],
        lastInteraction: new Date(Date.now() - 3600000).toISOString(),
        activeProjects: 3,
      });
      
      setLoading(false);
    };
    
    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-32 mb-4" />
        <div className="h-20 bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-zinc-300">Jarvis Insight</h3>
        </div>
        
        {insight && (
          <div className={`${getCategoryColor(insight.category)} border rounded-xl p-3`}>
            <div className="flex items-start gap-2">
              <Lightbulb size={14} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{insight.suggestion}</p>
            </div>
          </div>
        )}
        
        {pendingActions.length > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              {pendingActions.filter(a => a.priority === 'high').length} ações urgentes
            </span>
            <ChevronRight size={14} className="text-zinc-600" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Daily Suggestion */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-zinc-300">Sugestão do Dia</h3>
        </div>
        
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${getCategoryColor(insight.category)} border rounded-xl p-4`}
          >
            <div className="flex items-start gap-3">
              <Lightbulb size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm leading-relaxed">{insight.suggestion}</p>
                <div className="flex items-center gap-2 mt-3">
                  {getPriorityIndicator(insight.priority)}
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                    {insight.category}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pending Actions */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ListTodo size={16} className="text-orange-400" />
          <h3 className="text-sm font-bold text-zinc-300">Próximas Acções</h3>
        </div>
        
        <div className="space-y-2">
          {pendingActions.map((action) => (
            <div
              key={action.id}
              className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-zinc-900/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {getPriorityIndicator(action.priority)}
                <div>
                  <p className="text-xs font-medium text-zinc-200">{action.title}</p>
                  <p className="text-[10px] text-zinc-500">{action.source}</p>
                </div>
              </div>
              {action.dueDate && (
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Clock size={10} />
                  {action.dueDate}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Memory Summary */}
      {memorySummary && (
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold text-zinc-300">Memory</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-2">
                Tópicos Recentes
              </span>
              <div className="flex flex-wrap gap-1">
                {memorySummary.recentTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Projectos activos</span>
              <span className="text-zinc-300 font-semibold">{memorySummary.activeProjects}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Última interacção</span>
              <span className="text-zinc-400 text-[10px]">
                {new Date(memorySummary.lastInteraction).toLocaleTimeString('pt-PT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
