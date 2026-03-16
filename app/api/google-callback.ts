import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).send('<h1>❌ Erro: No authorization code</h1>');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://mission-control-cimwbgvoq-jarvisbodevs-projects.vercel.app/api/google-callback'
    );

    const { tokens } = await oauth2Client.getToken(code);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
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
            .instructions li {
              margin: 15px 0;
              color: #d4d4d8;
            }
            code {
              background: #18181b;
              padding: 4px 8px;
              border-radius: 4px;
              color: #3b82f6;
              font-family: 'Monaco', monospace;
            }
            a {
              color: #3b82f6;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
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
            <p class="success">Google Calendar conectado com sucesso.</p>
            
            ${tokens.refresh_token ? `
              <div class="token-box">
                <div class="label">🔑 Refresh Token:</div>
                ${tokens.refresh_token}
              </div>
            ` : `
              <div class="warning">
                <strong>⚠️ AVISO:</strong> Refresh token não foi recebido.<br>
                Isto acontece se já autorizaste antes. Tenta revogar acesso em 
                <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a>
                e tenta novamente.
              </div>
            `}

            <div class="instructions">
              <h3>📋 Próximos passos:</h3>
              <ol>
                <li><strong>Copia</strong> o Refresh Token acima</li>
                <li>Vai a: <a href="https://vercel.com/jarvisbodevs-projects/mission-control/settings/environment-variables" target="_blank">Vercel Environment Variables</a></li>
                <li>Clica <strong>"Add Variable"</strong></li>
                <li>Nome: <code>GOOGLE_REFRESH_TOKEN</code></li>
                <li>Valor: <code>[cola o token copiado]</code></li>
                <li>Clica <strong>"Save"</strong></li>
                <li>Aguarda redeploy automático (1-2 min)</li>
                <li>✅ Dashboard passa a mostrar calendário!</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.status(500).send(`
      <html>
        <head><title>❌ Erro</title></head>
        <body style="font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #0a0a0b; color: #fca5a5;">
          <h1>❌ Erro na Autorização</h1>
          <p>${error.message}</p>
          <p><a href="/api/google-auth" style="color: #3b82f6;">Tentar novamente</a></p>
        </body>
      </html>
    `);
  }
}
