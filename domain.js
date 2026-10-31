/* Page domaine : points forts et compétences appliquées pour le domaine passé dans ?id=… */
(() => {
    const { t, pick } = window.i18n;
    const { escapeHtml, techIcon, projectTitle, orderedProjects } = window.portfolio;
    const domains = window.PORTFOLIO_DOMAINS;
    const projects = orderedProjects(window.PORTFOLIO_PROJECTS);
    const certificates = window.PORTFOLIO_CERTIFICATES;
    const experiences = window.PORTFOLIO_EXPERIENCES || [];
    const main = document.querySelector("#contenu");
    const id = new URLSearchParams(location.search).get("id");
    let sourceFilter = "all";
    const VISIBLE_SOURCES = 6;

    const key = (name) => String(name).toLowerCase();
    const certTitle = (cert) => (window.i18n.language === "en" && cert.titleEn ? cert.titleEn : cert.title);

    /*
     * Pour chaque compétence du domaine, où elle a été appliquée :
     * projets (stack), certifications (skills) et expériences (skills).
     */
    function collectSkills(domain) {
        const wanted = new Map(domain.skills.map((s) => [key(s), s]));
        const found = new Map();
        const add = (name, source) => {
            const k = key(name);
            if (!wanted.has(k)) return;
            if (!found.has(k)) found.set(k, { name: wanted.get(k), project: [], cert: [], exp: [] });
            const entry = found.get(k)[source.type];
            if (!entry.some((x) => x.id === source.id)) entry.push(source);
        };
        projects.forEach((p) => p.stack.forEach((s) => add(s, { type: "project", id: p.id, item: p })));
        certificates.forEach((c) => (c.skills || []).forEach((s) => add(s, { type: "cert", id: c.id, item: c })));
        experiences.forEach((e) => e.skills.forEach((s) => add(s, { type: "exp", id: e.id, item: e })));
        const total = (s) => s.project.length * 2 + s.cert.length + s.exp.length * 2;
        return [...found.values()].sort((a, b) => total(b) - total(a) || a.name.localeCompare(b.name));
    }

    /* Projets du domaine : ceux qui utilisent le plus de compétences du domaine. */
    function rankProjects(skills) {
        const scores = new Map();
        skills.forEach((s) => s.project.forEach(({ item }) => {
            const entry = scores.get(item.id) || { item, skills: [] };
            entry.skills.push(s.name);
            scores.set(item.id, entry);
        }));
        return [...scores.values()]
            .filter((e) => e.skills.length >= 2)
            .sort((a, b) => b.skills.length - a.skills.length)
            .slice(0, 8);
    }

    const sourceLink = ({ type, item }) => {
        if (type === "project") return `<a class="src src-project" href="project.html?id=${item.id}">${escapeHtml(projectTitle(item))}</a>`;
        if (type === "cert") return `<a class="src src-cert" href="index.html?cert=${encodeURIComponent(item.id)}#certifications">${escapeHtml(certTitle(item))}</a>`;
        return `<a class="src src-exp" href="index.html#parcours">${escapeHtml(item.org.split(" · ")[0])}</a>`;
    };

    function skillCard(skill) {
        const groups = [["project", "d.src.project"], ["cert", "d.src.cert"], ["exp", "d.src.exp"]]
            .filter(([type]) => skill[type].length && (sourceFilter === "all" || sourceFilter === type));
        if (!groups.length) return "";
        const count = groups.reduce((n, [type]) => n + skill[type].length, 0);
        return `
            <li class="skill-card">
                <div class="skill-head">${techIcon(skill.name)}<strong>${escapeHtml(skill.name)}</strong><span class="skill-count" title="${escapeHtml(t("d.uses", { n: count }))}">${count}</span></div>
                ${groups.map(([type, label]) => {
                    const list = skill[type];
                    const extra = list.length - VISIBLE_SOURCES;
                    return `
                    <div class="skill-sources">
                        <span class="src-label src-label-${type}">${t(label)}</span>
                        <div>${list.map((s, i) => (i < VISIBLE_SOURCES ? sourceLink(s) : sourceLink(s).replace('class="src ', 'class="src src-extra '))).join("")}${extra > 0 ? `<button type="button" class="src-more" aria-expanded="false">+${extra}</button>` : ""}</div>
                    </div>`;
                }).join("")}
            </li>`;
    }

    function render() {
        window.i18n.apply();
        const index = domains.findIndex((d) => d.id === id);
        const domain = domains[index];
        if (!domain) {
            document.title = "Amine AIT ALI";
            main.innerHTML = `<div class="not-found"><h1>${t("d.notfound")}</h1><a class="button button-primary" href="index.html#expertise">${t("d.back")}</a></div>`;
            return;
        }

        const title = t(`exp.${domain.id}`);
        document.title = `${title} — Amine AIT ALI`;
        document.querySelector("meta[name='description']").setAttribute("content", pick(domain.intro));

        const skills = collectSkills(domain);
        const usedProjects = new Set(skills.flatMap((s) => s.project.map((x) => x.id)));
        const usedCerts = new Set(skills.flatMap((s) => s.cert.map((x) => x.id)));
        const usedExp = experiences.filter((e) => skills.some((s) => s.exp.some((x) => x.id === e.id)));
        const ranked = rankProjects(skills);
        const prev = domains[(index - 1 + domains.length) % domains.length];
        const next = domains[(index + 1) % domains.length];
        const byId = (pid) => projects.find((p) => p.id === pid);

        const metrics = [
            [skills.length, "d.stats.skills"],
            [usedProjects.size, "d.stats.projects"],
            [usedCerts.size, "d.stats.certs"],
            [usedExp.length, "d.stats.exp"]
        ].filter(([n]) => n).map(([n, label]) => `<div><dt>${n}</dt><dd>${escapeHtml(n === 1 ? t(`${label}.one`) : t(label))}</dd></div>`).join("");

        const strengths = `<ol class="strengths">${domain.strengths.map((s, i) => `
            <li>
                <span class="strength-num">${String(i + 1).padStart(2, "0")}</span>
                <h3>${escapeHtml(pick(s.title))}</h3>
                <p>${escapeHtml(pick(s.text))}</p>
                ${s.proof?.length ? `<p class="strength-proof"><span>${t("d.proof")}</span>${s.proof.map(byId).filter(Boolean).map((p) => `<a href="project.html?id=${p.id}">${escapeHtml(projectTitle(p))}</a>`).join("")}</p>` : ""}
            </li>`).join("")}</ol>`;

        const filters = ["all", "project", "cert", "exp"]
            .filter((f) => f === "all" || skills.some((s) => s[f].length))
            .map((f) => `<button type="button" data-source="${f}" aria-pressed="${f === sourceFilter}">${t(`d.filter.${f}`)}</button>`).join("");

        const skillList = skills.map(skillCard).join("");

        const projectCards = ranked.map(({ item, skills: used }) => `
            <li>
                <a class="domain-project" href="project.html?id=${item.id}">
                    <span class="case-kind">${escapeHtml(pick(item.kind))}</span>
                    <strong>${escapeHtml(projectTitle(item))}</strong>
                    <span class="domain-project-skills">${used.slice(0, 6).map((s) => `<span>${techIcon(s)}${escapeHtml(s)}</span>`).join("")}${used.length > 6 ? `<span class="more">+${used.length - 6}</span>` : ""}</span>
                </a>
            </li>`).join("");

        const expCards = usedExp.map((e) => {
            const used = skills.filter((s) => s.exp.some((x) => x.id === e.id)).map((s) => s.name);
            return `
                <li class="domain-exp">
                    <img src="${e.logo}" width="48" height="48" alt="" loading="lazy">
                    <div>
                        <p class="case-kind">${escapeHtml(e.org)}</p>
                        <strong>${escapeHtml(pick(e.title))}</strong>
                        <ul class="stack">${used.map((s) => `<li class="tech">${techIcon(s)}<span>${escapeHtml(s)}</span></li>`).join("")}</ul>
                    </div>
                </li>`;
        }).join("");

        const sections = [
            ["strengths", t("d.strengths"), strengths],
            ["skills", t("d.skills"), `
                <p class="section-note">${t("d.skills.lead")}</p>
                <div class="seg" role="group" aria-label="${escapeHtml(t("d.skills"))}">${filters}</div>
                <ul class="skill-grid">${skillList}</ul>`],
            projectCards && ["projects", t("d.projects"), `<p class="section-note">${t("d.projects.lead")}</p><ul class="domain-projects">${projectCards}</ul>`],
            expCards && ["experience", t("d.experience"), `<ul class="domain-exps">${expCards}</ul>`]
        ].filter(Boolean);

        main.innerHTML = `
            <article class="study domain">
                <header class="study-head">
                    <p class="case-kind">${t("d.kicker")} · ${escapeHtml(domain.label)}</p>
                    <h1>${escapeHtml(title)}</h1>
                    <p class="study-lead">${escapeHtml(pick(domain.intro))}</p>
                </header>

                <section aria-label="${escapeHtml(t("p.numbers"))}"><dl class="metrics metrics-large">${metrics}</dl></section>

                <div class="study-layout">
                    <nav class="toc" aria-label="${escapeHtml(t("p.toc"))}">
                        <p>${t("p.toc")}</p>
                        <ol>${sections.map(([k, label]) => `<li><a href="#s-${k}">${escapeHtml(label)}</a></li>`).join("")}</ol>
                    </nav>
                    <div class="study-sections">
                        ${sections.map(([k, label, html]) => `
                            <section class="study-section" id="s-${k}" aria-labelledby="h-${k}">
                                <h2 id="h-${k}">${escapeHtml(label)}</h2>
                                ${html}
                            </section>`).join("")}
                    </div>
                </div>

                <nav class="domain-switch" aria-label="${escapeHtml(t("d.other"))}">
                    <p>${t("d.other")}</p>
                    <ul>${domains.map((d) => `<li><a href="domain.html?id=${d.id}"${d.id === domain.id ? ' aria-current="page"' : ""}>${escapeHtml(t(`exp.${d.id}`))}</a></li>`).join("")}</ul>
                </nav>

                <nav class="pager" aria-label="${escapeHtml(t("d.other"))}">
                    <a href="domain.html?id=${prev.id}"><span>${t("d.prev")}</span><strong>${escapeHtml(t(`exp.${prev.id}`))}</strong></a>
                    <a href="domain.html?id=${next.id}"><span>${t("d.next")}</span><strong>${escapeHtml(t(`exp.${next.id}`))}</strong></a>
                </nav>
            </article>`;

        watchToc();
    }

    /* Filtre des sources : ne redessine que la grille des compétences. */
    main.addEventListener("click", (event) => {
        const more = event.target.closest(".src-more");
        if (more) {
            const open = more.getAttribute("aria-expanded") !== "true";
            more.setAttribute("aria-expanded", String(open));
            more.closest(".skill-sources").classList.toggle("open", open);
            more.textContent = open ? "−" : `+${more.parentElement.querySelectorAll(".src-extra").length}`;
            return;
        }
        const button = event.target.closest("[data-source]");
        if (!button) return;
        sourceFilter = button.dataset.source;
        main.querySelectorAll("[data-source]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        const domain = domains.find((d) => d.id === id);
        main.querySelector(".skill-grid").innerHTML = collectSkills(domain).map(skillCard).join("");
    });

    /* Table des matières : surligne la section en cours de lecture. */
    let tocObserver;
    function watchToc() {
        tocObserver?.disconnect();
        const links = [...main.querySelectorAll(".toc a")];
        tocObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
            });
        }, { rootMargin: "-20% 0px -70%" });
        main.querySelectorAll(".study-section").forEach((s) => tocObserver.observe(s));
    }

    window.i18n.onChange(render);
    render();
})();
