import { execSync } from 'child_process';

const SHEET_ID = '1jGna6XTDKh-siRwlNdZ-gWVpQ4Rx4s45MH33pHWDLSE';

export async function fetchSheetData(range: string): Promise<any[][]> {
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
    const cmd = `GOG_KEYRING_PASSWORD="filipe" GOG_ACCOUNT=bedinbraga1@gmail.com gog sheets update ${SHEET_ID} "${range}" --values-json '${valuesJson}'`;
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
