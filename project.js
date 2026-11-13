/* Page d'étude de cas : affiche le projet passé dans ?id=… */
(() => {
    const { t, pick } = window.i18n;
    const { escapeHtml, techChip, architecture, projectTitle, formatDate, orderedProjects, capToNaturalSize } = window.portfolio;
    /* experience.html réutilise cette page pour les stages (data/internships.js). */
    const isExperience = document.body.dataset.collection === "experiences";
    const projects = isExperience ? window.PORTFOLIO_INTERNSHIPS : window.PORTFOLIO_PROJECTS;
    const docs = window.PORTFOLIO_DOCS || {};
    const main = document.querySelector("#contenu");
    const id = new URLSearchParams(location.search).get("id");
    const imageDir = isExperience ? "images/experiences" : "images/projects";
    const page = isExperience ? "experience.html" : "project.html";
    /* Libellé propre aux stages (x.*) s'il existe, sinon celui des projets (p.*). */
    const label = (key) => (isExperience && t(`x.${key}`) !== `x.${key}` ? t(`x.${key}`) : t(`p.${key}`));
    let archView = "map";

    /* Même ordre que sur l'accueil : Data engineering, IA & ML, puis Software. Les stages gardent leur ordre. */
    const ordered = isExperience ? projects : orderedProjects(projects);
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

    /* Schéma d'architecture : le canevas est dessiné par diagram.js une fois la page affichée (mountMap). */
    function systemMap(map) {
        const nodeName = Object.fromEntries(map.zones.flatMap((z) => z.nodes.map((n) => [n.id, nodeLabel(n.name)])));
        return `
            <div class="flow" tabindex="0" role="group" aria-label="${escapeHtml(t("p.arch"))}"></div>
            <div class="legend">
                <span class="lg-data">${t("p.legend.data")}</span>
                <span class="lg-control">${t("p.legend.control")}</span>
                <span class="lg-monitor">${t("p.legend.monitor")}</span>
                <span class="lg-hint">${t("p.arch.hint")}</span>
            </div>
            ${map.stack?.length ? `<div class="flow-base"><span>${t("p.arch.base")}</span><ul class="stack">${map.stack.map(techChip).join("")}</ul></div>` : ""}
            <details class="links-list">
                <summary>${t("p.links")}</summary>
                <ul>${map.links.map((l) => `<li><strong>${escapeHtml(nodeName[l.from])}</strong> → <strong>${escapeHtml(nodeName[l.to])}</strong>${pick(l.label) ? ` : ${escapeHtml(pick(l.label))}` : ""}</li>`).join("")}</ul>
            </details>`;
    }

    /* Carte du projet : celle de data/docs.js, sinon une carte déduite de la vue pipeline. */
    function mapOf(project) {
        const doc = docs[project.id];
        if (doc?.map) return doc.map;
        const arch = window.PORTFOLIO_ARCHITECTURES?.[project.id];
        return arch ? window.portfolioDiagram.fromPipeline(arch, pick) : null;
    }

    function decisions(doc) {
        if (!doc.decisions?.length) return "";
        return `<div class="decisions">${doc.decisions.map((d) => `
            <article>
                <h3>${escapeHtml(pick(d.choice))}</h3>
                <p><span>${t("p.why")}</span> ${escapeHtml(pick(d.why))}</p>
            </article>`).join("")}</div>`;
    }

    /* ---------- Schéma interactif ---------- */

    let flow = null;
    function mountMap(project) {
        flow?.destroy();
        flow = null;
        const el = main.querySelector(".flow");
        const map = mapOf(project);
        if (el && map) flow = window.portfolioDiagram.mount(el, map, { pick, name: nodeLabel, t });
    }

    /* ---------- Page ---------- */

    function render() {
        window.i18n.apply();
        const index = ordered.findIndex((p) => p.id === id);
        const project = ordered[index];

        if (!project) {
            document.title = "Amine AIT ALI";
            main.innerHTML = `<div class="not-found"><h1>${label("notfound")}</h1><a class="button button-primary" href="index.html#${isExperience ? "parcours" : "projets"}">${label("back")}</a></div>`;
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
        const map = mapOf(project);

        const metrics = (project.metrics || []).map((m) =>
            `<div><dt>${escapeHtml(m.value)}</dt><dd>${escapeHtml(pick(m.label))}</dd></div>`).join("");

        const actions = [
            repoUrl ? `<a class="button button-primary" href="${repoUrl}" target="_blank" rel="noreferrer">${t("p.code")}</a>` : "",
            project.post ? `<a class="button ${repoUrl ? "button-ghost" : "button-primary"}" href="${escapeHtml(project.post)}" target="_blank" rel="noreferrer">${t("p.post")}</a>` : ""
        ].join("");

        const images = project.images || [];
        const gallery = images.map((img, i) => `
            <figure class="shot">
                <button type="button" data-index="${i}" data-src="${imageDir}/${project.id}/${img.file}" data-caption="${escapeHtml(pick(img.caption))}" aria-label="${escapeHtml(t("p.zoom"))} : ${escapeHtml(pick(img.caption))}">
                    <img src="${imageDir}/${project.id}/${img.file}" alt="${escapeHtml(pick(img.caption))}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async">
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
            map && ["architecture", t("p.arch"), `
                ${doc?.map && hasPipeline ? `<div class="seg" role="tablist" aria-label="${escapeHtml(t("p.arch"))}">
                    <button type="button" role="tab" data-view="map" aria-selected="${archView === "map"}">${t("p.arch.map")}</button>
                    <button type="button" role="tab" data-view="pipeline" aria-selected="${archView === "pipeline"}">${t("p.arch.pipeline")}</button>
                </div>` : ""}
                ${archView === "map" || !hasPipeline ? `<div class="arch-panel arch-panel-flow">${systemMap(map)}</div>` : `<div class="arch-panel">${architecture(project)}</div>`}`],
            doc?.decisions?.length && ["decisions", t("p.decisions"), decisions(doc)],
            doc && (list(doc.results).length || list(doc.next).length) && ["results", t("p.results"), `
                <div class="outcomes">
                    ${list(doc.results).length ? `<div><h3 class="sub">${t("p.results.done")}</h3><ul class="built">${list(doc.results).map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul></div>` : ""}
                    ${list(doc.next).length ? `<div class="outcomes-next"><h3 class="sub">${t("p.limits")}</h3><ul class="built">${list(doc.next).map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul></div>` : ""}
                </div>`],
            ["stack", t("p.stack"), `<ul class="stack stack-large">${project.stack.map(techChip).join("")}</ul>`],
            gallery && ["gallery", isExperience ? label("gallery") : t(project.source === "cloud" ? "p.gallery.cloud" : "p.gallery"), `<div class="gallery">${gallery}</div>`]
        ].filter(Boolean);

        main.innerHTML = `
            <article class="study">
                <header class="study-head">
                    ${isExperience
                        ? `<p class="case-kind experience-org"><img src="${project.logo}" width="40" height="40" alt="">${escapeHtml(project.org)} · ${escapeHtml(pick(project.kind))} · ${escapeHtml(pick(project.period))}</p>`
                        : `<p class="case-kind">${t(`group.${project.group}`)} · ${escapeHtml(pick(project.kind))} · ${project.source === "cloud" ? t("p.source.cloud") : t("p.source.github")}${project.updated ? ` · ${t("p.updated")} ${formatDate(project.updated)}` : ""}</p>`}
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

                ${ordered.length > 1 ? `<nav class="pager${ordered.length === 2 ? " pager-single" : ""}" aria-label="${escapeHtml(isExperience ? label("nav") : t("nav.projects"))}">
                    ${ordered.length > 2 ? `<a href="${page}?id=${prev.id}"><span>${label("prev")}</span><strong>${escapeHtml(projectTitle(prev))}</strong></a>` : ""}
                    <a href="${page}?id=${next.id}"><span>${ordered.length > 2 ? label("next") : isExperience ? label("other") : label("next")}</span><strong>${escapeHtml(projectTitle(next))}</strong></a>
                </nav>` : ""}
            </article>`;

        mountMap(project);
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

    let resizeTimer;
    window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => flow?.refit(), 120); });
    /* Les polices changent la taille des composants : on recalcule le placement une fois chargées. */
    document.fonts?.ready.then(() => flow?.relayout());

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
