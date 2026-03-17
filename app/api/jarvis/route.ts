import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// Try to read sessions directly from file as fallback
function readSessionsFile(): any {
  const sessionPaths = [
    path.join(os.homedir(), '.clawdbot/agents/main/sessions/sessions.json'),
    '/home/ubuntu/.clawdbot/agents/main/sessions/sessions.json',
  ];
  
  for (const sessionPath of sessionPaths) {
    try {
      if (fs.existsSync(sessionPath)) {
        const content = fs.readFileSync(sessionPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

export async function GET() {
  let data: any = {};
  let cliWorked = false;

  // Try CLI first
  try {
    const { stdout } = await execAsync('clawdbot status --json', {
      timeout: 10000,
      env: { ...process.env, PATH: `${process.env.PATH}:/usr/local/bin:/usr/bin` },
    });
    data = JSON.parse(stdout || '{}');
    cliWorked = true;
  } catch (cliError) {
    console.log('CLI unavailable, using fallback');
  }

  // Fallback: read sessions file directly
  if (!cliWorked) {
    const sessions = readSessionsFile();
    if (sessions) {
      data = {
        sessions: {
          count: Object.keys(sessions).length,
          recent: Object.values(sessions).slice(0, 10),
        },
        gateway: { reachable: true, status: 'unknown' },
      };
    }
  }

  try {
    
    // Calculate token usage for today
    const today = new Date().setHours(0, 0, 0, 0);
    const recentSessions = data.sessions?.recent || [];
    
    const todayTokens = recentSessions
      .filter((session: any) => {
        const sessionDate = new Date(session.updatedAt);
        return sessionDate.getTime() >= today;
      })
      .reduce((sum: number, session: any) => sum + (session.totalTokens || 0), 0);
    
    const weekTokens = recentSessions
      .filter((session: any) => {
        const sessionDate = new Date(session.updatedAt);
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return sessionDate.getTime() >= weekAgo;
      })
      .reduce((sum: number, session: any) => sum + (session.totalTokens || 0), 0);

    // Format the response for the frontend
    const formattedResponse = {
      gateway: {
        status: data.gateway?.reachable ? 'online' : 'offline',
        reachable: data.gateway?.reachable || false,
        latency: data.gateway?.connectLatencyMs || 0,
        url: data.gateway?.url || '',
        service: data.gatewayService?.runtimeShort || 'unknown',
      },
      tokens: {
        today: todayTokens,
        week: weekTokens,
        recentSessions: recentSessions.length,
      },
      sessions: {
        total: data.sessions?.count || 0,
        recent: recentSessions.slice(0, 5).map((session: any) => ({
          id: session.sessionId,
          agent: session.agentId,
          model: session.model,
          tokens: session.totalTokens || 0,
          age: session.age || 0,
          percentUsed: session.percentUsed || 0,
          kind: session.kind,
        })),
      },
      system: {
        os: data.os?.label || '',
        memory: {
          files: data.memory?.files || 0,
          chunks: data.memory?.chunks || 0,
          cacheEntries: data.memory?.cache?.entries || 0,
        },
        agents: data.agents?.agents || [],
      },
      security: {
        critical: data.securityAudit?.summary?.critical || 0,
        warnings: data.securityAudit?.summary?.warn || 0,
        findings: data.securityAudit?.findings?.slice(0, 3) || [],
      },
      raw: data, // Include raw data for debugging
    };

    return NextResponse.json(formattedResponse);
  } catch (error: any) {
    console.error('Jarvis API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch Jarvis system status',
        gateway: { status: 'error', reachable: false },
        tokens: { today: 0, week: 0, recentSessions: 0 },
        sessions: { total: 0, recent: [] },
        system: { os: '', memory: { files: 0, chunks: 0, cacheEntries: 0 }, agents: [] },
        security: { critical: 0, warnings: 0, findings: [] },
      },
      { status: 500 }
    );
  }
}