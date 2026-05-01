// src/pages/Home.jsx
import "./Home.css";
import cities from "../data/cities.json";
import { Link, useNavigate } from "react-router-dom";
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
  const [searchText, setSearchText] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const navigate = useNavigate();

  const suggestionList = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query || query.length < 2) return [];

    const filtered = cities
      .filter((city) => {
        const cityLower = city.toLowerCase();
        const labelLower = formatCityName(city).toLowerCase();
        return cityLower.includes(query) || labelLower.includes(query);
      })
      .map((city) => ({ slug: city, label: formatCityName(city) }))
      .slice(0, 8);

    return filtered;
  }, [searchText]);

  const selectedCitySlug = useMemo(() => {
    if (!searchText.trim()) return null;
    const query = searchText.trim().toLowerCase().replace(/\s+/g, "-");
    if (cities.includes(query)) return query;
    return suggestionList[0]?.slug || null;
  }, [searchText, suggestionList]);

  const canSearch = Boolean(selectedCitySlug && searchText.trim());

  useEffect(() => {
    if (searchText.trim() && suggestionList.length > 0) {
      setSuggestionsOpen(true);
    } else {
      setSuggestionsOpen(false);
    }
  }, [searchText, suggestionList]);

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

  const worstCities = useMemo(() => topCities.slice(0, 5), [topCities]);

  const bestCities = useMemo(
    () => [...topCities].sort((a, b) => (a.aqi || 0) - (b.aqi || 0)).slice(0, 5),
    [topCities]
  );

  const summary = useMemo(() => {
    const values = topCities.map((city) => Number(city.aqi)).filter((aqi) => !Number.isNaN(aqi));
    const average = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    const worst = topCities[0] || null;
    return {
      total: topCities.length,
      average,
      worst,
      updatedLabel: loading ? "Loading..." : "Live now",
    };
  }, [topCities, loading]);

  return (
    <div className="container">
      <header className="hero">
        <div className="hero-copy fade-up">
          <span className="eyebrow">Live AQI India</span>
          <h1>India’s air quality, clearer and faster.</h1>
          <p className="hero-text">
            A modern dashboard for real-time AQI, city rankings, and health guidance across Indian cities.
          </p>

          <div className="hero-stats">
            <div className="hero-card">
              <span>National Avg AQI</span>
              <strong>{summary.average ?? "—"}</strong>
              <p className="small">Current average of reported cities.</p>
            </div>
            <div className="hero-card">
              <span>Tracking</span>
              <strong>{summary.total}</strong>
              <p className="small">Live city reports included.</p>
            </div>
            <div className="hero-card">
              <span>Worst AQI</span>
              <strong>{summary.worst?.aqi ?? "—"}</strong>
              <p className="small">{summary.worst?.city ?? "Data updating"}</p>
            </div>
          </div>
        </div>

        <aside className="hero-panel fade-up">
          <div className="panel-top">
            <div>
              <h2>Dashboard highlights</h2>
              <p className="small">Keep a quick pulse on the worst, the best, and the latest air quality trends.</p>
            </div>
            <span className="badge glass">Live</span>
          </div>

          <form
            className="search-panel"
            onSubmit={(event) => {
              event.preventDefault();
              if (canSearch) {
                navigate(`/city/${selectedCitySlug}`);
                setSuggestionsOpen(false);
              }
            }}
          >
            <div className="search-input-wrap">
              <input
                type="search"
                value={searchText}
                placeholder="Search any city (e.g. Surat)"
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setSuggestionsOpen(true);
                }}
                onFocus={() => setSuggestionsOpen(Boolean(searchText.trim()))}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 120)}
              />
              <button type="submit" disabled={!canSearch}>
                Search
              </button>
            </div>
            {suggestionsOpen && searchText.trim() && (
              <div className="autocomplete">
                {suggestionList.length > 0 ? (
                  suggestionList.map((item) => (
                    <button
                      type="button"
                      key={item.slug}
                      className="autocomplete-item"
                      onMouseDown={() => {
                        setSearchText(item.label);
                        setSuggestionsOpen(false);
                        navigate(`/city/${item.slug}`);
                      }}
                    >
                      {item.label}
                    </button>
                  ))
                ) : (
                  <div className="autocomplete-no-match">No cities match "{searchText.trim()}"</div>
                )}
              </div>
            )}
          </form>

          <div className="hero-panel-line">
            <div>
              <p className="small">Updated</p>
              <strong>{summary.updatedLabel}</strong>
            </div>
            <div>
              <p className="small">Cities tracked</p>
              <strong>{summary.total}</strong>
            </div>
          </div>

          <p className="small note">Search will be enabled once city lookup is connected to live data.</p>
        </aside>
      </header>

      <section className="grid-two">
        <div className="glass-card fade-up">
          <div className="section-head">
            <div>
              <h2>City rankings</h2>
              <p className="small">Worst and best AQI across the current city dataset.</p>
            </div>
          </div>

          <div className="list-row">
            <div className="list-block">
              <h3>Worst AQI (Top 5)</h3>
              <ul className="top-list">
                {loading ? (
                  <li>Loading top cities…</li>
                ) : worstCities.length === 0 ? (
                  <li>No data available yet.</li>
                ) : (
                  worstCities.map((city) => {
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
                  })
                )}
              </ul>
            </div>

            <div className="list-block">
              <h3>Best AQI (Top 5)</h3>
              <ul className="top-list">
                {loading ? (
                  <li>Loading best cities…</li>
                ) : bestCities.length === 0 ? (
                  <li>No data available yet.</li>
                ) : (
                  bestCities.map((city) => {
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
                  })
                )}
              </ul>
            </div>
          </div>
        </div>

        <section className="map-card fade-up">
          <div className="map-header">
            <div>
              <h2>India AQI map</h2>
              <p className="small">Tap city markers to see live AQI values.</p>
            </div>
          </div>
          <AQIMap markers={markers} />
        </section>
      </section>

      <section className="fade-up">
        <div className="section-head">
          <div>
            <h2>City dashboard</h2>
            <p className="small">Browse all tracked cities and open a report page for each.</p>
          </div>
        </div>

        <div className="city-grid">
          {cities.map((city) => (
            <Link key={city} to={`/city/${city}`} className="city-card">
              {formatCityName(city)}
            </Link>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <span>Live AQI India © 2026</span>
        <div>
          <a href="/about">About AQI</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>
    </div>
  );
}
