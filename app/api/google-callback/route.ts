import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return new NextResponse('<h1>❌ Erro: No authorization code</h1>', {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'https://mission-control-36y9.vercel.app/api/google-callback'
    );

    const { tokens } = await oauth2Client.getToken(code);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>✅ Autorização Completa</title>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #0a0a0b;
              color: #e4e4e7;
              padding: 40px 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 16px;
              padding: 40px;
            }
            h1 { color: #3b82f6; margin-bottom: 20px; font-size: 32px; }
            .success { color: #10b981; font-size: 18px; margin-bottom: 30px; }
            .token-box {
              background: #09090b;
              border: 1px solid #3b82f6;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
              font-family: 'Monaco', 'Courier New', monospace;
              word-break: break-all;
              font-size: 13px;
              line-height: 1.6;
            }
            .label {
              color: #71717a;
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 700;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .instructions {
              margin-top: 40px;
              padding: 30px;
              background: #27272a;
              border-radius: 12px;
            }
            .instructions h3 {
              color: #e4e4e7;
              margin-bottom: 20px;
              font-size: 20px;
            }
            .instructions ol {
              margin-left: 20px;
              line-height: 2;
            }
            code {
              background: #18181b;
              padding: 4px 8px;
              border-radius: 4px;
              color: #3b82f6;
              font-family: 'Monaco', monospace;
            }
            a { color: #3b82f6; text-decoration: none; }
            .warning {
              background: #7f1d1d;
              color: #fca5a5;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Autorização Completa!</h1>
            <p class="success">Google Calendar + Sheets conectados com sucesso.</p>
            
            ${tokens.refresh_token ? `
              <div class="token-box">
                <div class="label">🔑 Refresh Token:</div>
                ${tokens.refresh_token}
              </div>
              <div class="instructions">
                <h3>📋 Próximos passos:</h3>
                <ol>
                  <li><strong>Copia</strong> o Refresh Token acima</li>
                  <li>Vai a: <a href="https://vercel.com" target="_blank">Vercel</a> → Settings → Environment Variables</li>
                  <li>Actualiza <code>GOOGLE_REFRESH_TOKEN</code> com o novo valor</li>
                  <li>Faz redeploy do projecto</li>
                  <li>✅ Dashboard com Calendar + BINB data!</li>
                </ol>
              </div>
            ` : `
              <div class="warning">
                <strong>⚠️ AVISO:</strong> Refresh token não foi recebido.<br>
                Isto acontece se já autorizaste antes. Revoga acesso em 
                <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a>
                e tenta novamente.
              </div>
            `}
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; background: #0a0a0b; color: #fca5a5; padding: 40px;">
          <h1>❌ Erro na Autorização</h1>
          <p>${error.message}</p>
          <p><a href="/api/google-auth" style="color: #3b82f6;">Tentar novamente</a></p>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
