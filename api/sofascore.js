export default async function handler(req, res) {
  // req.url = /api/sofascore/team/3202/events/next/0
  const sofascorePath = (req.url || '').replace(/^\/api\/sofascore\/?/, '');
  const url = `https://api.sofascore.com/api/v1/${sofascorePath}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; La12Digital/1.0)',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', message: String(err) });
  }
}
