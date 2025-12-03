export default async function handler(req, res) {
  try {
    const apiKey = process.env.OPENAQ_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAQ_KEY not configured" });
    }

    const { country = "IN", city = "Delhi", limit = 50 } = req.query;

    const url = `https://api.openaq.org/v3/latest?country=${country}&city=${city}&limit=${limit}`;

    const upstream = await fetch(url, {
      headers: { "X-API-Key": apiKey }
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "server error" });
  }
}
