/*
 * Serveur de test local : sert le site et la fonction /api/ask comme Netlify.
 * Les clés sont lues depuis un fichier .env (chemin en argument ou ENV_FILE), sans jamais être affichées.
 *
 * Utilisation : node tools/dev-server.mjs [chemin/vers/.env] [port]
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = process.argv[2] || process.env.ENV_FILE;
const port = Number(process.argv[3] || 8888);

if (envFile && fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
        if (m && ["GROQ_API_KEY", "OPENROUTER_API_KEY"].includes(m[1]) && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
}
console.log(`Clés chargées : GROQ ${process.env.GROQ_API_KEY ? "oui" : "non"}, OPENROUTER ${process.env.OPENROUTER_API_KEY ? "oui" : "non"}`);

const { default: ask } = await import("../netlify/functions/ask/ask.mjs");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".pdf": "application/pdf", ".json": "application/json" };

http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/ask") {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const request = new Request(url, { method: req.method, headers: req.headers, body: req.method === "POST" ? Buffer.concat(chunks) : undefined });
        const response = await ask(request, { ip: req.socket.remoteAddress });
        res.writeHead(response.status, Object.fromEntries(response.headers));
        if (response.body) for await (const part of response.body) res.write(part);
        return res.end();
    }
    let file = path.join(ROOT, decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`http://127.0.0.1:${port}`));
