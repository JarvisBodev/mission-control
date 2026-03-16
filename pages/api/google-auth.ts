import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://mission-control-cimwbgvoq-jarvisbodevs-projects.vercel.app/api/google-callback'
    );

    const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    res.redirect(authUrl);
  } catch (error: any) {
    console.error('OAuth auth error:', error);
    res.status(500).json({ error: error.message });
  }
}
