/* Éléments partagés par l'accueil et les pages projet : thème, menu, logos, schémas. */
(() => {
    const root = document.documentElement;

    function setTheme(theme) {
        root.dataset.theme = theme;
        try { localStorage.setItem("portfolio-theme", theme); } catch (_) { /* rien */ }
    }

    document.querySelectorAll(".theme-toggle").forEach((button) => {
        button.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
    });

    const header = document.querySelector(".site-header");
    const progress = document.querySelector(".scroll-progress");
    const toTop = document.querySelector(".to-top");
    function onScroll() {
        header?.classList.toggle("scrolled", window.scrollY > 12);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        if (toTop) toTop.classList.toggle("visible", window.scrollY > window.innerHeight);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    function closeMenu() {
        menuToggle?.setAttribute("aria-expanded", "false");
        navLinks?.classList.remove("open");
        document.body.classList.remove("menu-open");
    }
    menuToggle?.addEventListener("click", () => {
        const open = menuToggle.getAttribute("aria-expanded") !== "true";
        menuToggle.setAttribute("aria-expanded", String(open));
        navLinks.classList.toggle("open", open);
        document.body.classList.toggle("menu-open", open);
    });
    navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

    const year = document.querySelector("#current-year");
    if (year) year.textContent = new Date().getFullYear();

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]);
    }

    /*
     * Logos des technologies (images/tech/*.svg). La clé est le nom affiché, en minuscules.
     * Une technologie sans logo garde un petit monogramme.
     */
    const AZURE = "azure";
    const TECH_LOGOS = {
        "postgresql": "postgresql", "psycopg2": "postgresql", "airflow": "airflow-icon", "airflow 3": "airflow-icon",
        "databricks": "databricks", "dbt": "dbt-icon", "power bi": "microsoft-power-bi", "kafka": "kafka-icon",
        "kafka protocol": "kafka-icon", "fastapi": "fastapi-icon", "python": "python", "asyncio": "python",
        "mysql": "mysql-icon", "mongodb": "mongodb-icon", "pytorch": "pytorch-icon", "resnet50": "pytorch-icon",
        "graphsage": "pytorch-icon", "grad-cam": "pytorch-icon", "hadoop": "hadoop", "hadoop hdfs": "hadoop", "yarn": "hadoop",
        "spark": "apache-spark", "pyspark": "apache-spark", "azure": AZURE, "azure event hubs": AZURE,
        "azure synapse": AZURE, "serverless sql": AZURE, "dedicated sql pool": AZURE, "adls gen2": AZURE,
        "data factory": AZURE, "azure data factory": AZURE, "data flow": AZURE, "azure resource manager": AZURE,
        "azure blob storage": AZURE, "blob storage": AZURE, "vnet": AZURE, "nat gateway": AZURE, "azurerm": AZURE,
        "sas": AZURE, "aws": "aws", "aws ec2": "aws-ec2", "terraform": "terraform-icon", "docker": "docker-icon",
        "docker compose": "docker-icon", "kubernetes": "kubernetes", "redis": "redis", "grafana": "grafana",
        "prometheus": "prometheus", "loki": "loki", "celery": "celery", "react": "react", "next.js": "nextjs-icon",
        "supabase": "supabase-icon", "pgvector": "supabase-icon", "openai": "openai-icon", "claude": "claude-icon",
        "langchain": "langchain-icon", "langgraph": "langgraph", "flutter": "flutter", "dart": "dart",
        "node.js": "nodejs-icon", "express": "express", "stripe": "stripe", "sqlite": "sqlite", "aiosqlite": "sqlite",
        "flask": "flask", "streamlit": "streamlit", "hugging face": "hugging-face-icon", "sentence-transformers": "hugging-face-icon",
        "jupyter": "jupyter", "pandas": "pandas-icon", "tailwind": "tailwindcss-icon", "tailwind css": "tailwindcss-icon",
        "typescript": "typescript-icon", "javascript": "javascript", "html": "html-5", "css": "css-3", "chart.js": "chartjs",
        "github actions": "github-actions", "nginx": "nginx", "gitlab": "gitlab", "gitlab ci/cd": "gitlab", "ollama": "ollama",
        "llama 3.2": "meta-icon", "llama 3.3": "meta-icon", "llama 3.3 70b": "meta-icon", "scikit-learn": "scikit-learn",
        "numpy": "numpy", "matplotlib": "matplotlib-icon", "pydantic": "pydantic", "uv": "uv", "jwt": "jwt", "oauth": "google",
        "qt": "qt", "pyqt": "qt", "jinja": "jinja", "jinja2": "jinja", "binance": "binance", "mcp": "mcp", "json": "json",
        "entra id": "microsoft", "google": "google", "vite": "vitejs", "sheetjs": "javascript", "jspdf": "javascript",
        "git": "git", "linux": "linux", "pytest": "pytest", "synapse": AZURE, "faiss": "meta-icon",
        "unity catalog": "databricks", "diffusiongemma": "google", "kafka ui": "kafka-icon", "seaborn": "python",
        "datacamp": "datacamp", "coursera": "coursera", "java": "java", "polars": "polars",
        "microsoft": "microsoft", "meta": "meta-icon", "bigquery": "gcp", "ibm": "ibm", "cisco": "cisco",
        "oracle": "oracle", "nvidia": "nvidia", "apache": "apache", "snowflake": "snowflake-icon"
    };

    function techLogo(name) {
        const file = TECH_LOGOS[String(name).toLowerCase()];
        return file ? `images/tech/${file}.svg` : null;
    }

    function techIcon(name) {
        const src = techLogo(name);
        if (src) return `<img class="tech-logo" src="${src}" alt="" width="20" height="20" loading="lazy">`;
        const letters = String(name).replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
        return `<span class="tech-logo tech-mono" aria-hidden="true">${escapeHtml(letters || "·")}</span>`;
    }

    /* Une technologie : son logo et son nom. */
    function techChip(name) {
        return `<li class="tech">${techIcon(name)}<span>${escapeHtml(name)}</span></li>`;
    }

    /* Ajoute les logos aux listes de technologies écrites directement dans le HTML. */
    function decorateStacks(scope = document) {
        scope.querySelectorAll("ul.stack > li:not(.tech)").forEach((li) => {
            const name = li.textContent.trim();
            li.classList.add("tech");
            li.innerHTML = `${techIcon(name)}<span>${escapeHtml(name)}</span>`;
        });
    }

    function architectureOf(project) {
        return window.PORTFOLIO_ARCHITECTURES?.[project.id] || null;
    }

    function techList(items) {
        return items?.length ? `<ul class="stack arch-tech">${items.map(techChip).join("")}</ul>` : "";
    }

    /* Schéma complet (page projet) : étapes numérotées, branches parallèles, bandeaux transverses. */
    function architecture(project) {
        const { pick } = window.i18n;
        const arch = architectureOf(project);
        if (!arch) return "";
        const stages = arch.stages.map((stage, i) => {
            const body = stage.branches
                ? `<div class="arch-branches">${stage.branches.map((b) => `
                        <div class="arch-branch">
                            <h4>${escapeHtml(pick(b.title))}</h4>
                            ${techList(b.items)}
                            <p>${escapeHtml(pick(b.detail))}</p>
                        </div>`).join("")}</div>`
                : `${techList(stage.items)}<p>${escapeHtml(pick(stage.detail))}</p>`;
            return `<li class="arch-stage">
                    <header><span class="arch-num">${String(i + 1).padStart(2, "0")}</span><h3>${escapeHtml(pick(stage.title))}</h3></header>
                    ${body}
                </li>`;
        }).join("");
        const bands = (arch.bands || []).map((band) => `
                <div class="arch-band">
                    <strong>${escapeHtml(pick(band.title))}</strong>
                    ${techList(band.items)}
                    <p>${escapeHtml(pick(band.detail))}</p>
                </div>`).join("");
        return `<div class="arch" style="--steps:${arch.stages.length}">
                <ol class="arch-stages">${stages}</ol>
                ${bands ? `<div class="arch-bands">${bands}</div>` : ""}
            </div>`;
    }

    /* Toutes les technologies d'une étape, branches comprises. */
    function stageItems(stage) {
        return stage.branches ? stage.branches.flatMap((b) => b.items || []) : (stage.items || []);
    }

    /* Schéma compact (cartes de l'accueil) : une ligne par étape, avec les logos. */
    function architectureCompact(project) {
        const { pick } = window.i18n;
        const arch = architectureOf(project);
        if (!arch) return "";
        const rows = arch.stages.map((stage, i) => {
            /* Un logo par technologie distincte (Unity Catalog et Databricks partagent le même). */
            const seen = new Set();
            const items = stageItems(stage).filter((n) => { const key = techLogo(n) || n; if (seen.has(key)) return false; seen.add(key); return true; });
            return `<li>
                    <span class="arch-num">${String(i + 1).padStart(2, "0")}</span>
                    <span class="arch-row-title">${escapeHtml(pick(stage.title))}</span>
                    <span class="arch-row-logos">${items.map((n) => `<span title="${escapeHtml(n)}">${techIcon(n)}</span>`).join("")}</span>
                </li>`;
        }).join("");
        return `<ol class="arch-compact">${rows}</ol>`;
    }

    /* Logos distincts d'un projet, pour les petites cartes. */
    function projectLogos(project, max = 6) {
        const arch = architectureOf(project);
        const names = arch ? arch.stages.flatMap(stageItems).concat((arch.bands || []).flatMap((b) => b.items || [])) : [];
        const withLogo = [...new Set(names.concat(project.stack))].filter((n) => techLogo(n));
        const seen = new Set();
        return withLogo.filter((n) => { const f = techLogo(n); if (seen.has(f)) return false; seen.add(f); return true; }).slice(0, max);
    }

    function projectTitle(project) {
        return window.i18n.language === "en" && project.titleEn ? project.titleEn : project.title;
    }

    function formatDate(iso, options = { month: "short", year: "numeric" }) {
        if (!iso) return "";
        const locale = window.i18n.language === "en" ? "en-GB" : "fr-FR";
        return new Date(`${iso}T12:00:00`).toLocaleDateString(locale, options);
    }

    /* Ordre d'affichage : Data engineering, puis IA & ML, puis Software ; études de cas d'abord. */
    const GROUP_ORDER = ["data", "ai", "software"];
    function orderedProjects(list = window.PORTFOLIO_PROJECTS) {
        return [...list].sort((a, b) =>
            GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
            || Number(Boolean(b.featured)) - Number(Boolean(a.featured))
            || (b.updated || "").localeCompare(a.updated || ""));
    }

    /*
     * Affiche une image sans jamais l'agrandir au-delà de sa taille réelle
     * (corrigée par la densité d'écran), pour qu'elle reste nette.
     */
    function capToNaturalSize(img) {
        const apply = () => {
            if (!img.naturalWidth) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const sharpWidth = Math.max(img.naturalWidth / dpr, Math.min(img.naturalWidth, 760));
            img.style.maxWidth = `min(100%, ${Math.round(sharpWidth)}px)`;
        };
        if (img.complete) apply(); else img.addEventListener("load", apply, { once: true });
    }

    window.portfolio = {
        escapeHtml, techChip, techIcon, decorateStacks, architecture, architectureCompact, projectLogos,
        projectTitle, formatDate, orderedProjects, capToNaturalSize, closeMenu, GROUP_ORDER
    };
})();
