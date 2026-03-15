import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  const dir = path.join(process.env.HOME || '/home/ubuntu', 'clawd', 'knowledge');
  const date = new Date().toISOString().split('T')[0];
  const filename = `journal-${date}.md`;
  const filePath = path.join(dir, filename);

  const content = `# Journal - ${date}\n\nToday we successfully deployed the Mission Control dashboard in production mode and integrated the local knowledge base.\n\n- Infrastructure: AWS EC2 + PM2\n- Logic: Dynamic File Reading via Next.js API\n- UI: 3-column Layout with Sidebar navigation.`;

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content);
    return NextResponse.json({ success: true, filename });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create journal' }, { status: 500 });
  }
}
