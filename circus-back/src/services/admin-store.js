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
        throw new AdminError(429, "ÐžÐ»Ð¾Ð½ ÑƒÐ´Ð°Ð° Ð¾Ñ€Ð¾Ð»Ð´ÑÐ¾Ð½ Ð±Ð°Ð¹Ð½Ð°. 15 Ð¼Ð¸Ð½ÑƒÑ‚Ñ‹Ð½ Ð´Ð°Ñ€Ð°Ð° Ð´Ð°Ñ…Ð¸Ð½ Ð¾Ñ€Ð¾Ð»Ð´Ð¾Ð½Ð¾ ÑƒÑƒ.");
}
export function requireLocal(request) {
    if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname))
        throw new AdminError(403, "Ð­Ð½Ñ admin panel Ð¾Ð´Ð¾Ð¾Ð³Ð¾Ð¾Ñ€ Ð·Ó©Ð²Ñ…Ó©Ð½ local Ð¾Ñ€Ñ‡Ð¸Ð½Ð´ Ð°Ð¶Ð¸Ð»Ð»Ð°Ð½Ð°.");
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
        throw new AdminError(401, "ÐÑÐ²Ñ‚ÑÑ€Ð½Ñ Ò¯Ò¯.");
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
                throw new AdminError(409, "Admin Ð±Ò¯Ñ€Ñ‚Ð³ÑÐ» Ð°Ð»ÑŒ Ñ…ÑÐ´Ð¸Ð¹Ð½ Ò¯Ò¯ÑÑÑÐ½ Ð±Ð°Ð¹Ð½Ð°.");
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
                throw new AdminError(409, "Ð­Ñ…Ð»ÑÑÐ´ admin Ð±Ò¯Ñ€Ñ‚Ð³ÑÐ» Ò¯Ò¯ÑÐ³ÑÐ½Ñ Ò¯Ò¯.");
            const hash = await hashPassword(password, user.salt);
            if (email !== user.email ||
                !timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex")))
                throw new AdminError(401, "Ð˜Ð¼ÑÐ¹Ð» ÑÑÐ²ÑÐ» Ð½ÑƒÑƒÑ† Ò¯Ð³ Ð±ÑƒÑ€ÑƒÑƒ Ð±Ð°Ð¹Ð½Ð°.");
        }
        const token = randomBytes(32).toString("hex");
        user.sessions = user.sessions.filter((session) => session.expires > Date.now()).slice(-9);
        user.sessions.push({ hash: tokenHash(token), expires: Date.now() + 8 * 60 * 60 * 1000 });
        await writeJson("auth.json", user);
        return {
            email: user.email,
            cookie: "ub_admin=" +
                token +
                "; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800" +
                (new URL(request.url).protocol === "https:" ? "; Secure" : ""),
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
            throw new AdminError(401, "ÐžÐ´Ð¾Ð¾Ð³Ð¸Ð¹Ð½ Ð½ÑƒÑƒÑ† Ò¯Ð³ Ð±ÑƒÑ€ÑƒÑƒ Ð±Ð°Ð¹Ð½Ð°.");
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
        throw new AdminError(503, "ÐšÐ¾Ð½Ñ‚ÐµÐ½Ñ‚Ð¸Ð¹Ð½ Ñ„Ð°Ð¹Ð» Ð³ÑÐ¼Ñ‚ÑÑÐ½ Ð±Ð°Ð¹Ð½Ð°. ÐÓ©Ó©Ñ† Ñ…ÑƒÑƒÐ»Ð±Ð°Ñ€Ñ‹Ð³ ÑÑÑ€Ð³ÑÑÐ½Ñ Ò¯Ò¯.");
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
                throw new AdminError(409, "Ð­Ð½Ñ Ñ…Ò¯ÑÑÐ»Ñ‚ Ó©Ð¼Ð½Ó©Ñ… Ð°Ð³ÑƒÑƒÐ»Ð³Ð°Ð°Ñ€Ð°Ð° Ñ…Ð°Ð´Ð³Ð°Ð»Ð°Ð³Ð´ÑÐ°Ð½. Ó¨Ó©Ñ€Ñ‡Ð¸Ð»ÑÓ©Ð½ Ð°Ð³ÑƒÑƒÐ»Ð³Ñ‹Ð³ ÑˆÐ¸Ð½Ñ Ñ…Ò¯ÑÑÐ»Ñ‚ÑÑÑ€ Ð¸Ð»Ð³ÑÑÐ½Ñ Ò¯Ò¯.");
            return { id: existing.id };
        }
        const now = Date.now();
        const attempt = enquiryAttempts.get("local");
        if (attempt && now - attempt.start < 15 * 60 * 1000 && attempt.count >= 10)
            throw new AdminError(429, "ÐžÐ»Ð¾Ð½ Ñ…Ò¯ÑÑÐ»Ñ‚ Ð¸Ð»Ð³ÑÑÑÑÐ½ Ð±Ð°Ð¹Ð½Ð°. 15 Ð¼Ð¸Ð½ÑƒÑ‚Ñ‹Ð½ Ð´Ð°Ñ€Ð°Ð° Ð´Ð°Ñ…Ð¸Ð½ Ð¾Ñ€Ð¾Ð»Ð´Ð¾Ð½Ð¾ ÑƒÑƒ.");
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
            throw new AdminError(404, "Ð¥Ò¯ÑÑÐ»Ñ‚ Ð¾Ð»Ð´ÑÐ¾Ð½Ð³Ò¯Ð¹.");
        if (enquiries[index].revision !== update.revision)
            throw new AdminError(409, "Ð¥Ò¯ÑÑÐ»Ñ‚ Ó©Ó©Ñ€ Ñ†Ð¾Ð½Ñ…Ð½Ð¾Ð¾Ñ Ó©Ó©Ñ€Ñ‡Ð»Ó©Ð³Ð´ÑÓ©Ð½ Ð±Ð°Ð¹Ð½Ð°. Ð¨Ð¸Ð½ÑÑ‡Ð»ÑÑÐ´ Ð´Ð°Ñ…Ð¸Ð½ Ð¾Ñ€Ð¾Ð»Ð´Ð¾Ð½Ð¾ ÑƒÑƒ.");
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
            throw new AdminError(503, "ÐšÐ¾Ð½Ñ‚ÐµÐ½Ñ‚Ñ‹Ð³ ÑÑÑ€Ð³ÑÑÑ… ÑˆÐ°Ð°Ñ€Ð´Ð»Ð°Ð³Ð°Ñ‚Ð°Ð¹. Admin Ñ…ÑÑÐ³Ð¸Ð¹Ð³ Ð½ÑÑÐ½Ñ Ò¯Ò¯.");
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
            throw new AdminError(409, "Ó¨Ó©Ñ€ Ñ†Ð¾Ð½Ñ…Ð½Ð¾Ð¾Ñ Ð¼ÑÐ´ÑÑÐ»ÑÐ» Ó©Ó©Ñ€Ñ‡Ð¸Ð»ÑÓ©Ð½ Ð±Ð°Ð¹Ð½Ð°. Ð¥ÑƒÑƒÐ´ÑÑ‹Ð³ ÑˆÐ¸Ð½ÑÑ‡Ð»ÑÑÐ´ Ð´Ð°Ñ…Ð¸Ð½ Ð¾Ñ€Ð¾Ð»Ð´Ð¾Ð½Ð¾ ÑƒÑƒ.");
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
    throw new AdminError(400, "Ð—Ó©Ð²Ñ…Ó©Ð½ JPG, PNG, WebP Ð·ÑƒÑ€Ð°Ð³ Ð¾Ñ€ÑƒÑƒÐ»Ð½Ð° ÑƒÑƒ.");
}
const mediaName = /^[a-f0-9-]+\.(jpg|png|webp)$/;
export async function uploadImage(file) {
    if (!file.size || file.size > 5 * 1024 * 1024)
        throw new AdminError(400, "Ð—ÑƒÑ€Ð³Ð¸Ð¹Ð½ Ñ…ÑÐ¼Ð¶ÑÑ 5 MB-Ð°Ð°Ñ Ð±Ð°Ð³Ð° Ð±Ð°Ð¹Ñ… Ñ‘ÑÑ‚Ð¾Ð¹.");
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
        throw new AdminError(400, "Ð—ÑƒÑ€Ð°Ð³ Ð³ÑÐ¼Ñ‚ÑÑÐ½ ÑÑÐ²ÑÐ» Ñ…ÑÑ‚ Ñ‚Ð¾Ð¼ Ð±Ð°Ð¹Ð½Ð°. Ð‘Ò¯Ñ€ÑÐ½ JPG, PNG, WebP Ð·ÑƒÑ€Ð°Ð³ ÑÐ¾Ð½Ð³Ð¾Ð½Ð¾ ÑƒÑƒ.");
    }
    const id = crypto.randomUUID() + "." + extension;
    const item = { id, name: file.name.slice(0, 150), src: "/api/media/" + id, size: file.size, createdAt: new Date().toISOString() };
    await pool.query("INSERT INTO circus_media(id,name,content_type,bytes) VALUES ($1,$2,$3,$4)", [id, item.name, `image/${extension === "jpg" ? "jpeg" : extension}`, Buffer.from(bytes)]);
    return item;
}
export async function listImages() {
    const { rows } = await pool.query("SELECT id,name,octet_length(bytes) AS size,created_at FROM circus_media ORDER BY created_at DESC");
    return rows.map(row => ({ id: row.id, name: row.name, src: "/api/media/" + row.id, size: Number(row.size), createdAt: new Date(row.created_at).toISOString() }));
}
export async function readImage(id) {
    if (!mediaName.test(id)) throw new AdminError(404, "Image not found.");
    const { rows } = await pool.query("SELECT bytes,content_type FROM circus_media WHERE id=$1", [id]);
    if (!rows[0]) throw new AdminError(404, "Image not found.");
    return { bytes: rows[0].bytes, type: rows[0].content_type };
}
