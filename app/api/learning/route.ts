import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const LEARNING_FILE = path.join(process.cwd(), 'data', 'learning.json');

interface MicroSession {
  id: string;
  title: string;
  duration: string; // e.g., "15min"
  completed: boolean;
  completedAt?: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  weekOf: string; // ISO date string of week start
  microSessions: MicroSession[];
  resources: string[];
  notes: string;
}

interface LearningState {
  currentTopic: Topic | null;
  backlog: Array<{ id: string; name: string; priority: number; estimatedWeeks: number }>;
  completedTopics: Array<{ id: string; name: string; completedAt: string }>;
  streak: number;
  lastSessionDate: string | null;
}

const defaultState: LearningState = {
  currentTopic: {
    id: 'pe-fundamentals',
    name: 'Private Equity',
    description: 'Fundamentos de Private Equity: estrutura de fundos, estratégias de investimento, due diligence, e exit strategies.',
    weekOf: new Date().toISOString(),
    microSessions: [
      { id: 'pe-1', title: 'Estrutura de fundos PE (GP vs LP)', duration: '20min', completed: false },
      { id: 'pe-2', title: 'Estratégias: Buyout, Growth, Venture', duration: '25min', completed: false },
      { id: 'pe-3', title: 'Due Diligence: checklist essencial', duration: '20min', completed: false },
      { id: 'pe-4', title: 'Valuation em PE: múltiplos e DCF', duration: '30min', completed: false },
      { id: 'pe-5', title: 'Exit strategies e retornos', duration: '20min', completed: false },
    ],
    resources: [
      'Investopedia: Private Equity Basics',
      'McKinsey: Global Private Markets Review',
      'Preqin: PE Industry Report',
    ],
    notes: '',
  },
  backlog: [
    { id: 'real-estate-syndication', name: 'Real Estate Syndication', priority: 1, estimatedWeeks: 2 },
    { id: 'tax-optimization', name: 'Tax Optimization Portugal', priority: 2, estimatedWeeks: 1 },
    { id: 'alternative-investments', name: 'Alternative Investments', priority: 3, estimatedWeeks: 2 },
    { id: 'macro-economics', name: 'Macroeconomics Fundamentals', priority: 4, estimatedWeeks: 3 },
    { id: 'crypto-defi', name: 'Crypto & DeFi Deep Dive', priority: 5, estimatedWeeks: 2 },
  ],
  completedTopics: [],
  streak: 0,
  lastSessionDate: null,
};

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function loadLearningState(): Promise<LearningState> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(LEARNING_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return default state if file doesn't exist
    return defaultState;
  }
}

async function saveLearningState(state: LearningState): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(LEARNING_FILE, JSON.stringify(state, null, 2));
}

export async function GET() {
  try {
    const state = await loadLearningState();
    
    // Calculate progress
    const totalSessions = state.currentTopic?.microSessions.length || 0;
    const completedSessions = state.currentTopic?.microSessions.filter(s => s.completed).length || 0;
    const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Check and update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let streak = state.streak;
    if (state.lastSessionDate === today) {
      // Already studied today, streak maintained
    } else if (state.lastSessionDate === yesterday) {
      // Studied yesterday, streak continues (will increment on next session)
    } else if (state.lastSessionDate && state.lastSessionDate < yesterday) {
      // Missed a day, reset streak
      streak = 0;
    }

    return NextResponse.json({
      currentTopic: state.currentTopic,
      backlog: state.backlog,
      completedTopics: state.completedTopics,
      progress,
      completedSessions,
      totalSessions,
      streak,
      lastSessionDate: state.lastSessionDate,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Learning API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sessionId, topicId, notes } = body;

    const state = await loadLearningState();

    switch (action) {
      case 'complete-session':
        // Mark a micro-session as completed
        if (state.currentTopic && sessionId) {
          const session = state.currentTopic.microSessions.find(s => s.id === sessionId);
          if (session) {
            session.completed = true;
            session.completedAt = new Date().toISOString();
            
            // Update streak
            const today = new Date().toISOString().split('T')[0];
            if (state.lastSessionDate !== today) {
              const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
              if (state.lastSessionDate === yesterday || !state.lastSessionDate) {
                state.streak++;
              } else {
                state.streak = 1;
              }
              state.lastSessionDate = today;
            }
          }
        }
        break;

      case 'complete-topic':
        // Move current topic to completed and start next from backlog
        if (state.currentTopic) {
          state.completedTopics.push({
            id: state.currentTopic.id,
            name: state.currentTopic.name,
            completedAt: new Date().toISOString(),
          });
          
          // Get next topic from backlog
          if (state.backlog.length > 0) {
            const nextTopic = state.backlog.shift()!;
            state.currentTopic = {
              id: nextTopic.id,
              name: nextTopic.name,
              description: '',
              weekOf: new Date().toISOString(),
              microSessions: [],
              resources: [],
              notes: '',
            };
          } else {
            state.currentTopic = null;
          }
        }
        break;

      case 'add-backlog':
        // Add topic to backlog
        if (body.name) {
          state.backlog.push({
            id: `topic-${Date.now()}`,
            name: body.name,
            priority: state.backlog.length + 1,
            estimatedWeeks: body.estimatedWeeks || 1,
          });
        }
        break;

      case 'update-notes':
        // Update topic notes
        if (state.currentTopic && notes !== undefined) {
          state.currentTopic.notes = notes;
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await saveLearningState(state);
    return NextResponse.json({ success: true, state });
  } catch (error: any) {
    console.error('Learning API POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
