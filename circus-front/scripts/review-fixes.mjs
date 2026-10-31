import fs from "node:fs/promises";
import path from "node:path";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import assert from "node:assert/strict";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
await fs.mkdir(path.resolve(".review-fixes"), { recursive: true });
const dir = await fs.mkdtemp(path.resolve(".review-fixes/store-"));
process.env.UB_CIRCUS_DATA_DIR = dir;
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts") && !path.extname(specifier))
      return next(specifier + ".ts", context);
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts")) {
      const result = next(url, { ...context, format: "module" });
      return {
        format: "module",
        source: ts.transpileModule(String(result.source), {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        }).outputText,
      };
    }
    return next(url, context);
  },
});
const store = await import(pathToFileURL(path.resolve("src/lib/admin-store.server.ts")));
const schema = await import(pathToFileURL(path.resolve("src/lib/content-schema.ts")));
const checks = [];
try {
  async function check(name, fn) {
    await fn();
    checks.push(name);
    console.log("PASS " + name);
  }
  const input = {
    submissionId: randomUUID(),
    name: "Regression one",
    email: "review@example.invalid",
    company: "",
    date: "",
    city: "",
    audience: "",
    brief: "Original payload",
    eventType: "Gala",
    budget: "Not sure yet",
    show: "",
    language: "mn",
  };
  await check("Same payload retries reuse receipt", async () => {
    const a = await store.createEnquiry(input);
    const b = await store.createEnquiry(input);
    assert.equal(a.id, b.id);
    assert.equal((await store.listEnquiries()).length, 1);
  });
  await check("Changed payload returns 409 and preserves original", async () => {
    await assert.rejects(
      store.createEnquiry({ ...input, brief: "Changed payload" }),
      (e) => e.status === 409,
    );
    assert.equal((await store.listEnquiries())[0].brief, input.brief);
  });
  await check("New submission ID accepts explicitly changed request", async () => {
    await store.createEnquiry({ ...input, submissionId: randomUUID(), brief: "Changed payload" });
    assert.equal((await store.listEnquiries()).length, 2);
  });
  let saved;
  await check("Last valid backup survives corrupt main JSON", async () => {
    const initial = await store.readContent();
    saved = await store.saveContent({
      ...initial,
      settings: {
        ...initial.settings,
        brandName: "Ulaanbaatar International Circus Production House",
      },
    });
    await fs.writeFile(path.join(dir, "content.json"), "{broken");
    assert.equal((await store.readPublishedContent()).settings.brandName, saved.settings.brandName);
    assert.deepEqual(await store.contentHealth(), { damaged: true, backupAvailable: true });
    await assert.rejects(store.readContent(), (e) => e.status === 503);
  });
  await check("Recovery preserves damaged file and restores content", async () => {
    const recovered = await store.recoverContent();
    assert.equal(recovered.revision, saved.revision);
    assert((await fs.readdir(dir)).some((x) => x.startsWith("content.damaged.")));
    assert.equal((await store.contentHealth()).damaged, false);
  });
  await check("Stale revision rejects overwrite", async () => {
    await assert.rejects(
      store.saveContent({ ...saved, revision: saved.revision - 1 }),
      (e) => e.status === 409,
    );
  });
  await check("Header-only and truncated images rejected", async () => {
    const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    await assert.rejects(
      store.uploadImage(new File([header], "invalid.png")),
      (e) => e.status === 400,
    );
    const png = await sharp({ create: { width: 30, height: 30, channels: 3, background: "red" } })
      .png()
      .toBuffer();
    await assert.rejects(
      store.uploadImage(new File([png.subarray(0, png.length - 15)], "truncated.png")),
      (e) => e.status === 400,
    );
  });
  await check("Complete PNG JPEG WebP decode and upload", async () => {
    for (const format of ["png", "jpeg", "webp"]) {
      const buffer = await sharp({
        create: { width: 24, height: 24, channels: 3, background: "red" },
      })
        [format]()
        .toBuffer();
      const item = await store.uploadImage(new File([buffer], `valid.${format}`));
      assert.equal((await store.readImage(item.id)).bytes.length, buffer.length);
    }
  });
  await check("Optional hero video accepts HTTPS and rejects HTTP", async () => {
    assert(
      schema.settingsSchema.safeParse({
        ...saved.settings,
        heroVideoUrl: "https://example.invalid/film.mp4",
      }).success,
    );
    assert(
      !schema.settingsSchema.safeParse({
        ...saved.settings,
        heroVideoUrl: "http://example.invalid/film.mp4",
      }).success,
    );
  });
  await fs.writeFile(
    "docs/fixes-2026-10-05-evidence.json",
    JSON.stringify({ date: "2026-10-05", storeChecks: checks }, null, 2),
  );
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
