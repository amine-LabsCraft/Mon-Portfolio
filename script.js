/* Accueil : projets, certifications et formulaire de contact. */
const { t, pick } = window.i18n;
const { escapeHtml, techChip, decorateStacks, architectureCompact, projectLogos, projectTitle, formatDate, orderedProjects, capToNaturalSize, GROUP_ORDER } = window.portfolio;
const projects = orderedProjects(window.PORTFOLIO_PROJECTS);
const certificates = window.PORTFOLIO_CERTIFICATES;

const GITHUB_USER = "amine-LabsCraft";

/* ---------- Projets ---------- */

let projectFilter = "all";
let projectQuery = "";

function projectUrl(project) {
    return `project.html?id=${encodeURIComponent(project.id)}`;
}

function badges(project) {
    const items = [];
    if (project.isNew) items.push(`<span class="badge badge-new">${t("projects.new")}</span>`);
    else if (project.source === "cloud") items.push(`<span class="badge">${t("projects.cloud")}</span>`);
    if (project.pinned) items.push(`<span class="badge">${t("projects.pinned")}</span>`);
    return items.join("");
}

function codeLink(project) {
    if (project.repo) return `<a class="card-side-link" href="https://github.com/${GITHUB_USER}/${encodeURIComponent(project.repo)}" target="_blank" rel="noreferrer">${t("projects.code")}</a>`;
    if (project.post) return `<a class="card-side-link" href="${escapeHtml(project.post)}" target="_blank" rel="noreferrer">${t("projects.post")}</a>`;
    return "";
}

function featuredCard(project) {
    const metrics = (project.metrics || []).slice(0, 3).map((m) =>
        `<div><dt>${escapeHtml(m.value)}</dt><dd>${escapeHtml(pick(m.label))}</dd></div>`).join("");
    return `
        <article class="case">
            <div class="case-text">
                <p class="case-kind">${escapeHtml(pick(project.kind))}${badges(project)}</p>
                <h4><a class="stretched" href="${projectUrl(project)}">${escapeHtml(projectTitle(project))}</a></h4>
                <p>${escapeHtml(pick(project.tagline))}</p>
                ${metrics ? `<dl class="metrics">${metrics}</dl>` : ""}
                <div class="case-actions"><span class="read-more">${t("projects.open")}</span>${codeLink(project)}</div>
            </div>
            <div class="case-visual">${architectureCompact(project)}</div>
        </article>`;
}

function projectCard(project) {
    return `
        <article class="card">
            <div class="card-body">
                <p class="case-kind">${escapeHtml(pick(project.kind))}${badges(project)}</p>
                <h4><a class="stretched" href="${projectUrl(project)}">${escapeHtml(projectTitle(project))}</a></h4>
                <p>${escapeHtml(pick(project.tagline))}</p>
                <ul class="stack">${projectLogos(project, 4).map(techChip).join("")}</ul>
                ${codeLink(project)}
            </div>
        </article>`;
}

function matchesQuery(project) {
    if (!projectQuery) return true;
    const arch = window.PORTFOLIO_ARCHITECTURES?.[project.id];
    const haystack = [
        project.title, project.titleEn, pick(project.kind), pick(project.tagline), project.stack.join(" "),
        arch ? JSON.stringify(arch.stages.map((s) => [s.items, s.branches?.map((b) => b.items)])) : ""
    ].join(" ").toLowerCase();
    return projectQuery.split(/\s+/).every((word) => haystack.includes(word));
}

function renderProjectFilters() {
    const options = ["all", ...GROUP_ORDER];
    document.querySelector("#project-filters").innerHTML = options.map((g) => {
        const n = g === "all" ? projects.length : projects.filter((p) => p.group === g).length;
        return `<button type="button" class="chip${g === projectFilter ? " active" : ""}" data-filter="${g}" aria-pressed="${g === projectFilter}">${g === "all" ? t("projects.all") : t(`group.${g}`)} <span>${n}</span></button>`;
    }).join("");
}

