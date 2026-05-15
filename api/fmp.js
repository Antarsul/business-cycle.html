
Copy

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
 
  const series_id = req.query.series_id;
  const limit = req.query.limit || 10000;
  const sort_order = req.query.sort_order || 'desc';
  const observation_start = req.query.observation_start || '2000-01-01';
 
  if (!series_id) {
    return res.status(400).json({ error: 'Missing series_id' });
  }
 
  const API_KEY = 'e9220c32c6bc075476b12cc19ed66696';
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${API_KEY}&file_type=json&sort_order=${sort_order}&limit=${limit}&observation_start=${observation_start}`;
 
  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from FRED', details: error.message });
  }
}
 
