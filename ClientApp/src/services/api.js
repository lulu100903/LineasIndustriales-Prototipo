// Cliente HTTP hacia la API ASP.NET con respaldo local de datos falsos en memoria
const CATALOGO_RESPALDO = [
  {
    codigo: "TAB",
    nombre: "Tablero de ensamble",
    tipo: "Tablero móvil",
    categoria: "Mobiliario y equipo",
    descripcion:
      "Tablero de ruteo y ensamble de arneses con bastidor tubular, clavijas guía y rieles de desplazamiento.",
    color: "#2563eb",
    ancho: 2.0,
    fondo: 1.0,
    alto: 1.65,
    modelo3D: "tablero",
    materialPrincipal: "Perfil de aluminio anodizado y MDF fenólico",
    pesoKg: "68 kg",
    capacidadCarga: "180 kg",
    norma: "DAWS-STD-TAB-04",
  },
  {
    codigo: "MES",
    nombre: "Mesa de trabajo",
    tipo: "Superficie fija",
    categoria: "Mobiliario y equipo",
    descripcion:
      "Mesa industrial de superficie fija con cubierta ESD antiestática, repisa inferior y niveladores.",
    color: "#059669",
    ancho: 2.0,
    fondo: 1.0,
    alto: 0.9,
    modelo3D: "mesa",
    materialPrincipal: "Acero al carbón calibre 14 con cubierta laminada ESD",
    pesoKg: "54 kg",
    capacidadCarga: "350 kg",
    norma: "DAWS-STD-MES-01",
  },
  {
    codigo: "RAC",
    nombre: "Rack de herramientas",
    tipo: "Almacenamiento",
    categoria: "Mobiliario y equipo",
    descripcion:
      "Rack modular de 4 niveles con contenedores plásticos para conectores, terminales y cintas.",
    color: "#b45309",
    ancho: 1.0,
    fondo: 1.2,
    alto: 1.9,
    modelo3D: "rack",
    materialPrincipal: "Acero estructural pintado al horno",
    pesoKg: "62 kg",
    capacidadCarga: "450 kg",
    norma: "DAWS-STD-RAC-02",
  },
  {
    codigo: "CAR",
    nombre: "Carro de transporte",
    tipo: "Equipo móvil",
    categoria: "Mobiliario y equipo",
    descripcion:
      "Carro abastecedor con 4 ruedas giratorias de poliuretano con freno y maneral ergonómico.",
    color: "#7c3aed",
    ancho: 1.2,
    fondo: 0.8,
    alto: 0.95,
    modelo3D: "carro",
    materialPrincipal: "Tubo estructural de acero y charolas galvanizadas",
    pesoKg: "32 kg",
    capacidadCarga: "220 kg",
    norma: "DAWS-STD-CAR-03",
  },
  {
    codigo: "INS",
    nombre: "Mesa de inspección",
    tipo: "Control de calidad",
    categoria: "Mobiliario y equipo",
    descripcion:
      "Estación de prueba eléctrica y control de calidad con luminaria LED superior y pantalla de verificación.",
    color: "#0284c7",
    ancho: 1.8,
    fondo: 1.0,
    alto: 1.75,
    modelo3D: "inspeccion",
    materialPrincipal: "Acero inoxidable y cubierta acrílica iluminada",
    pesoKg: "75 kg",
    capacidadCarga: "250 kg",
    norma: "DAWS-STD-INS-05",
  },
];

