import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const releaseDir = path.join(root, "release-package");

await fs.rm(releaseDir, { recursive: true, force: true });
await fs.mkdir(releaseDir, { recursive: true });
await fs.cp(path.join(root, "dist"), path.join(releaseDir, "dist"), { recursive: true });
await fs.copyFile(path.join(root, "text-slides.lua"), path.join(releaseDir, "text-slides.lua"));
await fs.copyFile(path.join(root, "README.md"), path.join(releaseDir, "README.md"));
await fs.copyFile(path.join(root, "LICENSE"), path.join(releaseDir, "LICENSE"));
