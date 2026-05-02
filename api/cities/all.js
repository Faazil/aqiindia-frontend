import cities from '../../src/data/cities.json' with { type: 'json' };

export default async function handler(req, res) {
  try {
    const apiKey = process.env.OPENAQ_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAQ_KEY not configured" });
    }

    // Fetch AQI data for all Indian cities in batches
    const cityChunks = [];
    for (let i = 0; i < cities.length; i += 10) {
      cityChunks.push(cities.slice(i, i + 10));
    }

    const allCityData = [];

    for (const chunk of cityChunks) {
      const promises = chunk.map(city =>
        fetch(`https://api.openaq.org/v3/latest?country=IN&city=${encodeURIComponent(city)}&limit=1`, {
          headers: { "X-API-Key": apiKey }
        })
          .then(r => r.json())
          .then(data => {
            const result = data.results?.[0];
            if (result) {
              return {
                city: city,
                aqi: result.aqi,
                pm25: result.pm25,
                coordinates: result.coordinates,
                updatedAt: result.date?.utc
              };
            }
            return { city: city, aqi: null };
          })
          .catch(() => ({ city: city, aqi: null }))
      );

      const results = await Promise.all(promises);
      allCityData.push(...results);
    }

    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minute cache
    return res.status(200).json({
      total: allCityData.length,
      cities: allCityData,
      lastUpdated: new Date().toISOString()
    });

  } catch (err) {
    console.error("Cities API error:", err);
    return res.status(500).json({ error: "Failed to fetch cities data" });
  }
}
