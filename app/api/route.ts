import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Path to GYM_PROGRESS.md
const GYM_PROGRESS_PATH = path.join(process.env.HOME || '/home/ubuntu', 'clawd', 'memory', 'GYM_PROGRESS.md');

// Fixed family routines
const FAMILY_ROUTINES = [
  { name: 'Lourenço', schedule: '09:00-16:45', description: 'Colégio (Levar 09:00, Buscar 16:45)' },
  { name: 'Bia (Treino)', schedule: 'Qua 13:45', description: 'Treino Quarta-feira' },
  { name: 'Bia (Massagem)', schedule: 'Qua 11:30', description: 'Massagem Quarta-feira' },
  { name: 'Mãe', schedule: 'Sábado', description: 'Visita Sábado' },
];

export async function GET() {
  try {
    // 1. Gym Progress Data
    interface GymData {
      lastWorkoutDate: string | null;
      marchWorkouts: number;
      latestPR: string;
      hasData: boolean;
    }

    let gymData: GymData = {
      lastWorkoutDate: null,
      marchWorkouts: 0,
      latestPR: 'No gym data found',
      hasData: false,
    };

    try {
      if (fs.existsSync(GYM_PROGRESS_PATH)) {
        const gymContent = fs.readFileSync(GYM_PROGRESS_PATH, 'utf-8');

        // Parse last workout date
        const workoutLines = gymContent.split('\n');
        const lastWorkoutMatch = workoutLines.find(line => line.includes('2026-03-'));
        const lastWorkoutDate = lastWorkoutMatch ? lastWorkoutMatch.match(/2026-03-\d+/)?.[0] : null;

        // Count workouts in March
        const marchWorkouts = workoutLines.filter(line => line.includes('2026-03-')).length;

        // Extract latest PR
        const prLines = gymContent.split('\n').filter(line => line.includes('**'));
        const latestPR = prLines[0] ? prLines[0].replace('**', '').trim() : 'No PR recorded';

        gymData = {
          lastWorkoutDate: lastWorkoutDate ?? null,
          marchWorkouts,
          latestPR: latestPR ?? 'No PR recorded',
          hasData: true,
        };
      } else {
        // Fallback mock data for Vercel deployment
        gymData = {
          lastWorkoutDate: '2026-03-12',
          marchWorkouts: 8,
          latestPR: 'Belt Squat 60kg/lado',
          hasData: true,
        };
      }
    } catch (error) {
      console.error('GYM_PROGRESS read error:', error);
      // Fallback mock data for Vercel deployment
      gymData = {
        lastWorkoutDate: '2026-03-12',
        marchWorkouts: 8,
        latestPR: 'Belt Squat 60kg/lado',
        hasData: true,
      };
    }

    // 2. Calendar Events (if configured)
    let calendarEvents = [];
    let calendarConfigured = false;

    if (process.env.GOG_KEYRING_PASSWORD) {
      try {
        const fromDate = new Date().toISOString().split('T')[0];
        const toDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const command = `export GOG_KEYRING_PASSWORD="${process.env.GOG_KEYRING_PASSWORD}" && gog calendar events primary --from ${fromDate} --to ${toDate} --max 10 --account bedinbraga1@gmail.com --json`;

        const { stdout } = await execAsync(command, {
          env: { ...process.env, GOG_KEYRING_PASSWORD: process.env.GOG_KEYRING_PASSWORD },
          shell: '/bin/bash',
          timeout: 5000,
        });

        const result = JSON.parse(stdout || '{"events": []}');
        const now = new Date();
        calendarEvents = result.events
          ?.map((event: any) => ({
            id: event.id,
            summary: event.summary || 'No title',
            description: event.description || '',
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            location: event.location || '',
            attendees: event.attendees?.map((a: any) => a.email) || [],
            isAllDay: !event.start?.dateTime,
          }))
          .filter((event: any) => {
            const eventStart = event.start;
            
            if (event.isEnded) {
              // For all-day events, check if the date is today or future
              const eventDate = new Date(eventStart);
              const todayStart = new Date(now.setHours(0, 0, 0, 0));
              return eventDate >= todayStart;
            } else {
              // For timed events, check if the event hasn't started yet
              const eventTime = new Date(eventStart);
              return eventTime > now;
            }
          }) || [];

        calendarConfigured = true;
      } catch (calendarError) {
        console.error('Calendar fetch error:', calendarError);
        calendarEvents = [];
        calendarConfigured = false;
      }
    }

    // 3. Quick Stats (mock for now)
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
        error: error.message || 'Failed to fetch personal data',
        familyRoutines: FAMILY_ROUTINES,
        gymProgress: { lastWorkoutDate: null, marchWorkouts: 0, latestPR: 'Error loading data', hasData: false },
        calendar: { events: [], configured: false },
        quickStats: { eventsThisWeek: 0, workoutsMarch: 0, familyTasks: 3, nextEvent: null },
      },
      { status: 500 }
    );
  }
}