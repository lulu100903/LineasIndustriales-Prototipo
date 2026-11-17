using LineasIndustriales.Models;

namespace LineasIndustriales.Data;

// Almacén en memoria con datos falsos. Reemplazar por EF/SQL cuando se conecte a la base real.
public class AlmacenLineas
{
    private readonly object _lock = new();
    private readonly Dictionary<string, Linea> _lineas = new();

    public static readonly List<CatalogoObjeto> Catalogo = new()
    {
        new(
            "TAB",
            "Tablero de ensamble",
            "Tablero móvil",
            "Mobiliario y equipo",
            "Tablero de ruteo y ensamble de arneses con bastidor tubular, clavijas guía y rieles de desplazamiento.",
            "#2563eb",
            2.0,
            1.0,
            1.65,
            "tablero",
            "Perfil de aluminio anodizado y MDF fenólico",
            "68 kg",
            "180 kg",
            "DAWS-STD-TAB-04"
        ),
        new(
            "MES",
            "Mesa de trabajo",
            "Superficie fija",
            "Mobiliario y equipo",
            "Mesa industrial de superficie fija con cubierta ESD antiestática, repisa inferior y niveladores.",
            "#059669",
            2.0,
            1.0,
            0.90,
            "mesa",
            "Acero al carbón calibre 14 con cubierta laminada ESD",
            "54 kg",
            "350 kg",
            "DAWS-STD-MES-01"
        ),
        new(
            "RAC",
            "Rack de herramientas",
            "Almacenamiento",
            "Mobiliario y equipo",
            "Rack modular de 4 niveles con contenedores plásticos para conectores, terminales y cintas.",
            "#b45309",
            1.0,
            1.2,
            1.90,
            "rack",
            "Acero estructural pintado al horno",
            "62 kg",
            "450 kg",
            "DAWS-STD-RAC-02"
        ),
        new(
            "CAR",
            "Carro de transporte",
            "Equipo móvil",
            "Mobiliario y equipo",
            "Carro abastecedor con 4 ruedas giratorias de poliuretano con freno y maneral ergonómico.",
            "#7c3aed",
            1.2,
            0.8,
            0.95,
            "carro",
            "Tubo estructural de acero y charolas galvanizadas",
            "32 kg",
            "220 kg",
            "DAWS-STD-CAR-03"
        ),
        new(
            "INS",
            "Mesa de inspección",
            "Control de calidad",
            "Mobiliario y equipo",
            "Estación de prueba eléctrica y control de calidad con luminaria LED superior y pantalla de verificación.",
            "#0284c7",
            1.8,
            1.0,
            1.75,
            "inspeccion",
            "Acero inoxidable y cubierta acrílica iluminada",
            "75 kg",
            "250 kg",
            "DAWS-STD-INS-05"
        ),
    };

    public AlmacenLineas()
    {
        CargarDatosIniciales();
    }

