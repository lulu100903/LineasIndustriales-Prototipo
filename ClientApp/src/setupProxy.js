const { createProxyMiddleware } = require("http-proxy-middleware");

// En desarrollo, las llamadas /api se envían al backend ASP.NET (dotnet run)
const target = process.env.API_URL || "http://localhost:5080";

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target,
      changeOrigin: true,
    })
  );
};
