/*
 * Schéma d'architecture interactif (pages projet et stage), inspiré du canevas de FlowPlan :
 * zones en colonnes, composants placés automatiquement pour limiter les croisements,
 * liaisons routées entre les colonnes, étiquettes sans chevauchement, zoom, déplacement,
 * plein écran et panneau de détail au clic.
 *
 * window.portfolioDiagram.mount(élément, map, { pick, name, t }) → { relayout, refit, destroy }
 * window.portfolioDiagram.fromPipeline(arch, pick)             → map (schéma déduit de la vue pipeline)
 */
(() => {
    const NODE_W = 176;      /* largeur d'un composant */
    const PAD = 12;          /* marge intérieure d'une zone */
    const GAP = 22;          /* espace vertical entre deux composants */
    const GAP_LINKED = 50;   /* espace quand une liaison verticale (et son étiquette) passe entre eux */
    const GAP_DUMMY = 10;    /* espace autour d'une liaison qui traverse la zone */
    const DUMMY_H = 14;
    const LABEL_H = 20;
    const BULGE = 34;        /* écart des liaisons internes à une zone qui contournent des composants */
    const LANE_HUES = ["var(--blue)", "#8b5cf6", "var(--teal)", "var(--amber)", "#d9468f", "#0ea5e9"];

    const esc = (s) => window.portfolio.escapeHtml(String(s ?? ""));
    const avg = (list) => list.reduce((a, b) => a + b, 0) / list.length;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    /* Positions les plus proches des souhaits, dans l'ordre, sans chevauchement (régression isotone). */
    function pack(desired, sizes) {
        const off = [0];
        for (let i = 1; i < desired.length; i++) off[i] = off[i - 1] + sizes[i - 1];
        const blocks = [];
        desired.forEach((d, i) => {
            blocks.push({ sum: d - off[i], n: 1 });
            while (blocks.length > 1 && blocks.at(-2).sum / blocks.at(-2).n > blocks.at(-1).sum / blocks.at(-1).n) {
                const b = blocks.pop();
                blocks.at(-1).sum += b.sum;
                blocks.at(-1).n += b.n;
            }
        });
        const out = [];
        for (const b of blocks) for (let k = 0; k < b.n; k++) out.push(b.sum / b.n + off[out.length]);
        return out;
    }

    /* Point d'une courbe de Bézier cubique à liaison horizontale (tangentes horizontales aux extrémités). */
    const bez = (p, q, t) => {
        const mx = (q.x - p.x) / 2;
        const u = 1 - t;
        return {
            x: u ** 3 * p.x + 3 * u * u * t * (p.x + mx) + 3 * u * t * t * (q.x - mx) + t ** 3 * q.x,
            y: u ** 3 * p.y + 3 * u * u * t * p.y + 3 * u * t * t * q.y + t ** 3 * q.y
        };
    };
    const curve = (p, q) => { const mx = (q.x - p.x) / 2; return `C${p.x + mx},${p.y} ${q.x - mx},${q.y} ${q.x},${q.y}`; };

    /* ---------- Calcul du placement ---------- */

    function layout(map, size) {
        const lanes = map.zones.map((z) => z.nodes.map((n) => n.id));
        const node = new Map();
        map.zones.forEach((z, k) => z.nodes.forEach((n) => node.set(n.id, { id: n.id, lane: k, h: size.node(n.id) })));

        /* Liaisons : celles qui sautent des zones passent par des points relais (un par zone traversée). */
        const edges = map.links.map((l, i) => {
            const a = node.get(l.from), b = node.get(l.to);
            const e = { ...l, i, same: a.lane === b.lane, rev: b.lane < a.lane, labelW: size.label(i) };
            if (e.same) return e;
            const [s, t] = e.rev ? [b, a] : [a, b];
            e.chain = [s.id];
            for (let k = s.lane + 1; k < t.lane; k++) {
                const d = `~${i}~${k}`;
                node.set(d, { id: d, lane: k, h: DUMMY_H, dummy: true });
                lanes[k].push(d);
                e.chain.push(d);
            }
            e.chain.push(t.id);
            return e;
        });
        const segs = edges.filter((e) => !e.same).flatMap((e) => e.chain.slice(1).map((v, j) => ({ u: e.chain[j], v, lane: node.get(e.chain[j]).lane, e })));
        const same = edges.filter((e) => e.same);

        /* 1. Ordre dans chaque zone : barycentres successifs, on garde l'ordre qui croise le moins. */
        const pos = new Map();
        const index = () => lanes.forEach((l) => l.forEach((id, i) => pos.set(id, i)));
        const score = () => {
            index();
            let c = 0;
            for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
                const a = segs[i], b = segs[j];
                if (a.lane === b.lane && (pos.get(a.u) - pos.get(b.u)) * (pos.get(a.v) - pos.get(b.v)) < 0) c++;
            }
            for (const e of same) c += Math.abs(pos.get(e.from) - pos.get(e.to)) - 1 + (pos.get(e.from) > pos.get(e.to) ? 0.5 : 0);
            return c;
        };
        let best = lanes.map((l) => [...l]);
        let bestScore = score();
        for (let it = 0; it < 12 && bestScore > 0; it++) {
            const down = it % 2 === 0;
            const ks = lanes.map((_, k) => k).filter((k) => (down ? k > 0 : k < lanes.length - 1));
            if (!down) ks.reverse();
            for (const k of ks) {
                index();
                const bary = new Map(lanes[k].map((id) => {
                    const nb = segs.filter((s) => (down ? s.v === id : s.u === id)).map((s) => pos.get(down ? s.u : s.v));
                    return [id, nb.length ? avg(nb) : pos.get(id)];
                }));
                lanes[k].sort((x, y) => bary.get(x) - bary.get(y));
            }
            const sc = score();
            if (sc < bestScore) { bestScore = sc; best = lanes.map((l) => [...l]); }
        }
        best.forEach((l, k) => { lanes[k] = l; });
        /* Affinage : on essaie de déplacer chaque composant à chaque place de sa zone, tant que ça réduit les croisements. */
        for (let pass = 0, improved = true; improved && bestScore > 0 && pass < 6; pass++) {
            improved = false;
            for (let k = 0; k < lanes.length; k++) {
                for (let i = 0; i < lanes[k].length; i++) for (let j = 0; j < lanes[k].length; j++) {
                    if (i === j) continue;
                    const saved = lanes[k];
                    const cand = [...saved];
                    cand.splice(j, 0, cand.splice(i, 1)[0]);
                    lanes[k] = cand;
                    const sc = score();
                    if (sc < bestScore - 1e-9) { bestScore = sc; improved = true; } else lanes[k] = saved;
                }
            }
        }
        index();

        /* Liaisons internes : verticales entre voisins, sinon elles contournent par le côté. */
        const adjacent = (a, b) => Math.abs(pos.get(a) - pos.get(b)) === 1;
        const gapAfter = (lane, i) => {
            const a = lanes[lane][i], b = lanes[lane][i + 1];
            if (same.some((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a))) return GAP_LINKED;
            return node.get(a).dummy || node.get(b).dummy ? GAP_DUMMY : GAP;
        };

        /* 2. Hauteurs : chaque composant se rapproche de ses voisins des autres zones, sans chevauchement. */
        const y = new Map();
        lanes.forEach((l, k) => { let top = 0; l.forEach((id, i) => { y.set(id, top); top += node.get(id).h + (i < l.length - 1 ? gapAfter(k, i) : 0); }); });
        const center = (id) => y.get(id) + node.get(id).h / 2;
        const neighbours = new Map();
        for (const s of segs) {
            if (!neighbours.has(s.u)) neighbours.set(s.u, []);
            if (!neighbours.has(s.v)) neighbours.set(s.v, []);
            neighbours.get(s.u).push(s.v);
            neighbours.get(s.v).push(s.u);
        }
        for (let it = 0; it < 10; it++) {
            const order = lanes.map((_, k) => k);
            if (it % 2) order.reverse();
            for (const k of order) {
                const l = lanes[k];
                if (!l.length) continue;
                const desired = l.map((id) => {
                    const nb = neighbours.get(id);
                    return nb?.length ? avg(nb.map(center)) - node.get(id).h / 2 : y.get(id);
                });
                const sizes = l.map((id, i) => node.get(id).h + (i < l.length - 1 ? gapAfter(k, i) : 0));
                pack(desired, sizes).forEach((v, i) => y.set(l[i], v));
            }
        }
        const minY = Math.min(...[...y.values()]);
        for (const [id, v] of y) y.set(id, v - minY);

        /* 3. Largeur des couloirs entre zones : assez pour leurs étiquettes. */
        const bulgeSide = (e) => (node.get(e.from).lane === lanes.length - 1 ? -1 : 1);
        const gutterLabels = lanes.slice(1).map(() => []);
        for (const e of edges) {
            if (!e.labelW) continue;
            if (!e.same) gutterLabels[node.get(e.chain[0]).lane].push(e);
            else if (!adjacent(e.from, e.to)) {
                const g = node.get(e.from).lane + (bulgeSide(e) > 0 ? 0 : -1);
                if (gutterLabels[g]) gutterLabels[g].push(e);
            }
        }
        const gutterW = gutterLabels.map((list) => clamp(Math.max(0, ...list.map((e) => e.labelW)) + 40, 64, 200));
        const laneW = NODE_W + 2 * PAD;
        const laneX = [];
        lanes.forEach((_, k) => { laneX[k] = k ? laneX[k - 1] + laneW + gutterW[k - 1] : 0; });
        const width = laneX.at(-1) + laneW;
        const top0 = size.header + PAD;
        const height = top0 + Math.max(...lanes.map((l) => (l.length ? Math.max(...l.map((id) => y.get(id) + node.get(id).h)) : 0))) + PAD;

        const box = (id) => {
            const n = node.get(id);
            return { x: laneX[n.lane] + PAD, y: top0 + y.get(id), w: NODE_W, h: n.h };
        };

        /* 4. Points d'attache : répartis sur le côté du composant, triés selon la hauteur de l'autre extrémité. */
        const sides = new Map();
        const attach = (id, side, key, otherY) => {
            const k = `${id}|${side}`;
            if (!sides.has(k)) sides.set(k, []);
            sides.get(k).push({ key, otherY });
        };
        for (const s of segs) {
            attach(s.u, "R", s, box(s.v).y + box(s.v).h / 2);
            attach(s.v, "L", s, box(s.u).y + box(s.u).h / 2);
        }
        for (const e of same) {
            if (adjacent(e.from, e.to)) continue;
            const side = bulgeSide(e) > 0 ? "R" : "L";
            attach(e.from, side, e, box(e.to).y);
            attach(e.to, side, e, box(e.from).y);
        }
        const port = new Map();
        for (const [k, list] of sides) {
            const [id, side] = k.split("|");
            const b = box(id);
            list.sort((p, q) => p.otherY - q.otherY);
            list.forEach((item, i) => {
                const py = node.get(id).dummy ? b.y + b.h / 2 : b.y + (b.h * (i + 1)) / (list.length + 1);
                port.set(`${id}|${side}|${item.key.i ?? `${item.key.e.i}:${item.key.lane}`}`, { x: side === "R" ? b.x + b.w : b.x, y: py });
            });
        }
        const portOf = (id, side, key) => port.get(`${id}|${side}|${key.i ?? `${key.e.i}:${key.lane}`}`);

        /* 5. Tracés et étiquettes. */
        const paths = [];
        const labels = [];
        for (const e of edges) {
            let d = "";
            let label = null;
            if (!e.same) {
                const ss = segs.filter((s) => s.e === e);
                ss.forEach((s, j) => {
                    const p = portOf(s.u, "R", s), q = portOf(s.v, "L", s);
                    if (!d) d = `M${p.x},${p.y}`;
                    else d += ` L${p.x},${p.y}`;
                    d += ` ${curve(p, q)}`;
                    if (j === 0) label = { e, p, q, gutter: s.lane, ...bez(p, q, 0.5) };
                });
            } else if (adjacent(e.from, e.to)) {
                const a = box(e.from), b = box(e.to);
                const down = a.y < b.y;
                const twins = same.filter((o) => adjacent(o.from, o.to) && [o.from, o.to].sort().join() === [e.from, e.to].sort().join());
                const dx = (twins.indexOf(e) - (twins.length - 1) / 2) * 24;
                const x = a.x + a.w / 2 + dx;
                const y1 = down ? a.y + a.h : a.y, y2 = down ? b.y : b.y + b.h;
                d = `M${x},${y1} L${x},${y2}`;
                label = { e, x, y: (y1 + y2) / 2, fixed: true };
            } else {
                const dir = bulgeSide(e);
                const side = dir > 0 ? "R" : "L";
                const p = portOf(e.from, side, e), q = portOf(e.to, side, e);
                const bx = p.x + dir * BULGE * 1.6;
                d = `M${p.x},${p.y} C${bx},${p.y} ${bx},${q.y} ${q.x},${q.y}`;
                const g = node.get(e.from).lane + (dir > 0 ? 0 : -1);
                label = { e, x: p.x + dir * BULGE * 1.2, y: (p.y + q.y) / 2, gutter: gutterLabels[g] ? g : undefined, bulge: true };
            }
            paths.push({ e, d });
            if (e.labelW && label) labels.push(label);
        }
        /* Dans chaque couloir, les étiquettes sont écartées verticalement, puis replacées sur leur courbe. */
        gutterLabels.forEach((_, g) => {
            const list = labels.filter((l) => l.gutter === g).sort((a, b) => a.y - b.y);
            if (!list.length) return;
            const ys = pack(list.map((l) => l.y - LABEL_H / 2), list.map(() => LABEL_H + 4));
            const left = laneX[g] + laneW, right = laneX[g + 1];
            list.forEach((l, i) => {
                const target = ys[i] + LABEL_H / 2;
                if (!l.bulge && l.p.y !== l.q.y) {
                    let lo = 0, hi = 1;
                    const up = l.q.y > l.p.y;
                    for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if ((bez(l.p, l.q, m).y < target) === up) lo = m; else hi = m; }
                    l.x = bez(l.p, l.q, (lo + hi) / 2).x;
                }
                l.y = target;
                l.x = clamp(l.x, left + l.e.labelW / 2 + 4, right - l.e.labelW / 2 - 4);
            });
        });
        return {
            width, height, laneW, laneX, header: size.header,
            boxes: new Map(map.zones.flatMap((z) => z.nodes.map((n) => [n.id, box(n.id)]))),
            paths, labels
        };
    }

    /* ---------- Rendu ---------- */

    function mount(root, map, { pick, name = (n) => n, t }) {
        const kindLabel = { data: t("p.legend.data"), control: t("p.legend.control"), monitor: t("p.legend.monitor") };
        const nodes = map.zones.flatMap((z, k) => z.nodes.map((n) => ({ ...n, zone: z, lane: k })));
        const byId = new Map(nodes.map((n) => [n.id, n]));
        const zoneHasStack = map.zones.some((z) => z.stack?.length);
        const chips = (list) => (list?.length ? `<span class="flow-chips">${list.map((s) => `<i>${esc(s)}</i>`).join("")}</span>` : "");

        root.innerHTML = `
            <div class="flow-stage">
                <div class="flow-lanes"></div>
                <svg class="flow-edges" aria-hidden="true"></svg>
                ${nodes.map((n) => `
                    <button type="button" class="flow-node" data-node="${esc(n.id)}" style="--hue:${LANE_HUES[n.lane % LANE_HUES.length]}" aria-label="${esc(`${name(n.name)}${n.note ? ` — ${pick(n.note)}` : ""}`)}">
                        <span class="flow-node-head">${window.portfolio.techIcon(n.tech || n.name)}<strong>${esc(name(n.name))}</strong></span>
                        ${n.note ? `<small>${esc(pick(n.note))}</small>` : ""}
                        ${chips(n.stack)}
                    </button>`).join("")}
                ${map.links.map((l, i) => (pick(l.label) ? `<span class="flow-tag tag-${l.kind}" data-edge="${i}">${esc(pick(l.label))}</span>` : "")).join("")}
            </div>
            <div class="flow-controls" role="toolbar" aria-label="${esc(t("p.flow.tools"))}">
                <button type="button" data-flow="out" aria-label="${esc(t("p.flow.out"))}" title="${esc(t("p.flow.out"))}"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg></button>
                <button type="button" data-flow="fit" aria-label="${esc(t("p.flow.fit"))}" title="${esc(t("p.flow.fit"))}"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
                <button type="button" data-flow="in" aria-label="${esc(t("p.flow.in"))}" title="${esc(t("p.flow.in"))}"><svg viewBox="0 0 24 24"><path d="M6 12h12M12 6v12"/></svg></button>
                <span aria-hidden="true"></span>
                <button type="button" data-flow="full" aria-pressed="false" aria-label="${esc(t("p.flow.full"))}" title="${esc(t("p.flow.full"))}"><svg viewBox="0 0 24 24"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg></button>
            </div>
            <aside class="flow-drawer" hidden aria-live="polite"></aside>`;

        root.dataset.hint = t("p.flow.open");
        const stage = root.querySelector(".flow-stage");
        const svg = root.querySelector(".flow-edges");
        const drawer = root.querySelector(".flow-drawer");
        const fullBtn = root.querySelector('[data-flow="full"]');
        const nodeEl = new Map([...root.querySelectorAll(".flow-node")].map((el) => [el.dataset.node, el]));
        const tagEl = new Map([...root.querySelectorAll(".flow-tag")].map((el) => [Number(el.dataset.edge), el]));
        let geo = null;
        let view = { k: 1, x: 0, y: 0 };
        let moved = false;      /* le visiteur a zoomé ou déplacé : on ne recadre plus automatiquement */
        let selected = null;

        function relayout() {
            nodeEl.forEach((el) => { el.style.width = `${NODE_W}px`; });
            geo = layout(map, {
                node: (id) => nodeEl.get(id).offsetHeight,
                label: (i) => tagEl.get(i)?.offsetWidth || 0,
                header: zoneHasStack ? 62 : 40
            });
            stage.style.width = `${geo.width}px`;
            stage.style.height = `${geo.height}px`;
            root.querySelector(".flow-lanes").innerHTML = map.zones.map((z, k) => `
                <section class="flow-lane" style="left:${geo.laneX[k]}px;width:${geo.laneW}px;height:${geo.height}px;--hue:${LANE_HUES[k % LANE_HUES.length]}" aria-label="${esc(pick(z.title))}">
                    <h3>${esc(pick(z.title))}</h3>${chips(z.stack)}
                </section>`).join("");
            geo.boxes.forEach((b, id) => {
                const el = nodeEl.get(id);
                el.style.left = `${b.x}px`;
                el.style.top = `${b.y}px`;
            });
            svg.setAttribute("width", geo.width);
            svg.setAttribute("height", geo.height);
            svg.setAttribute("viewBox", `0 0 ${geo.width} ${geo.height}`);
            svg.innerHTML = `<defs>${["data", "control", "monitor"].map((k) =>
                `<marker id="flow-arrow-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrow-${k}"/></marker>`).join("")}</defs>
                ${geo.paths.map(({ e, d }) => `<g data-edge="${e.i}">
                    <path class="flow-hit" d="${d}"/>
                    <path class="link link-${e.kind}" d="${d}" ${e.rev ? `marker-start="url(#flow-arrow-${e.kind})"` : `marker-end="url(#flow-arrow-${e.kind})"`}/>
                </g>`).join("")}`;
            geo.labels.forEach((l) => {
                const el = tagEl.get(l.e.i);
                el.style.left = `${l.x}px`;
                el.style.top = `${l.y}px`;
            });
            refit(true);
        }

        function apply() {
            stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`;
            /* La grille de points suit le canevas, comme dans FlowPlan. */
            root.style.backgroundSize = `${18 * view.k}px ${18 * view.k}px`;
            root.style.backgroundPosition = `${view.x}px ${view.y}px`;
        }

        /* Cadre tout le schéma ; hors plein écran, la hauteur du bloc suit le schéma. */
        function refit(force) {
            if (!geo || (moved && !force)) return;
            moved = false;
            const full = root.classList.contains("flow-full");
            const cw = root.clientWidth;
            const margin = 16, bottom = 58;
            if (full) {
                const ch = root.clientHeight;
                view.k = Math.min(1.25, (cw - 2 * margin) / geo.width, (ch - margin - bottom) / geo.height);
                /* Sur téléphone, on ouvre à une taille lisible sur la première zone ; le doigt déplace, deux doigts zooment. */
                if (view.k < 0.5) view.k = 0.6;
                view.x = Math.max(margin, (cw - geo.width * view.k) / 2);
                view.y = Math.max(margin, (ch - bottom - geo.height * view.k) / 2);
            } else {
                view.k = Math.min(1, (cw - 2 * margin) / geo.width);
                view.x = (cw - geo.width * view.k) / 2;
                view.y = margin;
                root.style.height = `${Math.ceil(geo.height * view.k + margin + bottom)}px`;
            }
            root.classList.toggle("flow-small", !full && view.k < 0.62);
            apply();
        }

        function zoom(factor, cx = root.clientWidth / 2, cy = root.clientHeight / 2) {
            const k = clamp(view.k * factor, 0.25, 2.5);
            view.x = cx - (cx - view.x) * (k / view.k);
            view.y = cy - (cy - view.y) * (k / view.k);
            view.k = k;
            moved = true;
            apply();
        }

        /* Composants et liaisons liés à un composant (ou à une liaison) mis en évidence. */
        function focus(id, edge) {
            root.classList.toggle("focusing", id != null || edge != null);
            const on = (l, i) => (edge != null ? i === edge : l.from === id || l.to === id);
            const lit = new Set(id != null ? [id] : []);
            map.links.forEach((l, i) => {
                const hit = on(l, i);
                if (hit) { lit.add(l.from); lit.add(l.to); }
                svg.querySelector(`g[data-edge="${i}"]`)?.classList.toggle("on", hit);
                tagEl.get(i)?.classList.toggle("on", hit);
            });
            nodeEl.forEach((el, nid) => el.classList.toggle("on", lit.has(nid)));
        }
        const restFocus = () => focus(selected);

        function openDrawer(id) {
            selected = id;
            const n = byId.get(id);
            nodeEl.forEach((el, nid) => el.setAttribute("aria-pressed", String(nid === id)));
            if (!n) { drawer.hidden = true; restFocus(); return; }
            const rel = (dir) => map.links.map((l, i) => ({ l, i })).filter(({ l }) => (dir === "in" ? l.to === id : l.from === id));
            const relList = (dir) => {
                const list = rel(dir);
                return list.length ? `<h5>${esc(t(dir === "in" ? "p.flow.from" : "p.flow.to"))}</h5><ul>${list.map(({ l }) => {
                    const other = byId.get(dir === "in" ? l.from : l.to);
                    return `<li><button type="button" data-goto="${esc(other.id)}">${window.portfolio.techIcon(other.tech || other.name)}<span><strong>${esc(name(other.name))}</strong><small class="k-${l.kind}">${esc(pick(l.label) || kindLabel[l.kind])} · ${esc(kindLabel[l.kind])}</small></span></button></li>`;
                }).join("")}</ul>` : "";
            };
            const techs = [...new Set([n.tech, ...(n.stack || [])].filter(Boolean))];
            drawer.innerHTML = `
                <button type="button" class="flow-drawer-close" data-flow="close" aria-label="${esc(t("p.flow.close"))}">×</button>
                <p class="flow-drawer-zone" style="--hue:${LANE_HUES[n.lane % LANE_HUES.length]}">${esc(pick(n.zone.title))}</p>
                <h4>${window.portfolio.techIcon(n.tech || n.name)}${esc(name(n.name))}</h4>
                ${n.note ? `<p>${esc(pick(n.note))}</p>` : ""}
                ${techs.length ? `<ul class="stack">${techs.map(window.portfolio.techChip).join("")}</ul>` : ""}
                ${relList("in")}${relList("out")}`;
            drawer.hidden = false;
            focus(id);
        }

        /* ---------- Interactions ---------- */

        root.addEventListener("click", (event) => {
            const btn = event.target.closest("[data-flow]");
            if (btn) {
                const a = btn.dataset.flow;
                if (a === "in") zoom(1.25);
                if (a === "out") zoom(1 / 1.25);
                if (a === "fit") refit(true);
                if (a === "full") setFull(!root.classList.contains("flow-full"));
                if (a === "close") openDrawer(null);
                return;
            }
            if (dragged) return;
            /* Sur petit écran, le schéma réduit sert d'aperçu : un toucher l'ouvre en plein écran. */
            if (root.classList.contains("flow-small") && !root.classList.contains("flow-full")) { setFull(true); return; }
            const go = event.target.closest("[data-goto]");
            if (go) { openDrawer(go.dataset.goto); nodeEl.get(go.dataset.goto)?.focus({ preventScroll: true }); return; }
            const n = event.target.closest(".flow-node");
            if (n) { openDrawer(selected === n.dataset.node ? null : n.dataset.node); return; }
            if (!event.target.closest(".flow-drawer")) openDrawer(null);
        });
        root.addEventListener("mouseover", (event) => {
            const n = event.target.closest(".flow-node");
            const g = event.target.closest("g[data-edge], .flow-tag");
            if (n) focus(n.dataset.node);
            else if (g) focus(null, Number(g.dataset.edge));
        });
        root.addEventListener("mouseout", (event) => {
            if (!event.relatedTarget || !root.contains(event.relatedTarget) || !event.relatedTarget.closest(".flow-node, g[data-edge], .flow-tag")) restFocus();
        });
        root.addEventListener("focusin", (event) => { const n = event.target.closest(".flow-node"); if (n) focus(n.dataset.node); });
        root.addEventListener("focusout", () => setTimeout(() => { if (!root.contains(document.activeElement)) restFocus(); }));

        /* Ctrl + molette (ou pincement du pavé tactile) : zoom autour du pointeur ; la molette seule fait défiler la page. */
        root.addEventListener("wheel", (event) => {
            if (!event.ctrlKey && !event.metaKey && !root.classList.contains("flow-full")) return;
            event.preventDefault();
            const r = root.getBoundingClientRect();
            zoom(Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0015)), event.clientX - r.left, event.clientY - r.top);
        }, { passive: false });

        /* Glisser pour déplacer (souris partout, doigt en plein écran) ; deux doigts pour zoomer. */
        const pointers = new Map();
        let dragged = false, last = null, pinch = null;
        root.addEventListener("pointerdown", (event) => {
            if (event.target.closest(".flow-controls, .flow-drawer") || event.button > 0) return;
            if (event.pointerType === "touch" && !root.classList.contains("flow-full")) return;
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            dragged = false;
            last = { x: event.clientX, y: event.clientY };
            if (pointers.size === 2) {
                const [p, q] = [...pointers.values()];
                pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), k: view.k };
            }
        });
        root.addEventListener("pointermove", (event) => {
            if (!pointers.has(event.pointerId)) return;
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (pinch && pointers.size === 2) {
                const [p, q] = [...pointers.values()];
                const r = root.getBoundingClientRect();
                zoom((pinch.k * Math.hypot(p.x - q.x, p.y - q.y) / pinch.d) / view.k, (p.x + q.x) / 2 - r.left, (p.y + q.y) / 2 - r.top);
                return;
            }
            const dx = event.clientX - last.x, dy = event.clientY - last.y;
            if (!dragged && Math.hypot(dx, dy) < 4) return;
            if (!dragged) { dragged = true; root.setPointerCapture(event.pointerId); root.classList.add("flow-grabbing"); }
            last = { x: event.clientX, y: event.clientY };
            view.x += dx;
            view.y += dy;
            moved = true;
            apply();
        });
        const release = (event) => {
            pointers.delete(event.pointerId);
            if (pointers.size < 2) pinch = null;
            root.classList.remove("flow-grabbing");
            /* Le clic qui suit un glissement ne doit pas ouvrir ni fermer le panneau. */
            if (dragged) setTimeout(() => { dragged = false; });
        };
        root.addEventListener("pointerup", release);
        root.addEventListener("pointercancel", release);

        root.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                if (!drawer.hidden) { const id = selected; openDrawer(null); nodeEl.get(id)?.focus(); }
                else if (root.classList.contains("flow-full")) setFull(false);
                else return;
                event.preventDefault();
                return;
            }
            if (event.target.closest(".flow-drawer")) return;
            if (event.key === "+" || event.key === "=") zoom(1.25);
            else if (event.key === "-") zoom(1 / 1.25);
            else if (event.key === "0") refit(true);
            else return;
            event.preventDefault();
        });

        function setFull(on) {
            root.classList.toggle("flow-full", on);
            document.documentElement.classList.toggle("flow-locked", on);
            fullBtn.setAttribute("aria-pressed", String(on));
            fullBtn.setAttribute("aria-label", t(on ? "p.flow.exit" : "p.flow.full"));
            fullBtn.title = t(on ? "p.flow.exit" : "p.flow.full");
            if (!on) root.style.height = "";
            refit(true);
            if (on) root.focus({ preventScroll: true });
        }

        relayout();
        return {
            relayout,
            refit: () => refit(false),
            destroy: () => document.documentElement.classList.remove("flow-locked")
        };
    }

    /* Schéma minimal déduit de la vue pipeline, pour un projet qui n'a pas encore de carte. */
    function fromPipeline(arch, pick) {
        const zones = arch.stages.map((s, k) => {
            const raw = s.branches
                ? s.branches.map((b) => ({ name: pick(b.title), tech: b.items?.[0], stack: b.items?.slice(1) }))
                : s.items?.length ? s.items.map((it) => ({ name: it, tech: it })) : [{ name: pick(s.title) }];
            return { title: s.title, nodes: raw.map((n, j) => ({ id: `s${k}n${j}`, ...n, note: s.branches ? s.branches[j].detail : undefined })) };
        });
        if (arch.bands?.length) {
            zones.push({ title: { fr: "Transverse", en: "Cross-cutting" }, nodes: arch.bands.map((b, j) => ({ id: `b${j}`, name: pick(b.title), tech: b.items?.[0], stack: b.items?.slice(1) })) });
        }
        const links = [];
        for (let k = 0; k < arch.stages.length - 1; k++) {
            const a = zones[k].nodes, b = zones[k + 1].nodes;
            if (a.length === 1 || b.length === 1) a.forEach((u) => b.forEach((v) => links.push({ from: u.id, to: v.id, kind: "data", label: { fr: "", en: "" } })));
            else b.forEach((v, j) => links.push({ from: a[Math.min(j, a.length - 1)].id, to: v.id, kind: "data", label: { fr: "", en: "" } }));
        }
        return { zones, links };
    }

    window.portfolioDiagram = { mount, fromPipeline };
})();
