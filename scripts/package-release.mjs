import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const releaseDir = path.join(root, "release-package");

await fs.rm(releaseDir, { recursive: true, force: true });
await fs.mkdir(releaseDir, { recursive: true });

await fs.copyFile(path.join(root, "dist", "Dock.html"), path.join(releaseDir, "Dock.html"));
await fs.copyFile(path.join(root, "dist", "Source.html"), path.join(releaseDir, "Source.html"));
await fs.copyFile(path.join(root, "text-slides.lua"), path.join(releaseDir, "text-slides.lua"));
await fs.copyFile(path.join(root, "README.md"), path.join(releaseDir, "README.md"));
