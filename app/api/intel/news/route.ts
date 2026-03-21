import { NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category: 'markets' | 'tech' | 'ai' | 'crypto' | 'general';
}

// News API - fetches headlines from various sources
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';

  try {
    const news: NewsItem[] = [];

    // Try NewsAPI if key is available
    const newsApiKey = process.env.NEWS_API_KEY;
    if (newsApiKey) {
      try {
        const queries: { [key: string]: string } = {
          markets: 'stock market OR financial markets OR economy',
          tech: 'technology OR startups OR silicon valley',
          ai: 'artificial intelligence OR machine learning OR AI',
          crypto: 'bitcoin OR cryptocurrency OR blockchain',
          all: 'business OR technology OR finance',
        };

        const query = queries[category] || queries.all;
        const newsRes = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`,
          { next: { revalidate: 1800 } } // Cache for 30 minutes
        );

        if (newsRes.ok) {
          const newsData = await newsRes.json();
          newsData.articles?.forEach((article: any) => {
            if (article.title && article.title !== '[Removed]') {
              news.push({
                title: article.title,
                source: article.source?.name || 'Unknown',
                url: article.url,
                publishedAt: article.publishedAt,
                category: category as any,
              });
            }
          });
        }
      } catch (e) {
        console.error('Error fetching from NewsAPI:', e);
      }
    }

    // Fallback: Fetch from free RSS feeds via RSS2JSON
    if (news.length < 5) {
      const rssFeeds: { [key: string]: string[] } = {
        markets: [
          'https://feeds.bloomberg.com/markets/news.rss',
          'https://www.ft.com/?format=rss',
        ],
        tech: [
          'https://techcrunch.com/feed/',
          'https://www.theverge.com/rss/index.xml',
        ],
        ai: [
          'https://techcrunch.com/category/artificial-intelligence/feed/',
        ],
        crypto: [
          'https://cointelegraph.com/rss',
        ],
      };

      const feeds = rssFeeds[category] || Object.values(rssFeeds).flat();
      
      for (const feedUrl of feeds.slice(0, 2)) {
        try {
          const rssRes = await fetch(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
            { next: { revalidate: 1800 } }
          );
          if (rssRes.ok) {
            const rssData = await rssRes.json();
            rssData.items?.slice(0, 5).forEach((item: any) => {
              news.push({
                title: item.title,
                source: rssData.feed?.title || 'RSS Feed',
                url: item.link,
                publishedAt: item.pubDate,
                category: category as any,
              });
            });
          }
        } catch (e) {
          console.error('Error fetching RSS:', e);
        }
      }
    }

    // If still no news, return placeholder headlines
    if (news.length === 0) {
      news.push(
        {
          title: 'Markets await Fed decision on interest rates',
          source: 'Financial Times',
          url: '#',
          publishedAt: new Date().toISOString(),
          category: 'markets',
        },
        {
          title: 'Tech stocks rally on AI optimism',
          source: 'Bloomberg',
          url: '#',
          publishedAt: new Date().toISOString(),
          category: 'tech',
        },
        {
          title: 'OpenAI announces new model capabilities',
          source: 'TechCrunch',
          url: '#',
          publishedAt: new Date().toISOString(),
          category: 'ai',
        },
        {
          title: 'Bitcoin holds above key support level',
          source: 'CoinDesk',
          url: '#',
          publishedAt: new Date().toISOString(),
          category: 'crypto',
        }
      );
    }

    return NextResponse.json({
      news: news.slice(0, 15),
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('News API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
