import { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { contentSchema, DEFAULT_CONTENT } from "../schemas/content-schema.js";
import { enquiryInputSchema, enquiryUpdateSchema } from "../schemas/enquiry-schema.js";
import sharp from "sharp";
import { readState, writeState, pool } from "../db.js";
export class AdminError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
const queues = new Map();
async function serial(name, work) {
    const previous = queues.get(name) ?? Promise.resolve();
    const next = previous.catch(() => { }).then(work);
    queues.set(name, next);
    try {
        return await next;
    }
    finally {
        if (queues.get(name) === next)
            queues.delete(name);
    }
}
async function readJson(name, fallback) { return readState(name.replace(/\.json$/, ""), fallback); }
async function writeJson(name, value) { return writeState(name.replace(/\.json$/, ""), value); }
async function account() {
    return readJson("auth.json", null);
}
function tokenHash(value) {
    return createHash("sha256").update(value).digest("hex");
}
function sessionToken(request) {
    return (request.headers
        .get("cookie")
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("ub_admin="))
        ?.slice(9) ?? "");
}
async function hashPassword(password, salt) {
    return new Promise((done, reject) => scrypt(password, salt, 64, { N: 65536, r: 8, p: 2, maxmem: 128 * 1024 * 1024 }, (error, key) => error ? reject(error) : done(key.toString("hex"))));
}
const attempts = new Map();
function rateLimit(request) {
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
export function requireLocal(request) {
    if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname))
        throw new AdminError(403, "Энэ admin panel одоогоор зөвхөн local орчинд ажиллана.");
}
export function requireSameOrigin(request) {
    const origin = request.headers.get("origin");
    const configured = (process.env.ADMIN_FRONTEND_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean);
    const allowed = new Set([new URL(request.url).origin, ...configured]);
    if (!origin || !allowed.has(origin))
        throw new AdminError(403, "Request origin is not allowed.");
}
export async function requireAdmin(request) {
    const user = await account();
    const token = sessionToken(request);
    if (!user ||
        !token ||
        !user.sessions.some((session) => session.hash === tokenHash(token) && session.expires > Date.now()))
        throw new AdminError(401, "Нэвтэрнэ үү.");
    return user;
}
export async function authStatus(request) {
    const user = await account();
    let authenticated = false;
    try {
        await requireAdmin(request);
        authenticated = true;
    }
    catch (error) {
        if (!(error instanceof AdminError))
            throw error;
    }
    return {
        configured: Boolean(user),
        authenticated,
        email: authenticated ? user?.email : undefined,
    };
}
export async function login(request, email, password, setup = false, setupCode = "") {
    rateLimit(request);
    return serial("auth", async () => {
        let user = await account();
        if (setup) {
            if (user)
                throw new AdminError(409, "Admin бүртгэл аль хэдийн үүссэн байна.");
            const configuredCode = process.env.ADMIN_SETUP_CODE || "";
            const providedHash = createHash("sha256").update(setupCode).digest();
            const configuredHash = createHash("sha256").update(configuredCode).digest();
            if (configuredCode.length < 24 || !setupCode || !timingSafeEqual(providedHash, configuredHash))
                throw new AdminError(403, "????? admin ?????????? ??? ????? ????? ????????????? ?????.");
            const salt = randomBytes(32).toString("hex");
            user = { email, salt, passwordHash: await hashPassword(password, salt), sessions: [] };
        }
        else {
            if (!user)
                throw new AdminError(409, "Эхлээд admin бүртгэл үүсгэнэ үү.");
            const hash = await hashPassword(password, user.salt);
            if (email !== user.email ||
                !timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex")))
                throw new AdminError(401, "Имэйл эсвэл нууц үг буруу байна.");
        }
        const token = randomBytes(32).toString("hex");
        user.sessions = user.sessions.filter((session) => session.expires > Date.now()).slice(-9);
        user.sessions.push({ hash: tokenHash(token), expires: Date.now() + 8 * 60 * 60 * 1000 });
        await writeJson("auth.json", user);
        return {
            email: user.email,
            cookie: "ub_admin=" +
                token +
                `; HttpOnly; SameSite=${new URL(request.url).protocol === "https:" ? "None; Secure" : "Strict"}; Path=/; Max-Age=28800`,
        };
    });
}
export async function logout(request) {
    await serial("auth", async () => {
        const user = await account();
        if (user) {
            user.sessions = user.sessions.filter((session) => session.hash !== tokenHash(sessionToken(request)));
            await writeJson("auth.json", user);
        }
    });
}
export async function changePassword(request, currentPassword, newPassword) {
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
export async function readContent() {
    try {
        const content = contentSchema.parse(await readJson("content.json", DEFAULT_CONTENT));
        if (!(await readState("content.backup", null))) await writeJson("content.backup.json", content);
        return content;
    }
    catch {
        throw new AdminError(503, "Контентийн файл гэмтсэн байна. Нөөц хуулбарыг сэргээнэ үү.");
    }
}
export async function contentHealth() {
    try {
        await readContent();
        return { damaged: false, backupAvailable: false };
    }
    catch {
        try {
            contentSchema.parse(await readJson("content.backup.json", null));
            return { damaged: true, backupAvailable: true };
        }
        catch {
            return { damaged: true, backupAvailable: false };
        }
    }
}
export async function recoverContent() {
    return serial("content", async () => {
        const backup = contentSchema.parse(await readJson("content.backup.json", null));
        const damaged = await readJson("content.json", null);
        if (damaged) await writeState(`content.damaged.${Date.now()}`, damaged);
        await writeJson("content.json", backup);
        return backup;
    });
}
export async function listEnquiries() {
    return readJson("enquiries.json", []);
}
const enquiryAttempts = new Map();
export async function createEnquiry(input) {
    const data = enquiryInputSchema.parse(input);
    return serial("enquiries", async () => {
        const enquiries = await listEnquiries();
        const existing = enquiries.find((item) => item.submissionId === data.submissionId);
        if (existing) {
            const fingerprint = (value) => tokenHash(JSON.stringify(enquiryInputSchema.parse(value)));
            if (fingerprint(existing) !== fingerprint(data))
                throw new AdminError(409, "Энэ хүсэлт өмнөх агуулгаараа хадгалагдсан. Өөрчилсөн агуулгыг шинэ хүсэлтээр илгээнэ үү.");
            return { id: existing.id };
        }
        const now = Date.now();
        const attempt = enquiryAttempts.get("local");
        if (attempt && now - attempt.start < 15 * 60 * 1000 && attempt.count >= 10)
            throw new AdminError(429, "Олон хүсэлт илгээсэн байна. 15 минутын дараа дахин оролдоно уу.");
        const timestamp = new Date(now).toISOString();
        const entry = {
            ...data,
            id: randomUUID(),
            status: "new",
            notes: "",
            revision: 0,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        await writeJson("enquiries.json", [entry, ...enquiries]);
        enquiryAttempts.set("local", attempt && now - attempt.start < 15 * 60 * 1000
            ? { ...attempt, count: attempt.count + 1 }
            : { count: 1, start: now });
        return { id: entry.id };
    });
}
export async function updateEnquiry(input) {
    const update = enquiryUpdateSchema.parse(input);
    return serial("enquiries", async () => {
        const enquiries = await listEnquiries();
        const index = enquiries.findIndex((item) => item.id === update.id);
        if (index < 0)
            throw new AdminError(404, "Хүсэлт олдсонгүй.");
        if (enquiries[index].revision !== update.revision)
            throw new AdminError(409, "Хүсэлт өөр цонхноос өөрчлөгдсөн байна. Шинэчлээд дахин оролдоно уу.");
        enquiries[index] = {
            ...enquiries[index],
            status: update.status,
            notes: update.notes,
            revision: update.revision + 1,
            updatedAt: new Date().toISOString(),
        };
        await writeJson("enquiries.json", enquiries);
        return enquiries[index];
    });
}
export async function readPublishedContent() {
    let content;
    try {
        content = await readContent();
    }
    catch {
        try {
            content = contentSchema.parse(await readJson("content.backup.json", null));
        }
        catch {
            throw new AdminError(503, "Контентыг сэргээх шаардлагатай. Admin хэсгийг нээнэ үү.");
        }
    }
    return {
        ...content,
        shows: content.shows.filter((item) => item.status === "published"),
        projects: content.projects.filter((item) => item.status === "published"),
        events: content.events.filter((item) => item.status === "published"),
    };
}
export async function saveContent(input) {
    const content = contentSchema.parse(input);
    return serial("content", async () => {
        const current = await readContent();
        if (content.revision !== current.revision)
            throw new AdminError(409, "Өөр цонхноос мэдээлэл өөрчилсөн байна. Хуудсыг шинэчлээд дахин оролдоно уу.");
        const saved = {
            ...content,
            revision: current.revision + 1,
            updatedAt: new Date().toISOString(),
        };
        await writeJson("content.backup.json", saved);
        await writeJson("content.json", saved);
        return saved;
    });
}
function imageType(data) {
    if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff)
        return "jpg";
    if (data[0] === 0x89 &&
        data[1] === 0x50 &&
        data[2] === 0x4e &&
        data[3] === 0x47 &&
        data[4] === 0x0d &&
        data[5] === 0x0a &&
        data[6] === 0x1a &&
        data[7] === 0x0a)
        return "png";
    if (Buffer.from(data.slice(0, 4)).toString() === "RIFF" &&
        Buffer.from(data.slice(8, 12)).toString() === "WEBP")
        return "webp";
    throw new AdminError(400, "Зөвхөн JPG, PNG, WebP зураг оруулна уу.");
}
const mediaName = /^[a-f0-9-]+(?:\.(jpg|png|webp))?$/;
function cloudinaryCredentials() {
    const value = process.env.CLOUDINARY_URL;
    if (!value) throw new AdminError(503, "Cloudinary is not configured on the backend.");
    try {
        const url = new URL(value);
        if (url.protocol !== "cloudinary:" || !url.hostname || !url.username || !url.password)
            throw new Error("Invalid Cloudinary URL");
        const credential = (part) => decodeURIComponent(part).replace(/^<([^<>]+)>$/, "$1");
        return {
            cloudName: url.hostname,
            apiKey: credential(url.username),
            apiSecret: credential(url.password),
        };
    } catch {
        throw new AdminError(503, "Cloudinary backend configuration is invalid.");
    }
}
function cloudinarySignature(params, apiSecret) {
    const value = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => `${key}=${entry}`)
        .join("&");
    return createHash("sha1").update(value + apiSecret).digest("hex");
}
async function cloudinaryRequest(action, params, file) {
    const { cloudName, apiKey, apiSecret } = cloudinaryCredentials();
    const signed = { ...params, timestamp: Math.floor(Date.now() / 1000) };
    const form = new FormData();
    for (const [key, value] of Object.entries(signed)) form.append(key, String(value));
    form.append("api_key", apiKey);
    form.append("signature", cloudinarySignature(signed, apiSecret));
    if (file) form.append("file", new Blob([file.bytes], { type: file.contentType }), file.name);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/${action}`, {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(30_000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = typeof result?.error?.message === "string" ? result.error.message.slice(0, 180) : "";
        throw new AdminError(502, `Cloudinary ${action} failed (${response.status})${detail ? `: ${detail}` : "."}`);
    }
    return result;
}
export async function uploadImage(file) {
    if (!file.size || file.size > 5 * 1024 * 1024)
        throw new AdminError(400, "Зургийн хэмжээ 5 MB-аас бага байх ёстой.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = imageType(bytes);
    try {
        const decoder = sharp(bytes, { failOn: "warning", limitInputPixels: 40_000_000 });
        const metadata = await decoder.metadata();
        if (!metadata.width ||
            !metadata.height ||
            (metadata.pages ?? 1) > 1 ||
            !["jpeg", "png", "webp"].includes(metadata.format ?? ""))
            throw new Error("Invalid image");
        await decoder.raw().toBuffer();
    }
    catch {
        throw new AdminError(400, "Зураг гэмтсэн эсвэл хэт том байна. Бүрэн JPG, PNG, WebP зураг сонгоно уу.");
    }
    const id = randomUUID();
    const contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;
    const itemName = file.name.slice(0, 150) || id;
    const asset = await cloudinaryRequest("upload", { public_id: `ubcircus/${id}` }, {
        bytes,
        contentType,
        name: itemName,
    });
    if (!asset.public_id || !asset.secure_url)
        throw new AdminError(502, "Cloudinary returned an invalid upload result.");
    const item = { id, name: itemName, src: asset.secure_url, size: Number(asset.bytes || file.size), createdAt: new Date().toISOString() };
    try {
        await pool.query("INSERT INTO circus_media(id,name,content_type,bytes,src,public_id) VALUES ($1,$2,$3,NULL,$4,$5)", [id, item.name, contentType, item.src, asset.public_id]);
    } catch (error) {
        await cloudinaryRequest("destroy", { public_id: asset.public_id }).catch(() => { });
        throw error;
    }
    return item;
}
export async function listImages() {
    const { rows } = await pool.query("SELECT id,name,src,octet_length(bytes) AS size,created_at FROM circus_media ORDER BY created_at DESC");
    return rows.map(row => ({ id: row.id, name: row.name, src: row.src || "/api/media/" + row.id, size: Number(row.size || 0), createdAt: new Date(row.created_at).toISOString() }));
}
export async function readImage(id) {
    if (!mediaName.test(id)) throw new AdminError(404, "Image not found.");
    const { rows } = await pool.query("SELECT bytes,content_type FROM circus_media WHERE id=$1", [id]);
    if (!rows[0]?.bytes) throw new AdminError(404, "Image not found.");
    return { bytes: rows[0].bytes, type: rows[0].content_type };
}
function contentUsesImage(value, id, src = "") {
    if (typeof value === "string")
        return value === id || (src && value === src) || value.includes(`/api/media/${id}`);
    if (Array.isArray(value))
        return value.some(item => contentUsesImage(item, id, src));
    if (value && typeof value === "object")
        return Object.values(value).some(item => contentUsesImage(item, id, src));
    return false;
}
export async function deleteImage(id) {
    if (!mediaName.test(id)) throw new AdminError(404, "Image not found.");
    return serial("content", async () => {
        const content = await readContent();
        const backup = await readJson("content.backup.json", null);
        const { rows } = await pool.query("SELECT src,public_id FROM circus_media WHERE id=$1", [id]);
        const media = rows[0];
        if (contentUsesImage(content, id, media?.src) || contentUsesImage(backup, id, media?.src))
            throw new AdminError(409, "This image is in use. Replace it in site content before deleting.");
        if (media?.public_id) await cloudinaryRequest("destroy", { public_id: media.public_id });
        const result = await pool.query("DELETE FROM circus_media WHERE id=$1", [id]);
        if (!result.rowCount) throw new AdminError(404, "Image not found.");
        return { ok: true };
    });
}
