import express from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { AdminError, authStatus, changePassword, contentHealth, createEnquiry, deleteImage, listEnquiries, listImages, login, logout, readContent, readImage, readPublishedContent, recoverContent, requireAdmin, requireSameOrigin, saveContent, updateEnquiry, uploadImage } from "./services/admin-store.js";
import { initializeDatabase } from "./db.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use((req, res, next) => {
  const origin = req.get("Origin");
  const allowedOrigins = (process.env.ADMIN_FRONTEND_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.vary("Origin");
  }
  if (req.method === "OPTIONS") return res.sendStatus(origin && allowedOrigins.includes(origin) ? 204 : 403);
  next();
});
app.use("/api", express.raw({ type: () => true, limit: "6mb" }));

function toWebRequest(req) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
  }
  const host = req.headers.host || "127.0.0.1:8787";
  return new Request(`${req.protocol}://${host}${req.originalUrl}`, { method: req.method, headers });
}

function sendError(res, error, invalidMessage = "Мэдээллээ шалгана уу.") {
  if (error instanceof AdminError) return res.status(error.status).json({ error: error.message });
  if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues[0]?.message || invalidMessage });
  console.error("Circus API error", error);
  return res.status(500).json({ error: "Хүсэлтийг гүйцэтгэхэд алдаа гарлаа. Дахин оролдоно уу." });
}
async function body(req) {
  const text = req.body?.toString("utf8") ?? "";
  if (text.length > 1024 * 1024) throw new AdminError(413, "Хүсэлтийн хэмжээ хэтэрсэн.");
  try { return JSON.parse(text); } catch { throw new AdminError(400, "Хүсэлтийн бүтэц буруу байна."); }
}
app.get("/", (_req, res) => res.json({ service: "UB Circus API", status: "ok" }));
app.get("/api/content", async (_req, res) => {
  try { res.json(await readPublishedContent()); } catch (error) { sendError(res, error); }
});
app.post("/api/enquiries", async (req, res) => {
  try {
    const request = toWebRequest(req);
    requireSameOrigin(request);
    if (!req.is("application/json")) throw new AdminError(415, "JSON хүсэлт шаардлагатай.");
    if (req.body.length > 16000) throw new AdminError(413, "Хүсэлтийн хэмжээ хэтэрсэн.");
    res.status(201).json(await createEnquiry(JSON.parse(req.body.toString("utf8"))));
  } catch (error) { sendError(res, error); }
});
app.get("/api/media/:id", async (req, res) => {
  try {
    const image = await readImage(req.params.id);
    res.setHeader("Content-Type", image.type);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(image.bytes);
  } catch (error) {
    if (error instanceof AdminError) return res.status(error.status).send(error.message);
    return res.status(500).send("Зураг уншиж чадсангүй.");
  }
});
app.all("/api/admin/*path", async (req, res) => {
  try {
    const request = toWebRequest(req);
    const action = Array.isArray(req.params.path) ? req.params.path.join("/") : req.params.path;
    if (req.method !== "GET") requireSameOrigin(request);
    if (action === "status" && req.method === "GET") return res.json(await authStatus(request));
    if ((action === "login" || action === "setup") && req.method === "POST") {
      if (!req.is("application/json")) throw new AdminError(415, "JSON хүсэлт шаардлагатай.");
      const input = z.object({ email: z.string().trim().toLowerCase().email().max(150), password: z.string().min(8).max(200), setupCode: z.string().max(300).optional() }).parse(await body(req));
      const result = await login(request, input.email, input.password, action === "setup", input.setupCode || "");
      res.setHeader("Set-Cookie", result.cookie);
      return res.json({ email: result.email });
    }
    if (action === "logout" && req.method === "POST") {
      await logout(request);
      res.setHeader("Set-Cookie", `ub_admin=; HttpOnly; SameSite=${req.secure ? "None; Secure" : "Strict"}; Path=/; Max-Age=0`);
      return res.json({ ok: true });
    }
    await requireAdmin(request);
    if (action === "content-health" && req.method === "GET") return res.json(await contentHealth());
    if (action === "content-recover" && req.method === "POST") return res.json(await recoverContent());
    if (action === "enquiries" && req.method === "GET") return res.json(await listEnquiries());
    if (action === "enquiries" && req.method === "PUT") return res.json(await updateEnquiry(await body(req)));
    if (action === "content" && req.method === "GET") return res.json(await readContent());
    if (action === "content" && req.method === "PUT") return res.json(await saveContent(await body(req)));
    if (action === "media" && req.method === "GET") return res.json(await listImages());
    const mediaDelete = action.match(/^media\/([a-f0-9-]+\.(?:jpg|png|webp))$/);
    if (mediaDelete && req.method === "DELETE") return res.json(await deleteImage(mediaDelete[1]));
    if (action === "media" && req.method === "POST") {
    if (!req.is("multipart/form-data")) throw new AdminError(415, "Зураг оруулна уу.");
      const boundary = req.headers["content-type"].match(/boundary=(?:"([^"]+)"|([^;]+))/)?.slice(1).find(Boolean);
      if (!boundary) throw new AdminError(400, "Зураг оруулна уу.");
      const raw = req.body;
      const marker = Buffer.from(`--${boundary}`);
      let file;
      for (const part of raw.toString("latin1").split(marker.toString("latin1"))) {
        const split = part.indexOf("\r\n\r\n");
        if (split < 0 || !part.slice(0, split).includes('name="file"')) continue;
        const header = part.slice(0, split);
        const name = header.match(/filename="([^"]*)"/)?.[1] ?? "upload";
        const type = header.match(/Content-Type:\s*([^\r\n]+)/i)?.[1] ?? "application/octet-stream";
        let bytes = Buffer.from(part.slice(split + 4), "latin1");
        if (bytes.subarray(-2).toString() === "\r\n") bytes = bytes.subarray(0, -2);
        file = new File([bytes], name, { type }); break;
      }
      if (!file) throw new AdminError(400, "Зургаа сонгоно уу.");
      return res.status(201).json(await uploadImage(file));
    }
    if (action === "account" && req.method === "POST") {
      const input = z.object({ currentPassword: z.string().min(1).max(200), newPassword: z.string().min(8).max(200) }).parse(await body(req));
      await changePassword(request, input.currentPassword, input.newPassword);
      return res.json({ ok: true });
    }
    return res.status(404).json({ error: "Хүсэлт олдсонгүй." });
  } catch (error) { return sendError(res, error); }
});
app.use((error, _req, res, _next) => sendError(res, error));

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
await initializeDatabase();
app.listen(port, host, () => console.log(`UB Circus API listening on http://${host}:${port} (PostgreSQL)`));
