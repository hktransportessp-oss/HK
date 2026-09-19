import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const averbePortoUrl =
    process.env.AVERBEPORTO_API_URL ?? "https://apis.averbeporto.com.br/php/conn.php";
  const averbePortoCompany = process.env.AVERBEPORTO_COMPANY ?? "5";

  function isInternalRequest(req: express.Request) {
    const configuredKey = process.env.HK_INTERNAL_API_KEY;
    return Boolean(configuredKey && req.header("x-internal-api-key") === configuredKey);
  }

  // Tests the official AverbePorto API login without exposing credentials or session cookies.
  app.post("/api/v1/averbeporto/test-connection", async (req, res) => {
    if (!isInternalRequest(req)) {
      return res.status(401).json({ success: false, error: "Não autorizado." });
    }

    const user =
      process.env.AVERBE_PORTO_API_USUARIO ?? process.env.AVERBEPORTO_API_USER;
    const pass =
      process.env.AVERBE_PORTO_API_SENHA ?? process.env.AVERBEPORTO_API_PASSWORD;
    if (!user || !pass) {
      return res.status(503).json({
        success: false,
        error: "Credenciais da API AverbePorto não configuradas no backend.",
      });
    }

    try {
      const body = new URLSearchParams({
        mod: "login",
        comp: averbePortoCompany,
        user,
        pass,
      });
      const response = await fetch(averbePortoUrl, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "user-agent": "Mozilla/5.0 HK-Fleet-Forge/1.0",
        },
        body,
        signal: AbortSignal.timeout(15_000),
      });
      const payload = (await response.json()) as {
        success?: number;
        logout?: number;
        error?: { code?: string; msg?: string };
      };

      if (!response.ok || payload.logout || payload.success !== 1) {
        return res.status(502).json({
          success: false,
          connected: false,
          error: payload.error?.msg ?? "Falha na autenticação AverbePorto.",
          providerStatus: response.status,
        });
      }

      const sessionCookie = response.headers.get("set-cookie")?.includes("portal[ses]");
      return res.json({
        success: true,
        connected: sessionCookie,
        providerStatus: response.status,
        message: sessionCookie
          ? "Autenticação AverbePorto realizada com sucesso."
          : "A API respondeu, mas não retornou a sessão esperada.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro de comunicação.";
      return res.status(502).json({ success: false, connected: false, error: message });
    }
  });

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "HK Connect", time: new Date().toISOString() });
  });

  // API: Mock / Driver Sync / Romaneio audit status endpoint
  app.post("/api/sync", (req, res) => {
    res.json({
      success: true,
      syncedAt: new Date().toISOString(),
      message: "Dados sincronizados com o servidor HK Transportes com sucesso.",
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
