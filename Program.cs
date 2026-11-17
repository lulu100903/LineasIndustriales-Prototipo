using LineasIndustriales.Data;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Datos falsos en memoria (prototipo, no hay base de datos)
builder.Services.AddSingleton<AlmacenLineas>();

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

var app = builder.Build();

app.MapControllers();

// Sirve el build de React (ClientApp/build) si existe
var spaPath = Path.Combine(app.Environment.ContentRootPath, "ClientApp", "build");
if (Directory.Exists(spaPath))
{
    var fp = new PhysicalFileProvider(spaPath);
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = fp });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = fp });
    app.MapFallbackToFile("index.html", new StaticFileOptions { FileProvider = fp });
}

app.Run();
