import React, { useEffect, useState } from "react";
import axios from "axios";
import AQIChart from "../../components/AQIChart";

export default function Hyderabad(){
  const [history, setHistory] = useState([]);
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(()=>{
    // We don't have city-specific endpoint yet; we'll query /api/top-cities then call backend later
    axios.get(`${apiBase}/api/top-cities`).then(r=>{
      // placeholder: show city entry if exists
      const city = (r.data || []).find(c => c.city.toLowerCase() === "Hyderabad");
      if(city) setHistory([{ ts: new Date().toISOString(), pm25: city.pm25, pm10: city.pm10 }]);
    }).catch(()=>{});
  },[]);

  return (
    <div className="container">
      <h1>AQI Today — Hyderabad</h1>
      <p>Live air quality (AQI) in Hyderabad. This page is updated regularly with the latest PM2.5 and PM10 readings.</p>

      <section style={{marginTop:20}}>
        <h2>Latest trends</h2>
        <AQIChart data={history} />
        <p style={{marginTop:10}}><small>Data sources: CPCB, OpenAQ. Use this information for guidance only.</small></p>
      </section>
    </div>
  )
}
