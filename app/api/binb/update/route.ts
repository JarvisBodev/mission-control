import { NextResponse } from 'next/server';
import { updateSheetData, fetchSheetData } from '@/lib/sheets-bridge';

export const dynamic = 'force-dynamic';

interface UpdateRequest {
  action: 'update_contract' | 'update_asset' | 'update_rent' | 'mark_paid' | 'update_status';
  data: any;
}

export async function POST(request: Request) {
  try {
    const body: UpdateRequest = await request.json();
    const { action, data } = body;

    let result = { success: false, message: '', updated: null as any };

    switch (action) {
      case 'update_rent': {
        // Update monthly rent for a contract
        // Find contract row by Contract_ID and update column F
        const { contractId, newRent } = data;
        const contracts = await fetchSheetData("EntradasSaídas!A2:N60");
        const rowIndex = contracts.findIndex(row => row[0] === contractId);
        
        if (rowIndex === -1) {
          return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
        }

        const cellRef = `EntradasSaídas!F${rowIndex + 2}`;
        const success = await updateSheetData(cellRef, [[newRent]]);
        
        result = {
          success,
          message: success ? `Rent updated to €${newRent}` : 'Failed to update',
          updated: { contractId, newRent, cell: cellRef }
        };
        break;
      }

      case 'mark_paid': {
        // Mark deposit/first month/contract as paid/signed
        const { contractId, field } = data; // field: 'deposit' | 'firstMonth' | 'signed'
        const contracts = await fetchSheetData("EntradasSaídas!A2:N60");
        const rowIndex = contracts.findIndex(row => row[0] === contractId);
        
        if (rowIndex === -1) {
          return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
        }

        // J = Deposit_Paid (col 10), K = First_Month_Paid (col 11), L = Contract_Signed (col 12)
        const colMap: Record<string, string> = {
          'deposit': 'J',
          'firstMonth': 'K', 
          'signed': 'L'
        };
        const col = colMap[field];
        if (!col) {
          return NextResponse.json({ success: false, message: 'Invalid field' }, { status: 400 });
        }

        const cellRef = `EntradasSaídas!${col}${rowIndex + 2}`;
        const success = await updateSheetData(cellRef, [['TRUE']]);
        
        result = {
          success,
          message: success ? `${field} marked as complete` : 'Failed to update',
          updated: { contractId, field, cell: cellRef }
        };
        break;
      }

      case 'update_asset': {
        // Update asset market value or debt
        const { assetId, field, value } = data; // field: 'marketValue' | 'debt'
        const assets = await fetchSheetData("MASTER_INPUT!A2:M15");
        const rowIndex = assets.findIndex(row => row[0] === assetId);
        
        if (rowIndex === -1) {
          return NextResponse.json({ success: false, message: 'Asset not found' }, { status: 404 });
        }

        // H = Market_Value (col 8), I = Debt (col 9)
        const colMap: Record<string, string> = {
          'marketValue': 'H',
          'debt': 'I'
        };
        const col = colMap[field];
        if (!col) {
          return NextResponse.json({ success: false, message: 'Invalid field' }, { status: 400 });
        }

        const cellRef = `MASTER_INPUT!${col}${rowIndex + 2}`;
        const success = await updateSheetData(cellRef, [[value]]);
        
        result = {
          success,
          message: success ? `Asset ${assetId} ${field} updated to ${value}` : 'Failed to update',
          updated: { assetId, field, value, cell: cellRef }
        };
        break;
      }

      case 'update_status': {
        // Update asset status (Operacional, Em Remodelação, Em Construção)
        const { assetId, status } = data;
        const assets = await fetchSheetData("MASTER_INPUT!A2:M15");
        const rowIndex = assets.findIndex(row => row[0] === assetId);
        
        if (rowIndex === -1) {
          return NextResponse.json({ success: false, message: 'Asset not found' }, { status: 404 });
        }

        const cellRef = `MASTER_INPUT!K${rowIndex + 2}`;
        const success = await updateSheetData(cellRef, [[status]]);
        
        result = {
          success,
          message: success ? `Asset ${assetId} status updated to ${status}` : 'Failed to update',
          updated: { assetId, status, cell: cellRef }
        };
        break;
      }

      default:
        return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('BINB Update API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
