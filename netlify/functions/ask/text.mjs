/* Découpage du texte en termes pour la recherche BM25 (français et anglais). */

const STOPWORDS = new Set((
    "a au aux avec ce ces cet cette dans de des du elle en et eux il ils je la le les leur lui ma mais me meme mes moi mon ne nos notre nous on ou par pas pour qu que qui sa se ses son sur ta te tes toi ton tu un une vos votre vous est sont ete etre avoir a ont fait faire plus tres tout tous toute toutes comme aussi entre sans sous chaque dont ainsi alors donc quel quelle quels quelles " +
    "the a an and or of to in on for with by from at as is are was were be been it its this that these those you your he she they them his her their we our not no do does did can could has have had will would what which who whom how why when where there here into about over than then also more most such each any all"
).split(" "));

/* Quelques équivalences pour qu'une question en anglais retrouve des passages en français, et inversement. */
const SYNONYMS = {
    internship: ["stage"], stage: ["internship"], experience: ["experiences"], school: ["ecole", "ensa"],
    degree: ["diplome"], diplome: ["degree"], skills: ["competences"], competences: ["skills"],
    certificate: ["certification"], certifications: ["certification"], languages: ["langues"], langues: ["languages"],
    project: ["projet"], projects: ["projet"], projet: ["project"], cloud: ["azure", "aws"], streaming: ["temps", "reel", "kafka"],
    realtime: ["temps", "reel", "streaming"], pipeline: ["pipelines", "etl"], contact: ["email", "telephone"],
    email: ["contact"], phone: ["telephone"], fraud: ["fraude"], fraude: ["fraud"], tumor: ["tumeur"], tumeur: ["tumor"],
    agent: ["agents"], warehouse: ["entrepot"], dashboard: ["tableau"], testing: ["tests"], tests: ["testing"]
};

export function normalize(text) {
    return String(text).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function stem(word) {
    if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
    return word;
}

export function tokenize(text) {
    return normalize(text)
        .split(/[^a-z0-9+#.]+/)
        .map((w) => w.replace(/^\.+|\.+$/g, ""))
        .filter((w) => w.length > 1 && !STOPWORDS.has(w))
        .map(stem);
}

export function queryTerms(question) {
    const terms = tokenize(question);
    const expanded = new Set(terms);
    for (const t of terms) for (const s of SYNONYMS[t] || []) expanded.add(stem(s));
    return [...expanded];
}
