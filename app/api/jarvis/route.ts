import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Execute clawdbot status command to get system information
    const { stdout, stderr } = await execAsync('clawdbot status --json', {
      timeout: 10000, // 10 second timeout
    });

    if (stderr && !stderr.includes('warning')) {
      console.error('clawdbot stderr:', stderr);
    }

    const data = JSON.parse(stdout || '{}');
    
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