import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

// Helper to run gog commands
function runGogCommand(cmd: string): { success: boolean; data?: any; error?: string } {
  try {
    const fullCmd = `GOG_KEYRING_PASSWORD="filipe" GOG_ACCOUNT=bedinbraga1@gmail.com ${cmd}`;
    console.log('Running gog command:', fullCmd);
    
    const result = execSync(fullCmd, { 
      encoding: 'utf-8', 
      timeout: 15000,
      env: { ...process.env, HOME: '/home/ubuntu' }
    });
    
    return { success: true, data: result };
  } catch (e: any) {
    console.error('Gog command failed:', e.message);
    return { success: false, error: e.message };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Use gog CLI to fetch calendar events
    const now = new Date();
    const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    // Format dates for gog: YYYY-MM-DD
    const fromDate = now.toISOString().split('T')[0];
    const toDate = timeMax.toISOString().split('T')[0];

    let gogEvents: any[] = [];
    try {
      const cmd = `GOG_KEYRING_PASSWORD="filipe" GOG_ACCOUNT=bedinbraga1@gmail.com gog calendar events --from "${fromDate}" --to "${toDate}" --json 2>/dev/null`;
      const result = execSync(cmd, { 
        encoding: 'utf-8', 
        timeout: 15000,
        env: { ...process.env, HOME: '/home/ubuntu' }
      });
      const data = JSON.parse(result);
      gogEvents = data.events || [];
    } catch (e: any) {
      console.error('Gog calendar error:', e.message);
      // Return empty but configured
      return NextResponse.json({
        events: [],
        configured: true, // We're configured (gog is available), just no events
        count: 0,
        todayCount: 0,
        nextEvent: null,
      });
    }

    // Transform gog events to our format
    const events = gogEvents.map((event: any) => {
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;
      return {
        id: event.id,
        summary: event.summary || 'Sem título',
        description: event.description || '',
        start,
        end,
        location: event.location || '',
        attendees: event.attendees?.map((a: any) => a.email) || [],
        isAllDay: !event.start?.dateTime,
      };
    });

    // Filter out past events (just in case)
    const futureEvents = events.filter((event) => {
      if (!event.start) return false;
      const eventStart = new Date(event.start);
      return eventStart > now;
    });

    // Count today's events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEvents = events.filter((event) => {
      if (!event.start) return false;
      const eventStart = new Date(event.start);
      return eventStart >= today && eventStart < tomorrow;
    });

    // Get next event
    const nextEvent = futureEvents[0] ? {
      title: futureEvents[0].summary,
      time: futureEvents[0].start ? new Date(futureEvents[0].start).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      start: futureEvents[0].start
    } : null;

    return NextResponse.json({
      events: futureEvents,
      configured: true,
      count: futureEvents.length,
      todayCount: todayEvents.length,
      nextEvent,
    });
  } catch (error: any) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        configured: false,
        events: [],
      },
      { status: 500 }
    );
  }
}

// Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, start, end, location, calendarId = 'primary' } = body;

    if (!title || !start) {
      return NextResponse.json(
        { error: 'Title and start time are required' },
        { status: 400 }
      );
    }

    // Format for gog calendar add command
    // gog calendar add "Meeting" --when "2026-03-19T10:00:00" --description "Team sync" --location "Office"
    let cmd = `gog calendar add "${title.replace(/"/g, '\\"')}" --when "${start}"`;
    
    if (description) {
      cmd += ` --description "${description.replace(/"/g, '\\"')}"`;
    }
    
    if (location) {
      cmd += ` --location "${location.replace(/"/g, '\\"')}"`;
    }
    
    if (end) {
      // Note: gog calendar add doesn't have --end parameter, duration is implied
      // We'll just use start for now
      console.log('End time provided but gog calendar add only supports start time');
    }

    const result = runGogCommand(cmd);
    
    if (!result.success) {
      return NextResponse.json(
        { error: `Failed to create event: ${result.error}` },
        { status: 500 }
      );
    }

    // The gog command outputs JSON with the created event
    let eventId = 'unknown';
    try {
      const output = result.data;
      if (output && output.trim()) {
        const data = JSON.parse(output);
        eventId = data.id || 'unknown';
      }
    } catch (e) {
      // If not JSON, try to extract event ID from text output
      const match = result.data?.match(/Event created: (.+)/);
      if (match) eventId = match[1];
    }

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      eventId,
    });
  } catch (error: any) {
    console.error('Calendar POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

// Delete a calendar event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const calendarId = searchParams.get('calendarId') || 'primary';

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // gog calendar delete <calendarId> <eventId>
    const cmd = `gog calendar delete "${calendarId}" "${eventId}"`;
    
    const result = runGogCommand(cmd);
    
    if (!result.success) {
      return NextResponse.json(
        { error: `Failed to delete event: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
