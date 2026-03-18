import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

const REMINDERS_FILE = '/home/ubuntu/clawd/memory/reminders.json';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  type: 'reminder' | 'appointment' | 'task';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

function loadReminders(): Reminder[] {
  try {
    if (fs.existsSync(REMINDERS_FILE)) {
      const content = fs.readFileSync(REMINDERS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error loading reminders:', e);
  }
  return [];
}

function saveReminders(reminders: Reminder[]): boolean {
  try {
    // Ensure directory exists
    const dir = path.dirname(REMINDERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
    return true;
  } catch (e) {
    console.error('Error saving reminders:', e);
    return false;
  }
}

// GET - List all reminders
export async function GET() {
  try {
    const reminders = loadReminders();
    
    // Sort by due date (pending first, then by date)
    reminders.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    // Also fetch Google Calendar events if available
    let calendarEvents: any[] = [];
    try {
      const cmd = `GOG_KEYRING_PASSWORD="filipe" GOG_ACCOUNT=bedinbraga1@gmail.com gog calendar list --from today --to "+7d" --json 2>/dev/null`;
      const result = execSync(cmd, { 
        encoding: 'utf-8', 
        timeout: 15000,
        env: { ...process.env, HOME: '/home/ubuntu' }
      });
      const data = JSON.parse(result);
      calendarEvents = data.events || [];
    } catch (e) {
      // Calendar not available, continue without
    }

    return NextResponse.json({
      reminders: reminders.filter(r => r.status === 'pending'),
      completed: reminders.filter(r => r.status === 'completed').slice(0, 10),
      calendarEvents: calendarEvents.slice(0, 10),
      total: reminders.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new reminder
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, dueDate, dueTime, type = 'reminder' } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const reminders = loadReminders();
    
    const newReminder: Reminder = {
      id: `rem_${Date.now()}`,
      title,
      description,
      dueDate,
      dueTime,
      type,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    reminders.push(newReminder);
    
    if (saveReminders(reminders)) {
      // If it's an appointment with date/time, try to add to Google Calendar
      if (type === 'appointment' && dueDate) {
        try {
          const startTime = dueTime ? `${dueDate}T${dueTime}:00` : dueDate;
          const cmd = `GOG_KEYRING_PASSWORD="filipe" GOG_ACCOUNT=bedinbraga1@gmail.com gog calendar add "${title}" --when "${startTime}" ${description ? `--description "${description}"` : ''} 2>/dev/null`;
          execSync(cmd, { 
            encoding: 'utf-8', 
            timeout: 15000,
            env: { ...process.env, HOME: '/home/ubuntu' }
          });
        } catch (e) {
          // Calendar add failed, but reminder still saved
          console.log('Failed to add to Google Calendar');
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: `${type === 'appointment' ? 'Compromisso' : 'Lembrete'} criado com sucesso`,
        reminder: newReminder 
      });
    } else {
      return NextResponse.json({ error: 'Failed to save reminder' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update reminder (complete, cancel, edit)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    const reminders = loadReminders();
    const index = reminders.findIndex(r => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    if (action === 'complete') {
      reminders[index].status = 'completed';
      reminders[index].completedAt = new Date().toISOString();
    } else if (action === 'cancel') {
      reminders[index].status = 'cancelled';
    } else {
      // Update fields
      Object.assign(reminders[index], updates);
    }

    if (saveReminders(reminders)) {
      return NextResponse.json({ 
        success: true, 
        message: action === 'complete' ? 'Marcado como completo' : 'Actualizado',
        reminder: reminders[index]
      });
    } else {
      return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove reminder
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    const reminders = loadReminders();
    const filtered = reminders.filter(r => r.id !== id);

    if (filtered.length === reminders.length) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    if (saveReminders(filtered)) {
      return NextResponse.json({ success: true, message: 'Lembrete removido' });
    } else {
      return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