function renderProjects() {
    const visible = projects.filter((p) => (projectFilter === "all" || p.group === projectFilter) && matchesQuery(p));
    document.querySelector("#project-groups").innerHTML = GROUP_ORDER.map((group) => {
        const list = visible.filter((p) => p.group === group);
        if (!list.length) return "";
        const featured = list.filter((p) => p.featured);
        const others = list.filter((p) => !p.featured);
        return `
            <section class="project-group" aria-labelledby="group-${group}">
                <header class="group-head">
                    <h3 id="group-${group}">${t(`group.${group}`)} <span>${list.length}</span></h3>
                    <p>${t(`group.${group}.lead`)}</p>
                </header>
                ${featured.length ? `<div class="case-list">${featured.map(featuredCard).join("")}</div>` : ""}
                ${others.length ? `<div class="project-grid">${others.map(projectCard).join("")}</div>` : ""}
            </section>`;
    }).join("");
    document.querySelector("#projects-empty").hidden = visible.length > 0;
    renderProjectFilters();
}

document.querySelector("#project-filters").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-filter]");
    if (!chip) return;
    projectFilter = chip.dataset.filter;
    renderProjects();
});

const projectSearch = document.querySelector("#project-search");
projectSearch.addEventListener("input", () => {
    projectQuery = projectSearch.value.trim().toLowerCase();
    renderProjects();
});

/* « / » place le curseur dans la recherche de projets, comme sur beaucoup d'outils de développeurs. */
document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.target.closest("input, textarea")) return;
    event.preventDefault();
    projectSearch.focus();
    projectSearch.scrollIntoView({ block: "center" });
});

/* ---------- Certifications ---------- */

const certCategories = ["all", "data", "ai", "cloud", "dev"];
const CERT_PREVIEW_COUNT = 9;
/* En dessous de cette largeur, l'image d'origine est petite : on l'affiche à sa taille réelle, sans l'agrandir. */
const LOW_RES_WIDTH = 700;
let certFilter = "all";
let certsExpanded = false;
let visibleCerts = [];
let openCertIndex = -1;

const certImage = (cert) => `images/${cert.file.split("/").map(encodeURIComponent).join("/")}`;
const isLowRes = (cert) => cert.width < LOW_RES_WIDTH;
const certTitle = (cert) => (window.i18n.language === "en" && cert.titleEn ? cert.titleEn : cert.title);

const issuerInitials = (issuer) => issuer.split(/[\s·]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/* Fiche générée quand l'image d'origine est trop petite pour être lisible. */
function certFace(cert) {
    const date = cert.date ? formatDate(cert.date, { day: "numeric", month: "long", year: "numeric" }) : "";
    return `<span class="cert-face cert-face-${cert.category}">
        <span class="cert-seal" aria-hidden="true">${escapeHtml(issuerInitials(cert.issuer))}</span>
        <span class="cert-face-type">${cert.certification ? t("certs.certification") : t("certs.course")}</span>
        <strong>${escapeHtml(certTitle(cert))}</strong>
        <span class="cert-face-meta">${escapeHtml(cert.issuer)}${date ? ` · ${date}` : ""}</span>
        <span class="cert-face-owner">Amine AIT ALI</span>
    </span>`;
}

function certCard(cert, index) {
    /* Image d'origine si elle est assez grande, sinon une fiche générée nette. */
    const visual = isLowRes(cert)
        ? certFace(cert)
        : `<img src="${certImage(cert)}" alt="" width="${cert.width}" height="${cert.height}" ${index > 5 ? "loading=\"lazy\"" : ""}>`;
    return `
        <button class="cert-card" type="button" data-index="${index}" aria-label="${escapeHtml(t("certs.view"))} : ${escapeHtml(certTitle(cert))}">
            <span class="cert-visual">${visual}</span>
            <span class="cert-caption">
                <small>${escapeHtml(cert.issuer)} · ${t(`certcat.${cert.category}`)}</small>
                <strong>${escapeHtml(certTitle(cert))}</strong>
            </span>
        </button>`;
}

function renderCertFilters() {
    document.querySelector("#cert-filters").innerHTML = certCategories.map((c) => {
        const n = c === "all" ? certificates.length : certificates.filter((x) => x.category === c).length;
        return `<button type="button" class="chip${c === certFilter ? " active" : ""}" data-filter="${c}" aria-pressed="${c === certFilter}">${c === "all" ? t("projects.all") : t(`certcat.${c}`)} <span>${n}</span></button>`;
    }).join("");
}

function renderCertificates() {
    const filtered = certificates
        .filter((c) => certFilter === "all" || c.category === certFilter)
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const collapsible = filtered.length > CERT_PREVIEW_COUNT;
    visibleCerts = collapsible && !certsExpanded ? filtered.slice(0, CERT_PREVIEW_COUNT) : filtered;
    document.querySelector("#cert-grid").innerHTML = visibleCerts.map(certCard).join("");
    const toggle = document.querySelector("#cert-toggle");
    toggle.hidden = !collapsible;
    toggle.textContent = certsExpanded ? t("certs.less") : t("certs.more", { n: filtered.length });
    renderCertFilters();
}

document.querySelector("#cert-filters").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-filter]");
    if (!chip) return;
    certFilter = chip.dataset.filter;
    certsExpanded = false;
    renderCertificates();
});

