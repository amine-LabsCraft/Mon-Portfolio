/*
 * Assistant du portfolio : pose une question, la fonction /api/ask cherche dans le CV et les dépôts,
 * puis le modèle répond en streaming avec ses sources.
 */
(() => {
    const { t } = window.i18n;
    const { escapeHtml } = window.portfolio;
    const ENDPOINT = "/api/ask";
    const STORE_KEY = "portfolio-assistant";
    const SUGGESTIONS = {
        fr: ["Quelle expérience a-t-il en data engineering cloud ?", "Quels projets utilisent Kafka ou le streaming ?", "Qu'a-t-il fait chez N+ONE ?", "Quels sont ses projets d'IA générative ?"],
        en: ["What cloud data engineering experience does he have?", "Which projects use Kafka or streaming?", "What did he build at N+ONE?", "What are his generative AI projects?"]
    };

    let messages = [];
    try { messages = JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]"); } catch (_) { messages = []; }
    const save = () => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-20))); } catch (_) { /* rien */ } };

    document.body.insertAdjacentHTML("beforeend", `
        <button class="ai-launcher" type="button" aria-expanded="false" aria-controls="ai-panel">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>
            <span data-i18n="ai.open">Demander à l'IA</span>
        </button>
        <section class="ai-panel" id="ai-panel" role="dialog" aria-modal="false" aria-labelledby="ai-title" hidden>
            <header class="ai-head">
                <div>
                    <h2 id="ai-title" data-i18n="ai.title">Assistant du portfolio</h2>
                    <p data-i18n="ai.subtitle">Répond à partir de mon CV et de mes dépôts GitHub.</p>
                </div>
                <button type="button" class="ai-icon" id="ai-reset" data-i18n-attr="aria-label:ai.reset;title:ai.reset"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4"/></svg></button>
                <button type="button" class="ai-icon" id="ai-close" data-i18n-attr="aria-label:ai.close;title:ai.close">×</button>
            </header>
            <div class="ai-log" id="ai-log" aria-live="polite"></div>
            <form class="ai-form" id="ai-form">
                <label class="sr-only" for="ai-input" data-i18n="ai.label">Votre question</label>
                <textarea id="ai-input" rows="1" maxlength="600" data-i18n-attr="placeholder:ai.placeholder"></textarea>
                <button type="submit" class="ai-send" data-i18n-attr="aria-label:ai.send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
            </form>
            <p class="ai-note" data-i18n="ai.note">Réponses générées par IA, elles peuvent contenir des erreurs.</p>
        </section>`);

    const launcher = document.querySelector(".ai-launcher");
    const panel = document.querySelector("#ai-panel");
    const log = document.querySelector("#ai-log");
    const form = document.querySelector("#ai-form");
    const input = document.querySelector("#ai-input");
    let busy = false;

    /* Mise en forme minimale et sûre : le texte est échappé avant tout balisage. */
    function format(text, sources) {
        let html = escapeHtml(text.replace(/【\s*([\d,\s†]+?)\s*】/g, (_, n) => `[${n.replace(/†.*/, "")}]`));
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
        html = html.replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (_, list) => list.split(/\s*,\s*/).map((n) => {
            const s = sources?.find((x) => x.n === Number(n));
            return s ? `<a class="ai-cite" href="${escapeHtml(s.url)}" title="${escapeHtml(s.title)}">${n}</a>` : "";
        }).join(""));
        const lines = html.split("\n");
        let out = "", inList = false;
        for (const line of lines) {
            const item = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/);
            if (item) { if (!inList) { out += "<ul>"; inList = true; } out += `<li>${item[1]}</li>`; continue; }
            if (inList) { out += "</ul>"; inList = false; }
            if (line.trim()) out += `<p>${line}</p>`;
        }
        return inList ? `${out}</ul>` : out;
    }

    function sourcesHtml(text, sources) {
        const cited = new Set([...text.matchAll(/(?:\[|【)\s*([\d,\s]+)/g)].flatMap((m) => m[1].split(/\s*,\s*/).map(Number)));
        const unique = [];
        for (const s of sources || []) {
            if (!cited.has(s.n) || unique.some((u) => u.url === s.url)) continue;
            unique.push(s);
        }
        if (!unique.length) return "";
        return `<div class="ai-sources"><span>${t("ai.sources")}</span>${unique.map((s) => `<a href="${escapeHtml(s.url)}">${escapeHtml(s.title)}</a>`).join("")}</div>`;
    }

    function render() {
        if (!messages.length) {
            log.innerHTML = `<div class="ai-empty"><p>${t("ai.empty")}</p><div class="ai-suggestions">${SUGGESTIONS[window.i18n.language].map((q) => `<button type="button">${escapeHtml(q)}</button>`).join("")}</div></div>`;
            return;
        }
        log.innerHTML = messages.map((m) => m.role === "user"
            ? `<div class="ai-msg ai-user">${escapeHtml(m.content)}</div>`
            : `<div class="ai-msg ai-bot${m.error ? " ai-error" : ""}">${m.content ? format(m.content, m.sources) : '<span class="ai-typing"><i></i><i></i><i></i></span>'}${m.content && !m.error ? sourcesHtml(m.content, m.sources) : ""}</div>`).join("");
        log.scrollTop = log.scrollHeight;
    }

    function open(state) {
        panel.hidden = !state;
        launcher.setAttribute("aria-expanded", String(state));
        document.body.classList.toggle("ai-open", state);
        if (state) { render(); input.focus(); } else { launcher.focus(); }
    }

    async function ask(question) {
        if (busy || !question.trim()) return;
        busy = true;
        form.classList.add("busy");
        const history = messages.filter((m) => !m.error).map(({ role, content }) => ({ role, content }));
        messages.push({ role: "user", content: question.trim() });
        const answer = { role: "assistant", content: "", sources: [] };
        messages.push(answer);
        render();
        try {
            const response = await fetch(ENDPOINT, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ question, history, lang: window.i18n.language })
            });
            if (!response.ok || !response.body) throw new Error(String(response.status));
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            for (;;) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split("\n\n");
                buffer = events.pop();
                for (const event of events) {
                    const line = event.split("\n").find((l) => l.startsWith("data:"));
                    if (!line) continue;
                    const data = JSON.parse(line.slice(5));
                    if (data.type === "sources") answer.sources = data.sources;
                    if (data.type === "delta") { answer.content += data.text; render(); }
                    if (data.type === "error") throw new Error("stream");
                }
            }
            if (!answer.content) throw new Error("empty");
        } catch (error) {
            answer.error = true;
            answer.content = t(String(error.message) === "429" ? "ai.limit" : "ai.error");
        } finally {
            busy = false;
            form.classList.remove("busy");
            save();
            render();
        }
    }

    launcher.addEventListener("click", () => open(panel.hidden));
    document.querySelector("#ai-close").addEventListener("click", () => open(false));
    document.querySelector("#ai-reset").addEventListener("click", () => { messages = []; save(); render(); input.focus(); });
    panel.addEventListener("keydown", (event) => { if (event.key === "Escape") open(false); });
    log.addEventListener("click", (event) => {
        const suggestion = event.target.closest(".ai-suggestions button");
        if (suggestion) ask(suggestion.textContent);
    });
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const question = input.value;
        input.value = "";
        input.style.height = "";
        ask(question);
    });
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
    });
    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
        input.style.overflowY = input.scrollHeight > 140 ? "auto" : "hidden";
    });

    window.i18n.apply(panel.parentElement);
    window.i18n.onChange(() => { if (!panel.hidden) render(); });
})();
