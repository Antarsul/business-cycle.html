export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Missing ticker' });

  try {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&period1=${Math.floor(start.getTime()/1000)}&period2=${Math.floor(end.getTime()/1000)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    const chart = data?.chart?.result?.[0];

    if (!chart) {
      return res.status(404).json({ error: `No data found for ${ticker}`, raw: data?.chart?.error });
    }

    const timestamps = chart.timestamp;
    const closes = chart.indicators?.adjclose?.[0]?.adjclose || chart.indicators?.quote?.[0]?.close;

    if (!closes || closes.length < 50) {
      return res.status(404).json({ error: `Insufficient data for ${ticker}`, count: closes?.length || 0 });
    }

    return res.status(200).json({ timestamps, closes, symbol: chart.meta?.symbol });
  } catch (error) {
    return res.status(500).json({ error: 'Fetch failed', details: error.message });
  }
}
