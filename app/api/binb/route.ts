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
    // Fetch all required data in parallel
    const [apartamentos, ocupacao, seguros, analise, alertas] = await Promise.all([
      fetchSheet("'Lista Apartamentos'!A1:F15"),
      fetchSheet("'Ocupação'!A1:L60"),
      fetchSheet("'Seguros MR'!A1:I15"),
      fetchSheet("'Análise'!A1:E15"),
      fetchSheet("'ALERTA_PAGAMENTOS'!A1:D20"),
    ]);

    // Parse apartamentos (skip header)
    const apartamentosList = apartamentos.slice(1).filter(row => row[0]).map(row => ({
      id: row[0],
      morada: row[1],
      andar: row[2],
      lado: row[3],
      quartos: parseInt(row[4]) || 0,
      comodato: row[5] === 'Sim',
    }));

    // Parse ocupação - get active contracts
    const ocupacaoData = ocupacao.slice(1).filter(row => row[11] === 'Ativo').map(row => ({
      apartamento: row[0],
      quarto: row[1],
      nome: row[2],
      email: row[3],
      renda: parseFloat(row[4]) || 0,
      checkIn: row[5],
      checkOut: row[6],
      depositoPago: row[8] === 'TRUE',
      renda1Mes: row[9] === 'TRUE',
      contratoAssinado: row[10] === 'TRUE',
      status: row[11],
    }));

    // Calculate occupancy per apartment
    const occupancyByApt: Record<string, { occupied: number; total: number; revenue: number }> = {};
    apartamentosList.forEach(apt => {
      occupancyByApt[apt.id] = { occupied: 0, total: apt.quartos, revenue: 0 };
    });
    ocupacaoData.forEach(o => {
      if (occupancyByApt[o.apartamento]) {
        occupancyByApt[o.apartamento].occupied++;
        occupancyByApt[o.apartamento].revenue += o.renda;
      }
    });

    // Parse seguros - find expiring soon (next 60 days)
    const now = new Date();
    const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const segurosExpiring = seguros.slice(1).filter(row => {
      if (!row[8]) return false;
      const validade = new Date(row[8]);
      return validade <= sixtyDaysLater && validade >= now;
    }).map(row => ({
      apartamento: row[0],
      morada: row[1],
      empresa: row[4],
      valor: row[7],
      validade: row[8],
    }));

    // Parse análise
    const analiseData = analise.slice(1).filter(row => row[0]).map(row => ({
      apartamento: row[0],
      receitaBruta: parseFloat(row[1]) || 0,
      custosFixos: parseFloat(row[2]) || 0,
      cashflow: parseFloat(row[3]) || 0,
      margem: parseFloat(row[4]) || 0,
    }));

    // Calculate totals
    const totals = analiseData.reduce((acc, apt) => ({
      receita: acc.receita + apt.receitaBruta,
      custos: acc.custos + apt.custosFixos,
      cashflow: acc.cashflow + apt.cashflow,
    }), { receita: 0, custos: 0, cashflow: 0 });

    const totalQuartos = apartamentosList.reduce((sum, apt) => sum + apt.quartos, 0);
    const quartosOcupados = ocupacaoData.length;
    const taxaOcupacao = totalQuartos > 0 ? (quartosOcupados / totalQuartos * 100) : 0;

    // Upcoming checkouts (next 30 days)
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingCheckouts = ocupacaoData.filter(o => {
      const checkout = new Date(o.checkOut);
      return checkout >= now && checkout <= thirtyDaysLater;
    }).map(o => ({
      apartamento: o.apartamento,
      quarto: o.quarto,
      nome: o.nome,
      checkOut: o.checkOut,
    })).sort((a, b) => new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime());

    // Contracts with missing items
    const contratosPendentes = ocupacaoData.filter(o => 
      !o.depositoPago || !o.renda1Mes || !o.contratoAssinado
    ).map(o => ({
      apartamento: o.apartamento,
      quarto: o.quarto,
      nome: o.nome,
      depositoPago: o.depositoPago,
      renda1Mes: o.renda1Mes,
      contratoAssinado: o.contratoAssinado,
    }));

    return NextResponse.json({
      summary: {
        totalApartamentos: apartamentosList.filter(a => !['FABRICA', 'LOJA'].includes(a.id)).length,
        totalQuartos,
        quartosOcupados,
        taxaOcupacao: Math.round(taxaOcupacao * 10) / 10,
        receitaMensal: totals.receita,
        custosMensais: totals.custos,
        cashflowMensal: totals.cashflow,
        margemMedia: totals.receita > 0 ? Math.round((totals.cashflow / totals.receita) * 1000) / 10 : 0,
      },
      apartamentos: apartamentosList,
      ocupacao: occupancyByApt,
      analise: analiseData,
      alertas: {
        segurosExpiring,
        upcomingCheckouts,
        contratosPendentes,
      },
      projetos: {
        emRemodelacao: [
          { id: '63', nome: 'Manuel Monteiro 63', previsao: 'Setembro 2026', tipo: 'Arrendamento estudantes' },
          { id: 'FABRICA', nome: 'Fábrica (Airbnb)', previsao: 'Setembro 2026', tipo: 'Airbnb' },
          { id: 'LOJA', nome: 'Loja 349', previsao: '2027', tipo: 'Por definir' },
        ],
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
