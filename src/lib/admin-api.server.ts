import { z } from "zod";
import {
  AdminError,
  authStatus,
  changePassword,
  listImages,
  login,
  logout,
  readContent,
  requireAdmin,
  requireLocal,
  requireSameOrigin,
  saveContent,
  uploadImage,
} from "./admin-store.server";

const credentials = z.object({
  email: z.string().trim().toLowerCase().email().max(150),
  password: z.string().min(12, "Нууц үг хамгийн багадаа 12 тэмдэгт байна.").max(200),
});
const passwords = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(12, "Шинэ нууц үг хамгийн багадаа 12 тэмдэгт байна.").max(200),
});
function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
  });
}
async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new AdminError(415, "JSON хүсэлт шаардлагатай.");
  const text = await request.text();
  if (text.length > 1024 * 1024) throw new AdminError(413, "Хүсэлтийн хэмжээ хэтэрсэн.");
  try {
    return JSON.parse(text);
  } catch {
    throw new AdminError(400, "Хүсэлтийн бүтэц буруу байна.");
  }
}
export async function handleAdminRequest(request: Request) {
  try {
    requireLocal(request);
    const action = new URL(request.url).pathname.split("/").at(-1);
    const method = request.method;
    if (method !== "GET") requireSameOrigin(request);
    if (action === "status" && method === "GET") return json(await authStatus(request));
    if ((action === "login" || action === "setup") && method === "POST") {
      const input = credentials.parse(await readBody(request));
      const result = await login(request, input.email, input.password, action === "setup");
      return json({ email: result.email }, 200, { "Set-Cookie": result.cookie });
    }
    if (action === "logout" && method === "POST") {
      await logout(request);
      return json({ ok: true }, 200, {
        "Set-Cookie": "ub_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
      });
    }
    await requireAdmin(request);
    if (action === "content" && method === "GET") return json(await readContent());
    if (action === "content" && method === "PUT")
      return json(await saveContent(await readBody(request)));
    if (action === "media" && method === "GET") return json(await listImages());
    if (action === "media" && method === "POST") {
      const length = Number(request.headers.get("content-length") || 0);
      if (length > 6 * 1024 * 1024) throw new AdminError(413, "Зургийн хэмжээ хэтэрсэн.");
      const file = (await request.formData()).get("file");
      if (!(file instanceof File)) throw new AdminError(400, "Зургаа сонгоно уу.");
      return json(await uploadImage(file), 201);
    }
    if (action === "account" && method === "POST") {
      const input = passwords.parse(await readBody(request));
      await changePassword(request, input.currentPassword, input.newPassword);
      return json({ ok: true });
    }
    return json({ error: "Хүсэлт олдсонгүй." }, 404);
  } catch (error) {
    if (error instanceof AdminError) return json({ error: error.message }, error.status);
    if (error instanceof z.ZodError)
      return json({ error: error.issues[0]?.message || "Мэдээллээ шалгана уу." }, 400);
    console.error("Admin API error", error);
    return json({ error: "Мэдээлэл хадгалахад алдаа гарлаа. Дахин оролдоно уу." }, 500);
  }
}
