import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Path to GYM_PROGRESS.md
const GYM_PROGRESS_PATH = path.join(process.env.HOME || '/home/ubuntu', 'clawd', 'memory', 'GYM_PROGRESS.md');

// Rotinas familiares fixas
const FAMILY_ROUTINES = [
  { name: 'Lourenço', schedule: '09:00-16:45', description: 'Colégio (Levar 09:00, Buscar 16:45)' },
  { name: 'Bia (Treino)', schedule: 'Qua 13:45', description: 'Treino Quarta-feira' },
  { name: 'Bia (Massagem)', schedule: 'Qua 11:30', description: 'Massagem Quarta-feira' },
  { name: 'Mãe', schedule: 'Sábado', description: 'Visita Sábado' },
];

// Iron channel workout patterns
const EXERCISE_PATTERNS = {
  'Pernas': ['belt squat', 'búlgaro', 'leg press', 'extensora', 'flexora', 'agachamento', 'stiff'],
  'Costas': ['pulley', 'remada', 'pulldown'],
  'Peito': ['supino', 'crucifixo', 'chest', 'peito'],
  'Ombros': ['deltoide', 'elevação', 'press ombros', 'ombro'],
  'Braços': ['bíceps', 'tríceps', 'rosca', 'scotch'],
};

function parseWorkoutFromMessage(content: string): { date: string | null, muscleGroup: string, details: string } {
  const lines = content.split('\n');
  const dateMatch = lines[0].match(/(\d{1,2}) de (\w+) de (\d{4})/);
  let date = null;
  
  if (dateMatch) {
    const [_, day, month, year] = dateMatch;
    const monthMap: Record<string, string> = {
      'Março': '03',
      'Abril': '04',
      'Maio': '05',
      'Junho': '06',
      'Julho': '07',
      'Agosto': '08',
      'Setembro': '09',
      'Outubro': '10',
      'Novembro': '11',
      'Dezembro': '12',
      'Janeiro': '01',
      'Fevereiro': '02',
    };
    
    const monthNum = monthMap[month];
    if (monthNum) {
      date = `${year}-${monthNum}-${day.padStart(2, '0')}`;
    }
  }

  // Determine muscle group from content
  const contentLower = content.toLowerCase();
  let muscleGroup = 'Unknown';
  let details = '';

  for (const [group, keywords] of Object.entries(EXERCISE_PATTERNS)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      muscleGroup = group;
      break;
    }
  }

  // Extract first few exercises for details
  const exerciseLines = lines.slice(1).filter(line => 
    line.trim().length > 0 && 
    !line.includes('de Março') && 
    !line.includes('de Abril')
  );
  
  if (exerciseLines.length > 0) {
    details = exerciseLines.slice(0, 3).join(' ');
    if (details.length > 50) details = details.substring(0, 47) + '...';
  }

  return { date, muscleGroup, details };
}

