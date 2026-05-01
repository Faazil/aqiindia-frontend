// src/pages/Home.jsx
import "./Home.css";
import cities from "../data/cities.json";
import { Link } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AQIMap from "../components/AQIMap";
import AQIChart from "../components/AQIChart";

const CITY_COORDS = {
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

function getAqiCategory(aqi) {
  if (aqi == null) return { label: "Unknown", style: "moderate" };
  if (aqi <= 50) return { label: "Good", style: "good" };
  if (aqi <= 100) return { label: "Moderate", style: "moderate" };
  if (aqi <= 200) return { label: "Unhealthy", style: "unhealthy" };
  return { label: "Very Unhealthy", style: "very-unhealthy" };
}

function formatCityName(city) {
  return city.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Home() {
  const [topCities, setTopCities] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    axios
      .get(`${apiBase}/api/top-cities`)
      .then((response) => {
        const data = response.data || [];
        setTopCities(data);

        const mappedMarkers = data.map((city) => {
          const slug = (city.city || "").toLowerCase();
          const coords = CITY_COORDS[slug] || [22.5937, 78.9629];
          return { lat: coords[0], lon: coords[1], city: city.city, aqi: city.aqi };
        });
        setMarkers(mappedMarkers);
      })
      .catch(() => {
        setTopCities([]);
        setMarkers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const values = topCities.map((city) => Number(city.aqi)).filter((aqi) => !Number.isNaN(aqi));
    const average = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    const worst = topCities[0] || null;
    const categoryCounts = values.reduce(
      (counts, aqi) => {
        if (aqi <= 100) counts.good += 1;
        else if (aqi <= 200) counts.moderate += 1;
        else if (aqi <= 300) counts.unhealthy += 1;
        else counts.veryUnhealthy += 1;
        return counts;
      },
      { good: 0, moderate: 0, unhealthy: 0, veryUnhealthy: 0 }
    );

    return {
      total: topCities.length,
      average,
      worst,
      categoryCounts,
    };
  }, [topCities]);

  return (
    <div className="container">
      <header>
        <h1>AQI India — Live Air Quality Dashboard</h1>
        <p>Track current air pollution in India's major cities with cleaner layouts, clearer color cues, and faster data insight.</p>
      </header>

      <main>
        <section className="card-grid">
          <article className="stat-card">
            <h3>Tracked cities</h3>
            <strong>{cities.length}</strong>
            <span>Available for city reports</span>
          </article>
          <article className="stat-card">
            <h3>Worst AQI right now</h3>
            <strong>{stats.worst?.aqi ?? "—"}</strong>
            <span>{stats.worst?.city ?? "Data loading"}</span>
          </article>
          <article className="stat-card">
            <h3>Average AQI</h3>
            <strong>{stats.average ?? "—"}</strong>
            <span>Among top reported cities</span>
          </article>
        </section>

        <section className="map-card">
          <AQIMap markers={markers} />
        </section>

        <section className="grid-two">
          <div className="card">
            <div className="top-list">
              <h2>Top 10 worst cities (latest)</h2>
              {loading ? (
                <p>Loading latest air quality data…</p>
              ) : (
                <ul>
                  {topCities.length === 0 && <li>No data yet — will populate soon.</li>}
                  {topCities.map((city) => {
                    const category = getAqiCategory(city.aqi);
                    return (
                      <li key={city.city}>
                        <div>
                          <Link to={`/city/${city.city.toLowerCase()}`}>{city.city}</Link>
                          <span className={`badge ${category.style}`}>{category.label}</span>
                        </div>
                        <strong>{city.aqi ?? "N/A"}</strong>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <h3>City trends</h3>
              <AQIChart data={[]} />
              <p className="small" style={{ marginTop: 10 }}>
                Data sources: CPCB, OpenAQ. Use this information for guidance only.
              </p>
            </div>
          </div>

          <aside>
            <div className="panel">
              <h3>Air quality at a glance</h3>
              <div className="stats-grid">
                <div className="info-card">
                  <strong>{stats.categoryCounts.good}</strong>
                  <span>Good / Moderate cities</span>
                </div>
                <div className="info-card">
                  <strong>{stats.categoryCounts.unhealthy}</strong>
                  <span>Unhealthy cities</span>
                </div>
                <div className="info-card">
                  <strong>{stats.categoryCounts.veryUnhealthy}</strong>
                  <span>Very unhealthy cities</span>
                </div>
              </div>
            </div>

            <div className="panel">
              <h3>Health advice</h3>
              <p className="small">
                If the current AQI is above 150, limit outdoor exposure, wear an N95 mask if you need to go outside, and keep indoor air clean.
              </p>
            </div>
          </aside>
        </section>

        <section className="card">
          <h2>All cities</h2>
          <div className="city-grid">
            {cities.map((city) => (
              <Link key={city} to={`/city/${city}`} className="city-card">
                {formatCityName(city)}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </footer>
    </div>
  );
}
