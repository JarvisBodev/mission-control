import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

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
