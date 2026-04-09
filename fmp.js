export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Missing ticker' });

  try {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);

    const fmt = d => d.toISOString().split('T')[0].replace(/-/g, '');
    const url = `https://stooq.com/q/d/l/?s=${ticker.toLowerCase()}.us&d1=${fmt(start)}&d2=${fmt(end)}&i=d`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const text = await response.text();

    if (!text || text.includes('No data') || text.trim().length < 30) {
      return res.status(404).json({ error: `No data found for ${ticker}` });
    }

    const lines = text.trim().split('\n').slice(1); // skip header
    const closes = lines
      .map(line => {
        const cols = line.split(',');
        return parseFloat(cols[4]); // Close column
      })
      .filter(p => !isNaN(p))
      .reverse(); // oldest to newest

    if (closes.length < 50) {
      return res.status(404).json({ error: `Only ${closes.length} data points for ${ticker}` });
    }

    return res.status(200).json({ closes, symbol: ticker.toUpperCase(), count: closes.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fetch failed', details: error.message });
  }
}
