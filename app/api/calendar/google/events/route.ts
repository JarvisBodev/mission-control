import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      return NextResponse.json(
        { 
          error: 'GOOGLE_REFRESH_TOKEN not configured. Visit /api/calendar/google/auth first.',
          configured: false,
        },
        { status: 400 }
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
      summary: event.summary || 'No title',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location || '',
      attendees: event.attendees?.map((a) => a.email) || [],
      isAllDay: !event.start?.dateTime,
    })) || [];

    return NextResponse.json({
      events,
      configured: true,
      count: events.length,
    });
  } catch (error: any) {
    console.error('Calendar events fetch error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        configured: !!process.env.GOOGLE_REFRESH_TOKEN,
      },
      { status: 500 }
    );
  }
}
