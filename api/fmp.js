export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { ticker } = req.query;
  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker' });
  }

  const API_KEY = 'dz3Lx2iSE0OcuZmpDfJF8bUVLPF8wOwi';
  // NEW ENDPOINT
  const url = `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${ticker}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from FMP' });
  }
}
