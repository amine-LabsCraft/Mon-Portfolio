/*
 * Construit la base de connaissances de l'assistant RAG.
 * Sources : knowledge/cv.md, knowledge/readmes/*.md, data/projects.js, data/architectures.js, data/certificates.js.
 * Sortie : netlify/functions/ask/knowledge.mjs (passages, index BM25, vecteurs Cohere int8, catalogue du routeur).
 * Les vecteurs sont mis en cache dans knowledge/embeddings-cache.json : seuls les passages nouveaux sont encodés.
 * En local : ENV_FILE=chemin/.env node tools/build-knowledge.mjs (lit uniquement COHERE_API_KEY).
 *
 * Utilisation : node tools/build-knowledge.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { tokenize } from "../netlify/functions/ask/text.mjs";
import { embed, packInt8, EMBED_MODEL, EMBED_DIMS } from "../netlify/functions/ask/embed.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

function loadData(file) {
    const sandbox = { window: {} };
    vm.runInNewContext(read(file), sandbox);
    return sandbox.window;
}

const { PORTFOLIO_PROJECTS: projects } = loadData("data/projects.js");
const { PORTFOLIO_ARCHITECTURES: architectures } = loadData("data/architectures.js");
const { PORTFOLIO_CERTIFICATES: certificates } = loadData("data/certificates.js");
const { PORTFOLIO_DOCS: docs = {} } = loadData("data/docs.js");

const chunks = [];
const MAX_CHARS = 1500;

function add(source, text, extra = {}) {
    const clean = text.replace(/\n{3,}/g, "\n\n").trim();
    if (clean.length < 60) return;
    chunks.push({ id: chunks.length, source, text: clean, ...extra });
}

/* Découpe un long texte en morceaux d'environ MAX_CHARS, sur les paragraphes. */
function split(text) {
    const parts = [];
    let current = "";
    for (const para of text.split(/\n(?=\S)/)) {
        if ((current + "\n" + para).length > MAX_CHARS && current) { parts.push(current); current = ""; }
        current = current ? `${current}\n${para}` : para;
        while (current.length > MAX_CHARS * 1.4) { parts.push(current.slice(0, MAX_CHARS)); current = current.slice(MAX_CHARS); }
    }
    if (current) parts.push(current);
    return parts;
}

const fr = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v.fr : v);
const en = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v.en : v);
const projectUrl = (p) => `project.html?id=${p.id}`;
const GROUPS = { data: "Data engineering & Cloud", ai: "IA & Machine Learning", software: "Software" };

