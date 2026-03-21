import { NextResponse } from 'next/server';

// Crypto data API - fetches BTC, ETH prices and Fear & Greed Index
export async function GET() {
  try {
    const data = {
      btc: { price: 0, change24h: 0, marketCap: 0 },
      eth: { price: 0, change24h: 0, marketCap: 0 },
      fearGreed: { value: 0, classification: 'Neutral' },
      updatedAt: new Date().toISOString(),
    };

    // Fetch crypto prices from CoinGecko (free, no API key needed)
    try {
      const cgRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
        { next: { revalidate: 300 } } // Cache for 5 minutes
      );
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        
        if (cgData.bitcoin) {
          data.btc = {
            price: cgData.bitcoin.usd || 0,
            change24h: cgData.bitcoin.usd_24h_change || 0,
            marketCap: cgData.bitcoin.usd_market_cap || 0,
          };
        }
        
        if (cgData.ethereum) {
          data.eth = {
            price: cgData.ethereum.usd || 0,
            change24h: cgData.ethereum.usd_24h_change || 0,
            marketCap: cgData.ethereum.usd_market_cap || 0,
          };
        }
      }
    } catch (e) {
      console.error('Error fetching crypto prices:', e);
    }

    // Fetch Fear & Greed Index from alternative.me (free)
    try {
      const fgRes = await fetch('https://api.alternative.me/fng/?limit=1', {
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      if (fgRes.ok) {
        const fgData = await fgRes.json();
        if (fgData.data?.[0]) {
          data.fearGreed = {
            value: parseInt(fgData.data[0].value) || 50,
            classification: fgData.data[0].value_classification || 'Neutral',
          };
        }
      }
    } catch (e) {
      console.error('Error fetching Fear & Greed:', e);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Crypto API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
