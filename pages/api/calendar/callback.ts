import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).send('<h1>Erro: No authorization code received</h1>');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
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
              ${tokens.refresh_token || 'ERRO: Refresh token não recebido. Visita /api/calendar/auth novamente.'}
            </div>

            <div class="instructions">
              <h3>Próximos passos:</h3>
              <ol>
                <li>Copia o <strong>Refresh Token</strong> acima</li>
                <li>Vai a: <a href="https://vercel.com/jarvisbodevs-projects/mission-control/settings/environment-variables" target="_blank">Vercel Environment Variables</a></li>
                <li>Adiciona nova variável:
                  <ul>
                    <li>Nome: <code>GOOGLE_REFRESH_TOKEN</code></li>
                    <li>Valor: [cola o token]</li>
                  </ul>
                </li>
                <li>Clica <strong>Save</strong></li>
                <li>Dashboard passa a mostrar calendário!</li>
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
        <body style="font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
          <h1 style="color: #dc2626;">❌ Erro na Autorização</h1>
          <p>${error.message}</p>
          <p><a href="/api/calendar/auth">Tentar novamente</a></p>
        </body>
      </html>
    `);
  }
}
