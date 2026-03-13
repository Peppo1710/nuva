import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import medicalRoutes from "./routes/medical";
import medicationsRoutes from "./routes/medications";
import aiRoutes from "./routes/ai";
import remindersRoutes from "./routes/reminders";
import { runStartupChecks } from "./utils/dbCheck";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  })
);

app.use(express.json({ limit: "20mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  const { method, url } = req;
  const userId = req.headers["x-user-id"] || "anonymous";

  console.log(`→ ${method} ${url} [user: ${userId}]`);

  res.on("finish", () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const tag = status >= 400 ? "✗" : "✓";
    console.log(`${tag} ${method} ${url} ${status} (${ms}ms)`);
  });

  next();
});

app.get("/health", (_req, res) => {
  const mem = process.memoryUsage();
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "nuva-api",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime_seconds: Math.floor(process.uptime()),
    memory_mb: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heap_used: Math.round(mem.heapUsed / 1024 / 1024),
      heap_total: Math.round(mem.heapTotal / 1024 / 1024),
    },
  });
});

app.use("/v1/auth", authRoutes);
app.use("/v1/user/profile", profileRoutes);
app.use("/v1/medical", medicalRoutes);
app.use("/v1/medications", medicationsRoutes);
app.use("/v1/ai", aiRoutes);
app.use("/v1/reminders", remindersRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
);

app.listen(Number(PORT), "0.0.0.0", async () => {
  console.log(`Nuva API running on http://0.0.0.0:${PORT}`);
  await runStartupChecks();
});

export default app;