const LINEAS_INICIALES = {
  "L-04": {
    id: "L-04",
    nombre: "Ensamble de arneses",
    planta: "Durango",
    nave: "Nave 02",
    ancho: 16,
    fondo: 8,
    estado: "Borrador",
    version: 1,
    tipoRecorrido: "Espiral",
    objetos: [
      { id: "MES-01", codigo: "MES", etiqueta: "Preparación", x: 0.5, y: 0.85, ancho: 2.0, fondo: 1.0, alto: 0.9, rotacion: 0, orden: 0, rol: "inicio" },
      { id: "TAB-01", codigo: "TAB", etiqueta: "Tablero móvil", x: 4.25, y: 1.0, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 0, orden: 1, rol: "" },
      { id: "TAB-02", codigo: "TAB", etiqueta: "Tablero móvil", x: 8.75, y: 1.0, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 0, orden: 2, rol: "" },
      { id: "TAB-03", codigo: "TAB", etiqueta: "Tablero móvil", x: 13.0, y: 3.25, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 90, orden: 3, rol: "" },
      { id: "TAB-04", codigo: "TAB", etiqueta: "Tablero móvil", x: 8.75, y: 6.0, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 0, orden: 4, rol: "" },
      { id: "TAB-05", codigo: "TAB", etiqueta: "Tablero móvil", x: 2.0, y: 4.0, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 90, orden: 5, rol: "" },
      { id: "TAB-06", codigo: "TAB", etiqueta: "Tablero móvil", x: 6.75, y: 2.85, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 0, orden: 6, rol: "" },
      { id: "RAC-01", codigo: "RAC", etiqueta: "Rack", x: 4.4, y: 4.45, ancho: 1.0, fondo: 1.2, alto: 1.9, rotacion: 0, orden: 0, rol: "" },
      { id: "MES-02", codigo: "MES", etiqueta: "Salida / revisión", x: 6.25, y: 4.65, ancho: 2.0, fondo: 1.0, alto: 0.9, rotacion: 0, orden: 0, rol: "fin" },
    ],
  },
  "L-02": {
    id: "L-02",
    nombre: "Corte y preparación",
    planta: "Durango",
    nave: "Nave 01",
    ancho: 16,
    fondo: 8,
    estado: "Guardado",
    version: 3,
    tipoRecorrido: "Lineal",
    objetos: [
      { id: "MES-01", codigo: "MES", etiqueta: "Recepción de cable", x: 1.0, y: 1.5, ancho: 2.0, fondo: 1.0, alto: 0.9, rotacion: 0, orden: 0, rol: "inicio" },
      { id: "TAB-01", codigo: "TAB", etiqueta: "Subensamble A", x: 4.5, y: 1.5, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 0, orden: 1, rol: "" },
      { id: "TAB-02", codigo: "TAB", etiqueta: "Subensamble B", x: 8.5, y: 1.5, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 0, orden: 2, rol: "" },
      { id: "INS-01", codigo: "INS", etiqueta: "Inspección dimensional", x: 12.5, y: 1.5, ancho: 1.8, fondo: 1.0, alto: 1.75, rotacion: 0, orden: 3, rol: "" },
      { id: "RAC-01", codigo: "RAC", etiqueta: "Terminales y sellos", x: 4.5, y: 4.5, ancho: 1.0, fondo: 1.2, alto: 1.9, rotacion: 0, orden: 0, rol: "" },
      { id: "CAR-01", codigo: "CAR", etiqueta: "Abastecimiento", x: 7.5, y: 4.75, ancho: 1.2, fondo: 0.8, alto: 0.95, rotacion: 0, orden: 0, rol: "" },
      { id: "MES-02", codigo: "MES", etiqueta: "Empaque intermedio", x: 11.5, y: 4.5, ancho: 2.0, fondo: 1.0, alto: 0.9, rotacion: 0, orden: 0, rol: "fin" },
    ],
  },
  "L-07": {
    id: "L-07",
    nombre: "Pruebas eléctricas y clipado",
    planta: "Durango",
    nave: "Nave 02",
    ancho: 16,
    fondo: 8,
    estado: "Guardado",
    version: 2,
    tipoRecorrido: "Espiral",
    objetos: [
      { id: "MES-01", codigo: "MES", etiqueta: "Ingreso de lote", x: 1.0, y: 1.0, ancho: 2.0, fondo: 1.0, alto: 0.9, rotacion: 0, orden: 0, rol: "inicio" },
      { id: "TAB-01", codigo: "TAB", etiqueta: "Clipado frontal", x: 4.5, y: 1.0, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 0, orden: 1, rol: "" },
      { id: "INS-01", codigo: "INS", etiqueta: "Prueba continuidad 01", x: 8.5, y: 1.0, ancho: 1.8, fondo: 1.0, alto: 1.75, rotacion: 0, orden: 2, rol: "" },
      { id: "INS-02", codigo: "INS", etiqueta: "Prueba continuidad 02", x: 12.0, y: 1.0, ancho: 1.8, fondo: 1.0, alto: 1.75, rotacion: 0, orden: 3, rol: "" },
      { id: "CAR-01", codigo: "CAR", etiqueta: "Retorno de racks", x: 12.25, y: 4.5, ancho: 1.2, fondo: 0.8, alto: 0.95, rotacion: 0, orden: 4, rol: "" },
      { id: "RAC-01", codigo: "RAC", etiqueta: "Refacciones y clips", x: 4.5, y: 4.25, ancho: 1.0, fondo: 1.2, alto: 1.9, rotacion: 0, orden: 0, rol: "" },
      { id: "MES-02", codigo: "MES", etiqueta: "Liberación calidad", x: 7.5, y: 4.5, ancho: 2.0, fondo: 1.0, alto: 0.9, rotacion: 0, orden: 0, rol: "fin" },
    ],
  },
};

