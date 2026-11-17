import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCatalogo,
  getLinea,
  getLineas,
  guardarLinea,
  crearLinea,
  restaurarLineas,
} from "../services/api";
import {
  idsEnColision,
  posicionLibre,
  recorridoOrdenado,
  reordenarRecorrido,
} from "../utils/geometria";
import { ObjetosLinea } from "../components/Lineas/ObjetosLinea.jsx";
import { PlanoLinea } from "../components/Lineas/PlanoLinea.jsx";
import { PropiedadesObjeto } from "../components/Lineas/PropiedadesObjeto.jsx";
import { DetalleMaterial } from "../components/Lineas/DetalleMaterial.jsx";

export function DisenoLinea() {
  const { lineaId } = useParams();
  const navigate = useNavigate();

  const [catalogo, setCatalogo] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [lineaSelectId, setLineaSelectId] = useState(lineaId || "L-04");
  const [linea, setLinea] = useState(null);
  const [selectedId, setSelectedId] = useState("TAB-01");
  const [detalleModal, setDetalleModal] = useState(null); // { obj, pestana }
  const [zoom, setZoom] = useState(100);
  const [snap, setSnap] = useState(true);
  const [herramienta, setHerramienta] = useState("seleccionar");
  const [historial, setHistorial] = useState([]);
  const [futuro, setFuturo] = useState([]);
  const [sinGuardar, setSinGuardar] = useState(true);
  const [mensajeToast, setMensajeToast] = useState(null);
  const [mostrarMisPlanos, setMostrarMisPlanos] = useState(false);
  const [mostrarMenuExtra, setMostrarMenuExtra] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  // Formulario para crear nueva línea en el modal "Mis planos"
  const [nuevaLineaForm, setNuevaLineaForm] = useState({
    id: "L-09",
    nombre: "Ensamble consola central",
    planta: "Durango",
    nave: "Nave 02",
    ancho: 16,
    fondo: 8,
    tipoRecorrido: "Espiral",
  });

  const mostrarAviso = useCallback((texto) => {
    setMensajeToast(texto);
    setTimeout(() => {
      setMensajeToast((actual) => (actual === texto ? null : actual));
    }, 2800);
  }, []);

  const cargarLineaPorId = useCallback(async (id) => {
    const data = await getLinea(id);
    setLinea(data);
    setLineaSelectId(data.id);
    setHistorial([]);
    setFuturo([]);
    setSinGuardar(data.estado === "Borrador");
    const tab01 = data.objetos.find((o) => o.id === "TAB-01");
    setSelectedId(tab01 ? tab01.id : data.objetos[0]?.id || null);
  }, []);

  useEffect(() => {
    Promise.all([getCatalogo(), getLineas()]).then(([cat, lista]) => {
      setCatalogo(cat);
      setLineas(lista);
    });
  }, []);

  useEffect(() => {
    const objetivo = lineaId || "L-04";
    cargarLineaPorId(objetivo);
  }, [lineaId, cargarLineaPorId]);

  // Escuchar evento del botón "+" en la barra superior para abrir creación de línea
  useEffect(() => {
    const handler = () => setMostrarMisPlanos(true);
    window.addEventListener("abrir-mis-planos", handler);
    return () => window.removeEventListener("abrir-mis-planos", handler);
  }, []);

  const catalogoPorCodigo = useMemo(() => {
    const m = {};
    catalogo.forEach((c) => {
      m[c.codigo] = c;
    });
    return m;
  }, [catalogo]);

  const actualizarObjetos = (nuevosObjetos, marcarBorrador = true) => {
    if (!linea) return;
    setHistorial((h) => [...h.slice(-24), linea.objetos]);
    setFuturo([]);
    setLinea({
      ...linea,
      estado: marcarBorrador ? "Borrador" : linea.estado,
      objetos: nuevosObjetos,
    });
    if (marcarBorrador) setSinGuardar(true);
  };

  const deshacer = () => {
    if (historial.length === 0 || !linea) return;
    const anterior = historial[historial.length - 1];
    setHistorial((h) => h.slice(0, -1));
    setFuturo((f) => [linea.objetos, ...f]);
    setLinea({ ...linea, objetos: anterior, estado: "Borrador" });
    setSinGuardar(true);
  };

  const rehacer = () => {
    if (futuro.length === 0 || !linea) return;
    const siguiente = futuro[0];
    setFuturo((f) => f.slice(1));
    setHistorial((h) => [...h, linea.objetos]);
    setLinea({ ...linea, objetos: siguiente, estado: "Borrador" });
    setSinGuardar(true);
  };

  const generarNuevoId = (codigo, objetosActuales) => {
    let max = 0;
    objetosActuales.forEach((o) => {
      if (o.codigo === codigo) {
        const partes = o.id.split("-");
        const num = parseInt(partes[1], 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    const sig = String(max + 1).padStart(2, "0");
    return `${codigo}-${sig}`;
  };

  const handleAgregarObjeto = (codigo, posX = null, posY = null) => {
    if (!linea) return;
    const cat = catalogoPorCodigo[codigo];
    if (!cat) return;

    const pos =
      posX !== null && posY !== null
        ? {
            x: Math.min(posX, Math.max(0, linea.ancho - cat.ancho)),
            y: Math.min(posY, Math.max(0, linea.fondo - cat.fondo)),
          }
        : posicionLibre(
            linea.objetos,
            cat.ancho,
            cat.fondo,
            linea.ancho,
            linea.fondo
          );

    const id = generarNuevoId(codigo, linea.objetos);
    const rutaActual = recorridoOrdenado(linea.objetos);
    const orden = codigo === "TAB" ? rutaActual.length + 1 : 0;

    const nuevo = {
      id,
      codigo: cat.codigo,
      etiqueta: cat.tipo,
      x: pos.x,
      y: pos.y,
      ancho: cat.ancho,
      fondo: cat.fondo,
      alto: cat.alto,
      rotacion: 0,
      orden,
      rol: "",
    };

    actualizarObjetos([...linea.objetos, nuevo]);
    setSelectedId(id);
    mostrarAviso(`${cat.nombre} (${id}) agregado al plano`);
  };

  const handleMoverObjeto = (id, x, y) => {
    if (!linea) return;
    const nuevos = linea.objetos.map((o) =>
      o.id === id
        ? { ...o, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }
        : o
    );
    actualizarObjetos(nuevos);
  };

  const handleCambiarPropiedad = (id, campo, valor) => {
    if (!linea) return;
    const nuevos = linea.objetos.map((o) =>
      o.id === id ? { ...o, [campo]: valor } : o
    );
    actualizarObjetos(nuevos);
  };

  const handleCambiarOrden = (id, nuevoOrden) => {
    if (!linea) return;
    const nuevos = reordenarRecorrido(linea.objetos, id, nuevoOrden);
    actualizarObjetos(nuevos);
  };

  const handleEliminarObjeto = (id) => {
    if (!linea) return;
    const restantes = linea.objetos.filter((o) => o.id !== id);
    // Reindexar orden de recorrido
    const ordenados = recorridoOrdenado(restantes).map((o) => o.id);
    const limpios = restantes.map((o) => {
      const idx = ordenados.indexOf(o.id);
      return { ...o, orden: idx === -1 ? 0 : idx + 1 };
    });
    actualizarObjetos(limpios);
    if (selectedId === id) {
      setSelectedId(limpios[0]?.id || null);
    }
    mostrarAviso(`Objeto ${id} eliminado del plano`);
  };

  // Abre el visor ampliado 3D / Plano al hacer clic en un objeto del plano o del catálogo
  const handleAbrirMaterial = (idOCodigo, pestana = "3d") => {
    if (!linea) return;
    const objEnPlano = linea.objetos.find((o) => o.id === idOCodigo);
    if (objEnPlano) {
      setSelectedId(objEnPlano.id);
      setDetalleModal({ obj: objEnPlano, pestana });
      return;
    }
    // Si viene del catálogo por código (ej. "CAR" o "INS")
    const ejemplarEnPlano = linea.objetos.find((o) => o.codigo === idOCodigo);
    if (ejemplarEnPlano) {
      setSelectedId(ejemplarEnPlano.id);
      setDetalleModal({ obj: ejemplarEnPlano, pestana });
      return;
    }
    const cat = catalogoPorCodigo[idOCodigo];
    if (cat) {
      setDetalleModal({
        obj: {
          id: `${cat.codigo}-01`,
          codigo: cat.codigo,
          etiqueta: cat.tipo,
          x: 0,
          y: 0,
          ancho: cat.ancho,
          fondo: cat.fondo,
          alto: cat.alto,
          rotacion: 0,
          orden: 0,
          modelo3D: cat.modelo3D,
        },
        pestana,
      });
    }
  };

  const handleGuardarPlano = async () => {
    if (!linea) return;
    const guardada = await guardarLinea(linea);
    setLinea(guardada);
    setSinGuardar(false);
    const lista = await getLineas();
    setLineas(lista);
    mostrarAviso(
      `Plano ${guardada.id} guardado correctamente (v. ${String(
        guardada.version
      ).padStart(2, "0")})`
    );
  };

  const handleCargarLinea = () => {
    navigate(`/lineas/${lineaSelectId}`);
    cargarLineaPorId(lineaSelectId);
    mostrarAviso(`Objetos de ${lineaSelectId} cargados en el plano`);
  };

  const handleCrearNuevaLinea = async (e) => {
    e.preventDefault();
    const creada = await crearLinea(nuevaLineaForm);
    const lista = await getLineas();
    setLineas(lista);
    setMostrarMisPlanos(false);
    navigate(`/lineas/${creada.id}`);
    cargarLineaPorId(creada.id);
    mostrarAviso(`Nueva línea ${creada.id} creada`);
  };

  const handleRestaurarDemo = async () => {
    const lista = await restaurarLineas();
    setLineas(lista);
    await cargarLineaPorId("L-04");
    setMostrarMenuExtra(false);
    mostrarAviso("Datos de demostración restaurados");
  };

  if (!linea) {
    return <div className="cargando-vista">Cargando línea de producción...</div>;
  }

  const objetoSeleccionado =
    linea.objetos.find((o) => o.id === selectedId) || null;
  const colisiones = idsEnColision(linea.objetos);

  return (
    <main className="contenedor-pagina">
      {mensajeToast && <div className="toast-flotante">{mensajeToast}</div>}

      {/* Encabezado de página */}
      <section className="cabecera-pagina">
        <div>
          <div className="migas-pan">INGENIERÍA / LÍNEAS DE PRODUCCIÓN</div>
          <h1 className="titulo-pagina">Diseña el espacio de tu línea</h1>
          <p className="subtitulo-pagina">
            Agrega mesas, tableros y equipos; organiza su distribución y el
            recorrido de la línea.
          </p>
        </div>

        <div className="acciones-pagina">
          <button
            type="button"
            className="btn-blanco"
            onClick={() => setMostrarMisPlanos(true)}
          >
            Mis planos
          </button>
          <button
            type="button"
            className="btn-guardar-azul"
            onClick={handleGuardarPlano}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Guardar plano
          </button>
          <div className="menu-extra-wrapper">
            <button
              type="button"
              className="btn-mas-opciones"
              onClick={() => setMostrarMenuExtra(!mostrarMenuExtra)}
              title="Más opciones"
            >
              •••
            </button>
            {mostrarMenuExtra && (
              <div className="dropdown-menu-extra">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarMenuExtra(false);
                    setMostrarMisPlanos(true);
                  }}
                >
                  + Crear nueva línea industrial
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarMenuExtra(false);
                    if (objetoSeleccionado) {
                      handleAbrirMaterial(objetoSeleccionado.id, "3d");
                    } else if (linea.objetos[0]) {
                      handleAbrirMaterial(linea.objetos[0].id, "3d");
                    }
                  }}
                >
                  Ver material seleccionado en 3D
                </button>
                <button type="button" onClick={handleRestaurarDemo}>
                  Restaurar datos originales del prototipo
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Barra superior de selección de línea y contexto de planta */}
      <section className="barra-contexto-linea">
        <div className="bloque-selector-linea">
          <label className="label-contexto">Línea de producción</label>
          <div className="fila-selector-controles">
            <div className="select-con-lupa">
              <svg
                className="icono-lupa-select"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#475569"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <select
                value={lineaSelectId}
                onChange={(e) => {
                  const nuevoId = e.target.value;
                  setLineaSelectId(nuevoId);
                  navigate(`/lineas/${nuevoId}`);
                  cargarLineaPorId(nuevoId);
                }}
              >
                {lineas.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} · {l.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn-cargar-objetos"
              onClick={handleCargarLinea}
            >
              Cargar objetos
            </button>
          </div>
        </div>

        <div className="separador-vertical" />

        <div className="bloque-meta-linea">
          <div className="item-meta-linea">
            <span className="meta-label">PLANTA</span>
            <strong>
              {linea.planta} · {linea.nave}
            </strong>
          </div>
          <div className="item-meta-linea">
            <span className="meta-label">OBJETOS DISPONIBLES</span>
            <strong>{catalogo.length} tipos de mobiliario y equipo</strong>
          </div>
        </div>

        <div className="bloque-estado-version">
          <span
            className={
              sinGuardar ? "pill-estado borrador" : "pill-estado guardado"
            }
          >
            • {sinGuardar ? "Borrador" : "Guardado"}
          </span>
          <span className="texto-version">
            v. {String(linea.version || 1).padStart(2, "0")}
          </span>
        </div>
      </section>

      {/* Área de trabajo de 3 columnas */}
      <section
        className={`grid-trabajo ${
          pantallaCompleta ? "modo-pantalla-completa" : ""
        }`}
      >
        {/* Columna izquierda: Catálogo de Objetos */}
        <ObjetosLinea
          catalogo={catalogo}
          objetos={linea.objetos}
          codigoSeleccionado={objetoSeleccionado?.codigo}
          onAgregar={(codigo) => handleAgregarObjeto(codigo)}
          onVerDetalle={(codigo) => handleAbrirMaterial(codigo, "3d")}
        />

        {/* Columna central: Plano 2D de la línea */}
        <div className="panel panel-centro">
          {/* Cabecera del plano */}
          <div className="plano-cabecera">
            <div>
              <div className="plano-titulo-fila">
                <h3>Plano de la línea</h3>
                <span className="badge-conteo-objetos">
                  {linea.objetos.length} objetos
                </span>
              </div>
              <small className="plano-subtitulo-linea">
                {linea.id} · {linea.nombre}
              </small>
            </div>

            <div className="plano-estado-derecha">
              <span className="indicador-guardado">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M12 7v5l3 3" />
                </svg>
                {sinGuardar ? "Sin guardar" : "Guardado"}
              </span>
              <button
                type="button"
                className="btn-herramienta"
                title="Expandir área del plano"
                onClick={() => setPantallaCompleta(!pantallaCompleta)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Barra de herramientas del plano */}
          <div className="plano-toolbar">
            <div className="toolbar-izq">
              <button
                type="button"
                className={
                  herramienta === "seleccionar"
                    ? "btn-tool activo"
                    : "btn-tool"
                }
                title="Herramienta de selección (Clic en material para ver en 3D)"
                onClick={() => setHerramienta("seleccionar")}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
              </button>
              <button
                type="button"
                className={
                  herramienta === "mano" ? "btn-tool activo" : "btn-tool"
                }
                title="Desplazar vista"
                onClick={() => setHerramienta("mano")}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
              </button>

              <span className="sep-toolbar" />

              <button
                type="button"
                className="btn-tool"
                title="Deshacer"
                onClick={deshacer}
                disabled={historial.length === 0}
              >
                ↶
              </button>
              <button
                type="button"
                className="btn-tool"
                title="Rehacer"
                onClick={rehacer}
                disabled={futuro.length === 0}
              >
                ↷
              </button>

              <span className="sep-toolbar" />

              <label className="switch-cuadricula">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
                <span>Ajustar a cuadrícula</span>
                <input
                  type="checkbox"
                  checked={snap}
                  onChange={(e) => setSnap(e.target.checked)}
                />
                <span className="slider-toggle" />
              </label>
            </div>

            <div className="toolbar-der">
              <div className="zoom-control">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(60, z - 10))}
                >
                  −
                </button>
                <span onClick={() => setZoom(100)} title="Restablecer zoom">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(150, z + 10))}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="btn-tool"
                title="Restablecer vista 100%"
                onClick={() => setZoom(100)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Lienzo interactivo del plano */}
          <PlanoLinea
            linea={linea}
            catalogoPorCodigo={catalogoPorCodigo}
            selectedId={selectedId}
            zoom={zoom}
            snap={snap}
            herramienta={herramienta}
            onSelect={setSelectedId}
            onAbrirMaterial={(id) => handleAbrirMaterial(id, "3d")}
            onMover={handleMoverObjeto}
            onSoltarCatalogo={(codigo, x, y) =>
              handleAgregarObjeto(codigo, x, y)
            }
            onCambiarTipoRecorrido={(tipo) =>
              setLinea({ ...linea, tipoRecorrido: tipo, estado: "Borrador" })
            }
          />

          {/* Barra de estado inferior del plano */}
          <div className="plano-barra-inferior">
            <div className="estado-sel-izq">
              <i className="cuadro-azul-estado" />
              <strong>
                {objetoSeleccionado
                  ? "1 objeto seleccionado"
                  : "Ningún objeto seleccionado"}
              </strong>
            </div>
            <span>Escala: 1 m = 48 px</span>
            <span>Cuadrícula: 0.50 m</span>
            {colisiones.size === 0 ? (
              <span className="estado-colision ok">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.3"
                >
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                Sin superposiciones
              </span>
            ) : (
              <span className="estado-colision alerta">
                ⚠ {colisiones.size} objetos con superposición
              </span>
            )}
          </div>
        </div>

        {/* Columna derecha: Propiedades del objeto seleccionado */}
        <PropiedadesObjeto
          objeto={objetoSeleccionado}
          catalogo={
            objetoSeleccionado
              ? catalogoPorCodigo[objetoSeleccionado.codigo]
              : null
          }
          linea={linea}
          onCambiar={handleCambiarPropiedad}
          onCambiarOrden={handleCambiarOrden}
          onEliminar={handleEliminarObjeto}
          onVerDetalle={(id, pestana) => handleAbrirMaterial(id, pestana)}
        />
      </section>

      {/* Modal de Vista Ampliada (3D interactivo y descarga de plano) al hacer clic en un material */}
      {detalleModal && (
        <DetalleMaterial
          obj={detalleModal.obj}
          catalogo={catalogoPorCodigo[detalleModal.obj.codigo]}
          linea={linea}
          pestanaInicial={detalleModal.pestana}
          onClose={() => setDetalleModal(null)}
        />
      )}

      {/* Modal "Mis planos" / Crear nueva línea industrial */}
      {mostrarMisPlanos && (
        <div
          className="overlay-zoom"
          onClick={() => setMostrarMisPlanos(false)}
        >
          <div
            className="modal-mis-planos"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detalle-cabecera">
              <div>
                <h3>Mis planos de líneas de producción</h3>
                <small>
                  Selecciona una línea existente o crea una nueva línea
                  industrial con datos de prueba.
                </small>
              </div>
              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={() => setMostrarMisPlanos(false)}
              >
                ✕
              </button>
            </div>

            <div className="mis-planos-cuerpo">
              <div className="lista-planos-guardados">
                <h4>Líneas registradas</h4>
                {lineas.map((l) => (
                  <div
                    key={l.id}
                    className={`item-linea-guardada ${
                      l.id === linea.id ? "activa" : ""
                    }`}
                    onClick={() => {
                      setMostrarMisPlanos(false);
                      navigate(`/lineas/${l.id}`);
                      cargarLineaPorId(l.id);
                    }}
                  >
                    <div>
                      <strong>
                        {l.id} · {l.nombre}
                      </strong>
                      <small>
                        {l.planta} · {l.nave} · {l.totalObjetos ?? "—"} objetos
                      </small>
                    </div>
                    <div className="meta-der-item">
                      <span
                        className={
                          l.estado === "Borrador"
                            ? "pill-estado borrador"
                            : "pill-estado guardado"
                        }
                      >
                        • {l.estado}
                      </span>
                      <small>v. {String(l.version || 1).padStart(2, "0")}</small>
                    </div>
                  </div>
                ))}
              </div>

              <form
                className="form-nueva-linea"
                onSubmit={handleCrearNuevaLinea}
              >
                <h4>Crear nueva línea industrial</h4>
                <label>
                  Código de línea
                  <input
                    type="text"
                    required
                    value={nuevaLineaForm.id}
                    onChange={(e) =>
                      setNuevaLineaForm({
                        ...nuevaLineaForm,
                        id: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Nombre del proceso
                  <input
                    type="text"
                    required
                    value={nuevaLineaForm.nombre}
                    onChange={(e) =>
                      setNuevaLineaForm({
                        ...nuevaLineaForm,
                        nombre: e.target.value,
                      })
                    }
                  />
                </label>
                <div className="grid-2-prop">
                  <label>
                    Planta
                    <input
                      type="text"
                      value={nuevaLineaForm.planta}
                      onChange={(e) =>
                        setNuevaLineaForm({
                          ...nuevaLineaForm,
                          planta: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Nave
                    <input
                      type="text"
                      value={nuevaLineaForm.nave}
                      onChange={(e) =>
                        setNuevaLineaForm({
                          ...nuevaLineaForm,
                          nave: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <button type="submit" className="btn-guardar-azul ancho-100">
                  + Crear línea y abrir plano
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}