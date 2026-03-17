import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { target } = await request.json();
    
    if (!target || !['jarvis', 'gateway'].includes(target)) {
      return NextResponse.json(
        { error: 'Invalid target. Must be "jarvis" or "gateway"' },
        { status: 400 }
      );
    }

    const command = target === 'gateway' 
      ? 'clawdbot gateway restart'
      : 'sudo systemctl restart clawdbot';
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      env: { ...process.env, PATH: `${process.env.PATH}:/usr/local/bin:/usr/bin` },
    });

    return NextResponse.json({
      success: true,
      target,
      message: `${target} restart initiated`,
      output: stdout || stderr,
    });
  } catch (error: any) {
    console.error('Restart error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to restart',
      },
      { status: 500 }
    );
  }
}
