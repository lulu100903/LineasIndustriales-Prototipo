import React, { useMemo, useRef, useState } from "react";
import {
  PX_POR_METRO,
  ajustar,
  huella,
  idsEnColision,
  estacionesFlujo,
  puntosRecorrido,
  pathConCurvas,
} from "../../utils/geometria";

const MARGEN_X = 46;
const MARGEN_TOP = 64;
const MARGEN_BOTTOM = 78;

// Plano 2D interactivo de la línea: objetos arrastrables, cuadrícula, recorrido espiral/lineal y cotas
export function PlanoLinea({
  linea,
  catalogoPorCodigo,
  selectedId,
  zoom,
  snap,
  herramienta = "seleccionar",
  onSelect,
  onAbrirMaterial,
  onMover,
  onSoltarCatalogo,
  onCambiarTipoRecorrido,
}) {
  const svgRef = useRef(null);
  const scrollRef = useRef(null);
  const [arrastre, setArrastre] = useState(null);
  const [paneo, setPaneo] = useState(null);

  const S = (PX_POR_METRO * zoom) / 100;
  const anchoZona = linea.ancho * S;
  const altoZona = linea.fondo * S;
  const anchoPx = anchoZona + MARGEN_X * 2;
  const altoPx = altoZona + MARGEN_TOP + MARGEN_BOTTOM;

  // Posiciones mostradas (con vista previa mientras se arrastra)
  const objetos = useMemo(
    () =>
      linea.objetos.map((o) =>
        arrastre && arrastre.id === o.id
          ? { ...o, x: arrastre.x, y: arrastre.y }
          : o
      ),
    [linea.objetos, arrastre]
  );

  const colisiones = useMemo(() => idsEnColision(objetos), [objetos]);
  const { inicio, fin } = useMemo(() => estacionesFlujo(objetos), [objetos]);

  const aPxX = (m) => MARGEN_X + m * S;
  const aPxY = (m) => MARGEN_TOP + m * S;

  const { pathRecorrido, flechasPx } = useMemo(() => {
    const { puntos, flechas } = puntosRecorrido(
      objetos,
      linea.tipoRecorrido || "Espiral"
    );
    const ptsPx = puntos.map((p) => ({
      x: MARGEN_X + p.x * S,
      y: MARGEN_TOP + p.y * S,
    }));
    const flPx = flechas.map((f) => ({
      x: MARGEN_X + f.x * S,
      y: MARGEN_TOP + f.y * S,
      ang: f.ang,
    }));
    return {
      pathRecorrido: pathConCurvas(ptsPx, Math.max(14, S * 0.42)),
      flechasPx: flPx,
    };
  }, [objetos, linea.tipoRecorrido, S]);

  const onPointerDownObj = (e, obj) => {
    if (herramienta === "mano") return;
    e.stopPropagation();
    if (svgRef.current?.setPointerCapture) {
      try {
        svgRef.current.setPointerCapture(e.pointerId);
      } catch {}
    }
    setArrastre({
      id: obj.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: obj.x,
      origY: obj.y,
      x: obj.x,
      y: obj.y,
      moved: false,
    });
  };

  const onPointerDownFondo = (e) => {
    if (herramienta === "mano" && scrollRef.current) {
      setPaneo({
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: scrollRef.current.scrollLeft,
        scrollTop: scrollRef.current.scrollTop,
      });
    }
  };

  const onPointerMove = (e) => {
    if (paneo && scrollRef.current) {
      scrollRef.current.scrollLeft = paneo.scrollLeft - (e.clientX - paneo.startX);
      scrollRef.current.scrollTop = paneo.scrollTop - (e.clientY - paneo.startY);
      return;
    }
    if (!arrastre) return;
    const dxPx = e.clientX - arrastre.startX;
    const dyPx = e.clientY - arrastre.startY;
    const moved = arrastre.moved || Math.hypot(dxPx, dyPx) > 5;
    const obj = linea.objetos.find((o) => o.id === arrastre.id);
    if (!obj) return;
    const { w, h } = huella(obj);
    const x = Math.min(
      Math.max(ajustar(arrastre.origX + dxPx / S, snap), 0),
      Math.max(0, linea.ancho - w)
    );
    const y = Math.min(
      Math.max(ajustar(arrastre.origY + dyPx / S, snap), 0),
      Math.max(0, linea.fondo - h)
    );
    setArrastre({ ...arrastre, x, y, moved });
  };

  const onPointerUp = () => {
    if (paneo) {
      setPaneo(null);
    }
    if (!arrastre) return;
    if (arrastre.moved) {
      onMover(arrastre.id, arrastre.x, arrastre.y);
      onSelect(arrastre.id);
    } else {
      // Al darle click a un material de la línea: se selecciona y se abre en grande (3D / Plano)
      onSelect(arrastre.id);
      if (onAbrirMaterial) {
        onAbrirMaterial(arrastre.id);
      }
    }
    setArrastre(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const codigo = e.dataTransfer.getData("text/plain");
    if (!codigo || !svgRef.current || !onSoltarCatalogo) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - MARGEN_X) / S;
    const rawY = (e.clientY - rect.top - MARGEN_TOP) / S;
    onSoltarCatalogo(
      codigo,
      ajustar(Math.max(0, rawX - 0.8), snap),
      ajustar(Math.max(0, rawY - 0.5), snap)
    );
  };

  const fmtM = (n) => (Number.isInteger(n) ? `${n}` : Number(n).toFixed(1));

  return (
    <div className="plano-contenedor-lienzo">
      {/* Regla superior fija al lienzo */}
      <div
        ref={scrollRef}
        className={`plano-scroll ${herramienta === "mano" ? "cursor-mano" : ""}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="plano-canvas-wrapper" style={{ width: anchoPx, height: altoPx }}>
          {/* Cabecera flotante dentro del plano (como en el diseño) */}
          <div
            className="plano-overlay-header"
            style={{
              left: MARGEN_X,
              right: MARGEN_X,
              top: 24,
            }}
          >
            <span className="plano-subtitulo-interior">
              DISTRIBUCIÓN DE EQUIPOS · VISTA SUPERIOR
            </span>
            <div className="recorrido-selector-pill">
              <span>Recorrido:</span>
              <select
                value={linea.tipoRecorrido || "Espiral"}
                onChange={(e) =>
                  onCambiarTipoRecorrido && onCambiarTipoRecorrido(e.target.value)
                }
              >
                <option value="Espiral">Espiral</option>
                <option value="Lineal">Lineal</option>
                <option value="Directo">Directo</option>
              </select>
            </div>
          </div>

          <svg
            ref={svgRef}
            width={anchoPx}
            height={altoPx}
            className="plano-svg"
            onPointerDown={onPointerDownFondo}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={(e) => {
              if (e.target === svgRef.current || e.target.dataset.fondo) {
                onSelect(null);
              }
            }}
          >
            <defs>
              <pattern
                id="cuadricula-menor"
                width={S / 2}
                height={S / 2}
                patternUnits="userSpaceOnUse"
                x={MARGEN_X}
                y={MARGEN_TOP}
              >
                <path
                  d={`M ${S / 2} 0 L 0 0 0 ${S / 2}`}
                  fill="none"
                  stroke="#eef2f6"
                  strokeWidth="1"
                />
              </pattern>
              <pattern
                id="cuadricula-mayor"
                width={S}
                height={S}
                patternUnits="userSpaceOnUse"
                x={MARGEN_X}
                y={MARGEN_TOP}
              >
                <path
                  d={`M ${S} 0 L 0 0 0 ${S}`}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </pattern>
              <filter id="sombra-objeto" x="-10%" y="-10%" width="120%" height="125%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.06" />
              </filter>
            </defs>

            {/* Fondo general con cuadrícula tenue */}
            <rect
              x="0"
              y="0"
              width={anchoPx}
              height={altoPx}
              fill="#f8fafc"
              data-fondo="1"
            />
            <rect
              x="0"
              y="0"
              width={anchoPx}
              height={altoPx}
              fill="url(#cuadricula-menor)"
              data-fondo="1"
            />
            <rect
              x="0"
              y="0"
              width={anchoPx}
              height={altoPx}
              fill="url(#cuadricula-mayor)"
              data-fondo="1"
            />

            {/* Franjas de regla superior e izquierda */}
            <rect x="0" y="0" width={anchoPx} height="22" fill="#f1f5f9" />
            <line x1="0" y1="22" x2={anchoPx} y2="22" stroke="#e2e8f0" />
            <rect x="0" y="22" width="26" height={altoPx - 22} fill="#f1f5f9" />
            <line x1="26" y1="22" x2="26" y2={altoPx} stroke="#e2e8f0" />

            {/* Regla superior (cada 2 m) */}
            {Array.from(
              { length: Math.floor(linea.ancho / 2) + 1 },
              (_, i) => i * 2
            ).map((m) => (
              <g key={`rx-${m}`}>
                <line
                  x1={aPxX(m)}
                  y1={16}
                  x2={aPxX(m)}
                  y2={22}
                  stroke="#cbd5e1"
                />
                <text
                  x={aPxX(m)}
                  y={14}
                  textAnchor="middle"
                  className="regla-txt"
                >
                  {m} m
                </text>
              </g>
            ))}

            {/* Regla izquierda (cada 2 m) */}
            {Array.from(
              { length: Math.floor(linea.fondo / 2) + 1 },
              (_, i) => i * 2
            ).map((m) => (
              <g key={`ry-${m}`}>
                <line
                  x1={20}
                  y1={aPxY(m)}
                  x2={26}
                  y2={aPxY(m)}
                  stroke="#cbd5e1"
                />
                <text
                  x={17}
                  y={aPxY(m) + 4}
                  textAnchor="end"
                  className="regla-txt"
                >
                  {m}
                </text>
              </g>
            ))}

            {/* Área interior delimitada por línea punteada (16 x 8 m) */}
            <rect
              x={MARGEN_X}
              y={MARGEN_TOP}
              width={anchoZona}
              height={altoZona}
              rx="6"
              fill="#ffffff"
              fillOpacity="0.65"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              strokeDasharray="5 4"
              data-fondo="1"
            />
            <rect
              x={MARGEN_X}
              y={MARGEN_TOP}
              width={anchoZona}
              height={altoZona}
              fill="url(#cuadricula-menor)"
              data-fondo="1"
            />
            <rect
              x={MARGEN_X}
              y={MARGEN_TOP}
              width={anchoZona}
              height={altoZona}
              fill="url(#cuadricula-mayor)"
              data-fondo="1"
            />

            {/* Etiqueta de dimensión del área en la esquina inferior derecha */}
            <text
              x={MARGEN_X + anchoZona - 10}
              y={MARGEN_TOP + altoZona - 10}
              textAnchor="end"
              className="plano-dim-label"
            >
              {`${linea.ancho} × ${linea.fondo} m`}
            </text>

            {/* Recorrido continuo de la línea (banda azul clara + línea guía + flechas) */}
            {pathRecorrido && (
              <g className="capa-recorrido">
                <path
                  d={pathRecorrido}
                  fill="none"
                  stroke="#dbeafe"
                  strokeWidth={Math.max(14, S * 0.34)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={pathRecorrido}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {flechasPx.map((fl, idx) => (
                  <g
                    key={`fl-${idx}`}
                    transform={`translate(${fl.x}, ${fl.y}) rotate(${fl.ang})`}
                  >
                    <path
                      d="M -4 -4 L 3 0 L -4 4"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ))}
              </g>
            )}

            {/* Indicadores INICIO y FIN */}
            {inicio && (
              <text
                x={aPxX(inicio.x) + 2}
                y={aPxY(inicio.y) - 10}
                className="etiqueta-hito"
              >
                INICIO
              </text>
            )}
            {fin && (
              <text
                x={aPxX(fin.x + huella(fin).w / 2)}
                y={aPxY(fin.y + huella(fin).h) + 18}
                textAnchor="middle"
                className="etiqueta-hito"
              >
                FIN
              </text>
            )}

            {/* Objetos colocados en el plano */}
            {objetos.map((obj) => {
              const cat = catalogoPorCodigo[obj.codigo];
              const { w, h } = huella(obj);
              const seleccionado = obj.id === selectedId;
              const conflicto = colisiones.has(obj.id);
              const x = aPxX(obj.x);
              const y = aPxY(obj.y);
              const pw = w * S;
              const ph = h * S;
              const girado = Math.abs(Number(obj.rotacion) || 0) % 180 === 90;

              // Colores según tipo de objeto como en el diseño original
              let colorBorde = cat?.color || "#3b82f6";
              let colorFondo = "#f8fafc";
              let colorTexto = "#1e293b";

              if (obj.codigo === "MES") {
                colorBorde = "#059669";
                colorFondo = "#ecfdf5";
                colorTexto = "#065f46";
              } else if (obj.codigo === "TAB") {
                colorBorde = seleccionado ? "#2563eb" : "#64748b";
                colorFondo = seleccionado ? "#eff6ff" : "#f1f5f9";
                colorTexto = "#334155";
              } else if (obj.codigo === "RAC") {
                colorBorde = "#b45309";
                colorFondo = "#fffbeb";
                colorTexto = "#b45309";
              } else if (obj.codigo === "CAR") {
                colorBorde = "#7c3aed";
                colorFondo = "#f5f3ff";
                colorTexto = "#5b21b6";
              } else if (obj.codigo === "INS") {
                colorBorde = "#0284c7";
                colorFondo = "#f0f9ff";
                colorTexto = "#0369a1";
              }

              if (conflicto) {
                colorBorde = "#dc2626";
                colorFondo = "#fef2f2";
              }

              return (
                <g
                  key={obj.id}
                  className={`objeto-plano ${
                    arrastre?.id === obj.id ? "arrastrando" : ""
                  } ${seleccionado ? "seleccionado" : ""}`}
                  onPointerDown={(e) => onPointerDownObj(e, obj)}
                >
                  {/* Cuerpo principal del equipo */}
                  <rect
                    x={x}
                    y={y}
                    width={pw}
                    height={ph}
                    fill={colorFondo}
                    stroke={colorBorde}
                    strokeWidth={seleccionado ? 2.2 : 1.5}
                    rx="3"
                    filter="url(#sombra-objeto)"
                  />

                  {/* Detalles técnicos internos según el tipo de mobiliario */}
                  {obj.codigo === "MES" && (
                    <>
                      <line
                        x1={x + 10}
                        y1={y + 4}
                        x2={x + pw - 10}
                        y2={y + 4}
                        stroke={colorBorde}
                        strokeWidth="1.5"
                      />
                      <line
                        x1={x + 10}
                        y1={y + ph - 4}
                        x2={x + pw - 10}
                        y2={y + ph - 4}
                        stroke={colorBorde}
                        strokeWidth="1.5"
                      />
                    </>
                  )}

                  {obj.codigo === "TAB" && !girado && (
                    <>
                      <line
                        x1={x + 8}
                        y1={y + 4}
                        x2={x + pw - 8}
                        y2={y + 4}
                        stroke="#94a3b8"
                        strokeWidth="1.3"
                      />
                      <line
                        x1={x + 8}
                        y1={y + ph - 4}
                        x2={x + pw - 8}
                        y2={y + ph - 4}
                        stroke="#94a3b8"
                        strokeWidth="1.3"
                      />
                    </>
                  )}

                  {obj.codigo === "TAB" && girado && (
                    <>
                      <line
                        x1={x + 4}
                        y1={y + 8}
                        x2={x + 4}
                        y2={y + ph - 8}
                        stroke="#94a3b8"
                        strokeWidth="1.3"
                      />
                      <line
                        x1={x + pw - 4}
                        y1={y + 8}
                        x2={x + pw - 4}
                        y2={y + ph - 8}
                        stroke="#94a3b8"
                        strokeWidth="1.3"
                      />
                    </>
                  )}

                  {obj.codigo === "RAC" && (
                    <>
                      {[0.2, 0.36, 0.52].map((f, i) => (
                        <line
                          key={i}
                          x1={x + 6}
                          y1={y + ph * f}
                          x2={x + pw - 6}
                          y2={y + ph * f}
                          stroke="#b45309"
                          strokeWidth="1.4"
                        />
                      ))}
                    </>
                  )}

                  {/* Textos del objeto según su formato */}
                  {obj.codigo === "RAC" ? (
                    <>
                      <text
                        x={x + pw / 2}
                        y={y + ph - 10}
                        textAnchor="middle"
                        className="etiqueta-codigo-rack"
                        fill={colorTexto}
                      >
                        {obj.id}
                      </text>
                      <text
                        x={x + pw / 2}
                        y={y + ph + 15}
                        textAnchor="middle"
                        className="etiqueta-nombre-rack"
                      >
                        {obj.etiqueta}
                      </text>
                    </>
                  ) : girado ? (
                    <text
                      x={x + pw / 2}
                      y={y + ph / 2 + 4}
                      textAnchor="middle"
                      className="etiqueta-codigo"
                      fill={colorTexto}
                    >
                      {obj.id}
                    </text>
                  ) : (
                    <>
                      <text
                        x={x + 10}
                        y={y + ph / 2 - 2}
                        className="etiqueta-codigo"
                        fill={colorTexto}
                      >
                        {obj.id}
                      </text>
                      <text
                        x={x + 10}
                        y={y + ph / 2 + 13}
                        className="etiqueta-nombre"
                      >
                        {obj.etiqueta}
                      </text>
                    </>
                  )}

                  {/* Resaltado de selección con tooltip azul y 8 nodos de control */}
                  {seleccionado && (
                    <g className="seleccion-ui">
                      <g
                        className="tooltip-grupo-click"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAbrirMaterial && onAbrirMaterial(obj.id);
                        }}
                      >
                        <rect
                          x={x}
                          y={y - 26}
                          width={Math.max(108, pw)}
                          height="20"
                          rx="4"
                          fill="#1d4ed8"
                        />
                        <text x={x + 8} y={y - 12} className="tooltip-sel">
                          {`${obj.id} · ${fmtM(obj.ancho)} × ${fmtM(obj.fondo)} m`}
                        </text>
                      </g>
                      {[
                        [x, y],
                        [x + pw / 2, y],
                        [x + pw, y],
                        [x, y + ph / 2],
                        [x + pw, y + ph / 2],
                        [x, y + ph],
                        [x + pw / 2, y + ph],
                        [x + pw, y + ph],
                      ].map(([hx, hy], i) => (
                        <rect
                          key={i}
                          x={hx - 3.5}
                          y={hy - 3.5}
                          width="7"
                          height="7"
                          fill="#ffffff"
                          stroke="#2563eb"
                          strokeWidth="1.5"
                        />
                      ))}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Leyenda inferior y barra de ayuda dentro del lienzo (fiel al prototipo) */}
          <div
            className="plano-overlay-footer"
            style={{ left: MARGEN_X, right: MARGEN_X }}
          >
            <div className="plano-leyenda">
              <span>
                <i className="dot-leyenda" style={{ background: "#2563eb" }} />
                Tablero móvil
              </span>
              <span>
                <i className="dot-leyenda" style={{ background: "#059669" }} />
                Mesa de trabajo
              </span>
              <span>
                <i className="dot-leyenda" style={{ background: "#b45309" }} />
                Rack
              </span>
              <span className="leyenda-avance">
                <span className="flecha-leyenda">→</span> Sentido de avance
              </span>
            </div>
            <div className="plano-hint-pill">
              Arrastra los objetos para moverlos · Ajusta medidas y giro en Propiedades · Haz clic en un material para verlo en 3D o descargar su plano
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
