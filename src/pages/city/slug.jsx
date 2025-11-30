import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CityPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    async function fetchCity() {
      try {
        const res = await axios.get(`${API}/api/city/${slug}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCity();
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data available.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>AQI for {data.city_name}</h1>
      <h2>{data.aqi ? `${data.aqi}` : "No AQI calculated yet"}</h2>

      <p><b>PM2.5:</b> {data.pm25}</p>
      <p><b>PM10:</b> {data.pm10}</p>
      <p><b>Updated:</b> {data.updated_at}</p>

      <hr />
      <p><i>More charts and analytics coming soon…</i></p>
    </div>
  );
}
