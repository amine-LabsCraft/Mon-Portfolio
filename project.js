/* Page d'étude de cas : affiche le projet passé dans ?id=… */
(() => {
    const { t, pick } = window.i18n;
    const { escapeHtml, techChip, techIcon, architecture, projectTitle, formatDate, orderedProjects, capToNaturalSize } = window.portfolio;
    const projects = window.PORTFOLIO_PROJECTS;
    const docs = window.PORTFOLIO_DOCS || {};
    const main = document.querySelector("#contenu");
    const id = new URLSearchParams(location.search).get("id");
    let archView = "map";

    /* Même ordre que sur l'accueil : Data engineering, IA & ML, puis Software. */
    const ordered = orderedProjects(projects);
    const list = (items) => (pick(items) || []);
    /* Nom affiché d'un composant de la carte, traduit si besoin. */
    const nodeLabel = (name) => (window.i18n.language === "en" && window.PORTFOLIO_DOCS_EN_NAMES?.[name]) || name;

    /* ---------- Sections ---------- */

    function summary(doc, project) {
        const cards = [
            ["problem", doc ? pick(doc.pains)?.[0] || pick(doc.context) : pick(project.problem)],
            ["solution", doc ? pick(doc.solution) : ""],
            ["result", doc ? pick(doc.result) : ""]
        ].filter(([, text]) => text);
        return `<ol class="brief">${cards.map(([key, text], i) => `
            <li class="brief-${key}">
                <span class="brief-label">${t(`p.s.${key}`)}</span>
                <p>${escapeHtml(text)}</p>
                ${i < cards.length - 1 ? '<span class="brief-arrow" aria-hidden="true">→</span>' : ""}
            </li>`).join("")}</ol>`;
    }

    function steps(doc) {
        return `<ol class="steps">${doc.steps.map((step, i) => `
            <li>
                <span class="step-num" aria-hidden="true">${i + 1}</span>
                <div>
                    <h3>${escapeHtml(pick(step.title))}</h3>
                    <p>${escapeHtml(pick(step.text))}</p>
                    ${step.tech?.length ? `<ul class="stack">${step.tech.map(techChip).join("")}</ul>` : ""}
                </div>
            </li>`).join("")}</ol>`;
    }

    /* Carte d'architecture : zones et composants en HTML, liaisons dessinées en SVG par drawMap(). */
    function systemMap(doc) {
        const { zones, links } = doc.map;
        const nodeName = Object.fromEntries(zones.flatMap((z) => z.nodes.map((n) => [n.id, nodeLabel(n.name)])));
        return `
            <div class="sysmap" style="--zones:${zones.length}">
                <svg class="sysmap-links" aria-hidden="true"></svg>
                <div class="sysmap-labels" aria-hidden="true"></div>
                ${zones.map((zone) => `
                    <section class="zone" aria-label="${escapeHtml(pick(zone.title))}">
                        <h3>${escapeHtml(pick(zone.title))}</h3>
                        ${zone.nodes.map((node) => `
                            <div class="sysnode" data-node="${node.id}" tabindex="0">
                                ${techIcon(node.tech || node.name)}
                                <span><strong>${escapeHtml(nodeLabel(node.name))}</strong>${node.note ? `<small>${escapeHtml(pick(node.note))}</small>` : ""}</span>
                            </div>`).join("")}
                    </section>`).join("")}
            </div>
            <div class="legend" aria-hidden="true">
                <span class="lg-data">${t("p.legend.data")}</span>
                <span class="lg-control">${t("p.legend.control")}</span>
                <span class="lg-monitor">${t("p.legend.monitor")}</span>
                <span class="lg-hint">${t("p.arch.hint")}</span>
            </div>
            <details class="links-list"${matchMedia("(max-width: 900px)").matches ? " open" : ""}>
                <summary>${t("p.links")}</summary>
                <ul>${links.map((l) => `<li><strong>${escapeHtml(nodeName[l.from])}</strong> → <strong>${escapeHtml(nodeName[l.to])}</strong> : ${escapeHtml(pick(l.label))}</li>`).join("")}</ul>
            </details>`;
    }

    function decisions(doc) {
        if (!doc.decisions?.length) return "";
        return `<div class="decisions">${doc.decisions.map((d) => `
            <article>
                <h3>${escapeHtml(pick(d.choice))}</h3>
                <p><span>${t("p.why")}</span> ${escapeHtml(pick(d.why))}</p>
            </article>`).join("")}</div>`;
    }

    /* ---------- Dessin des liaisons ---------- */

    function drawMap() {
        const map = main.querySelector(".sysmap");
        const doc = docs[id];
        if (!map || !doc || archView !== "map") return;
        const svg = map.querySelector(".sysmap-links");
        const labels = map.querySelector(".sysmap-labels");
        const box = map.getBoundingClientRect();
        svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
        svg.setAttribute("width", box.width);
        svg.setAttribute("height", box.height);
        const rect = (nodeId) => {
            const r = map.querySelector(`[data-node="${nodeId}"]`).getBoundingClientRect();
            return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height, cx: r.left - box.left + r.width / 2, cy: r.top - box.top + r.height / 2 };
        };
        const placed = [];
        const nodes = [...map.querySelectorAll(".sysnode")].map((el) => rect(el.dataset.node));
        let paths = "";
        let tags = "";
        doc.map.links.forEach((link, i) => {
            const a = rect(link.from);
            const b = rect(link.to);
            const dx = b.cx - a.cx;
            const dy = b.cy - a.cy;
            let s, e, c1, c2;
            if (Math.abs(dx) > Math.abs(dy) * 0.6 && Math.abs(dx) > (a.w + b.w) / 2) {
                const dir = Math.sign(dx);
                s = { x: dir > 0 ? a.x + a.w : a.x, y: a.cy };
                e = { x: dir > 0 ? b.x : b.x + b.w, y: b.cy };
                const k = Math.max(30, Math.abs(e.x - s.x) / 2) * dir;
                c1 = { x: s.x + k, y: s.y }; c2 = { x: e.x - k, y: e.y };
            } else {
                const dir = Math.sign(dy) || 1;
                s = { x: a.cx, y: dir > 0 ? a.y + a.h : a.y };
                e = { x: b.cx, y: dir > 0 ? b.y : b.y + b.h };
                const k = Math.max(20, Math.abs(e.y - s.y) / 2) * dir;
                c1 = { x: s.x, y: s.y + k }; c2 = { x: e.x, y: e.y - k };
            }
            paths += `<path class="link link-${link.kind}" data-from="${link.from}" data-to="${link.to}" d="M${s.x},${s.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${e.x},${e.y}" marker-end="url(#arrow-${link.kind})"/>`;
            /* Étiquette au milieu de la courbe, décalée jusqu'à ne recouvrir ni un composant ni une autre étiquette. */
            const mid = { x: (s.x + 3 * c1.x + 3 * c2.x + e.x) / 8, y: (s.y + 3 * c1.y + 3 * c2.y + e.y) / 8 };
            const w = pick(link.label).length * 6.6 + 18;
            const h = 20;
            /* Encombrement d'une position : une autre étiquette compte double, un composant simple, l'éloignement un peu. */
            const cost = (x, y) =>
                nodes.filter((n) => x + w / 2 > n.x - 4 && x - w / 2 < n.x + n.w + 4 && y + h / 2 > n.y - 4 && y - h / 2 < n.y + n.h + 4).length
                + 2 * placed.filter((p) => Math.abs(p.x - x) < (p.w + w) / 2 + 4 && Math.abs(p.y - y) < h + 2).length
                + (Math.abs(x - mid.x) + Math.abs(y - mid.y)) / 400;
            const offsets = [];
            for (const dy of [0, -24, 24, -48, 48, -72, 72]) for (const dx of [0, -40, 40, -80, 80]) offsets.push([dx, dy]);
            const [ox, oy] = offsets.reduce((best, o) => (cost(mid.x + o[0], mid.y + o[1]) < cost(mid.x + best[0], mid.y + best[1]) ? o : best));
            const m = { x: mid.x + ox, y: mid.y + oy, w };
            placed.push(m);
            tags += `<span class="link-tag tag-${link.kind}" data-from="${link.from}" data-to="${link.to}" style="left:${m.x}px;top:${m.y}px">${escapeHtml(pick(link.label))}</span>`;
        });
        svg.innerHTML = `<defs>${["data", "control", "monitor"].map((k) =>
            `<marker id="arrow-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrow-${k}"/></marker>`).join("")}</defs>${paths}`;
        labels.innerHTML = tags;
    }

    function highlight(nodeId) {
        const map = main.querySelector(".sysmap");
        if (!map) return;
        map.classList.toggle("focusing", Boolean(nodeId));
        map.querySelectorAll("[data-from]").forEach((el) => {
            el.classList.toggle("on", el.dataset.from === nodeId || el.dataset.to === nodeId);
        });
        map.querySelectorAll(".sysnode").forEach((el) => el.classList.toggle("on", el.dataset.node === nodeId));
    }

    /* ---------- Page ---------- */

    function render() {
        window.i18n.apply();
        const index = ordered.findIndex((p) => p.id === id);
        const project = ordered[index];

        if (!project) {
            document.title = "Amine AIT ALI";
            main.innerHTML = `<div class="not-found"><h1>${t("p.notfound")}</h1><a class="button button-primary" href="index.html#projets">${t("p.back")}</a></div>`;
            return;
        }

        const doc = docs[project.id];
        const title = projectTitle(project);
        document.title = `${title} — Amine AIT ALI`;
        document.querySelector("meta[name='description']").setAttribute("content", pick(project.tagline));

        const prev = ordered[(index - 1 + ordered.length) % ordered.length];
        const next = ordered[(index + 1) % ordered.length];
        const repoUrl = project.repo ? `https://github.com/amine-LabsCraft/${encodeURIComponent(project.repo)}` : "";
        const hasPipeline = Boolean(window.PORTFOLIO_ARCHITECTURES?.[project.id]);

        const metrics = (project.metrics || []).map((m) =>
            `<div><dt>${escapeHtml(m.value)}</dt><dd>${escapeHtml(pick(m.label))}</dd></div>`).join("");

        const actions = [
            repoUrl ? `<a class="button button-primary" href="${repoUrl}" target="_blank" rel="noreferrer">${t("p.code")}</a>` : "",
            project.post ? `<a class="button ${repoUrl ? "button-ghost" : "button-primary"}" href="${escapeHtml(project.post)}" target="_blank" rel="noreferrer">${t("p.post")}</a>` : ""
        ].join("");

        const images = project.images || [];
        const gallery = images.map((img, i) => `
            <figure class="shot">
                <button type="button" data-index="${i}" data-src="images/projects/${project.id}/${img.file}" data-caption="${escapeHtml(pick(img.caption))}" aria-label="${escapeHtml(t("p.zoom"))} : ${escapeHtml(pick(img.caption))}">
                    <img src="images/projects/${project.id}/${img.file}" alt="${escapeHtml(pick(img.caption))}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async">
                    <span class="shot-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M11 8v6M8 11h6"/></svg></span>
                </button>
                <figcaption><span>${String(i + 1).padStart(2, "0")}</span>${escapeHtml(pick(img.caption))}</figcaption>
            </figure>`).join("");

        /* Sections dans l'ordre de lecture ; la table des matières suit la même liste. */
        const sections = [
            doc && ["context", t("p.context"), `
                <p class="lead-text">${escapeHtml(pick(doc.context))}</p>
                ${list(doc.pains).length ? `<h3 class="sub">${t("p.pains")}</h3><ul class="pains">${list(doc.pains).map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>` : ""}`],
            !doc && ["context", t("p.problem"), `<p class="lead-text">${escapeHtml(pick(project.problem))}</p>`],
            doc?.steps?.length ? ["steps", t("p.steps"), steps(doc)] : ["steps", t("p.built"), `<ul class="built">${list(project.built).map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`],
            (doc?.map || hasPipeline) && ["architecture", t("p.arch"), `
                ${doc?.map && hasPipeline ? `<div class="seg" role="tablist" aria-label="${escapeHtml(t("p.arch"))}">
                    <button type="button" role="tab" data-view="map" aria-selected="${archView === "map"}">${t("p.arch.map")}</button>
                    <button type="button" role="tab" data-view="pipeline" aria-selected="${archView === "pipeline"}">${t("p.arch.pipeline")}</button>
                </div>` : ""}
                <div class="arch-panel">${doc?.map && archView === "map" ? systemMap(doc) : architecture(project)}</div>`],
            doc?.decisions?.length && ["decisions", t("p.decisions"), decisions(doc)],
            doc && (list(doc.results).length || list(doc.next).length) && ["results", t("p.results"), `
                <div class="outcomes">
                    ${list(doc.results).length ? `<div><h3 class="sub">${t("p.results.done")}</h3><ul class="built">${list(doc.results).map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul></div>` : ""}
                    ${list(doc.next).length ? `<div class="outcomes-next"><h3 class="sub">${t("p.limits")}</h3><ul class="built">${list(doc.next).map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul></div>` : ""}
                </div>`],
            ["stack", t("p.stack"), `<ul class="stack stack-large">${project.stack.map(techChip).join("")}</ul>`],
            gallery && ["gallery", t(project.source === "cloud" ? "p.gallery.cloud" : "p.gallery"), `<div class="gallery">${gallery}</div>`]
        ].filter(Boolean);

        main.innerHTML = `
            <article class="study">
                <header class="study-head">
                    <p class="case-kind">${t(`group.${project.group}`)} · ${escapeHtml(pick(project.kind))} · ${project.source === "cloud" ? t("p.source.cloud") : t("p.source.github")}${project.updated ? ` · ${t("p.updated")} ${formatDate(project.updated)}` : ""}</p>
                    <h1>${escapeHtml(title)}</h1>
                    <p class="study-lead">${escapeHtml(pick(project.tagline))}</p>
                    <div class="hero-actions">${actions}</div>
                </header>

                ${metrics ? `<section aria-label="${escapeHtml(t("p.numbers"))}"><dl class="metrics metrics-large">${metrics}</dl></section>` : ""}

                ${doc ? `<section class="brief-section" aria-label="${escapeHtml(t("p.summary"))}">${summary(doc, project)}</section>` : ""}

                <div class="study-layout">
                    <nav class="toc" aria-label="${escapeHtml(t("p.toc"))}">
                        <p>${t("p.toc")}</p>
                        <ol>${sections.map(([key, label]) => `<li><a href="#s-${key}">${escapeHtml(label)}</a></li>`).join("")}</ol>
                    </nav>
                    <div class="study-sections">
                        ${sections.map(([key, label, html]) => `
                            <section class="study-section" id="s-${key}" aria-labelledby="h-${key}">
                                <h2 id="h-${key}">${escapeHtml(label)}</h2>
                                ${html}
                            </section>`).join("")}
                    </div>
                </div>

                <nav class="pager" aria-label="${escapeHtml(t("nav.projects"))}">
                    <a href="project.html?id=${prev.id}"><span>${t("p.prev")}</span><strong>${escapeHtml(projectTitle(prev))}</strong></a>
                    <a href="project.html?id=${next.id}"><span>${t("p.next")}</span><strong>${escapeHtml(projectTitle(next))}</strong></a>
                </nav>
            </article>`;

        requestAnimationFrame(drawMap);
        watchToc();
    }

    /* Table des matières : surligne la section en cours de lecture. */
    let tocObserver;
    function watchToc() {
        tocObserver?.disconnect();
        const links = [...main.querySelectorAll(".toc a")];
        if (!("IntersectionObserver" in window) || !links.length) return;
        tocObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
            });
        }, { rootMargin: "-30% 0px -60%" });
        main.querySelectorAll(".study-section").forEach((s) => tocObserver.observe(s));
    }

    /* ---------- Interactions ---------- */

    main.addEventListener("click", (event) => {
        const tab = event.target.closest(".seg [data-view]");
        if (tab) {
            archView = tab.dataset.view;
            const scroll = window.scrollY;
            render();
            window.scrollTo(0, scroll);
        }
    });
    main.addEventListener("mouseover", (event) => highlight(event.target.closest(".sysnode")?.dataset.node));
    main.addEventListener("mouseleave", () => highlight(null));
    main.addEventListener("focusin", (event) => highlight(event.target.closest(".sysnode")?.dataset.node));
    main.addEventListener("focusout", () => highlight(null));

    let resizeTimer;
    window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawMap, 120); });
    document.fonts?.ready.then(drawMap);

    const dialog = document.querySelector("#image-dialog");
    const fullImage = document.querySelector("#image-full");
    let shotIndex = 0;

    /* Visionneuse : flèches et clavier pour passer d'une image à l'autre. */
    function showShot(index) {
        const shots = [...main.querySelectorAll(".shot button")];
        if (!shots.length) return;
        shotIndex = (index + shots.length) % shots.length;
        const button = shots[shotIndex];
        fullImage.style.maxWidth = "";
        fullImage.src = button.dataset.src;
        fullImage.alt = button.dataset.caption;
        document.querySelector("#image-caption").textContent = `${button.dataset.caption} · ${shotIndex + 1} / ${shots.length}`;
        capToNaturalSize(fullImage);
    }

    main.addEventListener("click", (event) => {
        const button = event.target.closest(".shot button");
        if (!button) return;
        showShot(Number(button.dataset.index));
        dialog.showModal();
    });
    document.querySelector("#image-prev").addEventListener("click", () => showShot(shotIndex - 1));
    document.querySelector("#image-next").addEventListener("click", () => showShot(shotIndex + 1));
    dialog.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") showShot(shotIndex - 1);
        if (event.key === "ArrowRight") showShot(shotIndex + 1);
    });
    document.querySelector("#image-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

    window.i18n.onChange(render);
    render();
})();
