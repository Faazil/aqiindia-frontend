import React, { useEffect, useRef } from "react";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, TimeScale } from "chart.js";
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, TimeScale);

export default function AQIChart({ data = [] }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    const labels = data.map((d) => d.ts);
    const pm25 = data.map((d) => d.pm25 ?? null);
    const pm10 = data.map((d) => d.pm10 ?? null);

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "PM2.5", data: pm25, tension: 0.2, borderColor: "#2563eb", backgroundColor: "rgba(37, 99, 235, 0.12)", fill: false },
          { label: "PM10", data: pm10, tension: 0.2, borderColor: "#f59e0b", backgroundColor: "rgba(245, 158, 11, 0.12)", fill: false }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: false } },
        scales: {
          x: { display: true, title: { display: true, text: "Time" } },
          y: { display: true, title: { display: true, text: "Concentration" } }
        }
      }
    });

    return () => chart.destroy();
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="chart-placeholder">Trend data is not available yet.</div>;
  }

  return <canvas ref={canvasRef} style={{ maxHeight: 300, width: "100%" }} />;
}
