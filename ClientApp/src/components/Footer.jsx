import React from "react";

export function Footer() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} - Enginnering</span>
      <span>Planos de producción</span>
    </footer>
  );
}