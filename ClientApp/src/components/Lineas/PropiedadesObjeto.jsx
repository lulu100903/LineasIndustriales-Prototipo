import React from "react";
import { recorridoOrdenado } from "../../utils/geometria";
import { IconoCatalogo } from "./ObjetosLinea.jsx";

// Panel derecho: propiedades del objeto seleccionado (posición, medidas, rotación, recorrido)
export function PropiedadesObjeto({
  objeto,
  catalogo,
  linea,
  onCambiar,
  onCambiarOrden,
  onEliminar,
  onVerDetalle,
}) {
  if (!objeto) {
    return (
      <aside className="panel panel-der">
        <div className="panel-titulo">
          <h3>Propiedades</h3>
        </div>
        <div className="prop-vacio-caja">
          <p className="vacio">
            Selecciona o haz clic sobre cualquier material en el plano para ver sus propiedades, visualizarlo en 3D o descargar su plano técnico.
          </p>
        </div>
      </aside>
    );
  }

  const ruta = recorridoOrdenado(linea.objetos);
  const enRuta = objeto.orden > 0;
  const color = catalogo?.color || "#2563eb";
  const numero = (v) => (v === "" ? 0 : Number(v));

  return (
    <aside className="panel panel-der">
      <div className="panel-titulo">
        <h3>Propiedades</h3>
      </div>

      <div className="cabecera-prop">
        <div
          className="icono-objeto"
          style={{
            backgroundColor: `${color}14`,
            borderColor: `${color}35`,
          }}
        >
          <IconoCatalogo codigo={objeto.codigo} color={color} />
        </div>
        <div className="info-objeto">
          <strong>{catalogo?.nombre || objeto.etiqueta}</strong>
          <small>{objeto.id}</small>
        </div>
        <button
          className="btn-lupa-item"
          title="Ampliar material (Vista 3D y Plano)"
          onClick={() => onVerDetalle(objeto.id, "3d")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.3" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16" y2="16" />
          </svg>
        </button>
      </div>

      <div className="fila-badges-prop">
        <span className="pill-seleccionado">• Seleccionado</span>
      </div>

      <div className="acciones-rapidas-3d">
        <button
          type="button"
          className="btn-accion-3d"
          onClick={() => onVerDetalle(objeto.id, "3d")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L3 7l9 5 9-5-9-5z" />
            <path d="M3 17l9 5 9-5" />
            <path d="M3 12l9 5 9-5" />
          </svg>
          Ver en 3D
        </button>
        <button
          type="button"
          className="btn-accion-plano"
          onClick={() => onVerDetalle(objeto.id, "plano")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Plano 2D
        </button>
      </div>

      <div className="seccion-label">UBICACIÓN EN EL PLANO</div>
      <div className="grid-2-prop">
        <div className="campo-prop">
          <span>Posición X</span>
          <div className="input-con-unidad">
            <input
              type="number"
              step="0.25"
              value={objeto.x}
              onChange={(e) => onCambiar(objeto.id, "x", numero(e.target.value))}
            />
            <small>m</small>
          </div>
        </div>
        <div className="campo-prop">
          <span>Posición Y</span>
          <div className="input-con-unidad">
            <input
              type="number"
              step="0.25"
              value={objeto.y}
              onChange={(e) => onCambiar(objeto.id, "y", numero(e.target.value))}
            />
            <small>m</small>
          </div>
        </div>
        <div className="campo-prop">
          <span>Ancho</span>
          <div className="input-con-unidad">
            <input
              type="number"
              step="0.1"
              min="0.4"
              value={objeto.ancho}
              onChange={(e) =>
                onCambiar(objeto.id, "ancho", Math.max(0.4, numero(e.target.value)))
              }
            />
            <small>m</small>
          </div>
        </div>
        <div className="campo-prop">
          <span>Fondo</span>
          <div className="input-con-unidad">
            <input
              type="number"
              step="0.1"
              min="0.4"
              value={objeto.fondo}
              onChange={(e) =>
                onCambiar(objeto.id, "fondo", Math.max(0.4, numero(e.target.value)))
              }
            />
            <small>m</small>
          </div>
        </div>
      </div>

      <div className="campo-prop campo-rotacion">
        <span>Rotación</span>
        <div className="select-rotacion-caja">
          <svg className="icono-rot" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <select
            value={objeto.rotacion}
            onChange={(e) =>
              onCambiar(objeto.id, "rotacion", Number(e.target.value))
            }
          >
            <option value={0}>0°</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>
      </div>

      <div className="divisor-prop" />

      <div className="seccion-label">RECORRIDO DEL TABLERO</div>
      <div className="subtitulo-orden">Orden de avance</div>

      {enRuta ? (
        <>
          <div className="stepper-orden">
            <button
              type="button"
              onClick={() =>
                onCambiarOrden(objeto.id, Math.max(1, objeto.orden - 1))
              }
              disabled={objeto.orden <= 1}
            >
              −
            </button>
            <div className="stepper-valor">
              <strong>{objeto.orden}</strong>{" "}
              <small>de {ruta.length}</small>
            </div>
            <button
              type="button"
              onClick={() =>
                onCambiarOrden(
                  objeto.id,
                  Math.min(ruta.length, objeto.orden + 1)
                )
              }
              disabled={objeto.orden >= ruta.length}
            >
              +
            </button>
          </div>
          <div className="chip-ruta-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="M7 9h10v6H7z" />
            </svg>
            <span>Recorrido · {linea.tipoRecorrido || "Espiral"}</span>
          </div>
        </>
      ) : (
        <>
          <div className="stepper-orden deshabilitado">
            <button
              type="button"
              onClick={() => onCambiarOrden(objeto.id, ruta.length + 1)}
            >
              +
            </button>
            <div className="stepper-valor">
              <small>Estación fija ({objeto.etiqueta})</small>
            </div>
            <button
              type="button"
              onClick={() => onCambiarOrden(objeto.id, ruta.length + 1)}
            >
              +
            </button>
          </div>
          <div className="chip-ruta-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="3" />
            </svg>
            <span>Recorrido · {linea.tipoRecorrido || "Espiral"}</span>
          </div>
        </>
      )}

      <div className="empujador-flex" />

      <button
        type="button"
        className="btn-peligro-outline"
        onClick={() => onEliminar(objeto.id)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
        Quitar del plano
      </button>
    </aside>
  );
}
