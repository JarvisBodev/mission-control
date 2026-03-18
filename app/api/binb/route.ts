import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets-bridge';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch data from Google Sheets via gog CLI bridge
    const [masterInput, contratos, seguros, reservasData] = await Promise.all([
      fetchSheetData("MASTER_INPUT!A1:M15"),
      fetchSheetData("EntradasSaídas!A1:N55"),
      fetchSheetData("Seguros!A1:J25"),
      fetchSheetData("Reservas 2627!A1:N20"), // Reservas in separate sheet
    ]);

    // Check if we got real data
    const hasRealData = masterInput.length > 1 && contratos.length > 0;

    // Parse MASTER_INPUT (Portfolio)
    const apartamentos = masterInput.slice(1).filter(row => row && row[0] && !String(row[0]).includes('─')).map(row => ({
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

    // Calculate totals from real data
    const totalAssets = apartamentos.length || 11;
    const operatingAssets = apartamentos.filter(a => a.status === 'Operacional').length || 8;
    const totalQuartos = apartamentos.filter(a => a.status === 'Operacional').reduce((sum, a) => sum + a.quartos, 0) || 35;
    const quartosOcupados = contratosActivos.length > 0 ? contratosActivos.length : totalQuartos;
    const receita = receitaTotal > 0 ? receitaTotal : 11900;
    const opex = 6242; // Fixed for now

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

    // Calculate totals
    const cashflow = receita - opex;
    const margem = receita > 0 ? (cashflow / receita * 100) : 0;

    return NextResponse.json({
      connected: hasRealData,
      lastUpdate: new Date().toISOString(),
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
          .filter(a => a.status === 'Em Remodelação' || a.status === 'Em Construção')
          .map(apt => ({
            id: apt.id,
            nome: apt.morada || apt.nome,
            status: apt.status,
            previsao: apt.id === 'LOJA' ? '2027' : 'Setembro 2026',
            tipo: apt.id === 'FABRICA' ? 'Em Construção' : apt.id === 'LOJA' ? 'Por definir' : 'Arrendamento estudantes',
          })),
      },
      // Parse reservas (rows after header)
      reservas: reservasData.slice(1).filter(row => row && row[0] && row[0] !== '' && !row[0].includes('==='))
        .map(row => ({
          id: row[0],
          apartamento: row[1],
          unidade: row[2],
          nome: row[3],
          email: row[4],
          inicio: row[5],
          fim: row[6],
          quartos: parseInt(row[7]) || 1,
          depositoDeadline: row[8],
          depositoPago: row[9] === 'TRUE',
          status: row[10] || 'Pendente',
          rendaMensal: parseFloat(String(row[11] || '0').replace(',', '.')) || 0,
          valorTotal: parseFloat(String(row[12] || '0').replace(',', '.')) || 0,
          notas: row[13] || '',
        })),
    });
  } catch (error: any) {
    console.error('BINB API error:', error);
    
    // Return fallback data if connection fails
    return NextResponse.json({
      connected: false,
      error: error.message || 'Connection failed',
      summary: {
        totalApartamentos: 11,
        operatingAssets: 8,
        totalQuartos: 35,
        quartosOcupados: 35,
        taxaOcupacao: 100,
        receitaMensal: 11900,
        custosMensais: 6242,
        cashflowMensal: 5658,
        margemMedia: 47.5,
      },
      apartamentos: [],
      ocupacao: {},
      analise: [],
      alertas: {
        segurosExpiring: [],
        upcomingCheckouts: [],
        contratosPendentes: [],
      },
      projetos: {
        emRemodelacao: [
          { id: '63', nome: 'Manuel Monteiro 63', previsao: 'Setembro 2026', tipo: 'Arrendamento estudantes' },
          { id: 'FABRICA', nome: 'Fábrica', previsao: 'Setembro 2026', tipo: 'Em Construção' },
          { id: 'LOJA', nome: 'Loja 349', previsao: '2027', tipo: 'Por definir' },
        ],
      },
      reservas: [],
    });
  }
}
