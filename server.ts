import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./server/db.js";
import { seedInitialData } from "./server/models/index.js";
import { apiRouter } from "./server/routes/api.js";

dotenv.config({ override: true });

async function startServer() {
  // Connect to the database (MongoDB or local JSON fallback)
  await connectDB();

  // Populate product catalog with seeded values if empty
  await seedInitialData();

  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount API Router
  app.use("/api", apiRouter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "ShopSphere API" });
  });

  // Vite middleware for development, or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("⚡ Vite development server attached as middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("📂 Serving compiled production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ShopSphere running smoothly at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("🔥 Server failed to start:", err);
});
