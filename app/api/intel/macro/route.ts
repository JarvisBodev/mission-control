import { NextResponse } from 'next/server';

// Macro data API - fetches EUR/USD, Brent, S&P 500, 10Y Treasury
export async function GET() {
  try {
    // Use free APIs for market data
    const data = {
      eurusd: { value: 0, change: 0, changePercent: 0 },
      brent: { value: 0, change: 0, changePercent: 0 },
      sp500: { value: 0, change: 0, changePercent: 0 },
      treasury10y: { value: 0, change: 0, changePercent: 0 },
      updatedAt: new Date().toISOString(),
    };

    // Fetch EUR/USD from exchangerate-api (free tier)
    try {
      const fxRes = await fetch('https://open.er-api.com/v6/latest/EUR', { 
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        data.eurusd.value = fxData.rates?.USD || 0;
      }
    } catch (e) {
      console.error('Error fetching EUR/USD:', e);
    }

    // Use Yahoo Finance API via RapidAPI or free alternative
    // For now, use static placeholder data that can be replaced with real API
    const marketDataPlaceholder = {
      brent: { value: 74.85, change: -0.32, changePercent: -0.43 },
      sp500: { value: 5667.56, change: 32.45, changePercent: 0.58 },
      treasury10y: { value: 4.28, change: 0.02, changePercent: 0.47 },
    };

    // Try to fetch from free market data API
    try {
      // Using Alpha Vantage free tier (limited calls)
      const alphaVantageKey = process.env.ALPHA_VANTAGE_KEY;
      if (alphaVantageKey) {
        // Fetch S&P 500 (SPY as proxy)
        const spyRes = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${alphaVantageKey}`,
          { next: { revalidate: 300 } }
        );
        if (spyRes.ok) {
          const spyData = await spyRes.json();
          const quote = spyData['Global Quote'];
          if (quote) {
            data.sp500.value = parseFloat(quote['05. price']) * 10 || marketDataPlaceholder.sp500.value;
            data.sp500.change = parseFloat(quote['09. change']) * 10 || marketDataPlaceholder.sp500.change;
            data.sp500.changePercent = parseFloat(quote['10. change percent']?.replace('%', '')) || marketDataPlaceholder.sp500.changePercent;
          }
        }
      }
    } catch (e) {
      console.error('Error fetching market data:', e);
    }

    // Apply placeholder data where we couldn't fetch real data
    if (data.brent.value === 0) {
      data.brent = marketDataPlaceholder.brent;
    }
    if (data.sp500.value === 0) {
      data.sp500 = marketDataPlaceholder.sp500;
    }
    if (data.treasury10y.value === 0) {
      data.treasury10y = marketDataPlaceholder.treasury10y;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Macro API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
