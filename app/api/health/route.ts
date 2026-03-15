import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const HEALTH_PATH = path.join(process.env.HOME || '/home/ubuntu', 'clawd', 'data', 'health_log.json');

export async function GET() {
  try {
    if (!fs.existsSync(HEALTH_PATH)) {
      return NextResponse.json({ logs: [] });
    }
    const data = JSON.parse(fs.readFileSync(HEALTH_PATH, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read health data' }, { status: 500 });
  }
}
