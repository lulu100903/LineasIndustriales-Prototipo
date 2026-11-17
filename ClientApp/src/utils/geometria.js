// Escala visual: píxeles por metro al 100% de zoom
export const PX_POR_METRO = 48;
// Cuadrícula de ajuste en metros
export const CUADRICULA = 0.25;

export const ajustar = (valor, snap = true) =>
  snap ? Math.round(valor / CUADRICULA) * CUADRICULA : Number(valor.toFixed(2));

// Huella en el plano considerando la rotación (0/90/180/270)
export function huella(obj) {
  const girado = Math.abs(Number(obj.rotacion) || 0) % 180 === 90;
  return {
    w: girado ? obj.fondo : obj.ancho,
    h: girado ? obj.ancho : obj.fondo,
  };
}

export function hayColision(a, b) {
  const ha = huella(a);
  const hb = huella(b);
  const margen = 0.02;
  return (
    a.x + margen < b.x + hb.w &&
    b.x + margen < a.x + ha.w &&
    a.y + margen < b.y + hb.h &&
    b.y + margen < a.y + ha.h
  );
}

// Devuelve el conjunto de ids de objetos que se superponen con otro
export function idsEnColision(objetos) {
  const ids = new Set();
  for (let i = 0; i < objetos.length; i++) {
    for (let j = i + 1; j < objetos.length; j++) {
      if (hayColision(objetos[i], objetos[j])) {
        ids.add(objetos[i].id);
        ids.add(objetos[j].id);
      }
    }
  }
  return ids;
}

// Busca una posición libre para un nuevo objeto (barrido simple por la cuadrícula)
export function posicionLibre(objetos, ancho, fondo, anchoPlano, fondoPlano) {
  const candidato = { x: 0, y: 0, ancho, fondo, rotacion: 0 };
  for (let y = 0.5; y + fondo <= fondoPlano; y += 0.5) {
    for (let x = 0.5; x + ancho <= anchoPlano; x += 0.5) {
      candidato.x = x;
      candidato.y = y;
      if (!objetos.some((o) => hayColision(candidato, o))) {
        return { x, y };
      }
    }
  }
  return { x: 1.0, y: 1.0 };
}

// Centro de un objeto en metros (para dibujar el recorrido)
export function centro(obj) {
  const { w, h } = huella(obj);
  return { x: obj.x + w / 2, y: obj.y + h / 2 };
}

// Objetos que forman parte del recorrido, ordenados por su orden de avance
export function recorridoOrdenado(objetos) {
  return objetos
    .filter((o) => o.orden > 0)
    .sort((a, b) => a.orden - b.orden);
}

// Estaciones completas incluyendo estación de inicio y fin si existen
export function estacionesFlujo(objetos) {
  const inicio =
    objetos.find((o) => o.rol === "inicio") ||
    objetos.find((o) => o.id === "MES-01" && o.orden === 0);
  const fin =
    objetos.find((o) => o.rol === "fin") ||
    objetos.find(
      (o) =>
        o.id === "MES-02" &&
        o.orden === 0 &&
        (!inicio || o.id !== inicio.id)
    );
  const intermedios = recorridoOrdenado(objetos);
  const lista = [];
  if (inicio) lista.push(inicio);
  lista.push(...intermedios);
  if (fin) lista.push(fin);
  return { inicio, fin, intermedios, lista };
}

