import cities from '../../src/data/cities.json' with { type: 'json' };

export default async function handler(req, res) {
  try {
    const apiKey = process.env.OPENAQ_KEY;
    if (!apiKey) {
      // Return all cities from JSON with null AQI if API key not configured
      const citiesData = cities.map(city => ({ city, aqi: null }));
      return res.status(200).json({
        total: citiesData.length,
        cities: citiesData,
        lastUpdated: new Date().toISOString()
      });
    }

    // Fetch all AQI data from OpenAQ for India
    const response = await fetch('https://api.openaq.org/v3/latest?country=IN&limit=10000', {
      headers: { "X-API-Key": apiKey }
    });

    const data = await response.json();
    const results = data.results || [];

    // Convert to city objects
    const cityMap = new Map();
    results.forEach(result => {
      const cityName = result.city?.toLowerCase();
      if (cityName && !cityMap.has(cityName)) {
        cityMap.set(cityName, {
          city: cityName,
          aqi: result.aqi || null,
          pm25: result.pm25 || null,
          coordinates: result.coordinates || null,
          updatedAt: result.date?.utc || null
        });
      }
    });

    // Convert map to array
    const allCitiesData = Array.from(cityMap.values());

    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json({
      total: allCitiesData.length,
      cities: allCitiesData,
      lastUpdated: new Date().toISOString()
    });

  } catch (err) {
    console.error("Cities API error:", err);
    // Fallback to static cities
    const citiesData = cities.map(city => ({ city, aqi: null }));
    return res.status(200).json({
      total: citiesData.length,
      cities: citiesData,
      lastUpdated: new Date().toISOString()
    });
  }
}
