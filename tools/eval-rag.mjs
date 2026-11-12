/*
 * Évaluation de la recherche de l'assistant sur tools/rag-cases.json.
 * Mesure : la bonne source est-elle en 1re position, dans le top 3, parmi les passages envoyés au modèle ?
 *
 *   node tools/eval-rag.mjs                  BM25 seul, hors ligne (lancé par le build ; échoue sous le seuil)
 *   ENV_FILE=chemin/.env node tools/eval-rag.mjs --live   routeur + embeddings, comme en production
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const live = process.argv.includes("--live");
const verbose = process.argv.includes("--verbose");
const MIN_TOP3_OFFLINE = 0.75;

if (live && process.env.ENV_FILE && fs.existsSync(process.env.ENV_FILE)) {
    for (const line of fs.readFileSync(process.env.ENV_FILE, "utf8").split(/\r?\n/)) {
        const m = line.match(/^\s*(GROQ_API_KEY|COHERE_API_KEY)\s*=\s*(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
}

const { retrieve } = await import("../netlify/functions/ask/retrieve.mjs");
const { route, embedQuery } = live ? await import("../netlify/functions/ask/ask.mjs") : {};
const cases = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/rag-cases.json"), "utf8"));

const matches = (c, e) => e.startsWith("kind:") ? c.kind === e.slice(5)
    : e.startsWith("url:") ? c.source.url === e.slice(4)
    : e.startsWith("route:") ? c.route === e.slice(6)
    : c.project === e;

async function run(item) {
    const history = item.history || [];
    const lastUser = [...history].reverse().find((m) => m.role === "user")?.content || "";
    if (!live) {
        return { passages: retrieve({ text: `${item.q} ${item.q.length < 60 ? lastUser : ""}` }) };
    }
    const routed = history.length ? await route(item.q, history) : null;
    const first = history.length ? null : embedQuery(item.q);
    /* Même repli que la fonction : sans routeur, une relance courte est complétée par la question précédente. */
    const standalone = routed?.query || (item.q.length < 60 ? `${item.q} ${lastUser}` : item.q);
    const vector = await (first || embedQuery(standalone));
    return { routed, dense: Boolean(vector), passages: retrieve({ text: `${item.q} ${standalone} ${routed?.keywords || ""}`, vector, ids: routed?.ids }) };
}

let h1 = 0, h3 = 0, hall = 0, chars = 0, routedCount = 0, denseCount = 0;
const misses = [];
const results = [];
/* Par lots de 4 pour rester sous les limites de débit de Groq et Cohere. */
for (let i = 0; i < cases.length; i += 4) results.push(...await Promise.all(cases.slice(i, i + 4).map(run)));
cases.forEach((item, i) => {
    const { passages, routed, dense } = results[i];
    const rank = passages.findIndex((c) => item.expect.some((e) => matches(c, e)));
    if (rank === 0) h1++;
    if (rank >= 0 && rank < 3) h3++;
    if (rank >= 0) hall++;
    if (routed) routedCount++; else if (live && item.history) misses.push(`  routeur indisponible — « ${item.q} »`);
    if (dense) denseCount++;
    chars += passages.reduce((n, c) => n + c.text.length, 0);
    if (rank < 0 || rank > 2) misses.push(`  ${rank < 0 ? "absent" : `rang ${rank + 1}`} — « ${item.q} » → ${passages.slice(0, 3).map((c) => c.route || c.source.title).join(" | ")}`);
    if (verbose) console.log(`${rank === 0 ? "✓" : rank > 0 ? "~" : "✗"} ${item.q}  ${routed ? `[router: ${routed.ids.join(", ")}]` : ""}`);
});

const pct = (n) => `${Math.round((n / cases.length) * 100)} %`;
console.log(`RAG ${live ? "live (routeur + embeddings)" : "hors ligne (BM25)"} — ${cases.length} questions : 1re position ${pct(h1)}, top 3 ${pct(h3)}, présente ${pct(hall)}, contexte moyen ${Math.round(chars / cases.length)} caractères${live ? `, relances routées ${routedCount}/${cases.filter((c) => c.history).length}, embeddings ${denseCount}/${cases.length}` : ""}`);
if (misses.length) console.log(misses.join("\n"));
if (!live && h3 / cases.length < MIN_TOP3_OFFLINE) {
    console.error(`Échec : top 3 sous ${MIN_TOP3_OFFLINE * 100} %. Vérifiez la base de connaissances (tools/build-knowledge.mjs).`);
    process.exit(1);
}
