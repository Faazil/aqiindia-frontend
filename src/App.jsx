import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import City from "./pages/City";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/city/:slug" element={<City/>} />
      </Routes>
    </BrowserRouter>
  )
}
