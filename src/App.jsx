import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import City from "./pages/City";

// city pages
import Delhi from "./pages/cities/Delhi";
import Mumbai from "./pages/cities/Mumbai";
import Bengaluru from "./pages/cities/Bengaluru";
import Hyderabad from "./pages/cities/Hyderabad";
import Pune from "./pages/cities/Pune";
import Kolkata from "./pages/cities/Kolkata";
import Chennai from "./pages/cities/Chennai";
import Ahmedabad from "./pages/cities/Ahmedabad";
import Lucknow from "./pages/cities/Lucknow";
import Jaipur from "./pages/cities/Jaipur";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        {/* dynamic route (if you want to keep it) */}
        <Route path="/city/:slug" element={<City/>} />

        {/* SEO static city pages */}
        <Route path="/delhi" element={<Delhi/>} />
        <Route path="/mumbai" element={<Mumbai/>} />
        <Route path="/bengaluru" element={<Bengaluru/>} />
        <Route path="/hyderabad" element={<Hyderabad/>} />
        <Route path="/pune" element={<Pune/>} />
        <Route path="/kolkata" element={<Kolkata/>} />
        <Route path="/chennai" element={<Chennai/>} />
        <Route path="/ahmedabad" element={<Ahmedabad/>} />
        <Route path="/lucknow" element={<Lucknow/>} />
        <Route path="/jaipur" element={<Jaipur/>} />
      </Routes>
    </BrowserRouter>
  )
}
