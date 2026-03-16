import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasRedirectUri = !!process.env.GOOGLE_REDIRECT_URI;
  const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN;

  const clientIdPreview = process.env.GOOGLE_CLIENT_ID 
    ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...` 
    : 'NOT SET';
  
  const secretPreview = process.env.GOOGLE_CLIENT_SECRET 
    ? `${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...` 
    : 'NOT SET';

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Environment Variables Check</title>
        <style>
          body {
            font-family: monospace;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #0a0a0b;
            color: #e4e4e7;
          }
          .check {
            padding: 10px;
            margin: 10px 0;
            border-radius: 8px;
          }
          .ok {
            background: #064e3b;
            color: #10b981;
          }
          .error {
            background: #7f1d1d;
            color: #fca5a5;
          }
          code {
            background: #18181b;
            padding: 2px 6px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h1>🔍 Environment Variables Check</h1>
        
        <div class="check ${hasClientId ? 'ok' : 'error'}">
          <strong>GOOGLE_CLIENT_ID:</strong> ${hasClientId ? '✅ SET' : '❌ NOT SET'}<br>
          ${hasClientId ? `Preview: <code>${clientIdPreview}</code>` : ''}
        </div>
        
        <div class="check ${hasClientSecret ? 'ok' : 'error'}">
          <strong>GOOGLE_CLIENT_SECRET:</strong> ${hasClientSecret ? '✅ SET' : '❌ NOT SET'}<br>
          ${hasClientSecret ? `Preview: <code>${secretPreview}</code>` : ''}
        </div>
        
        <div class="check ${hasRedirectUri ? 'ok' : 'error'}">
          <strong>GOOGLE_REDIRECT_URI:</strong> ${hasRedirectUri ? '✅ SET' : '❌ NOT SET'}<br>
          ${hasRedirectUri ? `Value: <code>${process.env.GOOGLE_REDIRECT_URI}</code>` : ''}
        </div>
        
        <div class="check ${hasRefreshToken ? 'ok' : 'error'}">
          <strong>GOOGLE_REFRESH_TOKEN:</strong> ${hasRefreshToken ? '✅ SET (já autorizaste)' : '⏳ NOT SET (normal - ainda não autorizaste)'}
        </div>

        <hr style="margin: 30px 0; border-color: #27272a;">

        ${!hasClientId || !hasClientSecret || !hasRedirectUri ? `
          <h2 style="color: #dc2626;">❌ Variáveis em falta!</h2>
          <p>Vai a: <a href="https://vercel.com/jarvisbodevs-projects/mission-control/settings/environment-variables" target="_blank">Vercel Environment Variables</a></p>
          <p>Adiciona as variáveis em falta com os valores do Google Cloud Console.</p>
        ` : `
          <h2 style="color: #10b981;">✅ Tudo configurado!</h2>
          <p><a href="/api/calendar/auth">Clica aqui para autorizar Google Calendar</a></p>
        `}
      </body>
    </html>
  `);
}