document.querySelector("#cert-toggle").addEventListener("click", () => {
    certsExpanded = !certsExpanded;
    renderCertificates();
    if (!certsExpanded) document.querySelector("#certifications").scrollIntoView({ block: "start" });
});

const certDialog = document.querySelector("#cert-dialog");
const certDetail = document.querySelector("#cert-detail");

function renderCertDetail() {
    const cert = visibleCerts[openCertIndex];
    if (!cert) return;
    const related = (cert.projects || []).map((id) => projects.find((p) => p.id === id)).filter(Boolean);
    const visual = isLowRes(cert)
        ? `${certFace(cert)}<figcaption class="lowres">${t("certs.lowres")}</figcaption>`
        : `<img class="cert-full" src="${certImage(cert)}" width="${cert.width}" height="${cert.height}" alt="${escapeHtml(certTitle(cert))}, Amine AIT ALI">`;
    certDetail.innerHTML = `
        <figure class="cert-figure">${visual}</figure>
        <div class="cert-info">
            <p class="case-kind">${escapeHtml(cert.issuer)} · ${t(`certcat.${cert.category}`)}</p>
            <h2 id="cert-dialog-title">${escapeHtml(certTitle(cert))}</h2>
            <dl>
                ${cert.date ? `<div><dt>${t("certs.issued")}</dt><dd>${formatDate(cert.date, { day: "numeric", month: "long", year: "numeric" })}</dd></div>` : ""}
                ${cert.hours ? `<div><dt>${t("certs.duration")}</dt><dd>${t("certs.hours", { n: cert.hours })}</dd></div>` : ""}
                <div><dt>${t("certs.skills")}</dt><dd><ul class="stack">${cert.skills.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></dd></div>
                ${related.length ? `<div><dt>${t("certs.used")}</dt><dd class="related">${related.map((p) => `<a href="${projectUrl(p)}">${escapeHtml(projectTitle(p))}</a>`).join("")}</dd></div>` : ""}
            </dl>
            ${cert.url ? `<a class="button button-ghost" href="${escapeHtml(cert.url)}" target="_blank" rel="noreferrer">${t("certs.verify")}</a>` : ""}
        </div>`;
    const full = certDetail.querySelector(".cert-full");
    if (full) capToNaturalSize(full);
    document.querySelector("#cert-prev").disabled = openCertIndex === 0;
    document.querySelector("#cert-next").disabled = openCertIndex === visibleCerts.length - 1;
}

document.querySelector("#cert-grid").addEventListener("click", (event) => {
    const card = event.target.closest(".cert-card");
    if (!card) return;
    openCertIndex = Number(card.dataset.index);
    renderCertDetail();
    certDialog.showModal();
});

