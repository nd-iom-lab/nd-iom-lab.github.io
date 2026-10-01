import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, watch } from "node:fs";
import path from "node:path";
import { build, root } from "./build.mjs";
build();
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const server = createServer((req, res) => {
  let name;
  try {
    name = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  let file = path.resolve(root, "dist", "." + name);
  if (
    !file.startsWith(path.join(root, "dist") + path.sep) &&
    file !== path.join(root, "dist")
  ) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory())
    file = path.join(file, "index.html");
  let status = 200;
  if (!existsSync(file)) {
    status = 404;
    file = path.join(root, "dist/404.html");
  }
  res.writeHead(status, {
    "Content-Type": types[path.extname(file)] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  res.end(readFileSync(file));
});
const port = Number(process.env.PORT || 4321);
server.listen(port, "0.0.0.0", () =>
  console.log(`Preview: http://localhost:${port}`),
);
if (!process.argv.includes("--preview")) {
  let timer;
  for (const dir of ["content", "src", "public"])
    watch(path.join(root, dir), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          build();
        } catch (e) {
          console.error(e.message);
        }
      }, 150);
    });
}
