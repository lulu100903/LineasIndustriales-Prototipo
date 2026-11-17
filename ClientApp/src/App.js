import React from "react";
import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar.jsx";
import { Footer } from "./components/Footer.jsx";
import { DisenoLinea } from "./views/DisenoLinea.jsx";
import { NotFound } from "./views/NotFound.jsx";

export default function App() {
  return (
    <div className="app">
      <NavBar />

      <Routes>
        <Route path="/" element={<DisenoLinea />} />
        <Route path="/lineas/:lineaId" element={<DisenoLinea />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}
