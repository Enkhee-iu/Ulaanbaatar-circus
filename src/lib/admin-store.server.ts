import { readFile, writeFile, mkdir, rename, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomBytes, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { contentSchema, DEFAULT_CONTENT } from "./content-schema";
import type { MediaItem, SiteContent } from "./content-schema";

export class AdminError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
type Session = { hash: string; expires: number };
type AdminAccount = { email: string; salt: string; passwordHash: string; sessions: Session[] };
const storageDir = () =>
  resolve(process.env.UB_CIRCUS_DATA_DIR || join(process.cwd(), ".ubcircus", "data"));
const queues = new Map<string, Promise<unknown>>();
async function serial<T>(name: string, work: () => Promise<T>): Promise<T> {
  const previous = queues.get(name) ?? Promise.resolve();
  const next = previous.catch(() => {}).then(work);
  queues.set(name, next);
  try {
    return await next;
  } finally {
    if (queues.get(name) === next) queues.delete(name);
  }
}
async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(join(storageDir(), name), "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(fallback);
    throw error;
  }
}
async function writeJson(name: string, value: unknown) {
  const dir = storageDir();
  await mkdir(dir, { recursive: true });
  const temporary = join(dir, name + "." + randomBytes(8).toString("hex") + ".tmp");
  await writeFile(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
  await rename(temporary, join(dir, name));
}
async function account() {
  return readJson<AdminAccount | null>("auth.json", null);
}
function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
function sessionToken(request: Request) {
  return (
    request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("ub_admin="))
      ?.slice(9) ?? ""
  );
}
async function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((done, reject) =>
    scrypt(password, salt, 64, { N: 65536, r: 8, p: 2, maxmem: 128 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : done(key.toString("hex")),
    ),
  );
}
const attempts = new Map<string, { count: number; start: number }>();
function rateLimit(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const attempt = attempts.get(key);
  if (!attempt || now - attempt.start > 15 * 60 * 1000) {
    attempts.set(key, { count: 1, start: now });
    return;
  }
  attempt.count++;
  if (attempt.count > 10)
    throw new AdminError(429, "Олон удаа оролдсон байна. 15 минутын дараа дахин оролдоно уу.");
}
export function requireLocal(request: Request) {
  if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname))
    throw new AdminError(403, "Энэ admin panel одоогоор зөвхөн local орчинд ажиллана.");
}
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin)
    throw new AdminError(403, "Хүсэлтийн эх сурвалж зөвшөөрөгдөөгүй.");
}
export async function requireAdmin(request: Request) {
  const user = await account();
  const token = sessionToken(request);
  if (
    !user ||
    !token ||
    !user.sessions.some(
      (session) => session.hash === tokenHash(token) && session.expires > Date.now(),
    )
  )
    throw new AdminError(401, "Нэвтэрнэ үү.");
  return user;
}
export async function authStatus(request: Request) {
  const user = await account();
  let authenticated = false;
  try {
    await requireAdmin(request);
    authenticated = true;
  } catch (error) {
    if (!(error instanceof AdminError)) throw error;
  }
  return {
    configured: Boolean(user),
    authenticated,
    email: authenticated ? user?.email : undefined,
  };
}
export async function login(request: Request, email: string, password: string, setup = false) {
  rateLimit(request);
  return serial("auth", async () => {
    let user = await account();
    if (setup) {
      if (user) throw new AdminError(409, "Admin бүртгэл аль хэдийн үүссэн байна.");
      const salt = randomBytes(32).toString("hex");
      user = { email, salt, passwordHash: await hashPassword(password, salt), sessions: [] };
    } else {
      if (!user) throw new AdminError(409, "Эхлээд admin бүртгэл үүсгэнэ үү.");
      const hash = await hashPassword(password, user.salt);
      if (
        email !== user.email ||
        !timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"))
      )
        throw new AdminError(401, "Имэйл эсвэл нууц үг буруу байна.");
    }
    const token = randomBytes(32).toString("hex");
    user.sessions = user.sessions.filter((session) => session.expires > Date.now()).slice(-9);
    user.sessions.push({ hash: tokenHash(token), expires: Date.now() + 8 * 60 * 60 * 1000 });
    await writeJson("auth.json", user);
    return {
      email: user.email,
      cookie:
        "ub_admin=" +
        token +
        "; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800" +
        (new URL(request.url).protocol === "https:" ? "; Secure" : ""),
    };
  });
}
export async function logout(request: Request) {
  await serial("auth", async () => {
    const user = await account();
    if (user) {
      user.sessions = user.sessions.filter(
        (session) => session.hash !== tokenHash(sessionToken(request)),
      );
      await writeJson("auth.json", user);
    }
  });
}
export async function changePassword(
  request: Request,
  currentPassword: string,
  newPassword: string,
) {
  await serial("auth", async () => {
    const user = await requireAdmin(request);
    const hash = await hashPassword(currentPassword, user.salt);
    if (!timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex")))
      throw new AdminError(401, "Одоогийн нууц үг буруу байна.");
    const salt = randomBytes(32).toString("hex");
    user.salt = salt;
    user.passwordHash = await hashPassword(newPassword, salt);
    const current = tokenHash(sessionToken(request));
    user.sessions = user.sessions.filter((session) => session.hash === current);
    await writeJson("auth.json", user);
  });
}
export async function readContent(): Promise<SiteContent> {
  return contentSchema.parse(await readJson("content.json", DEFAULT_CONTENT));
}
export async function readPublishedContent(): Promise<SiteContent> {
  const content = await readContent();
  return {
    ...content,
    shows: content.shows.filter((item) => item.status === "published"),
    projects: content.projects.filter((item) => item.status === "published"),
    events: content.events.filter((item) => item.status === "published"),
  };
}
export async function saveContent(input: unknown) {
  const content = contentSchema.parse(input);
  return serial("content", async () => {
    const current = await readContent();
    if (content.revision !== current.revision)
      throw new AdminError(
        409,
        "Өөр цонхноос мэдээлэл өөрчилсөн байна. Хуудсыг шинэчлээд дахин оролдоно уу.",
      );
    const saved = {
      ...content,
      revision: current.revision + 1,
      updatedAt: new Date().toISOString(),
    };
    await writeJson("content.json", saved);
    return saved;
  });
}
function imageType(data: Uint8Array) {
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "jpg";
  if (
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47 &&
    data[4] === 0x0d &&
    data[5] === 0x0a &&
    data[6] === 0x1a &&
    data[7] === 0x0a
  )
    return "png";
  if (
    Buffer.from(data.slice(0, 4)).toString() === "RIFF" &&
    Buffer.from(data.slice(8, 12)).toString() === "WEBP"
  )
    return "webp";
  throw new AdminError(400, "Зөвхөн JPG, PNG, WebP зураг оруулна уу.");
}
const mediaName = /^[a-f0-9-]+\.(jpg|png|webp)$/;
export async function uploadImage(file: File): Promise<MediaItem> {
  if (!file.size || file.size > 5 * 1024 * 1024)
    throw new AdminError(400, "Зургийн хэмжээ 5 MB-аас бага байх ёстой.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = imageType(bytes);
  const id = crypto.randomUUID() + "." + extension;
  const directory = join(storageDir(), "media");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, id), bytes);
  const item = {
    id,
    name: file.name.slice(0, 150),
    src: "/api/media/" + id,
    size: file.size,
    createdAt: new Date().toISOString(),
  };
  await writeFile(join(directory, id + ".json"), JSON.stringify(item));
  return item;
}
export async function listImages(): Promise<MediaItem[]> {
  const directory = join(storageDir(), "media");
  let names: string[];
  try {
    names = await readdir(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const images = await Promise.all(
    names
      .filter((name) => mediaName.test(name))
      .map(async (name) => {
        try {
          return JSON.parse(await readFile(join(directory, name + ".json"), "utf8")) as MediaItem;
        } catch {
          const info = await stat(join(directory, name));
          return {
            id: name,
            name,
            src: "/api/media/" + name,
            size: info.size,
            createdAt: info.birthtime.toISOString(),
          };
        }
      }),
  );
  return images.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function readImage(id: string) {
  if (!mediaName.test(id)) throw new AdminError(404, "Зураг олдсонгүй.");
  try {
    return {
      bytes: await readFile(join(storageDir(), "media", id)),
      type: id.endsWith(".jpg") ? "image/jpeg" : id.endsWith(".png") ? "image/png" : "image/webp",
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      throw new AdminError(404, "Зураг олдсонгүй.");
    throw error;
  }
}
