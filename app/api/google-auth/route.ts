import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'https://mission-control-36y9.vercel.app/api/google-callback'
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('OAuth auth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
