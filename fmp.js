export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Missing ticker' });

  try {
    const API_KEY = '61303c074e6d4aa084d9de70e3291790';
    const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=252&apikey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error') {
      return res.status(404).json({ error: data.message || `No data for ${ticker}` });
    }

    if (!data.values || data.values.length < 50) {
      return res.status(404).json({ error: `Only ${data.values?.length || 0} data points for ${ticker}` });
    }

    // Twelve Data returns newest first — reverse to oldest first
    const closes = data.values
      .map(d => parseFloat(d.close))
      .filter(p => !isNaN(p))
      .reverse();

    return res.status(200).json({ closes, symbol: ticker.toUpperCase(), count: closes.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fetch failed', details: error.message });
  }
}
