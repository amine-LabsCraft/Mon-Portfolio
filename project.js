/* Page d'étude de cas : affiche le projet passé dans ?id=… */
(() => {
    const { t, pick } = window.i18n;
    const { escapeHtml, techChip, architecture, projectTitle, formatDate, orderedProjects, capToNaturalSize } = window.portfolio;
    const projects = window.PORTFOLIO_PROJECTS;
    const main = document.querySelector("#contenu");
    const id = new URLSearchParams(location.search).get("id");

    /* Même ordre que sur l'accueil : Data engineering, IA & ML, puis Software. */
    const ordered = orderedProjects(projects);

    function render() {
        window.i18n.apply();
        const index = ordered.findIndex((p) => p.id === id);
        const project = ordered[index];

        if (!project) {
            document.title = "Amine AIT ALI";
            main.innerHTML = `<div class="not-found"><h1>${t("p.notfound")}</h1><a class="button button-primary" href="index.html#projets">${t("p.back")}</a></div>`;
            return;
        }

        const title = projectTitle(project);
        document.title = `${title} — Amine AIT ALI`;
        document.querySelector("meta[name='description']").setAttribute("content", pick(project.tagline));

        const prev = ordered[(index - 1 + ordered.length) % ordered.length];
        const next = ordered[(index + 1) % ordered.length];
        const repoUrl = project.repo ? `https://github.com/amine-LabsCraft/${encodeURIComponent(project.repo)}` : "";

        const metrics = (project.metrics || []).map((m) =>
            `<div><dt>${escapeHtml(m.value)}</dt><dd>${escapeHtml(pick(m.label))}</dd></div>`).join("");

        const actions = [
            repoUrl ? `<a class="button button-primary" href="${repoUrl}" target="_blank" rel="noreferrer">${t("p.code")}</a>` : "",
            project.post ? `<a class="button ${repoUrl ? "button-ghost" : "button-primary"}" href="${escapeHtml(project.post)}" target="_blank" rel="noreferrer">${t("p.post")}</a>` : ""
        ].join("");

        const gallery = (project.images || []).map((img, i) => `
            <figure class="shot${i === 0 && project.images.length > 2 ? " shot-wide" : ""}">
                <button type="button" data-index="${i}" data-src="images/projects/${project.id}/${img.file}" data-caption="${escapeHtml(pick(img.caption))}" aria-label="${escapeHtml(t("p.zoom"))} : ${escapeHtml(pick(img.caption))}">
                    <img src="images/projects/${project.id}/${img.file}" alt="${escapeHtml(pick(img.caption))}" loading="${i < 2 ? "eager" : "lazy"}">
                </button>
                <figcaption>${escapeHtml(pick(img.caption))}</figcaption>
            </figure>`).join("");

        main.innerHTML = `
            <article class="study">
                <header class="study-head">
                    <p class="case-kind">${t(`group.${project.group}`)} · ${escapeHtml(pick(project.kind))} · ${project.source === "cloud" ? t("p.source.cloud") : t("p.source.github")}${project.updated ? ` · ${t("p.updated")} ${formatDate(project.updated)}` : ""}</p>
                    <h1>${escapeHtml(title)}</h1>
                    <p class="study-lead">${escapeHtml(pick(project.tagline))}</p>
                    <div class="hero-actions">${actions}</div>
                </header>

                ${window.PORTFOLIO_ARCHITECTURES?.[project.id] ? `<section class="study-flow" aria-labelledby="flow-title"><h2 id="flow-title">${t("p.flow")}</h2>${architecture(project)}</section>` : ""}

                ${metrics ? `<section aria-labelledby="numbers-title"><h2 class="sr-only" id="numbers-title">${t("p.numbers")}</h2><dl class="metrics metrics-large">${metrics}</dl></section>` : ""}

                <div class="study-body">
                    <section><h2>${t("p.problem")}</h2><p>${escapeHtml(pick(project.problem))}</p></section>
                    <section><h2>${t("p.built")}</h2><ul class="built">${(pick(project.built) || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul></section>
                    <section><h2>${t("p.stack")}</h2><ul class="stack stack-large">${project.stack.map(techChip).join("")}</ul></section>
                </div>

                ${gallery ? `<section class="gallery-section"><h2>${t(project.source === "cloud" ? "p.gallery.cloud" : "p.gallery")}</h2><div class="gallery">${gallery}</div></section>` : ""}

                <nav class="pager" aria-label="Projets">
                    <a href="project.html?id=${prev.id}"><span>${t("p.prev")}</span><strong>${escapeHtml(projectTitle(prev))}</strong></a>
                    <a href="project.html?id=${next.id}"><span>${t("p.next")}</span><strong>${escapeHtml(projectTitle(next))}</strong></a>
                </nav>
            </article>`;
    }

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
