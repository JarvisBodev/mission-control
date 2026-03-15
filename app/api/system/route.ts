import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 7bec458a8a19fc096b73ac7e4c640847d4466e00395aba6d'
    };

    if (action === 'restart') {
      await fetch('http://localhost:18789/rpc/gateway.restart', { method: 'POST', headers });
      return NextResponse.json({ success: true, message: 'Restart command sent to gateway' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 500 });
  }
}
