using LineasIndustriales.Data;
using Microsoft.AspNetCore.Mvc;

namespace LineasIndustriales.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogoController : ControllerBase
{
    // GET api/catalogo
    [HttpGet]
    public IActionResult Obtener()
    {
        return Ok(AlmacenLineas.Catalogo);
    }
}
