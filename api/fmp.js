export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { ticker, timeseries = 252 } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker' });
  }

  const API_KEY = 'dz3Lx2iSE0OcuZmpDfJF8bUVLPF8wOwi';
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?timeseries=${timeseries}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from FMP' });
  }
}
