import React, { useEffect, useMemo, useState } from "react";
import { Visor3D } from "./Visor3D.jsx";
import { generarPlanoSvg } from "../../utils/planoSvg.js";
import { IconoCatalogo } from "./ObjetosLinea.jsx";

// Vista ampliada de un material al hacer clic: Visor 3D interactivo + Plano técnico descargable (.svg / .png / PDF)
export function DetalleMaterial({
  obj,
  catalogo,
  linea,
  pestanaInicial = "3d",
  onClose,
}) {
  const [pestana, setPestana] = useState(pestanaInicial || "3d");

  useEffect(() => {
    if (pestanaInicial) setPestana(pestanaInicial);
  }, [pestanaInicial, obj?.id]);

  const svg = useMemo(
    () => generarPlanoSvg({ obj, catalogo, linea }),
    [obj, catalogo, linea]
  );

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const descargarSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Plano-${linea?.id || "DAWS"}-${obj.id}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const descargarPng = () => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `Plano-${linea?.id || "DAWS"}-${obj.id}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const imprimirPlano = () => {
    const ventana = window.open("", "_blank", "width=960,height=780");
    if (!ventana) return;
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Plano Técnico - ${obj.id} (${catalogo?.nombre || obj.etiqueta})</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; background: #fff; font-family: Arial, sans-serif; }
            svg { max-width: 100%; height: auto; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${svg}
          <script>window.onload = () => { setTimeout(() => window.print(), 250); };</script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  const color = catalogo?.color || "#2563eb";

  return (
    <div className="overlay-zoom" onClick={onClose}>
      <div
        className="detalle-modal-zoom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal ampliado */}
        <div className="detalle-cabecera">
          <div className="detalle-titulo-grupo">
            <div
              className="icono-objeto-grande"
              style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}40`,
              }}
            >
              <IconoCatalogo codigo={obj.codigo} color={color} />
            </div>
            <div>
              <div className="detalle-badges-sup">
                <span className="badge-codigo-modal" style={{ background: color }}>
                  {obj.id}
                </span>
                <span className="badge-norma-modal">
                  {catalogo?.norma || "DAWS-STD"}
                </span>
              </div>
              <h3>{catalogo?.nombre || obj.codigo}</h3>
              <small>
                {obj.etiqueta} · Línea {linea?.id} ({linea?.nombre}) · Planta{" "}
                {linea?.planta} · {linea?.nave}
              </small>
            </div>
          </div>

          {/* Selector de modo: Vista 3D vs Plano Técnico */}
          <div className="pestanas-modal">
            <button
              type="button"
              className={pestana === "3d" ? "tab-modal activo" : "tab-modal"}
              onClick={() => setPestana("3d")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L3 7l9 5 9-5-9-5z" />
                <path d="M3 17l9 5 9-5" />
                <path d="M3 12l9 5 9-5" />
              </svg>
              Visualizar en 3D
            </button>
            <button
              type="button"
              className={pestana === "plano" ? "tab-modal activo" : "tab-modal"}
              onClick={() => setPestana("plano")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              Plano Técnico 2D
            </button>
          </div>

          <button
            type="button"
            className="btn-cerrar-modal"
            onClick={onClose}
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo principal con Visor 3D o Plano Técnico + Especificaciones */}
        <div className="detalle-cuerpo-grid">
          <div className="detalle-area-visual">
            {pestana === "3d" ? (
              <Visor3D obj={obj} catalogo={catalogo} />
            ) : (
              <div
                className="plano-ampliado-contenedor"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </div>

          {/* Ficha lateral de especificaciones e ingeniería */}
          <div className="detalle-ficha-lateral">
            <h4>Especificaciones del material</h4>
            <p className="detalle-desc">
              {catalogo?.descripcion ||
                "Equipo industrial configurado para línea de producción."}
            </p>

            <div className="lista-especificaciones">
              <div className="item-espec">
                <span>Código en plano</span>
                <strong>{obj.id}</strong>
              </div>
              <div className="item-espec">
                <span>Tipo de equipo</span>
                <strong>{catalogo?.tipo || obj.etiqueta}</strong>
              </div>
              <div className="item-espec">
                <span>Dimensiones (A × F × H)</span>
                <strong>
                  {Number(obj.ancho).toFixed(2)} × {Number(obj.fondo).toFixed(2)} ×{" "}
                  {Number(obj.alto).toFixed(2)} m
                </strong>
              </div>
              <div className="item-espec">
                <span>Ubicación (X, Y)</span>
                <strong>
                  {Number(obj.x).toFixed(2)} m, {Number(obj.y).toFixed(2)} m
                </strong>
              </div>
              <div className="item-espec">
                <span>Orientación</span>
                <strong>{obj.rotacion}°</strong>
              </div>
              <div className="item-espec">
                <span>Material estructural</span>
                <strong>{catalogo?.materialPrincipal || "Acero recubierto"}</strong>
              </div>
              <div className="item-espec">
                <span>Peso estimado</span>
                <strong>{catalogo?.pesoKg || "50 kg"}</strong>
              </div>
              <div className="item-espec">
                <span>Capacidad de carga</span>
                <strong>{catalogo?.capacidadCarga || "200 kg"}</strong>
              </div>
            </div>

            <div className="caja-descarga-lateral">
              <h5>Descargar plano del material</h5>
              <p>
                Obtén el plano acotado de planta y alzado con cajetín de ingeniería DAWS.
              </p>
              <button
                type="button"
                className="btn-descarga-primario"
                onClick={descargarPng}
              >
                ⬇ Descargar plano (.PNG)
              </button>
              <button
                type="button"
                className="btn-descarga-secundario"
                onClick={descargarSvg}
              >
                ⬇ Descargar plano vectorial (.SVG)
              </button>
              <button
                type="button"
                className="btn-descarga-secundario"
                onClick={imprimirPlano}
              >
                🖨️ Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="detalle-pie">
          <span>
            Material seleccionado: <strong>{obj.id}</strong> ({catalogo?.nombre}) ·{" "}
            {Number(obj.ancho).toFixed(2)} × {Number(obj.fondo).toFixed(2)} ×{" "}
            {Number(obj.alto).toFixed(2)} m
          </span>
          <div className="acciones-pie-modal">
            <button
              type="button"
              className="btn-secundario"
              onClick={() => setPestana(pestana === "3d" ? "plano" : "3d")}
            >
              {pestana === "3d" ? "Ver plano acotado 2D" : "Ver modelo en 3D"}
            </button>
            <button
              type="button"
              className="btn-secundario"
              onClick={descargarSvg}
            >
              Descargar plano (.svg)
            </button>
            <button
              type="button"
              className="btn-azul-solido"
              onClick={onClose}
            >
              Cerrar vista ampliada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
