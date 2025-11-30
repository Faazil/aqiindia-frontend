import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CityPage from "./pages/city/slug";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/city/:slug" element={<CityPage />} />
      </Routes>
    </BrowserRouter>
  );
}
