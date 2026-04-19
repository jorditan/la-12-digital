const EMPTY_RESPONSE = { events: [], standings: [] };

export default async function handler(req, res) {
  // El path llega como query param ?p=team/3202/events/next/0 (via vercel.json rewrite)
  const sofascorePath = Array.isArray(req.query.p)
    ? req.query.p.join("/")
    : req.query.p || "";
  const url = `https://api.sofascore.com/api/v1/${sofascorePath}`;

  res.setHeader("Access-Control-Allow-Origin", "*");

  const isImageRequest = sofascorePath.endsWith("/image");
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: isImageRequest
          ? "image/webp,image/apng,image/*,*/*;q=0.8"
          : "application/json, */*",
        "Accept-Language": "es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7",
        Referer: "https://www.sofascore.com/",
        Origin: "https://www.sofascore.com",
        "Cache-Control": "no-cache",
        ...(isImageRequest && {
          "Sec-Fetch-Dest": "image",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "same-origin",
        }),
      },
    });

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("image") || contentType.includes("svg")) {
      if (!response.ok) {
        res.status(response.status).end();
        return;
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Cache-Control",
        "s-maxage=86400, stale-while-revalidate=604800",
      );
      const buffer = await response.arrayBuffer();
      res.status(200).send(Buffer.from(buffer));
    } else {
      if (!response.ok) {
        res.status(200).json(EMPTY_RESPONSE);
        return;
      }
      res.setHeader(
        "Cache-Control",
        "s-maxage=300, stale-while-revalidate=600",
      );
      const data = await response.json();
      res.status(200).json(data);
    }
  } catch (err) {
    res.status(200).json(EMPTY_RESPONSE);
  }
}
