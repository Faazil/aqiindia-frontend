import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CityPage from "./pages/city/slug";
import Header from "./components/Header";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/city/:slug" element={<CityPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
