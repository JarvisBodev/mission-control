import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      return NextResponse.json(
        { 
          error: 'Calendar not configured. Visit /api/calendar/google/auth to authorize.',
          configured: false,
          events: [],
        },
        { status: 200 } // Return 200 to avoid breaking UI
      );
    }

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
    const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items?.map((event) => ({
      id: event.id,
      summary: event.summary || 'Sem título',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location || '',
      attendees: event.attendees?.map((a) => a.email) || [],
      isAllDay: !event.start?.dateTime,
    })) || [];

    // Filter out past events
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
        configured: !!process.env.GOOGLE_REFRESH_TOKEN,
        events: [],
      },
      { status: 500 }
    );
  }
}