    public void CargarDatosIniciales()
    {
        lock (_lock)
        {
            _lineas.Clear();

            var l04 = new Linea(
                "L-04",
                "Ensamble de arneses",
                "Durango",
                "Nave 02",
                16,
                8,
                "Borrador",
                1,
                new List<ObjetoLinea>
                {
                    new("MES-01", "MES", "Preparación", 0.50, 0.85, 2.0, 1.0, 0.90, 0, 0, "inicio"),
                    new("TAB-01", "TAB", "Tablero móvil", 4.25, 1.00, 2.0, 1.0, 1.65, 0, 1),
                    new("TAB-02", "TAB", "Tablero móvil", 8.75, 1.00, 2.0, 1.0, 1.65, 0, 2),
                    new("TAB-03", "TAB", "Tablero móvil", 13.00, 3.25, 2.0, 1.0, 1.65, 90, 3),
                    new("TAB-04", "TAB", "Tablero móvil", 8.75, 6.00, 2.0, 1.0, 1.65, 0, 4),
                    new("TAB-05", "TAB", "Tablero móvil", 2.00, 4.00, 2.0, 1.0, 1.65, 90, 5),
                    new("TAB-06", "TAB", "Tablero móvil", 6.75, 2.85, 2.0, 1.0, 1.65, 0, 6),
                    new("RAC-01", "RAC", "Rack", 4.40, 4.45, 1.0, 1.2, 1.90, 0, 0),
                    new("MES-02", "MES", "Salida / revisión", 6.25, 4.65, 2.0, 1.0, 0.90, 0, 0, "fin"),
                },
                "Espiral"
            );

            var l02 = new Linea(
                "L-02",
                "Corte y preparación",
                "Durango",
                "Nave 01",
                16,
                8,
                "Guardado",
                3,
                new List<ObjetoLinea>
                {
                    new("MES-01", "MES", "Recepción de cable", 1.00, 1.50, 2.0, 1.0, 0.90, 0, 0, "inicio"),
                    new("TAB-01", "TAB", "Subensamble A", 4.50, 1.50, 2.0, 1.0, 1.65, 0, 1),
                    new("TAB-02", "TAB", "Subensamble B", 8.50, 1.50, 2.0, 1.0, 1.65, 0, 2),
                    new("INS-01", "INS", "Inspección dimensional", 12.50, 1.50, 1.8, 1.0, 1.75, 0, 3),
                    new("RAC-01", "RAC", "Terminales y sellos", 4.50, 4.50, 1.0, 1.2, 1.90, 0, 0),
                    new("CAR-01", "CAR", "Abastecimiento", 7.50, 4.75, 1.2, 0.8, 0.95, 0, 0),
                    new("MES-02", "MES", "Empaque intermedio", 11.50, 4.50, 2.0, 1.0, 0.90, 0, 0, "fin"),
                },
                "Lineal"
            );

            var l07 = new Linea(
                "L-07",
                "Pruebas eléctricas y clipado",
                "Durango",
                "Nave 02",
                16,
                8,
                "Guardado",
                2,
                new List<ObjetoLinea>
                {
                    new("MES-01", "MES", "Ingreso de lote", 1.00, 1.00, 2.0, 1.0, 0.90, 0, 0, "inicio"),
                    new("TAB-01", "TAB", "Clipado frontal", 4.50, 1.00, 2.0, 1.0, 1.65, 0, 1),
                    new("INS-01", "INS", "Prueba continuidad 01", 8.50, 1.00, 1.8, 1.0, 1.75, 0, 2),
                    new("INS-02", "INS", "Prueba continuidad 02", 12.00, 1.00, 1.8, 1.0, 1.75, 0, 3),
                    new("CAR-01", "CAR", "Retorno de racks", 12.25, 4.50, 1.2, 0.8, 0.95, 0, 4),
                    new("RAC-01", "RAC", "Refacciones y clips", 4.50, 4.25, 1.0, 1.2, 1.90, 0, 0),
                    new("MES-02", "MES", "Liberación calidad", 7.50, 4.50, 2.0, 1.0, 0.90, 0, 0, "fin"),
                },
                "Espiral"
            );

            _lineas[l04.Id] = l04;
            _lineas[l02.Id] = l02;
            _lineas[l07.Id] = l07;
        }
    }

    public List<Linea> Listar()
    {
        lock (_lock) return _lineas.Values.OrderBy(l => l.Id).ToList();
    }

    public Linea? Obtener(string id)
    {
        lock (_lock) return _lineas.TryGetValue(id, out var l) ? l : null;
    }

    public Linea Guardar(Linea linea)
    {
        lock (_lock)
        {
            var guardada = linea with { Estado = "Guardado", Version = linea.Version + 1 };
            _lineas[guardada.Id] = guardada;
            return guardada;
        }
    }

    public Linea Crear(Linea nueva)
    {
        lock (_lock)
        {
            var id = string.IsNullOrWhiteSpace(nueva.Id)
                ? $"L-0{_lineas.Count + 5}"
                : nueva.Id.Trim().ToUpperInvariant();

            var linea = nueva with
            {
                Id = id,
                Ancho = nueva.Ancho > 0 ? nueva.Ancho : 16,
                Fondo = nueva.Fondo > 0 ? nueva.Fondo : 8,
                Estado = "Borrador",
                Version = 1,
                Objetos = nueva.Objetos ?? new List<ObjetoLinea>()
            };
            _lineas[linea.Id] = linea;
            return linea;
        }
    }
}
