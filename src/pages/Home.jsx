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
  const [allCities, setAllCities] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [visitors, setVisitors] = useState({ total: 0, today: 0 });
  const navigate = useNavigate();

  const suggestionList = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    
    if (!query || query.length < 1) return [];

    const cityList = allCities.length > 0 ? allCities.map(c => c.city) : cities;
    const matches = cityList.filter((city) => {
      const citySlug = city.toLowerCase();
      const cityLabel = formatCityName(city).toLowerCase();
      return citySlug.startsWith(query) || cityLabel.startsWith(query) || citySlug.includes(query);
    });

    return matches
      .map((city) => ({ slug: city, label: formatCityName(city) }))
      .slice(0, 8);
  }, [searchText, allCities]);

  const selectedCitySlug = useMemo(() => {
    if (!searchText.trim()) return null;
    const normalized = searchText.trim().toLowerCase().replace(/\s+/g, "-");
    const cityList = allCities.length > 0 ? allCities.map(c => c.city) : cities;
    if (cityList.includes(normalized)) return normalized;
    return suggestionList[0]?.slug || null;
  }, [searchText, suggestionList, allCities]);

  const canSearch = Boolean(selectedCitySlug && searchText.trim());

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    
    // Track visitor
    axios
      .post(`${apiBase}/api/visitors/count`)
      .then((response) => {
        setVisitors({
          total: response.data.total || 0,
          today: response.data.today || 0
        });
      })
      .catch(() => {
        setVisitors({ total: 0, today: 0 });
      });
    
    // Fetch top cities data
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

    // Fetch all cities data for city grid
    axios
      .get(`${apiBase}/api/cities/all`)
      .then((response) => {
        const data = response.data || {};
        if (data.cities) {
          setAllCities(data.cities);
        }
      })
      .catch(() => {
        // Fallback to static cities if API fails
        setAllCities(cities.map(city => ({ city, aqi: null })));
      });
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
    const totalCities = allCities.length > 0 ? allCities.length : topCities.length;
    return {
      total: totalCities,
      average,
      worst,
      updatedLabel: loading ? "Loading..." : "Live now",
    };
  }, [topCities, loading, allCities]);

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

          <div className="visitor-stats">
            <div className="visitor-item">
              <span className="visitor-label">Total Visitors</span>
              <strong className="visitor-count">{visitors.total.toLocaleString()}</strong>
            </div>
            <div className="visitor-item">
              <span className="visitor-label">Today</span>
              <strong className="visitor-count">{visitors.today.toLocaleString()}</strong>
            </div>
          </div>

          <form
            className="search-panel"
            onSubmit={(event) => {
              event.preventDefault();
              if (canSearch) {
                navigate(`/city/${selectedCitySlug}`);
                setShowSuggestions(false);
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
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchText.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              <button type="submit" disabled={!canSearch}>
                Search
              </button>
            </div>
            {showSuggestions && searchText.trim().length >= 1 && (
              <div className="autocomplete">
                {suggestionList.length > 0 ? (
                  suggestionList.map((item) => (
                    <button
                      type="button"
                      key={item.slug}
                      className="autocomplete-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        navigate(`/city/${item.slug}`);
                        setShowSuggestions(false);
                        setSearchText("");
                      }}
                    >
                      {item.label}
                    </button>
                  ))
                ) : (
                  <div className="autocomplete-no-result">
                    No cities found for "{searchText.trim()}"
                  </div>
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
          {allCities.length > 0 
            ? allCities.map((cityData) => {
                const category = getAqiCategory(cityData.aqi);
                return (
                  <Link key={cityData.city} to={`/city/${cityData.city}`} className={`city-card ${category.style}`}>
                    <div className="city-card-content">
                      <span className="city-name">{formatCityName(cityData.city)}</span>
                      {cityData.aqi !== null ? (
                        <div className="city-aqi">
                          <strong>{cityData.aqi}</strong>
                          <span className={`badge ${category.style}`}>{category.label}</span>
                        </div>
                      ) : (
                        <span className="city-aqi">No data</span>
                      )}
                    </div>
                  </Link>
                );
              })
            : cities.map((city) => (
                <Link key={city} to={`/city/${city}`} className="city-card">
                  {formatCityName(city)}
                </Link>
              ))
          }
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
