import React, {useEffect, useState} from "react";
import axios from "axios";

export default function Home(){
  const [topCities,setTopCities] = useState([]);
  useEffect(()=>{
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    axios.get(`${apiBase}/api/top-cities`).then(r=>setTopCities(r.data)).catch(()=>{});
  },[]);
  return (
    <div className="container">
      <header>
        <h1>AQI India — Live</h1>
        <p>Real-time air quality index for major Indian cities</p>
      </header>
      <main>
        <section className="top-list">
          <h2>Top 10 worst cities (latest)</h2>
          <ul>
            {topCities.map((c)=> <li key={c.city}>{c.city} — {c.aqi ?? "N/A"}</li>)}
          </ul>
        </section>
      </main>
      <footer>
        <small>© {new Date().getFullYear()} AQI India</small>
      </footer>
    </div>
  )
}
