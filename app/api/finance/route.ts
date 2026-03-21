import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FINANCE_FILE = path.join(process.cwd(), 'data', 'finance.json');

interface RentPayment {
  apartmentId: string;
  apartmentName: string;
  expectedRent: number;
  receivedRent: number;
  status: 'paid' | 'pending' | 'late' | 'partial';
  dueDate: string;
  paidDate?: string;
}

interface FinanceState {
  // Cashflow tracking
  monthlyExpectedRent: number;
  monthlyReceivedRent: number;
  rentPayments: RentPayment[];
  
  // NAV/LTV tracking (simplified)
  totalAssetValue: number;
  totalDebt: number;
  nav: number; // Net Asset Value = Assets - Debt
  ltv: number; // Loan to Value = Debt / Assets
  
  // Savings goal
  savingsGoal: number;
  currentSavings: number;
  
  // Monthly tracking
  currentMonth: string;
  lastUpdated: string;
}

const defaultState: FinanceState = {
  monthlyExpectedRent: 0,
  monthlyReceivedRent: 0,
  rentPayments: [],
  totalAssetValue: 0,
  totalDebt: 0,
  nav: 0,
  ltv: 0,
  savingsGoal: 50000,
  currentSavings: 0,
  currentMonth: new Date().toISOString().slice(0, 7),
  lastUpdated: new Date().toISOString(),
};

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function loadFinanceState(): Promise<FinanceState> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(FINANCE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultState;
  }
}

async function saveFinanceState(state: FinanceState): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(FINANCE_FILE, JSON.stringify(state, null, 2));
}

// Try to fetch BINB data to calculate real cashflow
async function fetchBinbData() {
  try {
    const binbApiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${binbApiUrl}/api/binb`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Error fetching BINB data:', e);
  }
  return null;
}

export async function GET() {
  try {
    const state = await loadFinanceState();
    
    // Try to enrich with BINB data
    const binbData = await fetchBinbData();
    
    if (binbData?.portfolio?.length > 0) {
      // Calculate expected rent from occupied apartments
      let expectedRent = 0;
      let totalValue = 0;
      let totalDebt = 0;
      
      binbData.portfolio.forEach((apt: any) => {
        if (apt.status === 'Ocupado' && apt.rentaAtual) {
          expectedRent += apt.rentaAtual;
        }
        if (apt.valorCompra) {
          // Estimate current value (simplified: purchase value + 10%)
          totalValue += apt.valorCompra * 1.1;
        }
        // Estimate debt (would need real data)
        // For now, assume 60% LTV on purchase price
        if (apt.valorCompra && apt.status !== 'Em Remodelação') {
          totalDebt += apt.valorCompra * 0.6;
        }
      });
      
      state.monthlyExpectedRent = expectedRent;
      state.totalAssetValue = totalValue;
      state.totalDebt = totalDebt;
      state.nav = totalValue - totalDebt;
      state.ltv = totalValue > 0 ? Math.round((totalDebt / totalValue) * 100) : 0;
    }
    
    // Calculate cashflow progress
    const cashflowProgress = state.monthlyExpectedRent > 0 
      ? Math.round((state.monthlyReceivedRent / state.monthlyExpectedRent) * 100)
      : 0;
    
    // Calculate savings progress
    const savingsProgress = state.savingsGoal > 0
      ? Math.round((state.currentSavings / state.savingsGoal) * 100)
      : 0;

    return NextResponse.json({
      ...state,
      cashflowProgress,
      savingsProgress,
      paidCount: state.rentPayments.filter(p => p.status === 'paid').length,
      pendingCount: state.rentPayments.filter(p => p.status === 'pending' || p.status === 'late').length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Finance API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    const state = await loadFinanceState();

    switch (action) {
      case 'record-payment':
        // Record a rent payment
        const { apartmentId, amount, date } = body;
        const payment = state.rentPayments.find(p => p.apartmentId === apartmentId);
        if (payment) {
          payment.receivedRent = amount;
          payment.status = amount >= payment.expectedRent ? 'paid' : 'partial';
          payment.paidDate = date || new Date().toISOString();
        }
        // Update total received
        state.monthlyReceivedRent = state.rentPayments.reduce((sum, p) => sum + p.receivedRent, 0);
        break;

      case 'update-savings':
        // Update current savings amount
        state.currentSavings = body.amount || 0;
        break;

      case 'update-goal':
        // Update savings goal
        state.savingsGoal = body.goal || 50000;
        break;

      case 'update-nav':
        // Manual NAV/LTV update
        if (body.assetValue !== undefined) state.totalAssetValue = body.assetValue;
        if (body.debt !== undefined) state.totalDebt = body.debt;
        state.nav = state.totalAssetValue - state.totalDebt;
        state.ltv = state.totalAssetValue > 0 
          ? Math.round((state.totalDebt / state.totalAssetValue) * 100) 
          : 0;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    state.lastUpdated = new Date().toISOString();
    await saveFinanceState(state);
    return NextResponse.json({ success: true, state });
  } catch (error: any) {
    console.error('Finance API POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
