import React, { useEffect, useRef } from "react";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, TimeScale } from "chart.js";
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, TimeScale);

export default function AQIChart({ data = [] }) {
  const canvasRef = useRef();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const labels = data.map(d => d.ts);
    const pm25 = data.map(d => d.pm25 ?? null);
    const pm10 = data.map(d => d.pm10 ?? null);

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "PM2.5", data: pm25, tension: 0.2, fill: false },
          { label: "PM10", data: pm10, tension: 0.2, fill: false }
        ]
      },
      options: {
        responsive: true,
        plugins: { title: { display: false } },
        scales: {
          x: { display: true },
          y: { display: true }
        }
      }
    });

    return () => chart.destroy();
  }, [data]);

  return <canvas ref={canvasRef} style={{ maxHeight: 300 }} />;
}
