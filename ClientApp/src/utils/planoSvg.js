// Genera un plano técnico (SVG) de un material: vista superior y alzado con cotas.
// Se usa tanto para mostrar el plano ampliado como para descargarlo.

const escapar = (t) =>
  String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fmt = (n) => Number(n).toFixed(2);

export function generarPlanoSvg({ obj, catalogo, linea }) {
  const W = obj.ancho;
  const D = obj.fondo;
  const H = obj.alto;

  // Escala para que ambas vistas quepan
  const S = Math.min(640 / W, 300 / (D + H));
  const margen = 110;
  const anchoVista = W * S;
  const x0 = margen;
  const yTop = 150;
  const yFront = yTop + D * S + 170;
  const yTitulo = yFront + H * S + 120;
  const ancho = Math.max(anchoVista + margen * 2, 820);
  const alto = yTitulo + 150;
  const color = catalogo?.color || "#2563eb";

  // Vista superior
  const top = `
    <rect x="${x0}" y="${yTop}" width="${fmt(anchoVista)}" height="${fmt(D * S)}"
          fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="2.5" />
    <line x1="${x0 + anchoVista / 2}" y1="${yTop + (D * S) / 2 - 8}" x2="${x0 + anchoVista / 2}" y2="${yTop + (D * S) / 2 + 8}" stroke="#94a3b8" />
    <line x1="${x0 + anchoVista / 2 - 8}" y1="${yTop + (D * S) / 2}" x2="${x0 + anchoVista / 2 + 8}" y2="${yTop + (D * S) / 2}" stroke="#94a3b8" />
    <text x="${x0}" y="${yTop - 60}" class="titulo-vista">VISTA SUPERIOR (PLANTA)</text>
    ${cotaHorizontal(x0, x0 + anchoVista, yTop - 22, `${fmt(W)} m`)}
    ${cotaVertical(x0 - 22, yTop, yTop + D * S, `${fmt(D)} m`)}
  `;

  // Alzado con elementos según el modelo 3D
  const yBase = yFront + H * S;
  const alzado = `
    <text x="${x0}" y="${yFront - 60}" class="titulo-vista">ALZADO (VISTA FRONTAL)</text>
    ${alzadoModelo(obj.modelo3D || catalogo?.modelo3D, x0, yFront, anchoVista, H * S, color)}
    ${cotaHorizontal(x0, x0 + anchoVista, yFront - 22, `${fmt(W)} m`)}
    ${cotaVertical(x0 - 22, yFront, yBase, `${fmt(H)} m`)}
  `;

  // Cajetín (título)
  const cajetin = `
    <rect x="30" y="${yTitulo}" width="${ancho - 60}" height="110" fill="none" stroke="#0f172a" stroke-width="1.5" />
    <line x1="30" y1="${yTitulo + 55}" x2="${ancho - 30}" y2="${yTitulo + 55}" stroke="#0f172a" />
    <line x1="${ancho * 0.6}" y1="${yTitulo}" x2="${ancho * 0.6}" y2="${yTitulo + 110}" stroke="#0f172a" />
    <text x="46" y="${yTitulo + 26}" class="cajetin-tit">DAWS · Plano de material (prototipo)</text>
    <text x="46" y="${yTitulo + 46}" class="cajetin-txt">${escapar(catalogo?.nombre || obj.codigo)} · ${escapar(obj.codigo)} · ${escapar(obj.etiqueta)}</text>
    <text x="46" y="${yTitulo + 80}" class="cajetin-txt">Línea: ${escapar(linea?.id || "")} · ${escapar(linea?.nombre || "")}</text>
    <text x="46" y="${yTitulo + 100}" class="cajetin-txt">Planta: ${escapar(linea?.planta || "")} · ${escapar(linea?.nave || "")}</text>
    <text x="${ancho * 0.6 + 16}" y="${yTitulo + 26}" class="cajetin-txt">Dimensiones: ${fmt(W)} × ${fmt(D)} × ${fmt(H)} m</text>
    <text x="${ancho * 0.6 + 16}" y="${yTitulo + 46}" class="cajetin-txt">Posición: X ${fmt(obj.x)} m · Y ${fmt(obj.y)} m</text>
    <text x="${ancho * 0.6 + 16}" y="${yTitulo + 80}" class="cajetin-txt">Rotación: ${obj.rotacion}° · Escala: 1 m = ${Math.round(S)} px</text>
    <text x="${ancho * 0.6 + 16}" y="${yTitulo + 100}" class="cajetin-txt">Fecha: ${new Date().toLocaleDateString("es-MX")} · Datos falsos</text>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(ancho)}" height="${Math.round(alto)}" viewBox="0 0 ${Math.round(ancho)} ${Math.round(alto)}">
  <style>
    text { font-family: Arial, Helvetica, sans-serif; fill: #0f172a; }
    .titulo-vista { font-size: 15px; font-weight: 700; letter-spacing: 0.5px; }
    .cota { font-size: 14px; fill: #334155; }
    .cajetin-tit { font-size: 16px; font-weight: 700; }
    .cajetin-txt { font-size: 13px; fill: #334155; }
  </style>
  <rect x="0" y="0" width="${Math.round(ancho)}" height="${Math.round(alto)}" fill="#ffffff" />
  <rect x="10" y="10" width="${Math.round(ancho) - 20}" height="${Math.round(alto) - 20}" fill="none" stroke="#0f172a" stroke-width="2" />
  ${top}
  ${alzado}
  ${cajetin}
</svg>`;
}

