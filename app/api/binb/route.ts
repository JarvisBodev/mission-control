import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const SHEET_ID = '1jGna6XTDKh-siRwlNdZ-gWVpQ4Rx4s45MH33pHWDLSE';

async function fetchSheet(range: string): Promise<any[][]> {
  try {
    const { stdout } = await execAsync(
      `GOG_KEYRING_PASSWORD="filipe" GOG_ACCOUNT=bedinbraga1@gmail.com gog sheets get ${SHEET_ID} "${range}" --json`,
      { timeout: 30000, env: { ...process.env, PATH: `${process.env.PATH}:/usr/local/bin:/usr/bin` } }
    );
    const data = JSON.parse(stdout);
    return data.values || [];
  } catch (error) {
    console.error(`Failed to fetch ${range}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Fetch data from correct tabs
    const [masterInput, contratos, seguros, analiseRaw] = await Promise.all([
      fetchSheet("MASTER_INPUT!A1:M15"),
      fetchSheet("'EntradasSaídas'!A1:N60"),
      fetchSheet("Seguros!A1:J25"),
      fetchSheet("'Análise'!A1:E30"),
    ]);

    // Parse MASTER_INPUT (Portfolio)
    const apartamentos = masterInput.slice(1).filter(row => row && row[0] && !row[0].includes('─')).map(row => ({
      id: row[0],
      nome: row[1] || '',
      morada: row[2] || '',
      andar: row[3] || '',
      lado: row[4] || '',
      quartos: parseInt(row[5]) || 0,
      valorMercado: parseFloat(String(row[7] || '0').replace(',', '.')) || 0,
      divida: parseFloat(String(row[8] || '0').replace(',', '.')) || 0,
      ltv: parseFloat(String(row[9] || '0').replace(',', '.')) || 0,
      status: row[10] || '',
    }));

    // Parse CONTRACT_LOG (EntradasSaídas) - active contracts
    const contratosActivos = contratos.slice(1).filter(row => 
      row && row.length >= 13 && row[12] === 'Ativo'
    );

    // Calculate revenue by apartment
    const receitaPorApt: Record<string, number> = {};
    let receitaTotal = 0;
    contratosActivos.forEach(row => {
      const apt = row[1]; // Asset_ID
      const renda = parseFloat(String(row[5] || '0').replace(',', '.')) || 0;
      receitaPorApt[apt] = (receitaPorApt[apt] || 0) + renda;
      receitaTotal += renda;
    });

    // Count rooms per apartment
    const quartosPorApt: Record<string, number> = {};
    contratosActivos.forEach(row => {
      const apt = row[1];
      quartosPorApt[apt] = (quartosPorApt[apt] || 0) + 1;
    });

    // Parse Seguros - find expiring in 60 days
    const now = new Date();
    const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const segurosExpiring = seguros.slice(3).filter(row => {
      if (!row || !row[5]) return false;
      try {
        const validade = new Date(row[5]);
        return validade <= sixtyDaysLater && validade >= now;
      } catch {
        return false;
      }
    }).map(row => ({
      apartamento: row[0],
      tipo: row[1],
      seguradora: row[2],
      valor: row[4],
      validade: row[5],
    }));

    // Fixed OPEX values (from our calculations)
    const opex = 6242; // Total OPEX mensal confirmado
    
    // Parse Análise dashboard for KPIs
    let totalAssets = 11;
    let operatingAssets = 8;
    let totalQuartos = 35;
    let quartosOcupados = 35;

    // Try to extract from Análise
    analiseRaw.forEach(row => {
      if (!row || !row[0]) return;
      const label = String(row[0]).toLowerCase();
      const value = parseFloat(String(row[1] || '0').replace(/[€,\s]/g, '').replace(',', '.')) || 0;
      
      if (label.includes('total assets')) totalAssets = value || totalAssets;
      if (label.includes('operating assets')) operatingAssets = value || operatingAssets;
      if (label.includes('total units')) totalQuartos = value || totalQuartos;
      if (label.includes('occupied units')) quartosOcupados = value || quartosOcupados;
    });

    // If we got contracts, use real data
    if (contratosActivos.length > 0) {
      quartosOcupados = contratosActivos.length;
      receitaTotal = Object.values(receitaPorApt).reduce((a, b) => a + b, 0);
    }

    // Contracts with pending items
    const contratosPendentes = contratosActivos.filter(row => {
      const deposito = row[9];
      const renda1 = row[10];
      const assinado = row[11];
      return deposito === 'FALSE' || renda1 === 'FALSE' || assinado === 'FALSE';
    }).map(row => ({
      apartamento: row[1],
      quarto: row[2],
      nome: row[4],
      depositoPago: row[9] === 'TRUE',
      renda1Mes: row[10] === 'TRUE',
      contratoAssinado: row[11] === 'TRUE',
    }));

    // Upcoming checkouts (30 days)
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingCheckouts = contratosActivos.filter(row => {
      if (!row[7]) return false;
      try {
        const checkout = new Date(row[7]);
        return checkout >= now && checkout <= thirtyDaysLater;
      } catch {
        return false;
      }
    }).map(row => ({
      apartamento: row[1],
      quarto: row[2],
      nome: row[4],
      checkOut: row[7],
    })).sort((a, b) => new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime());

    // Build analise per apartment
    const analiseData = apartamentos
      .filter(apt => apt.status === 'Operacional')
      .map(apt => ({
        apartamento: apt.id,
        receitaBruta: receitaPorApt[apt.id] || 0,
        quartosOcupados: quartosPorApt[apt.id] || 0,
        totalQuartos: apt.quartos,
      }));

    // Calculate totals (use real receita or fallback)
    const receita = receitaTotal > 0 ? receitaTotal : 11900;
    const cashflow = receita - opex;
    const margem = receita > 0 ? (cashflow / receita * 100) : 0;

    return NextResponse.json({
      summary: {
        totalApartamentos: totalAssets,
        operatingAssets: operatingAssets,
        totalQuartos: totalQuartos,
        quartosOcupados: quartosOcupados,
        taxaOcupacao: totalQuartos > 0 ? Math.round((quartosOcupados / totalQuartos) * 100) : 0,
        receitaMensal: receita,
        custosMensais: opex,
        cashflowMensal: cashflow,
        margemMedia: Math.round(margem * 10) / 10,
      },
      apartamentos: apartamentos.filter(a => a.status === 'Operacional'),
      ocupacao: Object.fromEntries(
        apartamentos.filter(a => a.status === 'Operacional').map(apt => [
          apt.id,
          { 
            occupied: quartosPorApt[apt.id] || 0, 
            total: apt.quartos, 
            revenue: receitaPorApt[apt.id] || 0 
          }
        ])
      ),
      analise: analiseData,
      alertas: {
        segurosExpiring,
        upcomingCheckouts,
        contratosPendentes,
      },
      projetos: {
        emRemodelacao: apartamentos
          .filter(a => a.status === 'Em Remodelação')
          .map(apt => ({
            id: apt.id,
            nome: apt.morada || apt.nome,
            previsao: apt.id === 'LOJA' ? '2027' : 'Setembro 2026',
            tipo: apt.id === 'FABRICA' ? 'Airbnb' : apt.id === 'LOJA' ? 'Por definir' : 'Arrendamento estudantes',
          })),
      },
    });
  } catch (error: any) {
    console.error('BINB API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch BINB data' },
      { status: 500 }
    );
  }
}
