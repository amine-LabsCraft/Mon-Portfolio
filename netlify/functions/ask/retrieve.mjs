/*
 * Recherche hybride de l'assistant, partagée par la fonction Netlify et l'évaluation (tools/eval-rag.mjs).
 * 1. Fiches choisies par le routeur (projets, stages, domaines, certifications, sections du CV).
 * 2. BM25 (mots-clés) et similarité cosinus (embeddings Cohere), fusionnés par Reciprocal Rank Fusion.
 * 3. Sélection sous budget : peu de passages, ciblés, pour rester sous le quota de tokens de Groq.
 */
import { CHUNKS, DF, AVGDL, ROUTES, CATALOG } from "./knowledge.mjs";
import { queryTerms } from "./text.mjs";
import { unpackInt8 } from "./embed.mjs";

export { CATALOG, ROUTES };
export const ALWAYS = CHUNKS.filter((c) => c.always);

const N = CHUNKS.length;
const SEARCHABLE = CHUNKS.filter((c) => !c.always);
const RRF_K = 60;
const DEPTH = 50;
const MAX_PASSAGES = 8;
const MAX_CHARS = 8000;
const BOOST = { project: 1.25, experience: 1.25, domain: 1.15 };

/* Vecteurs int8 décodés une fois par instance, avec leur norme. */
const VECTORS = new Map();
for (const c of SEARCHABLE) {
    if (!c.vec) continue;
    const v = unpackInt8(c.vec);
    let n = 0;
    for (let i = 0; i < v.length; i++) n += v[i] * v[i];
    VECTORS.set(c.id, { v, norm: Math.sqrt(n) || 1 });
}
export const HAS_VECTORS = VECTORS.size > 0;

function bm25(terms, chunk) {
    const k1 = 1.4, b = 0.75;
    let score = 0;
    for (const t of terms) {
        const f = chunk.tf[t];
        if (!f) continue;
        const idf = Math.log(1 + (N - DF[t] + 0.5) / (DF[t] + 0.5));
        score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * chunk.len / AVGDL));
    }
    return score * (BOOST[chunk.kind] || 1);
}

export function lexicalRanking(text) {
    const terms = queryTerms(text);
    return SEARCHABLE.map((c) => [c, bm25(terms, c)]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).map((x) => x[0]);
}

export function denseRanking(queryVector) {
    if (!queryVector) return [];
    let qn = 0;
    for (const x of queryVector) qn += x * x;
    qn = Math.sqrt(qn) || 1;
    const scored = [];
    for (const c of SEARCHABLE) {
        const entry = VECTORS.get(c.id);
        if (!entry) continue;
        let dot = 0;
        for (let i = 0; i < entry.v.length; i++) dot += entry.v[i] * queryVector[i];
        scored.push([c, dot / (entry.norm * qn)]);
    }
    return scored.sort((a, b) => b[1] - a[1]).map((x) => x[0]);
}

/* Reciprocal Rank Fusion : additionne 1 / (k + rang) sur chaque classement, sans calibrer les scores. */
export function fuse(...rankings) {
    const score = new Map();
    for (const ranking of rankings) {
        ranking.slice(0, DEPTH).forEach((c, r) => score.set(c, (score.get(c) || 0) + 1 / (RRF_K + r + 1)));
    }
    return [...score].sort((a, b) => b[1] - a[1]).map((x) => x[0]);
}

/**
 * @param {object} q
 * @param {string} q.text       question (reformulée si le routeur a répondu) + mots-clés
 * @param {number[]} [q.vector] embedding de la question
 * @param {string[]} [q.ids]    fiches choisies par le routeur
 */
export function retrieve({ text, vector, ids = [] }) {
    const picked = [];
    let chars = 0;
    const perSource = {};
    const take = (c) => {
        if (!c || picked.includes(c) || c.always) return false;
        if (picked.length >= MAX_PASSAGES || (chars + c.text.length > MAX_CHARS && picked.length >= 2)) return false;
        /* Les README se répètent : 2 morceaux au plus. Les fiches (projet, stage) sont plus denses : jusqu'à 5. */
        const cap = c.kind === "readme" ? 2 : 5;
        if ((perSource[c.source.url] || 0) >= cap) return false;
        perSource[c.source.url] = (perSource[c.source.url] || 0) + 1;
        picked.push(c);
        chars += c.text.length;
        return true;
    };

    for (const id of ids.slice(0, 3)) take(CHUNKS[ROUTES[id]]);
    for (const c of fuse(lexicalRanking(text), denseRanking(vector))) {
        if (picked.length >= MAX_PASSAGES) break;
        take(c);
    }
    /* Un passage README ou de détails sans sa fiche manque de contexte : on ajoute la fiche si le budget le permet. */
    for (const c of [...picked]) {
        if (!c.project || picked.some((p) => p.primary && p.project === c.project)) continue;
        const card = CHUNKS.find((x) => x.primary && x.project === c.project);
        if (card && chars + card.text.length <= MAX_CHARS + 1500) { picked.push(card); chars += card.text.length; }
    }
    return picked;
}
