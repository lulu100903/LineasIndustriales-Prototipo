import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Caja({ p, s, c, r = [0, 0, 0], opacidad = 1, metal = 0.2, rugosidad = 0.5, wireframe = false }) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial
        color={c}
        roughness={rugosidad}
        metalness={metal}
        transparent={opacidad < 1}
        opacity={opacidad}
        wireframe={wireframe}
      />
    </mesh>
  );
}

function Cilindro({ p, args, c, r = [0, 0, 0], metal = 0.3, wireframe = false }) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={c} roughness={0.45} metalness={metal} wireframe={wireframe} />
    </mesh>
  );
}

function RuedaIndustrial({ p, wireframe }) {
  return (
    <group position={p}>
      {/* Horquilla metálica */}
      <Caja p={[0, 0.055, 0]} s={[0.06, 0.05, 0.06]} c="#64748b" metal={0.6} wireframe={wireframe} />
      {/* Rueda de poliuretano */}
      <Cilindro
        p={[0, 0, 0]}
        r={[0, 0, Math.PI / 2]}
        args={[0.055, 0.055, 0.04, 20]}
        c="#1e293b"
        wireframe={wireframe}
      />
      {/* Rin central */}
      <Cilindro
        p={[0, 0, 0]}
        r={[0, 0, Math.PI / 2]}
        args={[0.025, 0.025, 0.044, 16]}
        c="#3b82f6"
        wireframe={wireframe}
      />
    </group>
  );
}

