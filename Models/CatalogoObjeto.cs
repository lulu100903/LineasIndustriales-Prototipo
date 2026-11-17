namespace LineasIndustriales.Models;

// Tipo de material/mobiliario disponible para agregar a una línea
public record CatalogoObjeto(
    string Codigo,
    string Nombre,
    string Tipo,
    string Categoria,
    string Descripcion,
    string Color,
    double Ancho,
    double Fondo,
    double Alto,
    string Modelo3D,
    string MaterialPrincipal = "Acero estructural recubierto",
    string PesoKg = "45 kg",
    string CapacidadCarga = "150 kg",
    string Norma = "NOM-001-STPS / ISO 9001"
);
