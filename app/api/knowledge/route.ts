import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('file');

  if (!filename) {
    const dir = path.join(process.env.HOME || '/home/ubuntu', 'clawd', 'knowledge');
    try {
      if (!fs.existsSync(dir)) return NextResponse.json({ files: [] });
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      return NextResponse.json({ files });
    } catch (e) {
      return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
    }
  }

  // Read specific file content
  try {
    const filePath = path.join(process.env.HOME || '/home/ubuntu', 'clawd', 'knowledge', filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
