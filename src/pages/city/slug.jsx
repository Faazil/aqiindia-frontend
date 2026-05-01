import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function getAqiCategory(aqi) {
  if (aqi == null) return { label: "Unknown", style: "moderate", description: "No AQI available" };
  if (aqi <= 50) return { label: "Good", style: "good", description: "Air quality is satisfactory." };
  if (aqi <= 100) return { label: "Moderate", style: "moderate", description: "Air quality is acceptable." };
  if (aqi <= 200) return { label: "Unhealthy", style: "unhealthy", description: "Sensitive groups should reduce outdoor activity." };
  return { label: "Very Unhealthy", style: "very-unhealthy", description: "Everyone should avoid prolonged outdoor exposure." };
}

function formatCityName(city) {
  return city.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "Unknown";
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

export default function CityPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    async function fetchCity() {
      try {
        const res = await axios.get(`${API}/api/city/${slug}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCity();
  }, [slug, API]);

  const category = useMemo(() => getAqiCategory(data?.aqi), [data]);

  if (loading) return <p style={{ padding: 20 }}>Loading city details…</p>;
  if (!data) return <div style={{ padding: 20 }}><p>No data available for this city.</p><Link to="/" className="back-link">← Back to home</Link></div>;

  return (
    <div className="container">
      <header style={{ marginBottom: 20 }}>
        <Link to="/" className="back-link">← Back to home</Link>
        <h1 style={{ margin: "12px 0 0" }}>Air Quality in {formatCityName(data.city_name || slug)}</h1>
      </header>

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>{data.aqi ?? "—"}</h2>
            <p className="small">Current AQI value</p>
          </div>
          <span className={`badge ${category.style}`}>{category.label}</span>
        </div>

        <div className="grid-two" style={{ marginTop: 24 }}>
          <div className="card">
            <h3>Pollutant metrics</h3>
            <div className="info-grid">
              <div className="info-card">
                <strong>PM2.5</strong>
                <span>{data.pm25 ?? "N/A"} µg/m³</span>
              </div>
              <div className="info-card">
                <strong>PM10</strong>
                <span>{data.pm10 ?? "N/A"} µg/m³</span>
              </div>
              <div className="info-card">
                <strong>Last updated</strong>
                <span>{formatTimestamp(data.updated_at)}</span>
              </div>
            </div>
          </div>

          <aside className="panel">
            <h3>Health advice</h3>
            <p className="small">{category.description}</p>
            <ul style={{ margin: "16px 0 0", paddingLeft: 18, color: var(--text) }}>
              <li>Stay indoors if possible when AQI is unhealthy.</li>
              <li>Use a mask outdoors and avoid high-intensity exercise.</li>
              <li>Keep windows closed on days with high pollution.</li>
            </ul>
          </aside>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3>Additional data</h3>
          <div className="info-grid">
            <div className="info-card">
              <strong>Source</strong>
              <span>{data.source || "OpenAQ / CPCB"}</span>
            </div>
            <div className="info-card">
              <strong>Status</strong>
              <span>{category.label}</span>
            </div>
            <div className="info-card">
              <strong>City slug</strong>
              <span>{slug}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
