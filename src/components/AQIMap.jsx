import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/*
  Lightweight Leaflet map.
  Props:
    markers: [{lat: number, lon: number, city: string, aqi: number}] (optional)
*/
export default function AQIMap({ markers = [] }) {
  useEffect(() => {
    // create map
    const map = L.map("aqi-map", { center: [22.5937, 78.9629], zoom: 5, zoomControl: true });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // add markers
    markers.forEach(m => {
      const color = getColor(m.aqi);
      const circle = L.circle([m.lat, m.lon], {
        color,
        fillColor: color,
        fillOpacity: 0.6,
        radius: 20000
      }).addTo(map);
      circle.bindPopup(`<b>${m.city}</b><br/>AQI: ${m.aqi ?? "N/A"}`);
    });

    return () => map.remove();
  }, [markers]);

  function getColor(aqi) {
    if (aqi == null) return "#999";
    if (aqi <= 50) return "#2ECC71";
    if (aqi <= 100) return "#F1C40F";
    if (aqi <= 200) return "#E67E22";
    if (aqi <= 300) return "#E74C3C";
    return "#8E44AD";
  }

  return (
    <div id="aqi-map" style={{ width: "100%", height: "360px", borderRadius: 8, overflow: "hidden" }} />
  );
}
