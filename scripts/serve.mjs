import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";

const root = fileURLToPath(new URL("../docs/", import.meta.url));
const port = Number(process.env.PORT || 4173);
const component = fileURLToPath(
  new URL("../src/FloatFrame.tsx", import.meta.url),
);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".tsx": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
};
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file =
      path === "/FloatFrame.tsx"
        ? component
        : resolve(
            root,
            "." + (path.endsWith("/") ? path + "index.html" : path),
          );
    if (
      file !== component &&
      !file.startsWith(root.endsWith(sep) ? root : root + sep)
    ) {
      res.writeHead(403).end();
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`阿伟的镜头库: http://127.0.0.1:${port}`),
);
