/*
 * Prépare le déploiement en une commande :
 * 1. reconstruit la base de connaissances de l'assistant (netlify/functions/ask/knowledge.mjs) ;
 * 2. recrée dist/ avec uniquement les fichiers publiés par le site.
 *
 * Utilisation : node tools/build.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

execFileSync(process.execPath, [path.join(ROOT, "tools/build-knowledge.mjs")], { stdio: "inherit" });

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "images"), { recursive: true });

const files = ["index.html", "project.html", "style.css", "i18n.js", "common.js", "script.js", "project.js", "assistant.js", "favicon.svg", "CV___Amine_AIT ALI .pdf", "images/Mon Image.jpg"];
const folders = ["data", "images/projects", "images/logos", "images/tech", "images/certs"];
for (const f of files) fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
for (const d of folders) fs.cpSync(path.join(ROOT, d), path.join(DIST, d), { recursive: true });

/* Vérifie que chaque image référencée par les données existe bien dans dist/. */
const sandbox = { window: {} };
for (const f of ["data/projects.js", "data/certificates.js"]) vm.runInNewContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox);
const missing = [
    ...sandbox.window.PORTFOLIO_PROJECTS.flatMap((p) => p.images.map((i) => `images/projects/${p.id}/${i.file}`)),
    ...sandbox.window.PORTFOLIO_CERTIFICATES.map((c) => `images/${c.file}`)
].filter((p) => !fs.existsSync(path.join(DIST, p)));

const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
console.log(`dist/ prêt : ${count(DIST)} fichiers${missing.length ? ` — MANQUANTS : ${missing.join(", ")}` : ", aucune image manquante"}`);
