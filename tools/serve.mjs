// Run with:  npm start   (or: node tools/serve.mjs)
// Shows the site on http://localhost:3000. Nothing to install.
// Pages open with or without ".html" (/article.html?slug=... and /article?slug=... both work, like on Vercel),
// and the address is never redirected, so ?slug=, ?pack= and ?lang= are always kept.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, dirname, extname, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = 3000;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

// Finds the file for an address: /blog -> blog.html, / -> index.html, /folder/ -> folder/index.html
async function findFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^[\\/]+/, "");
  const base = join(root, clean);
  if (base !== root && !base.startsWith(root + sep)) return null; // stay inside the site folder
  const candidates = extname(base) ? [base] : [join(base, "index.html"), base.replace(/[\\/]+$/, "") + ".html"];
  for (const path of candidates) {
    try {
      if ((await stat(path)).isFile()) return path;
    } catch { /* try the next one */ }
  }
  return null;
}

const server = createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, "http://localhost");
    const file = await findFile(pathname);
    const path = file || join(root, "404.html");
    const body = await readFile(path);
    response.writeHead(file ? 200 : 404, {
      "Content-Type": types[extname(path).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store", // always show your latest changes
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Server error: ${error.message}`);
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Close the other window that runs the site (or the program using port ${port}) and try again.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

server.listen(port, () => {
  console.log(`SIDEKOM site running at http://localhost:${port}  (press Ctrl+C to stop)`);
});