// Modelo 3D detallado según el tipo de equipo seleccionado
function ModeloIndustrial({ obj, catalogo, color, wireframe, autoGirar }) {
  const groupRef = useRef();
  const w = Number(obj.ancho) || 2.0;
  const d = Number(obj.fondo) || 1.0;
  const h = Number(obj.alto) || 1.2;
  const tipo = obj.modelo3D || catalogo?.modelo3D || "mesa";

  useFrame((_, delta) => {
    if (autoGirar && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  // 1. TABLERO DE ENSAMBLE DE ARNESES (Bastidor móvil con tablero inclinado y ruteo de cables)
  if (tipo === "tablero") {
    const patasX = w / 2 - 0.1;
    const patasZ = d / 2 - 0.12;
    return (
      <group ref={groupRef}>
        {/* Ruedas industriales */}
        {[
          [-patasX, 0.055, -patasZ],
          [patasX, 0.055, -patasZ],
          [-patasX, 0.055, patasZ],
          [patasX, 0.055, patasZ],
        ].map((pos, i) => (
          <RuedaIndustrial key={i} p={pos} wireframe={wireframe} />
        ))}

        {/* Base tubular H */}
        <Caja p={[-patasX, 0.14, 0]} s={[0.06, 0.06, d - 0.16]} c="#334155" metal={0.5} wireframe={wireframe} />
        <Caja p={[patasX, 0.14, 0]} s={[0.06, 0.06, d - 0.16]} c="#334155" metal={0.5} wireframe={wireframe} />
        <Caja p={[0, 0.14, 0]} s={[w - 0.16, 0.05, 0.06]} c="#334155" metal={0.5} wireframe={wireframe} />

        {/* Charola inferior para herramientas y conectores */}
        <Caja p={[0, 0.28, 0.05]} s={[w - 0.24, 0.03, d * 0.55]} c="#475569" wireframe={wireframe} />

        {/* Columnas verticales de soporte */}
        <Caja p={[-patasX, h * 0.48, 0]} s={[0.06, h * 0.72, 0.06]} c="#475569" metal={0.5} wireframe={wireframe} />
        <Caja p={[patasX, h * 0.48, 0]} s={[0.06, h * 0.72, 0.06]} c="#475569" metal={0.5} wireframe={wireframe} />

        {/* Panel inclinado de ruteo de arnés */}
        <group position={[0, h * 0.68, 0]} rotation={[0.38, 0, 0]}>
          {/* Marco de aluminio */}
          <Caja p={[0, 0, 0]} s={[w, h * 0.56, 0.05]} c={color} wireframe={wireframe} />
          {/* Superficie blanca de trabajo */}
          <Caja p={[0, 0, 0.03]} s={[w - 0.1, h * 0.5, 0.02]} c="#f8fafc" rugosidad={0.3} wireframe={wireframe} />

          {/* Ruteo simulado del arnés eléctrico sobre el tablero */}
          <Caja p={[0, 0.02, 0.05]} s={[w * 0.72, 0.035, 0.02]} c="#1e293b" wireframe={wireframe} />
          <Caja p={[-w * 0.22, 0.12, 0.05]} s={[0.03, h * 0.22, 0.02]} c="#2563eb" wireframe={wireframe} />
          <Caja p={[0, -0.1, 0.05]} s={[0.03, h * 0.2, 0.02]} c="#dc2626" wireframe={wireframe} />
          <Caja p={[w * 0.22, 0.1, 0.05]} s={[0.03, h * 0.24, 0.02]} c="#16a34a" wireframe={wireframe} />

          {/* Clavijas / postes guía de arnés */}
          {[
            [-w * 0.34, 0.02],
            [-w * 0.22, 0.02],
            [-w * 0.22, 0.2],
            [0, 0.02],
            [0, -0.18],
            [w * 0.22, 0.02],
            [w * 0.22, 0.2],
            [w * 0.34, 0.02],
          ].map(([px, py], idx) => (
            <Cilindro
              key={idx}
              p={[px, py, 0.075]}
              r={[Math.PI / 2, 0, 0]}
              args={[0.018, 0.018, 0.07, 12]}
              c="#f59e0b"
              wireframe={wireframe}
            />
          ))}
        </group>
      </group>
    );
  }

  // 2. RACK DE HERRAMIENTAS Y CONTENEDORES
  if (tipo === "rack") {
    const niveles = [0.12, h * 0.36, h * 0.64, h * 0.92];
    const px = w / 2 - 0.04;
    const pz = d / 2 - 0.04;
    return (
      <group ref={groupRef}>
        {/* 4 postes esquineros */}
        {[
          [-px, -pz],
          [px, -pz],
          [-px, pz],
          [px, pz],
        ].map(([x, z], i) => (
          <Caja key={i} p={[x, h / 2, z]} s={[0.06, h, 0.06]} c="#78350f" metal={0.4} wireframe={wireframe} />
        ))}

        {/* Entrepaños */}
        {niveles.map((ny, i) => (
          <Caja key={`n-${i}`} p={[0, ny, 0]} s={[w, 0.04, d]} c="#d97706" wireframe={wireframe} />
        ))}

        {/* Contenedores / gavetas industriales */}
        <Caja p={[-w * 0.23, niveles[1] + 0.11, 0]} s={[w * 0.36, 0.18, d * 0.72]} c="#2563eb" wireframe={wireframe} />
        <Caja p={[w * 0.23, niveles[1] + 0.11, 0]} s={[w * 0.36, 0.18, d * 0.72]} c="#2563eb" wireframe={wireframe} />
        <Caja p={[-w * 0.23, niveles[2] + 0.11, 0]} s={[w * 0.36, 0.18, d * 0.72]} c="#dc2626" wireframe={wireframe} />
        <Caja p={[w * 0.23, niveles[2] + 0.11, 0]} s={[w * 0.36, 0.18, d * 0.72]} c="#16a34a" wireframe={wireframe} />
        <Caja p={[0, niveles[3] + 0.1, 0]} s={[w * 0.55, 0.16, d * 0.65]} c="#475569" wireframe={wireframe} />
      </group>
    );
  }

  // 3. CARRO DE TRANSPORTE DE MATERIAL
  if (tipo === "carro") {
    const px = w / 2 - 0.1;
    const pz = d / 2 - 0.1;
    return (
      <group ref={groupRef}>
        {[
          [-px, 0.055, -pz],
          [px, 0.055, -pz],
          [-px, 0.055, pz],
          [px, 0.055, pz],
        ].map((pos, i) => (
          <RuedaIndustrial key={i} p={pos} wireframe={wireframe} />
        ))}

        {/* Charola inferior y superior con bordes */}
        <Caja p={[0, 0.2, 0]} s={[w, 0.05, d]} c={color} wireframe={wireframe} />
        <Caja p={[0, h * 0.62, 0]} s={[w, 0.05, d]} c={color} wireframe={wireframe} />

        {/* Postes esquineros */}
        {[
          [-px, -pz],
          [px, -pz],
          [-px, pz],
          [px, pz],
        ].map(([x, z], i) => (
          <Caja key={i} p={[x, h * 0.42, z]} s={[0.045, h * 0.5, 0.045]} c="#475569" metal={0.5} wireframe={wireframe} />
        ))}

        {/* Maneral ergonómico de empuje */}
        <Caja p={[-px, h * 0.8, -pz]} s={[0.04, h * 0.38, 0.04]} c="#334155" wireframe={wireframe} />
        <Caja p={[-px, h * 0.8, pz]} s={[0.04, h * 0.38, 0.04]} c="#334155" wireframe={wireframe} />
        <Cilindro
          p={[-px, h * 0.96, 0]}
          r={[Math.PI / 2, 0, 0]}
          args={[0.022, 0.022, d - 0.16, 16]}
          c="#1e293b"
          wireframe={wireframe}
        />

        {/* Cajas de material sobre la charola */}
        <Caja p={[-w * 0.18, h * 0.62 + 0.11, 0]} s={[w * 0.38, 0.17, d * 0.65]} c="#3b82f6" wireframe={wireframe} />
        <Caja p={[w * 0.22, h * 0.62 + 0.09, 0]} s={[w * 0.3, 0.13, d * 0.55]} c="#f59e0b" wireframe={wireframe} />
      </group>
    );
  }

  // 4. MESA DE INSPECCIÓN Y PRUEBA ELÉCTRICA
  if (tipo === "inspeccion") {
    const hMesa = 0.9;
    const px = w / 2 - 0.07;
    const pz = d / 2 - 0.07;
    return (
      <group ref={groupRef}>
        {/* Patas de la estación */}
        {[
          [-px, -pz],
          [px, -pz],
          [-px, pz],
          [px, pz],
        ].map(([x, z], i) => (
          <Caja key={i} p={[x, hMesa / 2, z]} s={[0.065, hMesa, 0.065]} c="#334155" metal={0.4} wireframe={wireframe} />
        ))}

        {/* Cubierta principal y panel acrílico iluminado */}
        <Caja p={[0, hMesa, 0]} s={[w, 0.06, d]} c={color} wireframe={wireframe} />
        <Caja p={[0, hMesa + 0.036, 0.05]} s={[w * 0.82, 0.015, d * 0.68]} c="#e0f2fe" opacidad={0.85} wireframe={wireframe} />

        {/* Pórtico superior con luminaria LED y monitor */}
        <Caja p={[-px, (h + hMesa) / 2, -pz]} s={[0.05, h - hMesa, 0.05]} c="#475569" wireframe={wireframe} />
        <Caja p={[px, (h + hMesa) / 2, -pz]} s={[0.05, h - hMesa, 0.05]} c="#475569" wireframe={wireframe} />
        <Caja p={[0, h - 0.04, -pz + 0.18]} s={[w, 0.05, 0.42]} c="#334155" wireframe={wireframe} />
        {/* Luz LED inferior del pórtico */}
        <Caja p={[0, h - 0.07, -pz + 0.22]} s={[w * 0.85, 0.015, 0.12]} c="#ffffff" wireframe={wireframe} />

        {/* Monitor de prueba y torreta Andon */}
        <Caja p={[-w * 0.25, hMesa + 0.36, -pz + 0.08]} s={[0.44, 0.28, 0.03]} c="#0f172a" wireframe={wireframe} />
        <Caja p={[-w * 0.25, hMesa + 0.36, -pz + 0.1]} s={[0.4, 0.24, 0.01]} c="#38bdf8" wireframe={wireframe} />
        {/* Torreta de estado (Verde / Ámbar / Rojo) */}
        <Cilindro p={[px, h + 0.08, -pz]} args={[0.025, 0.025, 0.16, 14]} c="#16a34a" wireframe={wireframe} />
      </group>
    );
  }

  // 5. MESA DE TRABAJO INDUSTRIAL (MES - Superficie fija ESD)
  const px = w / 2 - 0.07;
  const pz = d / 2 - 0.07;
  return (
    <group ref={groupRef}>
      {/* Patas con niveladores */}
      {[
        [-px, -pz],
        [px, -pz],
        [-px, pz],
        [px, pz],
      ].map(([x, z], i) => (
        <group key={i}>
          <Caja p={[x, (h - 0.06) / 2, z]} s={[0.07, h - 0.06, 0.07]} c="#334155" metal={0.45} wireframe={wireframe} />
          <Cilindro p={[x, 0.015, z]} args={[0.045, 0.045, 0.03, 14]} c="#0f172a" wireframe={wireframe} />
        </group>
      ))}

      {/* Repisa inferior reforzada */}
      <Caja p={[0, 0.24, 0]} s={[w - 0.12, 0.035, d - 0.14]} c="#64748b" wireframe={wireframe} />

      {/* Cubierta superior ESD */}
      <Caja p={[0, h - 0.03, 0]} s={[w, 0.06, d]} c={color} wireframe={wireframe} />
      {/* Tapete antiestático sobre la mesa */}
      <Caja p={[0, h + 0.005, 0.03]} s={[w * 0.88, 0.01, d * 0.78]} c="#10b981" wireframe={wireframe} />

      {/* Cajas de preparación sobre la mesa */}
      <Caja p={[-w * 0.28, h + 0.06, -d * 0.22]} s={[0.28, 0.11, 0.2]} c="#2563eb" wireframe={wireframe} />
      <Caja p={[0, h + 0.05, -d * 0.22]} s={[0.28, 0.09, 0.2]} c="#f59e0b" wireframe={wireframe} />
    </group>
  );
}

// Visor 3D interactivo del material seleccionado
export function Visor3D({ obj, catalogo }) {
  const [autoGirar, setAutoGirar] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [vistaPreset, setVistaPreset] = useState("iso");

  const color = catalogo?.color || "#2563eb";
  const maxLado = Math.max(obj.ancho || 2, obj.fondo || 1, obj.alto || 1, 1.5);
  const dist = maxLado * 1.9 + 1.1;

  const camPos = {
    iso: [dist * 0.85, dist * 0.65, dist * 0.95],
    frontal: [0, obj.alto * 0.65, dist * 1.25],
    superior: [0, dist * 1.45, 0.01],
    lateral: [dist * 1.25, obj.alto * 0.65, 0],
  }[vistaPreset];

  return (
    <div className="visor-3d-wrapper">
      {/* Barra de controles del visor 3D */}
      <div className="visor-3d-controles">
        <div className="grupo-vistas-3d">
          <span className="etiqueta-ctrl-3d">Cámara:</span>
          {[
            { id: "iso", label: "Isométrica" },
            { id: "frontal", label: "Frontal" },
            { id: "superior", label: "Superior" },
            { id: "lateral", label: "Lateral" },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              className={vistaPreset === v.id ? "btn-cam-3d activo" : "btn-cam-3d"}
              onClick={() => setVistaPreset(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="grupo-vistas-3d">
          <button
            type="button"
            className={autoGirar ? "btn-cam-3d activo" : "btn-cam-3d"}
            onClick={() => setAutoGirar(!autoGirar)}
          >
            {autoGirar ? "⟳ Rotación activa" : "⟳ Auto-rotar"}
          </button>
          <button
            type="button"
            className={wireframe ? "btn-cam-3d activo" : "btn-cam-3d"}
            onClick={() => setWireframe(!wireframe)}
          >
            {wireframe ? "Estructura (Malla)" : "Sólido 3D"}
          </button>
        </div>
      </div>

      <div className="visor-3d">
        <Canvas
          key={vistaPreset}
          shadows
          camera={{ position: camPos, fov: 38 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <color attach="background" args={["#f1f5f9"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 10, 6]} intensity={1.0} castShadow />
          <directionalLight position={[-5, 6, -4]} intensity={0.35} />
          <gridHelper
            args={[
              Math.ceil(maxLado * 4),
              Math.ceil(maxLado * 8),
              "#94a3b8",
              "#e2e8f0",
            ]}
            position={[0, 0, 0]}
          />
          <ModeloIndustrial
            obj={obj}
            catalogo={catalogo}
            color={color}
            wireframe={wireframe}
            autoGirar={autoGirar}
          />
          <OrbitControls
            makeDefault
            target={[0, (obj.alto || 1) * 0.45, 0]}
            enableDamping
          />
        </Canvas>

        {/* Tarjeta flotante de cotas 3D */}
        <div className="visor-3d-cotas-badge">
          <div>
            <strong>{obj.id}</strong> · {catalogo?.nombre || obj.etiqueta}
          </div>
          <div>
            Ancho: <b>{Number(obj.ancho).toFixed(2)} m</b> · Fondo:{" "}
            <b>{Number(obj.fondo).toFixed(2)} m</b> · Alto:{" "}
            <b>{Number(obj.alto).toFixed(2)} m</b>
          </div>
        </div>
      </div>

      <div className="visor-3d-pie">
        <span>🖱️ Arrastra con clic izquierdo para rotar 360° · Rueda del mouse para zoom · Clic derecho para desplazar</span>
        <span>Escala 1:1 en metros</span>
      </div>
    </div>
  );
}
