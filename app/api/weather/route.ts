import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city') || 'Braga';
  
  try {
    // Using wttr.in for simple weather (no API key needed)
    const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
      headers: { 'User-Agent': 'curl/7.68.0' },
      next: { revalidate: 1800 } // Cache for 30 minutes
    });
    
    if (!response.ok) {
      throw new Error('Weather service unavailable');
    }
    
    const data = await response.json();
    const current = data.current_condition?.[0];
    const today = data.weather?.[0];
    
    if (!current) {
      throw new Error('No weather data');
    }
    
    // Get weather description in Portuguese
    const weatherDescPT: Record<string, string> = {
      'Sunny': 'Ensolarado ☀️',
      'Clear': 'Céu limpo 🌙',
      'Partly cloudy': 'Parcialmente nublado ⛅',
      'Cloudy': 'Nublado ☁️',
      'Overcast': 'Encoberto ☁️',
      'Mist': 'Neblina 🌫️',
      'Fog': 'Nevoeiro 🌫️',
      'Light rain': 'Chuva fraca 🌧️',
      'Light rain shower': 'Aguaceiros fracos 🌧️',
      'Moderate rain': 'Chuva moderada 🌧️',
      'Heavy rain': 'Chuva forte 🌧️',
      'Patchy rain possible': 'Possível chuva 🌦️',
      'Thundery outbreaks possible': 'Possíveis trovoadas ⛈️',
      'Light snow': 'Neve fraca 🌨️',
      'Moderate snow': 'Neve moderada 🌨️',
      'Heavy snow': 'Neve forte 🌨️',
    };
    
    const description = current.weatherDesc?.[0]?.value || 'Unknown';
    const descriptionPT = weatherDescPT[description] || description;
    
    return NextResponse.json({
      city,
      temperature: parseInt(current.temp_C),
      feelsLike: parseInt(current.FeelsLikeC),
      humidity: parseInt(current.humidity),
      description: descriptionPT,
      descriptionEN: description,
      windSpeed: parseInt(current.windspeedKmph),
      uvIndex: parseInt(current.uvIndex),
      maxTemp: today ? parseInt(today.maxtempC) : null,
      minTemp: today ? parseInt(today.mintempC) : null,
      chanceOfRain: today?.hourly?.[Math.floor(new Date().getHours() / 3)]?.chanceofrain || '0',
      icon: current.weatherCode,
      updated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      city,
      error: error.message,
      temperature: null,
      description: 'Indisponível'
    }, { status: 200 }); // Return 200 to not break UI
  }
}
