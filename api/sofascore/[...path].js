const EMPTY_RESPONSE = { events: [], standings: [] };

// Only allow alphanumeric characters, hyphens, and underscores in each segment.
const SAFE_SEGMENT = /^[a-zA-Z0-9_-]+$/;

export default async function handler(req, res) {
  // req.query.path is an array of path segments for catch-all routes, e.g.
  // /api/sofascore/team/3202/events/next/0 → ['team','3202','events','next','0']
  const raw = req.query.path;
  const segments = Array.isArray(raw) ? raw : raw ? [raw] : [];

  // Validate every segment to prevent path traversal or unexpected API calls.
  if (segments.length === 0 || segments.some((s) => !SAFE_SEGMENT.test(s))) {
    res.status(400).json({ error: 'Invalid path' });
    return;
  }

  const sofascorePath = segments.join('/');
  const url = `https://api.sofascore.com/api/v1/${sofascorePath}`;

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-CH-UA': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
      },
    });

    if (!response.ok) {
      // SofaScore blocked the request (e.g. 403); return empty data so the
      // client falls back to mock data without generating browser console errors.
      res.status(200).json(EMPTY_RESPONSE);
      return;
    }

    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (err) {
    // Network error – return empty data so the client falls back to mock data.
    res.status(200).json(EMPTY_RESPONSE);
  }
}
