// One-time loss-minimizing web export. Originals stay in migration/original-assets.
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  renameSync,
  existsSync,
} from "node:fs";
import path from "node:path";
import { root } from "./build.mjs";
const sharp = (await import(process.env.SHARP_MODULE || "sharp")).default;
const folder = path.join(root, "public/assets"),
  originals = path.join(root, "migration/original-assets");
mkdirSync(originals, { recursive: true });
const replacements = {};
for (const file of readdirSync(folder)) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
  const source = path.join(folder, file),
    name = file.replace(/\.(png|jpe?g|webp)$/i, ".webp");
  const isHero = file.includes("3fc12d88"),
    width = isHero ? 3341 : 1800;
  const buffer = await sharp(source)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 94, effort: 6 })
    .toBuffer();
  renameSync(source, path.join(originals, file));
  writeFileSync(path.join(folder, name), buffer);
  replacements["/assets/" + file] = "/assets/" + name;
}
for (const file of readdirSync(path.join(root, "content"))) {
  const p = path.join(root, "content", file);
  let text = readFileSync(p, "utf8");
  for (const [old, next] of Object.entries(replacements))
    text = text.replaceAll(old, next);
  writeFileSync(p, text);
}
writeFileSync(
  path.join(root, "migration/optimized-assets.json"),
  JSON.stringify(replacements, null, 2),
);
console.log("Optimized", Object.keys(replacements).length, "images");