// Genera una polilínea ortogonal suavizada (en metros) para el recorrido
export function puntosRecorrido(objetos, tipoRecorrido = "Espiral") {
  const { lista } = estacionesFlujo(objetos);
  if (lista.length < 2) return { puntos: [], flechas: [] };

  if (tipoRecorrido === "Directo") {
    const puntos = lista.map((o) => centro(o));
    const flechas = [];
    for (let i = 0; i < puntos.length - 1; i++) {
      const a = puntos[i];
      const b = puntos[i + 1];
      flechas.push({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        ang: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
      });
    }
    return { puntos, flechas };
  }

  // En modo Espiral o Lineal, conectamos con codos ortogonales limpios
  const puntos = [centro(lista[0])];
  const flechas = [];

  for (let i = 0; i < lista.length - 1; i++) {
    const actual = lista[i];
    const sig = lista[i + 1];
    const a = centro(actual);
    const b = centro(sig);
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (Math.abs(dx) < 0.35 || Math.abs(dy) < 0.35) {
      // Casi alineados horizontal o verticalmente
      puntos.push(b);
      flechas.push({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        ang: (Math.atan2(dy, dx) * 180) / Math.PI,
      });
    } else if (
      sig.rol === "fin" ||
      (i === lista.length - 2 && sig.codigo === "MES" && a.y < b.y)
    ) {
      // Curva en U hacia la mesa de salida/revisión (como en el prototipo L-04)
      const xGiro = Math.max(a.x + huella(actual).w / 2 + 1.2, b.x + huella(sig).w / 2 + 1.1);
      const p1 = { x: xGiro, y: a.y };
      const p2 = { x: xGiro, y: b.y };
      puntos.push(p1, p2, b);
      flechas.push({
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
        ang: b.y >= a.y ? 90 : -90,
      });
      flechas.push({
        x: (p2.x + b.x) / 2,
        y: b.y,
        ang: b.x <= p2.x ? 180 : 0,
      });
    } else {
      // Codo en L según orientación predominante del flujo espiral
      const girarHorizontalPrimero =
        Math.abs(dx) >= Math.abs(dy) ? a.y <= b.y : a.y > b.y;
      const codo = girarHorizontalPrimero
        ? { x: b.x, y: a.y }
        : { x: a.x, y: b.y };
      puntos.push(codo, b);

      // Flecha en el tramo más largo
      const d1 = Math.hypot(codo.x - a.x, codo.y - a.y);
      const d2 = Math.hypot(b.x - codo.x, b.y - codo.y);
      if (d1 >= d2) {
        flechas.push({
          x: (a.x + codo.x) / 2,
          y: (a.y + codo.y) / 2,
          ang: (Math.atan2(codo.y - a.y, codo.x - a.x) * 180) / Math.PI,
        });
      } else {
        flechas.push({
          x: (codo.x + b.x) / 2,
          y: (codo.y + b.y) / 2,
          ang: (Math.atan2(b.y - codo.y, b.x - codo.x) * 180) / Math.PI,
        });
      }
    }
  }

  return { puntos, flechas };
}

// Convierte una lista de puntos (en px) en un path SVG con esquinas redondeadas
export function pathConCurvas(puntosPx, radio = 22) {
  if (!puntosPx || puntosPx.length === 0) return "";
  if (puntosPx.length === 1) return `M ${puntosPx[0].x} ${puntosPx[0].y}`;

  let d = `M ${puntosPx[0].x.toFixed(1)} ${puntosPx[0].y.toFixed(1)}`;
  for (let i = 1; i < puntosPx.length - 1; i++) {
    const prev = puntosPx[i - 1];
    const curr = puntosPx[i];
    const next = puntosPx[i + 1];

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const len1 = Math.hypot(v1x, v1y);

    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const len2 = Math.hypot(v2x, v2y);

    if (len1 < 4 || len2 < 4) {
      d += ` L ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
      continue;
    }

    const r = Math.min(radio, len1 * 0.45, len2 * 0.45);
    const pInicio = {
      x: curr.x - (v1x / len1) * r,
      y: curr.y - (v1y / len1) * r,
    };
    const pFin = {
      x: curr.x + (v2x / len2) * r,
      y: curr.y + (v2y / len2) * r,
    };

    d += ` L ${pInicio.x.toFixed(1)} ${pInicio.y.toFixed(1)} Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${pFin.x.toFixed(1)} ${pFin.y.toFixed(1)}`;
  }

  const ultimo = puntosPx[puntosPx.length - 1];
  d += ` L ${ultimo.x.toFixed(1)} ${ultimo.y.toFixed(1)}`;
  return d;
}

// Reasigna el orden 1..n a los objetos del recorrido, colocando "id" en la posición "nuevoOrden"
export function reordenarRecorrido(objetos, id, nuevoOrden) {
  const ruta = recorridoOrdenado(objetos).map((o) => o.id);
  const actual = ruta.indexOf(id);
  if (nuevoOrden <= 0) {
    if (actual === -1) return objetos;
    ruta.splice(actual, 1);
  } else {
    if (actual !== -1) ruta.splice(actual, 1);
    const destino = Math.min(Math.max(nuevoOrden, 1), ruta.length + 1);
    ruta.splice(destino - 1, 0, id);
  }
  return objetos.map((o) => {
    const pos = ruta.indexOf(o.id);
    return { ...o, orden: pos === -1 ? 0 : pos + 1 };
  });
}
