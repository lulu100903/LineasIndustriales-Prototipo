using LineasIndustriales.Data;
using LineasIndustriales.Models;
using Microsoft.AspNetCore.Mvc;

namespace LineasIndustriales.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LineasController : ControllerBase
{
    private readonly AlmacenLineas _almacen;

    public LineasController(AlmacenLineas almacen)
    {
        _almacen = almacen;
    }

    // GET api/lineas
    [HttpGet]
    public IActionResult Listar()
    {
        var lista = _almacen.Listar().Select(l => new
        {
            l.Id,
            l.Nombre,
            l.Planta,
            l.Nave,
            l.Ancho,
            l.Fondo,
            l.Estado,
            l.Version,
            l.TipoRecorrido,
            TotalObjetos = l.Objetos.Count
        });
        return Ok(lista);
    }

    // GET api/lineas/L-04
    [HttpGet("{id}")]
    public IActionResult Obtener(string id)
    {
        var linea = _almacen.Obtener(id);
        return linea is null ? NotFound() : Ok(linea);
    }

    // POST api/lineas
    [HttpPost]
    public IActionResult Crear([FromBody] Linea nueva)
    {
        var creada = _almacen.Crear(nueva);
        return Ok(creada);
    }

    // PUT api/lineas/L-04
    [HttpPut("{id}")]
    public IActionResult Guardar(string id, [FromBody] Linea linea)
    {
        if (_almacen.Obtener(id) is null) return NotFound();
        var guardada = _almacen.Guardar(linea with { Id = id });
        return Ok(guardada);
    }

    // POST api/lineas/restaurar
    [HttpPost("restaurar")]
    public IActionResult Restaurar()
    {
        _almacen.CargarDatosIniciales();
        return Ok(_almacen.Listar());
    }
}
