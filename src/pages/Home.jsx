// src/pages/Home.jsx
import "./Home.css";
import cities from "../data/cities.json";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AQIMap from "../components/AQIMap";
import AQIChart from "../components/AQIChart";

export default function Home() {
  const [topCities, setTopCities] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    axios
      .get(`${apiBase}/api/top-cities`)
      .then((r) => {
        const data = r.data || [];
        setTopCities(data);

        // rough lat/lon lookup for main cities
        const latlon = {
          delhi: [28.7041, 77.1025],
          mumbai: [19.076, 72.8777],
          bengaluru: [12.9716, 77.5946],
          hyderabad: [17.385, 78.4867],
          pune: [18.5204, 73.8567],
          kolkata: [22.5726, 88.3639],
          chennai: [13.0827, 80.2707],
          ahmedabad: [23.0225, 72.5714],
          lucknow: [26.8467, 80.9462],
          jaipur: [26.9124, 75.7873],
        };

        const m = (data || []).map((c) => {
          // city name normalization to match keys (lowercase)
          const slug = (c.city || "").toLowerCase();
          const coords = latlon[slug] || [22.5937, 78.9629];
          return { lat: coords[0], lon: coords[1], city: c.city, aqi: c.aqi };
        });
        setMarkers(m);
      })
      .catch(() => {
        setTopCities([]);
        setMarkers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <header style={{ marginBottom: 16 }}>
        <h1>AQI India — Live</h1>
        <p>Real-time air quality index for major Indian cities. Data aggregated from public sources.</p>
      </header>

      <section>
        <AQIMap markers={markers} />
      </section>

      <section style={{ display: "flex", gap: 24, marginTop: 20, alignItems: "flex-start" }}>
        <div style={{ flex: 2 }}>
          <h2>Top 10 worst cities (latest)</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul>
              {topCities.length === 0 && <li>No data yet — will populate soon.</li>}
              {topCities.map((c) => (
                <li key={c.city}>
                  <Link to={`/city/${c.city.toLowerCase()}`}>{c.city}</Link> — {c.aqi ?? "N/A"}
                </li>
              ))}
            </ul>
          )}

          <h3 style={{ marginTop: 24 }}>All Cities</h3>
          <div className="city-grid">
            {cities.map((c) => (
              <Link key={c} to={`/city/${c}`} className="city-card">
                {c.replace("-", " ")}
              </Link>
            ))}
          </div>
        </div>

        <aside style={{ flex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <h3>Quick Health Tip</h3>
            <p>If AQI &gt; 150: Wear N95 outdoors, avoid long exercise outdoors, use indoor air purifier if available.</p>
          </div>

          <div>
            <h3>Latest Trends (sample)</h3>
            <AQIChart data={[]} />
            <p style={{ marginTop: 10 }}>
              <small>Data sources: CPCB, OpenAQ. Use this information for guidance only.</small>
            </p>
          </div>
        </aside>
      </section>

      <footer style={{ marginTop: 36 }}>
        <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a> • <a href="/about">About</a> • <a href="/contact">Contact</a>
      </footer>
    </div>
  );
}
