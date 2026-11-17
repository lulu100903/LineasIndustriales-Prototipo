namespace LineasIndustriales.Models;

// Línea de producción con su plano (distribución de objetos)
public record Linea(
    string Id,
    string Nombre,
    string Planta,
    string Nave,
    double Ancho,
    double Fondo,
    string Estado,
    int Version,
    List<ObjetoLinea> Objetos,
    string TipoRecorrido = "Espiral"
);

// Objeto colocado en el plano. Dimensiones y posición en metros.
// Orden > 0 indica que forma parte del recorrido de la línea.
public record ObjetoLinea(
    string Id,
    string Codigo,
    string Etiqueta,
    double X,
    double Y,
    double Ancho,
    double Fondo,
    double Alto,
    int Rotacion,
    int Orden,
    string Rol = ""
);