let memoriaLocal = JSON.parse(JSON.stringify(LINEAS_INICIALES));

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status} en ${path}`);
  }
  return response.json();
}

export const getLineas = async () => {
  try {
    return await request("/lineas");
  } catch {
    return Object.values(memoriaLocal).map((l) => ({
      id: l.id,
      nombre: l.nombre,
      planta: l.planta,
      nave: l.nave,
      ancho: l.ancho,
      fondo: l.fondo,
      estado: l.estado,
      version: l.version,
      tipoRecorrido: l.tipoRecorrido || "Espiral",
      totalObjetos: l.objetos.length,
    }));
  }
};

export const getLinea = async (id) => {
  try {
    return await request(`/lineas/${encodeURIComponent(id)}`);
  } catch {
    return JSON.parse(
      JSON.stringify(memoriaLocal[id] || memoriaLocal["L-04"])
    );
  }
};

export const guardarLinea = async (linea) => {
  try {
    return await request(`/lineas/${encodeURIComponent(linea.id)}`, {
      method: "PUT",
      body: JSON.stringify(linea),
    });
  } catch {
    const guardada = {
      ...linea,
      estado: "Guardado",
      version: (linea.version || 1) + 1,
    };
    memoriaLocal[guardada.id] = JSON.parse(JSON.stringify(guardada));
    return guardada;
  }
};

export const crearLinea = async (nueva) => {
  try {
    return await request("/lineas", {
      method: "POST",
      body: JSON.stringify(nueva),
    });
  } catch {
    const id =
      nueva.id?.trim().toUpperCase() ||
      `L-0${Object.keys(memoriaLocal).length + 5}`;
    const creada = {
      id,
      nombre: nueva.nombre || "Nueva línea de ensamble",
      planta: nueva.planta || "Durango",
      nave: nueva.nave || "Nave 02",
      ancho: nueva.ancho || 16,
      fondo: nueva.fondo || 8,
      estado: "Borrador",
      version: 1,
      tipoRecorrido: nueva.tipoRecorrido || "Espiral",
      objetos: nueva.objetos || [
        { id: "MES-01", codigo: "MES", etiqueta: "Preparación", x: 1.0, y: 1.0, ancho: 2.0, fondo: 1.0, alto: 0.9, rotacion: 0, orden: 0, rol: "inicio" },
        { id: "TAB-01", codigo: "TAB", etiqueta: "Tablero móvil", x: 5.0, y: 1.0, ancho: 2.0, fondo: 1.0, alto: 1.65, rotacion: 0, orden: 1, rol: "" },
        { id: "MES-02", codigo: "MES", etiqueta: "Salida / revisión", x: 9.0, y: 1.0, ancho: 2.0, fondo: 1.0, alto: 0.9, rotacion: 0, orden: 0, rol: "fin" },
      ],
    };
    memoriaLocal[creada.id] = creada;
    return creada;
  }
};

export const restaurarLineas = async () => {
  try {
    return await request("/lineas/restaurar", { method: "POST" });
  } catch {
    memoriaLocal = JSON.parse(JSON.stringify(LINEAS_INICIALES));
    return getLineas();
  }
};

export const getCatalogo = async () => {
  try {
    return await request("/catalogo");
  } catch {
    return CATALOGO_RESPALDO;
  }
};
