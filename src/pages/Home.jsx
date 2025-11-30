import cities from "../data/cities.json";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AQIMap from "../components/AQIMap";
import AQIChart from "../components/AQIChart";

export default function Home(){
  const [topCities,setTopCities] = useState([]);
  const [markers,setMarkers] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    axios.get(`${apiBase}/api/top-cities`).then(r=>{
      setTopCities(r.data || []);
      // map to markers with placeholder coords (we'll use rough lat/lon map below)
      const latlon = {
        "Delhi":[28.7041,77.1025],
        "Mumbai":[19.0760,72.8777],
        "Bengaluru":[12.9716,77.5946],
        "Hyderabad":[17.3850,78.4867],
        "Pune":[18.5204,73.8567],
        "Kolkata":[22.5726,88.3639],
        "Chennai":[13.0827,80.2707],
        "Ahmedabad":[23.0225,72.5714],
        "Lucknow":[26.8467,80.9462],
        "Jaipur":[26.9124,75.7873]
      };
      const m = (r.data || []).map(c => {
        const coords = latlon[c.city] || [22.5937,78.9629];
        return { lat: coords[0], lon: coords[1], city:c.city, aqi: c.aqi };
      });
      setMarkers(m);
    }).catch(()=> {
      setTopCities([]);
      setMarkers([]);
    }).finally(()=> setLoading(false));
  },[]);

  return (
    <div className="city-grid">
     {cities.map((c) => (
      <Link key={c} to={`/city/${c}`} className="city-card">
        {c.replace("-", " ")}
      </Link>
     ))}
    </div>

    <div className="container">
      <header style={{marginBottom:16}}>
        <h1>AQI India — Live</h1>
        <p>Real-time air quality index for major Indian cities. Data aggregated from public sources.</p>
      </header>

      <section>
        <AQIMap markers={markers} />
      </section>

      <section style={{display:"flex", gap:24, marginTop:20, alignItems:"flex-start"}}>
        <div style={{flex:2}}>
          <h2>Top 10 worst cities (latest)</h2>
          {loading ? <p>Loading...</p> : (
            <ul>
              {topCities.length === 0 && <li>No data yet — will populate soon.</li>}
              {topCities.map(c => <li key={c.city}><a href={`/city/${c.city.toLowerCase()}`}>{c.city}</a> — {c.aqi ?? "N/A"}</li>)}
            </ul>
          )}
        </div>
        <aside style={{flex:1}}>
          <h3>Quick Health Tip</h3>
          <p>If AQI &gt; 150: Wear N95 outdoors, avoid long exercise outdoors, use indoor air purifier if available.</p>
          <h3>Subscribe</h3>
          <p><small>Get SMS/Email alerts — coming soon.</small></p>
        </aside>
      </section>

      <footer style={{marginTop:36}}>
        <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a> • <a href="/about">About</a> • <a href="/contact">Contact</a>
      </footer>
    </div>
  )
}
