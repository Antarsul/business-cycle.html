export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Missing ticker' });

  try {
    const end = Math.floor(Date.now() / 1000);
    const start = end - (365 * 24 * 60 * 60);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&period1=${start}&period2=${end}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const text = await response.text();
    const data = JSON.parse(text);

    const result = data?.chart?.result?.[0];
    if (!result) {
      const err = data?.chart?.error;
      return res.status(404).json({ error: err?.description || `No data for ${ticker}` });
    }

    const quote = result.indicators?.quote?.[0];
    const adjclose = result.indicators?.adjclose?.[0]?.adjclose;
    const closes = adjclose || quote?.close;

    if (!closes || closes.length === 0) {
      return res.status(404).json({ 
        error: `No price data for ${ticker}`,
        keys: Object.keys(result.indicators || {}),
        quoteKeys: Object.keys(quote || {})
      });
    }

    const clean = closes.filter(p => p !== null && p !== undefined && !isNaN(p));

    return res.status(200).json({ closes: clean, symbol: result.meta?.symbol, count: clean.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fetch failed', details: error.message });
  }
}
