import React, { useMemo, useState } from "react";

// Iconos vectoriales para cada tipo de equipo industrial
export function IconoCatalogo({ codigo, color = "#2563eb" }) {
  if (codigo === "MES") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="19" x2="8" y2="21" />
        <line x1="16" y1="19" x2="16" y2="21" />
      </svg>
    );
  }
  if (codigo === "RAC") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="1.5" />
        <line x1="5" y1="9" x2="19" y2="9" />
        <line x1="5" y1="15" x2="19" y2="15" />
      </svg>
    );
  }
  if (codigo === "CAR") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="19" r="2" />
        <circle cx="17" cy="19" r="2" />
        <path d="M3 5h3l2 10h11l2-7H7" />
      </svg>
    );
  }
  if (codigo === "INS") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <line x1="7" y1="20" x2="17" y2="20" />
        <line x1="9" y1="16" x2="9" y2="20" />
        <line x1="15" y1="16" x2="15" y2="20" />
      </svg>
    );
  }
  // TAB por defecto
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="13" y2="12" />
      <line x1="8" y1="17" x2="8" y2="20" />
      <line x1="16" y1="17" x2="16" y2="20" />
    </svg>
  );
}

// Panel izquierdo: catálogo de tipos de objeto disponibles para la línea
export function ObjetosLinea({
  catalogo,
  objetos,
  codigoSeleccionado,
  onAgregar,
  onVerDetalle,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const conteo = useMemo(() => {
    const mapa = {};
    objetos.forEach((o) => {
      mapa[o.codigo] = (mapa[o.codigo] || 0) + 1;
    });
    return mapa;
  }, [objetos]);

  const visibles = catalogo.filter((c) => {
    const coincide =
      !busqueda ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.tipo.toLowerCase().includes(busqueda.toLowerCase());
    const enPlano = (conteo[c.codigo] || 0) > 0;
    return coincide && (filtro === "todos" || enPlano);
  });

  const totalEnPlano = objetos.length;

  return (
    <aside className="panel panel-izq">
      <div className="panel-titulo">
        <h3>Objetos de la línea</h3>
        <p>Agrega solo lo que necesitas.</p>
      </div>

      <div className="buscador-caja">
        <svg className="icono-buscar" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="input-buscar"
          placeholder="Buscar nombre o código"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="filtros-barra">
        <div className="filtros-izq">
          <button
            className={filtro === "todos" ? "chip-filtro activo" : "chip-filtro"}
            onClick={() => setFiltro("todos")}
          >
            Todos <strong>{catalogo.length}</strong>
          </button>
          <button
            className={filtro === "plano" ? "chip-filtro activo" : "chip-filtro"}
            onClick={() => setFiltro("plano")}
          >
            En el plano <strong>{totalEnPlano}</strong>
          </button>
        </div>
        <button
          className="btn-filtro-icono"
          title="Cambiar filtro"
          onClick={() => setFiltro(filtro === "todos" ? "plano" : "todos")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
        </button>
      </div>

      <div className="seccion-label">MOBILIARIO Y EQUIPO</div>

      <div className="lista-objetos">
        {visibles.map((c) => {
          const n = conteo[c.codigo] || 0;
          const esActivo = codigoSeleccionado === c.codigo || (c.codigo === "TAB" && !codigoSeleccionado);
          return (
            <div
              key={c.codigo}
              className={`tarjeta-objeto ${esActivo ? "tarjeta-activa" : ""}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", c.codigo);
              }}
              onClick={() => onVerDetalle(c.codigo)}
              title="Haz clic para ver en 3D o descargar plano · Arrastra para agregar al plano"
            >
              <div
                className="icono-objeto"
                style={{
                  backgroundColor: `${c.color}14`,
                  borderColor: `${c.color}35`,
                }}
              >
                <IconoCatalogo codigo={c.codigo} color={c.color} />
              </div>

              <div className="info-objeto">
                <strong>{c.nombre}</strong>
                <small>
                  {c.codigo} · {c.tipo}
                </small>
                {n > 0 ? (
                  <span className="estado-conteo" style={{ color: c.color }}>
                    {n} en el plano
                  </span>
                ) : (
                  <span className="estado-conteo" style={{ color: c.color }}>
                    Disponible para agregar
                  </span>
                )}
              </div>

              <div className="acciones-objeto" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-lupa-item"
                  title="Ver modelo 3D y plano técnico"
                  onClick={() => onVerDetalle(c.codigo)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.3" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="20" y1="20" x2="16" y2="16" />
                  </svg>
                </button>

                {n > 0 ? (
                  <button
                    className="btn-check-item"
                    title="En el plano (clic para agregar otro igual)"
                    onClick={() => onAgregar(c.codigo)}
                  >
                    <span className="icono-check">✓</span>
                    <span className="icono-mas-hover">+</span>
                  </button>
                ) : (
                  <button
                    className="btn-agregar-azul"
                    title="Agregar al plano"
                    onClick={() => onAgregar(c.codigo)}
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {visibles.length === 0 && (
          <p className="vacio">Sin resultados para "{busqueda}"</p>
        )}
      </div>

      <button
        type="button"
        className="link-ver-todos"
        onClick={() => {
          setFiltro("todos");
          setBusqueda("");
        }}
      >
        Ver los {catalogo.length} tipos de objetos
      </button>

      <div className="pie-panel">
        <span className="icono-info">ⓘ</span>
        <span>Arrastra o usa + para agregar.</span>
      </div>
    </aside>
  );
}
