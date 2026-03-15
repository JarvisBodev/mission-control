import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.env.HOME || '/home/ubuntu', 'clawd', 'data', 'db.json');

export async function GET() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return NextResponse.json({ db: { tasks: [], events: [], Análise: [] } });
    }
    const rawData = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(rawData);
    
    return NextResponse.json({
      tasks: db.tasks || [],
      events: db.events || [],
      db: db 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Data link broken' }, { status: 500 });
  }
}