export async function GET() {
  try {
    // 1. Gym Progress Data
    // Try to read from local file first (development)
    let gymData = {
      lastWorkoutDate: null as string | null,
      marchWorkouts: 0,
      latestPR: 'Sem dados de ginásio',
      muscleGroup: 'Desconhecido',
      workoutDetails: '',
      recentWorkouts: [] as Array<{date: string, muscleGroup: string, details: string}>,
      hasData: false,
    };

    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    try {
      if (fs.existsSync(GYM_PROGRESS_PATH) && !isProduction) {
        // Local development: read from file
        const gymContent = fs.readFileSync(GYM_PROGRESS_PATH, 'utf-8');
        
        // Parse last workout date from table and recent workouts
        const tableLines = gymContent.split('\n').filter(line => line.includes('|'));
        let lastWorkoutDate = null;
        let lastWorkoutDetails = '';
        let muscleGroup = 'Desconhecido';
        const recentWorkouts = [];
        
        if (tableLines.length > 1) {
          const headers = tableLines[0].split('|').map(h => h.trim());
          for (let i = 1; i < tableLines.length; i++) {
            const cells = tableLines[i].split('|').map(c => c.trim());
            if (cells.length >= 4) {
              const date = cells[1];
              const group = cells[2];
              const details = cells[3];
              
              if (date && date.includes('2026-03')) {
                if (!lastWorkoutDate) {
                  lastWorkoutDate = date.trim();
                  muscleGroup = group || 'Desconhecido';
                  lastWorkoutDetails = details || '';
                }
                // Add to recent workouts (max 5)
                if (recentWorkouts.length < 5) {
                  recentWorkouts.push({
                    date: date.trim(),
                    muscleGroup: group || 'Desconhecido',
                    details: details || '',
                  });
                }
              }
            }
          }
        }

        // Count workouts in March
        const marchWorkouts = tableLines.filter(line => line.includes('2026-03')).length;
        
        // Extract latest PR from the PR section
        const prLines = gymContent.split('\n').filter(line => line.includes('**'));
        const latestPR = prLines[0] ? prLines[0].replace('**', '').trim() : 'Sem PR registado';
        
        gymData = {
          lastWorkoutDate,
          marchWorkouts,
          latestPR,
          muscleGroup,
          workoutDetails: lastWorkoutDetails,
          recentWorkouts,
          hasData: true,
        };
      } else {
        // Production (Vercel) or file not found: use latest workout from Discord Iron (13 Março)
        gymData = {
          lastWorkoutDate: '2026-03-13',
          marchWorkouts: 9, // Contagem baseada nos logs
          latestPR: 'Deltóide posterior halteres 4x10x10kg',
          muscleGroup: 'Ombros',
          workoutDetails: 'Deltóide posterior halteres + Elevação unilateral + Supersérie elevação lateral',
          recentWorkouts: [
            { date: '2026-03-13', muscleGroup: 'Ombros', details: 'Deltóide posterior halteres + Elevação unilateral + Supersérie elevação lateral' },
            { date: '2026-03-12', muscleGroup: 'Pernas', details: 'PR Belt Squat 60kg/lado' },
            { date: '2026-03-10', muscleGroup: 'Costas & Bíceps', details: 'PR Pulley Aberto 59kg' },
            { date: '2026-03-09', muscleGroup: 'Peito', details: 'Volume Day' },
            { date: '2026-03-07', muscleGroup: 'Peito', details: 'Dropsets (Smith)' },
          ],
          hasData: true,
        };
      }
    } catch (fileError) {
      console.error('GYM_PROGRESS read error:', fileError);
      // Fallback to Discord Iron workout
      gymData = {
        lastWorkoutDate: '2026-03-13',
        marchWorkouts: 9,
        latestPR: 'Deltóide posterior halteres 4x10x10kg',
        muscleGroup: 'Ombros',
        workoutDetails: 'Treino de ombros completo',
        recentWorkouts: [
          { date: '2026-03-13', muscleGroup: 'Ombros', details: 'Treino de ombros completo' },
          { date: '2026-03-12', muscleGroup: 'Pernas', details: 'Belt Squat 60kg/lado' },
          { date: '2026-03-10', muscleGroup: 'Costas & Bíceps', details: 'Pulley Aberto 59kg' },
        ],
        hasData: true,
      };
    }

    // 2. Calendar Events (use Google Calendar API directly)
    let calendarEvents: any[] = [];
    let calendarConfigured = false;
    
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      try {
        const { google } = await import('googleapis');
        
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const now = new Date();
        const timeMin = now.toISOString();
        const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin,
          timeMax,
          maxResults: 50,
          singleEvents: true,
          orderBy: 'startTime',
        });

        calendarEvents = response.data.items?.map((event) => ({
          id: event.id,
          summary: event.summary || 'Sem título',
          description: event.description || '',
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location || '',
          attendees: event.attendees?.map((a) => a.email) || [],
          isAllDay: !event.start?.dateTime,
        })).filter((event) => {
          if (!event.start) return false;
          const eventStart = new Date(event.start);
          return eventStart > now;
        }) || [];
        
        calendarConfigured = true;
      } catch (calendarError) {
        console.error('Calendar fetch error:', calendarError);
        calendarEvents = [];
        calendarConfigured = false;
      }
    }

    // 3. Quick Stats
    const quickStats = {
      eventsThisWeek: calendarEvents.length,
      workoutsMarch: gymData.marchWorkouts,
      familyTasks: 3, // placeholder
      nextEvent: calendarEvents.length > 0 ? calendarEvents[0] : null,
    };

    return NextResponse.json({
      familyRoutines: FAMILY_ROUTINES,
      gymProgress: gymData,
      calendar: {
        events: calendarEvents,
        configured: calendarConfigured,
      },
      quickStats,
    });
  } catch (error: any) {
    console.error('Personal API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao obter dados pessoais',
        familyRoutines: FAMILY_ROUTINES,
        gymProgress: { 
          lastWorkoutDate: '2026-03-13', 
          marchWorkouts: 9, 
          latestPR: 'Deltóide posterior halteres 4x10x10kg',
          muscleGroup: 'Ombros',
          workoutDetails: 'Deltóide posterior halteres + Elevação unilateral + Supersérie elevação lateral',
          hasData: true 
        },
        calendar: { events: [], configured: false },
        quickStats: { eventsThisWeek: 0, workoutsMarch: 9, familyTasks: 3, nextEvent: null },
      },
      { status: 500 }
    );
  }
}