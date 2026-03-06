export default async function handler(req, res) {
  const { path: pathSegments } = req.query;
  const sofascorePath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments ?? '';

  const url = `https://api.sofascore.com/api/v1/${sofascorePath}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}