document.querySelector("#cert-prev").addEventListener("click", () => { if (openCertIndex > 0) { openCertIndex -= 1; renderCertDetail(); } });
document.querySelector("#cert-next").addEventListener("click", () => { if (openCertIndex < visibleCerts.length - 1) { openCertIndex += 1; renderCertDetail(); } });
document.querySelector("#cert-close").addEventListener("click", () => certDialog.close());
certDialog.addEventListener("click", (event) => { if (event.target === certDialog) certDialog.close(); });
certDialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") document.querySelector("#cert-prev").click();
    if (event.key === "ArrowRight") document.querySelector("#cert-next").click();
});

/* ---------- Contact ---------- */

const copyButton = document.querySelector("#copy-email");
const copyStatus = document.querySelector("#copy-status");
copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(copyButton.dataset.email);
        copyStatus.textContent = t("contact.copied");
    } catch (_) {
        copyStatus.textContent = copyButton.dataset.email;
    }
    setTimeout(() => { copyStatus.textContent = ""; }, 2500);
});

const contactForm = document.querySelector("#contact-form");
const contactEmailInput = document.querySelector("#contact-email-input");
const contactMessage = document.querySelector("#contact-message");
const messageCount = document.querySelector("#message-count");
const formSuccess = document.querySelector("#form-success");
const formError = document.querySelector("#form-error");

const EMAILJS_PUBLIC_KEY = "uXqgaEJ5E8a3xd3-Y";
const EMAILJS_SERVICE_ID = "service_fzqlfbb";
const EMAILJS_TEMPLATE_ID = "template_z7v0gxu";
const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send-form";

contactMessage.addEventListener("input", () => { messageCount.textContent = contactMessage.value.length; });

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    contactForm.classList.add("was-validated");
    formSuccess.hidden = true;
    formError.hidden = true;
    if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }

    if (contactForm.elements.company.value) {
        contactForm.reset();
        formSuccess.hidden = false;
        return;
    }

    const submitButton = contactForm.querySelector("button[type='submit']");
    const submitLabel = submitButton.querySelector(".submit-label");
    submitButton.disabled = true;
    submitLabel.textContent = t("form.sending");

    try {
        const sender = contactEmailInput.value.trim();
        document.querySelector("#contact-sender-name").value = sender;
        document.querySelector("#contact-reply-to").value = sender;
        const formData = new FormData(contactForm);
        formData.append("service_id", EMAILJS_SERVICE_ID);
        formData.append("template_id", EMAILJS_TEMPLATE_ID);
        formData.append("user_id", EMAILJS_PUBLIC_KEY);
        const response = await fetch(EMAILJS_ENDPOINT, { method: "POST", body: formData });
        if (!response.ok) throw new Error(`EmailJS: ${response.status}`);
        contactForm.reset();
        contactForm.classList.remove("was-validated");
        messageCount.textContent = "0";
        formSuccess.hidden = false;
    } catch (_) {
        formError.hidden = false;
    } finally {
        submitButton.disabled = false;
        submitLabel.textContent = t("form.send");
    }
});

/* ---------- Navigation active ---------- */

const navAnchors = [...document.querySelectorAll(".nav-links a[href^='#']")];
if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
        });
    }, { rootMargin: "-40% 0px -55%" });
    navAnchors.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean).forEach((s) => observer.observe(s));
}

/* ---------- Démarrage ---------- */

function renderAll() {
    window.i18n.apply();
    decorateStacks();
    document.querySelector("#stat-certs").textContent = certificates.length;
    renderProjects();
    renderCertificates();
    if (certDialog.open) renderCertDetail();
}

window.i18n.onChange(renderAll);
renderAll();

/* Nombre de dépôts publics, mis à jour depuis GitHub quand l'API répond. */
fetch(`https://api.github.com/users/${GITHUB_USER}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((profile) => { if (profile?.public_repos) document.querySelector("#stat-repos").textContent = profile.public_repos; })
    .catch(() => {});
