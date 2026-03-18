import { execSync } from 'child_process';

const SHEET_ID = '1jGna6XTDKh-siRwlNdZ-gWVpQ4Rx4s45MH33pHWDLSE';

// Check if running on Vercel (serverless)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;

export async function fetchSheetData(range: string): Promise<any[][]> {
  // If on Vercel, return empty (APIs won't work without gog CLI)
  if (isVercel) {
    console.log(`Vercel environment detected, skipping gog CLI for ${range}`);
    return [];
  }
  
  try {
    const cmd = `GOG_KEYRING_PASSWORD="filipe" GOG_ACCOUNT=bedinbraga1@gmail.com gog sheets get ${SHEET_ID} "${range}" --json`;
    const result = execSync(cmd, { 
      encoding: 'utf-8',
      timeout: 30000,
      env: { ...process.env, HOME: '/home/ubuntu' }
    });
    const data = JSON.parse(result);
    return data.values || [];
  } catch (error: any) {
    console.error(`Failed to fetch ${range}:`, error.message);
    return [];
  }
}

export async function updateSheetData(range: string, values: any[][]): Promise<boolean> {
  try {
    const valuesJson = JSON.stringify(values);
    // Escape single quotes in JSON for bash
    const escapedJson = valuesJson.replace(/'/g, "'\\''");
    const cmd = `GOG_KEYRING_PASSWORD="filipe" GOG_ACCOUNT=bedinbraga1@gmail.com gog sheets update ${SHEET_ID} "${range}" --values-json '${escapedJson}'`;
    execSync(cmd, { 
      encoding: 'utf-8',
      timeout: 30000,
      env: { ...process.env, HOME: '/home/ubuntu' }
    });
    return true;
  } catch (error: any) {
    console.error(`Failed to update ${range}:`, error.message);
    return false;
  }
}

export async function updateSingleCell(range: string, value: string | number): Promise<boolean> {
  try {
    const valueStr = String(value);
    // Use -- to handle negative numbers
    const cmd = `GOG_KEYRING_PASSWORD="filipe" GOG_ACCOUNT=bedinbraga1@gmail.com gog sheets update ${SHEET_ID} "${range}" -- ${valueStr}`;
    execSync(cmd, { 
      encoding: 'utf-8',
      timeout: 30000,
      env: { ...process.env, HOME: '/home/ubuntu' }
    });
    return true;
  } catch (error: any) {
    console.error(`Failed to update ${range}:`, error.message);
    return false;
  }
}
