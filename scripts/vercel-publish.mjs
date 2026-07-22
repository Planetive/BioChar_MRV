import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function findWorkspaceRoot(start) {
  let dir = start;
  for (;;) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot =
  findWorkspaceRoot(scriptRoot) ?? findWorkspaceRoot(process.cwd());

if (!workspaceRoot) {
  console.error("Could not find pnpm-workspace.yaml");
  process.exit(1);
}

const build = spawnSync(
  "pnpm",
  ["--filter", "@workspace/mrv-platform", "run", "build"],
  { cwd: workspaceRoot, stdio: "inherit", shell: true },
);

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const src = path.join(
  workspaceRoot,
  "artifacts",
  "mrv-platform",
  "dist",
  "public",
);

if (!fs.existsSync(src)) {
  console.error("Build output missing:", src);
  process.exit(1);
}

// Vercel outputDirectory is relative to the project Root Directory (cwd).
const dest = path.join(process.cwd(), "public");
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`Published ${src} -> ${dest}`);
