import React from "react";
import { Link } from "react-router-dom";
import Logo from "../img/logo.png";

export function NavBar() {
  const abrirNuevoPlano = () => {
    window.dispatchEvent(new CustomEvent("abrir-mis-planos"));
  };

  return (
    <header className="app-header">
      <div className="app-header-izq">
        <Link to="/" className="app-logo-link">
          <img src={Logo} alt="DAWS" className="app-logo-img" />
        </Link>
        <span className="app-header-sep" />
        <span className="app-header-title">Engineering</span>
      </div>

      <div className="app-user-pill">
        <span className="app-avatar">LS</span>
        <div className="app-user-info">
          <small>Hola,</small>
          <strong>Lourdes Sariñana Pérez</strong>
        </div>
        <button
          type="button"
          className="app-user-add-btn"
          title="Mis planos / Nueva línea"
          onClick={abrirNuevoPlano}
        >
          +
        </button>
      </div>
    </header>
  );
}