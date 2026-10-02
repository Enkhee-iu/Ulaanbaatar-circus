import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const action = process.argv[2] || "dev";
const version = process.versions.node.split(".").map(Number);
if (version[0] < 22 || (version[0] === 22 && version[1] < 12)) {
  console.error("Node.js 22.12+ шаардлагатай. start-local.cmd ашиглах эсвэл Node.js шинэчилнэ үү.");
  process.exit(1);
}
const env = { ...process.env, UB_CIRCUS_LOCAL_BUILD: "1", HOST: "127.0.0.1", PORT: "5173" };
const args = action === "build"
  ? [resolve(root, "node_modules/vite/bin/vite.js"), "build"]
  : action === "start"
    ? [resolve(root, ".output/server/index.mjs")]
    : [resolve(root, "node_modules/vite/bin/vite.js"), "dev", "--host", "127.0.0.1", "--port", "5173", "--strictPort"];
const child = spawn(process.execPath, args, { cwd: root, env, stdio: "inherit" });
child.on("error", error => { console.error(error.message); process.exitCode = 1; });
child.on("exit", code => { process.exitCode = code ?? 1; });