/* 1. CV : une section par passage. Le profil et les expériences sont toujours fournis au modèle. */
const cvSections = read("knowledge/cv.md").split(/\n(?=## )/);
cvSections.forEach((section, i) => {
    const heading = (section.match(/^## (.*)/) || [null, "Identité et contact"])[1].trim();
    add({ title: "CV", url: "CV___Amine_AIT%20ALI%20.pdf" }, section, { kind: "cv", route: `cv-${i}`, label: `CV — ${heading}`, ...(i <= 2 ? { always: true } : {}) });
});

/* Documentation détaillée (data/docs.js) : contexte, démarche, choix et résultats, en français. */
function docText(doc) {
    if (!doc) return "";
    return [
        `Contexte : ${fr(doc.context)}`,
        (fr(doc.pains) || []).length ? `Ce qui bloquait : ${fr(doc.pains).join(" ")}` : "",
        `Démarche : ${doc.steps.map((s, i) => `${i + 1}) ${fr(s.title)} : ${fr(s.text)}`).join(" ")}`,
        doc.decisions?.length ? `Choix techniques : ${doc.decisions.map((d) => `${fr(d.choice)} (${fr(d.why)})`).join(" ")}` : "",
        (fr(doc.results) || []).length ? `Résultats : ${fr(doc.results).join(" ")}` : "",
        (fr(doc.next) || []).length ? `Limites et suites : ${fr(doc.next).join(" ")}` : ""
    ].filter(Boolean).join("\n");
}

/* 2. Projets : une fiche complète par projet, en français et en anglais. */
for (const p of projects) {
    const arch = architectures[p.id];
    const archText = arch ? [
        "Architecture :",
        ...arch.stages.map((s, i) => {
            const branches = s.branches ? s.branches.map((b) => `${fr(b.title)} (${(b.items || []).join(", ")}) : ${fr(b.detail)}`).join(" | ") : "";
            return `${i + 1}. ${fr(s.title)}${s.items?.length ? ` [${s.items.join(", ")}]` : ""} : ${fr(s.detail) || branches}`;
        }),
        ...(arch.bands || []).map((b) => `Transverse — ${fr(b.title)} [${(b.items || []).join(", ")}] : ${fr(b.detail)}`)
    ].join("\n") : "";
    /* Fiche courte (ce que fait le projet) et détails (architecture, démarche, résultats) en passages séparés :
       chaque passage reste ciblé et le contexte envoyé au modèle reste petit. */
    const summary = [
        `Projet : ${p.title}${p.titleEn ? ` (${p.titleEn})` : ""} — ${fr(p.kind)} / ${en(p.kind)}. Domaine : ${GROUPS[p.group]}.${p.featured ? " Projet phare du portfolio." : ""}`,
        p.source === "cloud" ? "Projet réalisé dans le cloud, présenté sur LinkedIn (pas de dépôt de code)." : `Dépôt GitHub : github.com/amine-LabsCraft/${p.repo}.`,
        p.updated ? `Dernière mise à jour : ${p.updated}.` : "",
        `Résumé : ${fr(p.tagline)}`,
        `Summary (EN): ${en(p.tagline)}`,
        `Problème : ${fr(p.problem)}`,
        `Réalisation : ${(fr(p.built) || []).join(" ")}`,
        p.metrics?.length ? `Chiffres clés : ${p.metrics.map((m) => `${m.value} ${fr(m.label)}`).join(", ")}.` : "",
        `Stack : ${p.stack.join(", ")}.`
    ].filter(Boolean).join("\n");
    const source = { title: p.title, url: projectUrl(p) };
    add(source, summary, { project: p.id, kind: "project", primary: true, route: p.id, label: `Projet ${p.title} (${GROUPS[p.group]}${p.featured ? ", phare" : ""}) — ${p.stack.slice(0, 3).join(", ")}` });
    const details = [archText, docText(docs[p.id])].filter(Boolean).join("\n");
    for (const part of split(details)) add(source, `[Projet ${p.title} — architecture, démarche et résultats]\n${part}`, { project: p.id, kind: "project" });
}

/* 3. README des dépôts : nettoyés puis découpés par section. */
const byRepo = Object.fromEntries(projects.filter((p) => p.repo).map((p) => [p.repo, p]));
const SKIP = /(table des mati|sommaire|table of contents|licen[cs]e|contribu|installation|prérequis|prerequisites|dépannage|troubleshooting|démarrage rapide|quick ?start|faq|auteur|author|commandes utiles)/i;
for (const file of fs.readdirSync(path.join(ROOT, "knowledge/readmes"))) {
    const project = byRepo[file.replace(/\.md$/, "")];
    if (!project) continue;
    const md = read(`knowledge/readmes/${file}`)
        .replace(/```[\s\S]*?```/g, (block) => (block.length < 700 && /→|-->|│|▼|flowchart/.test(block) ? block.replace(/```\w*/g, "") : ""))
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/:contentReference\[[^\]]*\]\{[^}]*\}/g, "")
        .replace(/^\s*[-|: ]+\s*$/gm, "")
        .replace(/[ \t]+/g, " ");
    let count = 0;
    const trail = [];
    for (const section of md.split(/\n(?=#{1,3} )/)) {
        const [, hashes = "", heading = ""] = section.match(/^(#{1,3}) (.*)/) || [];
        if (hashes) { trail.length = hashes.length - 1; trail[hashes.length - 1] = heading.replace(/[*_`#]/g, "").trim(); }
        if (SKIP.test(heading)) continue;
        /* Chaque morceau porte son chemin de titres (« projet › section › sous-section ») : hors contexte, il reste compréhensible. */
        const where = [project.title, ...trail.slice(1).filter(Boolean)].join(" › ");
        for (const part of split(section)) {
            if (count >= 45) break;
            add({ title: `${project.title} (README)`, url: projectUrl(project) }, `[README ${where}] ${part}`, { project: project.id, kind: "readme" });
            count += 1;
        }
    }
}

/* 3 bis. Notes des projets sans dépôt (knowledge/projects/<id>.md), découpées par section. */
const notesDir = path.join(ROOT, "knowledge/projects");
for (const file of fs.existsSync(notesDir) ? fs.readdirSync(notesDir).filter((f) => f.endsWith(".md")) : []) {
    const project = projects.find((p) => p.id === file.replace(/\.md$/, ""));
    if (!project) continue;
    for (const section of read(`knowledge/projects/${file}`).split(/\n(?=#{1,3} )/)) {
        for (const part of split(section)) {
            add({ title: `${project.title} (notes)`, url: projectUrl(project) }, `[Notes ${project.title}] ${part}`, { project: project.id, kind: "readme" });
        }
    }
}

/* 4. Certifications, regroupées par domaine. */
const CAT = { data: "Data & SQL", ai: "IA & Machine Learning", cloud: "Cloud", dev: "Développement" };
for (const [cat, label] of Object.entries(CAT)) {
    const list = certificates.filter((c) => c.category === cat);
    add({ title: "Certifications", url: "index.html#certifications" },
        `Certifications ${label} (${list.length}) :\n` + list.map((c) => `- ${c.title} — ${c.issuer}${c.partners?.length ? `, en collaboration avec ${c.partners.join(", ")}` : ""}${c.date ? `, ${c.date}` : ""}${c.skills ? ` (${c.skills.join(", ")})` : ""}`).join("\n"),
        { kind: "certs", route: `certs-${cat}`, label: `Certifications ${label} (${list.length})` });
}
add({ title: "Certifications", url: "index.html#certifications" },
    `Amine a ${certificates.length} certifications au total : ${Object.entries(CAT).map(([c, l]) => `${certificates.filter((x) => x.category === c).length} en ${l}`).join(", ")}. Émetteurs : DataCamp, Coursera (Google, IBM, University of Michigan, Vanderbilt, University of Colorado Boulder), 365 Data Science, Microsoft, Cisco Networking Academy.`,
    { kind: "certs", route: "certs-total", label: "Nombre total de certifications et émetteurs" });

/* 3 ter. Stages (pages experience.html) : présentation et documentation détaillée. */
const { PORTFOLIO_INTERNSHIPS: internships = [], PORTFOLIO_DOCS: internshipDocs = {} } = loadData("data/internships.js");
for (const x of internships) {
    const source = { title: `Stage : ${x.org}`, url: `experience.html?id=${x.id}` };
    add(source, [
        `Stage ${x.org} — ${fr(x.title)} (${fr(x.kind)}, ${fr(x.period)}).`,
        `Résumé : ${fr(x.tagline)}`,
        `Enjeu : ${fr(x.problem)}`,
        x.metrics?.length ? `Chiffres clés : ${x.metrics.map((m) => `${m.value} ${fr(m.label)}`).join(", ")}.` : "",
        `Stack : ${x.stack.join(", ")}.`
    ].filter(Boolean).join("\n"), { kind: "experience", primary: true, route: `stage-${x.id}`, label: `Stage ${x.org} — ${fr(x.title)} — ${x.stack.slice(0, 3).join(", ")}` });
    for (const part of split(docText(internshipDocs[x.id]))) add(source, `[Stage ${x.org} — démarche, choix et résultats]\n${part}`, { kind: "experience" });
}

/* 4 bis. Domaines (pages domain.html) : points forts et compétences appliquées. */
const { PORTFOLIO_DOMAINS: domains = [], PORTFOLIO_EXPERIENCES: experiences = [] } = loadData("data/domains.js");
const DOMAIN_NAMES = { data: "Data engineering", cloud: "Cloud & lakehouse", ai: "AI engineering", ml: "Machine learning", bi: "Analytics & BI", ops: "Exploitation (Ops)" };
for (const d of domains) {
    const wanted = new Set(d.skills.map((s) => s.toLowerCase()));
    const used = (list) => list.filter((s) => wanted.has(s.toLowerCase()));
    const skillsApplied = [...new Set([
        ...projects.flatMap((p) => used(p.stack)),
        ...certificates.flatMap((c) => used(c.skills || [])),
        ...experiences.flatMap((e) => used(e.skills))
    ])];
    const byId = (id) => projects.find((p) => p.id === id)?.title || id;
    add({ title: `Domaine : ${DOMAIN_NAMES[d.id] || d.id}`, url: `domain.html?id=${d.id}` }, [
        `Domaine ${DOMAIN_NAMES[d.id] || d.id} : ${fr(d.intro)}`,
        `Points forts : ${d.strengths.map((s) => `${fr(s.title)} — ${fr(s.text)} (démontré dans ${s.proof.map(byId).join(", ")})`).join(" ")}`,
        `Compétences appliquées dans des projets, formations ou expériences : ${skillsApplied.join(", ")}.`
    ].join("\n"), { kind: "domain", route: `domaine-${d.id}`, label: `Domaine ${DOMAIN_NAMES[d.id] || d.id} : points forts et compétences` });
}

/* 5. Vue d'ensemble du portfolio, toujours fournie au modèle. */
add({ title: "Portfolio", url: "index.html#projets" },
    /* Chaque projet avec ses technologies principales : pour une question « liste », le modèle a de quoi décrire
       chaque projet sans rien inventer. */
    `Le portfolio présente ${projects.length} projets (technologies principales entre parenthèses).\n` + Object.entries(GROUPS).map(([g, l]) => `${l} : ${projects.filter((p) => p.group === g).map((p) => `${p.title} (${p.stack.slice(0, 4).join(", ")})`).join(" ; ")}`).join(".\n") + ".",
    { always: true, kind: "overview" });

/* Index BM25 : fréquence des termes par passage et fréquence documentaire. */
const df = {};
let totalLength = 0;
for (const c of chunks) {
    const tokens = tokenize(`${c.source.title} ${c.text}`);
    const tf = {};
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
    c.tf = tf;
    c.len = tokens.length;
    totalLength += tokens.length;
    for (const t of Object.keys(tf)) df[t] = (df[t] || 0) + 1;
}

/* Embeddings : relus depuis knowledge/embeddings-cache.json (versionné) ; seuls les passages nouveaux
   ou modifiés sont envoyés à Cohere, et seulement si COHERE_API_KEY est disponible pendant le build. */
if (!process.env.COHERE_API_KEY && process.env.ENV_FILE && fs.existsSync(process.env.ENV_FILE)) {
    const line = fs.readFileSync(process.env.ENV_FILE, "utf8").split(/\r?\n/).find((l) => /^\s*COHERE_API_KEY\s*=/.test(l));
    if (line) process.env.COHERE_API_KEY = line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
}
const CACHE_FILE = path.join(ROOT, "knowledge/embeddings-cache.json");
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) : {};
const vectors = cache.model === `${EMBED_MODEL}/${EMBED_DIMS}` ? cache.vectors : {};
const embedText = (c) => `${c.source.title}\n${c.text}`.slice(0, 6000);
const hash = (c) => crypto.createHash("sha1").update(embedText(c)).digest("hex").slice(0, 16);
const todo = chunks.filter((c) => !c.always && !vectors[hash(c)]);
if (todo.length && process.env.COHERE_API_KEY) {
    for (let i = 0; i < todo.length; i += 90) {
        const batch = todo.slice(i, i + 90);
        const result = await embed(batch.map(embedText), { type: "document", key: process.env.COHERE_API_KEY, int8: true, timeout: 60_000 });
        batch.forEach((c, j) => { vectors[hash(c)] = packInt8(result[j]); });
    }
    console.log(`embeddings : ${todo.length} passages encodés avec ${EMBED_MODEL}`);
} else if (todo.length) {
    console.warn(`embeddings : ${todo.length} passages sans vecteur (COHERE_API_KEY absente) — recherche par mots-clés pour ceux-là`);
}
const kept = {};
for (const c of chunks) {
    if (c.always) continue;
    const v = vectors[hash(c)];
    if (v) { c.vec = v; kept[hash(c)] = v; }
}
fs.writeFileSync(CACHE_FILE, JSON.stringify({ model: `${EMBED_MODEL}/${EMBED_DIMS}`, vectors: kept }));

/* Catalogue du routeur : une ligne par fiche (projet, stage, domaine, certifications, section du CV). */
const routes = Object.fromEntries(chunks.filter((c) => c.route).map((c) => [c.route, c.id]));
const catalog = chunks.filter((c) => c.route).map((c) => `${c.route} — ${c.label}`).join("\n");

const out = `/* Généré par tools/build-knowledge.mjs — ne pas modifier à la main. */
export const CHUNKS = ${JSON.stringify(chunks)};
export const DF = ${JSON.stringify(df)};
export const AVGDL = ${totalLength / chunks.length};
export const ROUTES = ${JSON.stringify(routes)};
export const CATALOG = ${JSON.stringify(catalog)};
`;
fs.writeFileSync(path.join(ROOT, "netlify/functions/ask/knowledge.mjs"), out);
console.log(`${chunks.length} passages, ${Object.keys(df).length} termes, ${Object.keys(kept).length} vecteurs, ${Object.keys(routes).length} fiches routables, ${(out.length / 1024).toFixed(0)} Ko`);