function cotaHorizontal(x1, x2, y, texto) {
  return `
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#334155" />
    <line x1="${x1}" y1="${y - 6}" x2="${x1}" y2="${y + 6}" stroke="#334155" />
    <line x1="${x2}" y1="${y - 6}" x2="${x2}" y2="${y + 6}" stroke="#334155" />
    <text x="${(x1 + x2) / 2}" y="${y - 6}" text-anchor="middle" class="cota">${texto}</text>`;
}

function cotaVertical(x, y1, y2, texto) {
  return `
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#334155" />
    <line x1="${x - 6}" y1="${y1}" x2="${x + 6}" y2="${y1}" stroke="#334155" />
    <line x1="${x - 6}" y1="${y2}" x2="${x + 6}" y2="${y2}" stroke="#334155" />
    <text x="${x - 8}" y="${(y1 + y2) / 2}" text-anchor="end" class="cota" transform="rotate(-90 ${x - 8} ${(y1 + y2) / 2})">${texto}</text>`;
}

function alzadoModelo(modelo, x, y, w, h, color) {
  const grosor = 6;
  const base = `<rect x="${x}" y="${y}" width="${fmt(w)}" height="${fmt(h)}" fill="${color}" fill-opacity="0.08" stroke="${color}" stroke-width="2" />`;

  if (modelo === "rack") {
    const lineas = [0.1, 0.4, 0.7, 0.95]
      .map((f) => `<line x1="${x}" y1="${fmt(y + h * f)}" x2="${fmt(x + w)}" y2="${fmt(y + h * f)}" stroke="${color}" stroke-width="3" />`)
      .join("");
    return base + lineas;
  }

  if (modelo === "carro") {
    const ruedas = [x + 14, x + w - 14]
      .map((cx) => `<circle cx="${fmt(cx)}" cy="${fmt(y + h)}" r="8" fill="#0f172a" />`)
      .join("");
    return base + `<line x1="${x}" y1="${fmt(y + h * 0.5)}" x2="${fmt(x + w)}" y2="${fmt(y + h * 0.5)}" stroke="${color}" stroke-width="3" />` + ruedas;
  }

  // Mesas, tableros e inspección: cubierta + patas
  const cubierta = `<rect x="${x}" y="${fmt(y)}" width="${fmt(w)}" height="${grosor * 2}" fill="${color}" />`;
  const patas = [x + 8, x + w - 8 - grosor]
    .map((px) => `<rect x="${fmt(px)}" y="${fmt(y + grosor * 2)}" width="${grosor}" height="${fmt(h - grosor * 2)}" fill="${color}" fill-opacity="0.6" />`)
    .join("");
  return base + cubierta + patas;
}
