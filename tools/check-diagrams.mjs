/*
 * Contrôle des schémas d'architecture (data/docs.js → map) de chaque projet et de chaque stage.
 * Échoue si un schéma est incohérent ou s'il oublie une technologie de la stack :
 *  - chaque technologie de project.stack apparaît sur le schéma (nom, tech ou stack d'un composant,
 *    titre ou stack d'une zone, ou socle commun map.stack) ;
 *  - chaque liaison relie deux composants existants, avec un type connu ;
 *  - chaque composant est relié à au moins un autre ;
 *  - zones, notes et liaisons ont un libellé français et anglais.
 *
 * Utilisation : node tools/check-diagrams.mjs   (lancé par tools/build.mjs)
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sandbox = { window: {} };
for (const f of ["projects", "architectures", "docs", "internships"]) {
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, `data/${f}.js`), "utf8"), sandbox);
}
const { PORTFOLIO_PROJECTS: projects, PORTFOLIO_INTERNSHIPS: internships, PORTFOLIO_DOCS: docs } = sandbox.window;

const KINDS = new Set(["data", "control", "monitor"]);
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const bilingual = (v) => v && typeof v === "object" && v.fr && v.en;

const errors = [];
let checked = 0;
for (const item of [...projects, ...internships]) {
    const map = docs[item.id]?.map;
    const where = item.id;
    if (!map) { errors.push(`${where} : aucun schéma (ajoutez map dans data/docs.js)`); continue; }
    checked++;
    const nodes = map.zones.flatMap((z) => z.nodes);
    const ids = new Set();
    for (const zone of map.zones) {
        if (!bilingual(zone.title)) errors.push(`${where} : zone sans titre fr/en`);
        if (!zone.nodes.length) errors.push(`${where} : zone « ${zone.title.fr} » vide`);
    }
    for (const n of nodes) {
        if (ids.has(n.id)) errors.push(`${where} : identifiant de composant en double « ${n.id} »`);
        ids.add(n.id);
        if (n.note && !bilingual(n.note)) errors.push(`${where} : note de « ${n.name} » sans fr/en`);
    }
    const linked = new Set();
    for (const l of map.links) {
        if (!ids.has(l.from) || !ids.has(l.to)) errors.push(`${where} : liaison ${l.from} → ${l.to} vers un composant inconnu`);
        if (l.from === l.to) errors.push(`${where} : liaison de ${l.from} vers lui-même`);
        if (!KINDS.has(l.kind)) errors.push(`${where} : type de liaison inconnu « ${l.kind} »`);
        if (!bilingual(l.label)) errors.push(`${where} : liaison ${l.from} → ${l.to} sans libellé fr/en`);
        linked.add(l.from); linked.add(l.to);
    }
    for (const n of nodes) if (!linked.has(n.id)) errors.push(`${where} : « ${n.name} » n'est relié à rien`);

    /* Tout ce qui apparaît sur le schéma, pour vérifier qu'aucune technologie de la stack n'a été oubliée. */
    const shown = [
        ...(map.stack || []),
        ...map.zones.flatMap((z) => [z.title.fr, z.title.en, ...(z.stack || [])]),
        ...nodes.flatMap((n) => [n.name, n.tech, ...(n.stack || [])])
    ].map(norm);
    const missing = item.stack.filter((tech) => !shown.some((s) => s.includes(norm(tech))));
    if (missing.length) errors.push(`${where} : technologies absentes du schéma — ${missing.join(", ")}`);
}

if (errors.length) {
    console.error(`Schémas : ${errors.length} problème(s)\n  ${errors.join("\n  ")}`);
    process.exit(1);
}
console.log(`Schémas : ${checked} vérifiés, toutes les technologies de chaque stack sont représentées.`);
