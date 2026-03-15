import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '7';
    
    // Calculate date range
    const fromDate = new Date().toISOString().split('T')[0];
    const toDate = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Get GOG_KEYRING_PASSWORD from environment
    const gogPassword = process.env.GOG_KEYRING_PASSWORD;
    if (!gogPassword) {
      return NextResponse.json(
        { error: 'GOG_KEYRING_PASSWORD not configured' },
        { status: 500 }
      );
    }

    // Build the gog command
    const command = `export GOG_KEYRING_PASSWORD="${gogPassword}" && gog calendar events primary --from ${fromDate} --to ${toDate} --max 20 --account bedinbraga1@gmail.com --json`;

    // Execute the command
    const { stdout, stderr } = await execAsync(command, {
      env: { ...process.env, GOG_KEYRING_PASSWORD: gogPassword },
      shell: '/bin/bash',
      timeout: 10000 // 10 seconds timeout
    });

    if (stderr && !stderr.includes('warning')) {
      console.error('gog stderr:', stderr);
    }

    const result = JSON.parse(stdout || '{"events": []}');
    
    // Transform events to a simpler format
    const events = result.events?.map((event: any) => ({
      id: event.id,
      summary: event.summary || 'No title',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location || '',
      attendees: event.attendees?.map((a: any) => a.email) || [],
      isAllDay: !event.start?.dateTime, // If no time, it's all-day
    })) || [];

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}