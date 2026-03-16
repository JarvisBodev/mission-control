import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Return tokens in a user-friendly format
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Calendar - Autorização Completa</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #0a0a0b;
              color: #e4e4e7;
            }
            .container {
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 12px;
              padding: 30px;
            }
            h1 {
              color: #3b82f6;
              margin-bottom: 20px;
            }
            .token-box {
              background: #09090b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              font-family: monospace;
              word-break: break-all;
              font-size: 14px;
            }
            .label {
              color: #71717a;
              font-size: 12px;
              text-transform: uppercase;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .success {
              color: #10b981;
              font-weight: 600;
            }
            .instructions {
              margin-top: 30px;
              padding: 20px;
              background: #27272a;
              border-radius: 8px;
            }
            .instructions ol {
              margin-left: 20px;
            }
            .instructions li {
              margin: 10px 0;
            }
            code {
              background: #18181b;
              padding: 2px 6px;
              border-radius: 4px;
              color: #3b82f6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Autorização Completa!</h1>
            <p class="success">Google Calendar conectado com sucesso.</p>
            
            <div class="token-box">
              <div class="label">Refresh Token (guarda isto!):</div>
              ${tokens.refresh_token || 'ERRO: Refresh token não recebido. Tenta novamente visitando /api/calendar/google/auth'}
            </div>

            <div class="instructions">
              <h3>Próximos passos:</h3>
              <ol>
                <li>Copia o <strong>Refresh Token</strong> acima</li>
                <li>Vai a: <a href="https://vercel.com/jarvisbodevs-projects/mission-control/settings/environment-variables" target="_blank">Vercel Environment Variables</a></li>
                <li>Adiciona nova variável:
                  <ul>
                    <li>Nome: <code>GOOGLE_REFRESH_TOKEN</code></li>
                    <li>Valor: [cola o token copiado]</li>
                  </ul>
                </li>
                <li>Clica <strong>Save</strong></li>
                <li>Aguarda redeploy automático (1-2 min)</li>
                <li>Dashboard passa a mostrar calendário automaticamente!</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erro na Autorização</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #0a0a0b;
              color: #e4e4e7;
            }
            .error {
              background: #18181b;
              border: 1px solid #dc2626;
              border-radius: 12px;
              padding: 30px;
              color: #fca5a5;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Erro na Autorização</h1>
            <p>${error.message}</p>
            <p>Tenta novamente: <a href="/api/calendar/google/auth">/api/calendar/google/auth</a></p>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
}
