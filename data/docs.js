/*
 * Documentation détaillée des projets (page projet), rédigée à partir des README et des posts.
 * Pour chaque projet :
 *   context   situation de départ          pains    points de douleur
 *   solution  la réponse en une phrase      result   le résultat en une phrase
 *   steps     démarche, étape par étape (title, text, tech)
 *   map       architecture globale : zones > nodes, et links (from → to, label, kind : data | control | monitor)
 *   decisions choix techniques et leur raison (choice, why)
 *   results   ce que le projet démontre     next     limites et suites possibles
 */
window.PORTFOLIO_DOCS = {};
const DOC = (id, doc) => { window.PORTFOLIO_DOCS[id] = doc; };

/* ===================== Data engineering & Cloud ===================== */

DOC("spotify-pipeline", {
    context: {
        fr: "Une application de streaming musical enregistre ses abonnés, artistes, titres et chaque écoute dans une base Azure SQL. Pour analyser ces données sans charger la production, il faut les amener dans un lakehouse et suivre leurs changements dans le temps.",
        en: "A music streaming app stores its subscribers, artists, tracks and every play in an Azure SQL database. To analyse this data without loading production, it has to be brought into a lakehouse and its changes tracked over time."
    },
    pains: {
        fr: ["Recopier toutes les tables à chaque exécution coûte cher et devient impossible quand les volumes grandissent.", "Un pipeline par table multiplie le code à maintenir : 5 tables aujourd'hui, 50 demain.", "Les dimensions changent (abonnement, nom d'un titre) : écraser les lignes fausse les analyses passées."],
        en: ["Copying every table on each run is costly and becomes impossible as volumes grow.", "One pipeline per table multiplies the code to maintain: 5 tables today, 50 tomorrow.", "Dimensions change (subscription, track name): overwriting rows skews past analyses."]
    },
    solution: { fr: "Un pipeline ADF unique piloté par métadonnées, un filigrane par table, puis Auto Loader et Delta Live Tables en SCD 2 sur Databricks.", en: "A single metadata-driven ADF pipeline, one watermark per table, then Auto Loader and Delta Live Tables with SCD 2 on Databricks." },
    result: { fr: "Le 2e run ne transfère que les 470 lignes modifiées, et les dimensions Gold gardent chaque version des lignes.", en: "The 2nd run moves only the 470 changed rows, and Gold dimensions keep every version of each row." },
    steps: [
        { title: { fr: "Préparer la source", en: "Prepare the source" }, text: { fr: "Schéma en étoile dans Azure SQL : FactStream et quatre dimensions. Un script charge 2 865 lignes, un second en ajoute ou modifie 470 pour tester l'incrémental.", en: "Star schema in Azure SQL: FactStream and four dimensions. One script loads 2,865 rows, a second adds or changes 470 to test incremental loading." }, tech: ["Azure SQL"] },
        { title: { fr: "Piloter par métadonnées", en: "Drive by metadata" }, text: { fr: "loop_input.json décrit chaque table (schéma, nom, colonne CDC, date de reprise). ADF le lit sur GitHub via un service lié HTTP et boucle dessus avec ForEach.", en: "loop_input.json describes each table (schema, name, CDC column, restart date). ADF reads it from GitHub through an HTTP linked service and loops over it with ForEach." }, tech: ["Azure Data Factory", "GitHub"] },
        { title: { fr: "Charger en incrémental", en: "Load incrementally" }, text: { fr: "Lookup du dernier filigrane dans cdc.json, copie des lignes où cdc_col dépasse ce filigrane vers Bronze en Parquet. Si des lignes arrivent, MAX(cdc_col) devient le nouveau filigrane ; sinon le fichier vide est supprimé.", en: "Lookup of the last watermark in cdc.json, copy of rows where cdc_col exceeds it to Bronze as Parquet. If rows arrive, MAX(cdc_col) becomes the new watermark; otherwise the empty file is deleted." }, tech: ["Azure Data Factory", "ADLS Gen2", "Parquet"] },
        { title: { fr: "Nettoyer en Silver", en: "Clean in Silver" }, text: { fr: "Auto Loader lit uniquement les nouveaux fichiers (checkpoint par table) : dédoublonnage par clé, user_name en majuscules, durationFlag low / medium / high sur les titres, suppression de _rescued_data.", en: "Auto Loader reads only new files (one checkpoint per table): deduplication by key, upper-cased user_name, low / medium / high durationFlag on tracks, _rescued_data dropped." }, tech: ["Auto Loader", "PySpark", "Unity Catalog"] },
        { title: { fr: "Historiser en Gold", en: "Historise in Gold" }, text: { fr: "Delta Live Tables avec create_auto_cdc_flow : dimuser, dimtrack et dimdate en SCD 2 (l'ancienne version est conservée), factstream en SCD 1. dimuser écarte les lignes sans user_id.", en: "Delta Live Tables with create_auto_cdc_flow: dimuser, dimtrack and dimdate as SCD 2 (the old version is kept), factstream as SCD 1. dimuser drops rows without a user_id." }, tech: ["Delta Live Tables", "Databricks"] },
        { title: { fr: "Superviser et analyser", en: "Monitor and analyse" }, text: { fr: "En fin de boucle, ADF appelle un Logic App qui envoie un e-mail avec le nom du pipeline et le Run ID. Un gabarit Jinja2 génère les requêtes de jointure fait / dimensions.", en: "At the end of the loop, ADF calls a Logic App that sends an e-mail with the pipeline name and run ID. A Jinja2 template generates the fact / dimension join queries." }, tech: ["Logic Apps", "Jinja2"] }
    ],
    map: {
        zones: [
            { id: "src", title: { fr: "Source", en: "Source" }, nodes: [
                { id: "sql", name: "Azure SQL", tech: "Azure SQL", note: { fr: "5 tables en étoile", en: "5 star-schema tables" } },
                { id: "cfg", name: "loop_input.json", tech: "GitHub", note: { fr: "Liste des tables", en: "Table list" } }
            ] },
            { id: "orch", title: { fr: "Orchestration", en: "Orchestration" }, nodes: [
                { id: "adf", name: "Data Factory", tech: "Azure Data Factory", note: { fr: "ForEach incrémental", en: "Incremental ForEach" } },
                { id: "logic", name: "Logic Apps", tech: "Logic Apps", note: { fr: "E-mail d'alerte", en: "Alert e-mail" } }
            ] },
            { id: "bronze", title: { fr: "Bronze · ADLS Gen2", en: "Bronze · ADLS Gen2" }, nodes: [
                { id: "raw", name: "Parquet bruts", tech: "Parquet", note: { fr: "Un dossier par table", en: "One folder per table" } },
                { id: "state", name: "cdc.json", tech: "ADLS Gen2", note: { fr: "Filigrane par table", en: "Watermark per table" } }
            ] },
            { id: "dbx", title: { fr: "Databricks", en: "Databricks" }, nodes: [
                { id: "silver", name: "Silver", tech: "Auto Loader", note: { fr: "Nettoyage, Delta", en: "Cleaning, Delta" } },
                { id: "gold", name: "Gold", tech: "Delta Live Tables", note: { fr: "SCD 1 et SCD 2", en: "SCD 1 and SCD 2" } },
                { id: "uc", name: "Unity Catalog", tech: "Unity Catalog", note: { fr: "spotify_cata", en: "spotify_cata" } }
            ] }
        ],
        links: [
            { from: "cfg", to: "adf", label: { fr: "tables", en: "tables" }, kind: "control" },
            { from: "sql", to: "adf", label: { fr: "lignes > filigrane", en: "rows > watermark" }, kind: "data" },
            { from: "state", to: "adf", label: { fr: "dernier cdc", en: "last cdc" }, kind: "control" },
            { from: "adf", to: "raw", label: { fr: "Parquet", en: "Parquet" }, kind: "data" },
            { from: "adf", to: "logic", label: { fr: "fin de run", en: "end of run" }, kind: "monitor" },
            { from: "raw", to: "silver", label: { fr: "Auto Loader", en: "Auto Loader" }, kind: "data" },
            { from: "silver", to: "gold", label: { fr: "Auto CDC", en: "Auto CDC" }, kind: "data" },
            { from: "uc", to: "gold", label: { fr: "droits", en: "access" }, kind: "control" }
        ]
    },
    decisions: [
        { choice: { fr: "Un pipeline générique plutôt qu'un pipeline par table", en: "One generic pipeline instead of one per table" }, why: { fr: "Ajouter une table revient à ajouter une ligne dans loop_input.json ; la logique incrémentale n'existe qu'à un seul endroit.", en: "Adding a table means adding one entry to loop_input.json; the incremental logic lives in one place only." } },
        { choice: { fr: "Un filigrane cdc.json par table, stocké dans le lac", en: "One cdc.json watermark per table, stored in the lake" }, why: { fr: "Chaque table avance à son rythme : l'échec de FactStream ne bloque pas DimUser, et l'état reste lisible.", en: "Each table moves at its own pace: a FactStream failure does not block DimUser, and the state stays readable." } },
        { choice: { fr: "Auto Loader avec trigger(once=True)", en: "Auto Loader with trigger(once=True)" }, why: { fr: "Le coût d'un batch, mais seuls les nouveaux fichiers sont lus grâce au checkpoint.", en: "The cost of a batch, but only new files are read thanks to the checkpoint." } },
        { choice: { fr: "SCD 2 pour les dimensions, SCD 1 pour les faits", en: "SCD 2 for dimensions, SCD 1 for facts" }, why: { fr: "On garde l'historique là où il a un sens métier (abonnement, titre) et une seule version des écoutes.", en: "History is kept where it matters to the business (subscription, track) and a single version of plays." } },
        { choice: { fr: "Unity Catalog plutôt que des montages", en: "Unity Catalog instead of mounts" }, why: { fr: "Accès au stockage par External Locations et identité managée : aucune clé de compte dans les notebooks.", en: "Storage access through External Locations and a managed identity: no account key in notebooks." } }
    ],
    results: {
        fr: ["Le 2e run ne rapatrie que 470 lignes sur 3 335, et un run sans nouveauté ne laisse aucun fichier vide.", "Les dimensions Gold conservent chaque version des abonnés et des titres modifiés.", "Une table de plus ne demande qu'une ligne de configuration côté ADF."],
        en: ["The 2nd run brings back only 470 of 3,335 rows, and a run with nothing new leaves no empty file.", "Gold dimensions keep every version of changed subscribers and tracks.", "One more table needs only one configuration entry on the ADF side."]
    },
    next: {
        fr: ["Le filigrane repose sur une colonne de date : les suppressions côté source ne sont pas détectées ; le CDC natif de SQL Server les capterait.", "Enchaîner ADF, Silver et Gold dans un seul job planifié.", "Ajouter une table Gold pour dimartist et limiter l'alerte aux runs en échec."],
        en: ["The watermark relies on a date column, so source deletions are not detected; native SQL Server CDC would capture them.", "Chain ADF, Silver and Gold in a single scheduled job.", "Add a Gold table for dimartist and limit the alert to failed runs."]
    }
});

DOC("lakebase", {
    context: {
        fr: "Les applications et les agents IA écrivent dans une base transactionnelle (OLTP), tandis que la BI et le ML lisent un lakehouse analytique (OLAP). Les deux mondes sont d'habitude reliés par des pipelines ETL et des copies.",
        en: "Applications and AI agents write to a transactional database (OLTP), while BI and ML read an analytical lakehouse (OLAP). The two worlds are usually connected by ETL pipelines and copies."
    },
    pains: {
        fr: ["Données dupliquées entre la base applicative et le lakehouse, avec un décalage entre les deux.", "Mise à l'échelle coûteuse : compute, données et journaux sont liés à la même machine.", "Chaque environnement de test ou de développement exige une copie complète de la base."],
        en: ["Data duplicated between the application database and the lakehouse, with a lag between them.", "Expensive scaling: compute, data and logs are tied to the same machine.", "Every test or development environment needs a full copy of the database."]
    },
    solution: { fr: "Un Lakebase Databricks : PostgreSQL serverless dont les données vivent sur le stockage du Lakehouse.", en: "A Databricks Lakebase: serverless PostgreSQL whose data lives on Lakehouse storage." },
    result: { fr: "Un projet PostgreSQL 17 avec deux branches copy-on-write, et une architecture documentée de bout en bout.", en: "A PostgreSQL 17 project with two copy-on-write branches, and an end-to-end documented architecture." },
    steps: [
        { title: { fr: "Créer le projet", en: "Create the project" }, text: { fr: "Projet Lakebase sur AWS us-east-2, PostgreSQL 17, 7 jours d'historique et télémétrie Postgres activée.", en: "Lakebase project on AWS us-east-2, PostgreSQL 17, 7-day history and Postgres telemetry enabled." }, tech: ["Databricks", "PostgreSQL", "AWS"] },
        { title: { fr: "Brancher les environnements", en: "Branch the environments" }, text: { fr: "Branche production par défaut et branche développement créée en copy-on-write, chacune avec un compute primaire de 1 CU.", en: "Default production branch and a copy-on-write development branch, each with a 1 CU primary compute." }, tech: ["PostgreSQL"] },
        { title: { fr: "Observer les computes", en: "Monitor the computes" }, text: { fr: "Suivi des CU allouées, de la RAM et de l'état actif ou inactif de chaque compute dans la console.", en: "Tracked allocated CU, RAM and active or idle state of each compute in the console." }, tech: ["Databricks"] },
        { title: { fr: "Comprendre le moteur", en: "Understand the engine" }, text: { fr: "Analyse du découplage compute / stockage / WAL : Safekeepers, Pageservers, stockage objet, read replicas.", en: "Analysed the compute / storage / WAL decoupling: Safekeepers, Pageservers, object storage, read replicas." }, tech: [] },
        { title: { fr: "Documenter", en: "Document" }, text: { fr: "Deux schémas d'architecture et une note sur LTAP, le branching, les réplicas et Unity Catalog.", en: "Two architecture diagrams and a note on LTAP, branching, replicas and Unity Catalog." }, tech: [] }
    ],
    map: {
        zones: [
            { id: "apps", title: { fr: "Clients", en: "Clients" }, nodes: [
                { id: "app", name: "Applications", note: { fr: "Web, mobile, ERP", en: "Web, mobile, ERP" } },
                { id: "agent", name: "Agents IA", note: { fr: "Requêtes SQL", en: "SQL queries" } }
            ] },
            { id: "compute", title: { fr: "Compute sans état", en: "Stateless compute" }, nodes: [
                { id: "pg", name: "PostgreSQL 17", tech: "PostgreSQL", note: { fr: "Primaire lecture / écriture", en: "Read / write primary" } },
                { id: "replica", name: "Read replica", tech: "PostgreSQL", note: { fr: "Lectures lourdes", en: "Heavy reads" } }
            ] },
            { id: "storage", title: { fr: "Stockage durable", en: "Durable storage" }, nodes: [
                { id: "safe", name: "Safekeepers", note: { fr: "WAL, quorum Paxos", en: "WAL, Paxos quorum" } },
                { id: "pages", name: "Pageservers", note: { fr: "Pages, branches COW", en: "Pages, COW branches" } },
                { id: "s3", name: "Stockage objet", tech: "AWS", note: { fr: "S3 / Azure Blob", en: "S3 / Azure Blob" } }
            ] },
            { id: "lake", title: { fr: "Lakehouse", en: "Lakehouse" }, nodes: [
                { id: "uc", name: "Unity Catalog", tech: "Unity Catalog", note: { fr: "Gouvernance", en: "Governance" } },
                { id: "spark", name: "Spark · SQL · BI", tech: "Spark", note: { fr: "Analyse sans ETL", en: "Analytics without ETL" } }
            ] }
        ],
        links: [
            { from: "app", to: "pg", label: { fr: "SQL", en: "SQL" }, kind: "data" },
            { from: "agent", to: "pg", label: { fr: "SQL", en: "SQL" }, kind: "data" },
            { from: "pg", to: "safe", label: { fr: "WAL", en: "WAL" }, kind: "data" },
            { from: "safe", to: "pages", label: { fr: "pages", en: "pages" }, kind: "data" },
            { from: "pages", to: "s3", label: { fr: "couches", en: "layers" }, kind: "data" },
            { from: "pages", to: "replica", label: { fr: "lecture", en: "read" }, kind: "control" },
            { from: "s3", to: "spark", label: { fr: "Parquet / Delta", en: "Parquet / Delta" }, kind: "data" },
            { from: "uc", to: "spark", label: { fr: "droits", en: "access" }, kind: "control" }
        ]
    },
    decisions: [
        { choice: { fr: "Branches copy-on-write plutôt que des copies de base", en: "Copy-on-write branches instead of database copies" }, why: { fr: "Un environnement de test est créé en quelques secondes, sans dupliquer les données ; seules les pages modifiées sont stockées.", en: "A test environment is created in seconds without duplicating data; only modified pages are stored." } },
        { choice: { fr: "Compute sans état séparé du stockage", en: "Stateless compute separated from storage" }, why: { fr: "Le calcul s'adapte à la charge (autoscaling) sans déplacer les données.", en: "Compute scales with load (autoscaling) without moving data." } },
        { choice: { fr: "Read replicas pour l'analytique", en: "Read replicas for analytics" }, why: { fr: "Les tableaux de bord lisent sans ralentir les écritures de l'application.", en: "Dashboards read without slowing down application writes." } }
    ],
    results: {
        fr: ["Un environnement transactionnel et un environnement de développement isolés, sur les mêmes données.", "Une compréhension fine du modèle LTAP : OLTP et OLAP sur une seule couche de stockage.", "Deux schémas d'architecture réutilisables pour expliquer Lakebase."],
        en: ["A transactional environment and an isolated development environment on the same data.", "A detailed understanding of the LTAP model: OLTP and OLAP on one storage layer.", "Two reusable architecture diagrams to explain Lakebase."]
    },
    next: {
        fr: ["Brancher une vraie application et un agent IA sur la branche de production.", "Mesurer l'apport des read replicas sur une charge de lecture réelle.", "Synchroniser des tables Gold vers Lakebase avec Lakehouse Sync."],
        en: ["Connect a real application and an AI agent to the production branch.", "Measure what read replicas bring under a real read load.", "Sync Gold tables to Lakebase with Lakehouse Sync."]
    }
});

DOC("walmart-streaming-flow", {
    context: {
        fr: "Un supermarché enregistre des commandes en continu, mais ses équipes veulent des indicateurs fiables, historisés et rafraîchis régulièrement, sans toucher à la base de production.",
        en: "A supermarket records orders continuously, but its teams want reliable, historised indicators refreshed regularly, without touching the production database."
    },
    pains: {
        fr: ["Deux rythmes incompatibles : écritures toutes les quelques secondes, analyse horaire.", "Rechargements complets lents et coûteux à chaque rafraîchissement.", "Aucune garantie de qualité : une donnée fausse arrive directement dans les rapports.", "Historique des prix, magasins et clients perdu à chaque mise à jour."],
        en: ["Two incompatible rhythms: writes every few seconds, hourly analytics.", "Slow, costly full reloads on every refresh.", "No quality guarantee: bad data goes straight into reports.", "Price, store and customer history lost on every update."]
    },
    solution: { fr: "Une capture de changements horaire vers un lakehouse Databricks, modélisé et testé par dbt avant publication.", en: "Hourly change capture into a Databricks lakehouse, modelled and tested by dbt before publication." },
    result: { fr: "Un schéma en étoile Gold publié seulement si ses 131 tests passent, et supervisé de bout en bout.", en: "A Gold star schema published only if its 131 tests pass, monitored end to end." },
    steps: [
        { title: { fr: "Simuler le magasin", en: "Simulate the store" }, text: { fr: "Order Pulse (Flask) écrit des commandes cohérentes : 25 supercentres, horaires locaux, paniers de 1 à 5 articles, une seule transaction par commande.", en: "Order Pulse (Flask) writes coherent orders: 25 supercentres, local hours, 1–5 item baskets, one transaction per order." }, tech: ["Flask", "PostgreSQL", "Docker"] },
        { title: { fr: "Capturer les changements", en: "Capture changes" }, text: { fr: "Un trigger pose un change_version monotone sur chaque insertion ou mise à jour ; c'est le curseur de l'ingestion.", en: "A trigger assigns a monotonic change_version on every insert or update; it is the ingestion cursor." }, tech: ["PostgreSQL"] },
        { title: { fr: "Ingérer en Bronze", en: "Ingest to Bronze" }, text: { fr: "Toutes les heures, le DAG orchestrate lance ingest_cdc : lecture au-delà du watermark et MERGE idempotent dans bronze_local.", en: "Every hour, the orchestrate DAG runs ingest_cdc: read past the watermark and idempotent MERGE into bronze_local." }, tech: ["Airflow", "Celery", "Redis"] },
        { title: { fr: "Nettoyer et conformer", en: "Clean and conform" }, text: { fr: "Six modèles Silver incrémentaux, puis obt_b : une ligne par article de commande avec toutes les jointures métier.", en: "Six incremental Silver models, then obt_b: one row per order item with every business join." }, tech: ["Databricks", "Delta Lake", "dbt"] },
        { title: { fr: "Modéliser et tester", en: "Model and test" }, text: { fr: "Snapshots SCD2, sept dimensions et fact_orders ; 131 tests (clés, relations, montants, horaires, rôles). Un échec bloque la suite.", en: "SCD2 snapshots, seven dimensions and fact_orders; 131 tests (keys, relations, amounts, hours, roles). A failure stops the run." }, tech: ["dbt"] },
        { title: { fr: "Restituer et superviser", en: "Serve and monitor" }, text: { fr: "Power BI lit le Gold via le SQL Warehouse ; Prometheus, Grafana et Loki suivent chaque étape avec des règles d'alerte.", en: "Power BI reads Gold through the SQL Warehouse; Prometheus, Grafana and Loki track each step with alert rules." }, tech: ["Power BI", "Prometheus", "Grafana"] }
    ],
    map: {
        zones: [
            { id: "src", title: { fr: "Source (Docker)", en: "Source (Docker)" }, nodes: [
                { id: "pulse", name: "Order Pulse", tech: "Flask", note: { fr: "Génère les commandes", en: "Generates orders" } },
                { id: "pg", name: "PostgreSQL", tech: "PostgreSQL", note: { fr: "Schéma raw + trigger", en: "raw schema + trigger" } }
            ] },
            { id: "orch", title: { fr: "Orchestration", en: "Orchestration" }, nodes: [
                { id: "af", name: "Airflow 3", tech: "Airflow", note: { fr: "DAG horaire", en: "Hourly DAG" } },
                { id: "dbt", name: "dbt", tech: "dbt", note: { fr: "Modèles + 131 tests", en: "Models + 131 tests" } }
            ] },
            { id: "lake", title: { fr: "Lakehouse Databricks", en: "Databricks lakehouse" }, nodes: [
                { id: "bronze", name: "Bronze", tech: "Delta Lake", note: { fr: "bronze_local", en: "bronze_local" } },
                { id: "silver", name: "Silver", tech: "Delta Lake", note: { fr: "Conformé, obt_b", en: "Conformed, obt_b" } },
                { id: "gold", name: "Gold", tech: "Delta Lake", note: { fr: "Étoile + SCD2", en: "Star + SCD2" } }
            ] },
            { id: "use", title: { fr: "Usage & supervision", en: "Use & monitoring" }, nodes: [
                { id: "bi", name: "Power BI", tech: "Power BI", note: { fr: "KPIs retail", en: "Retail KPIs" } },
                { id: "obs", name: "Grafana", tech: "Grafana", note: { fr: "4 dashboards, alertes", en: "4 dashboards, alerts" } }
            ] }
        ],
        links: [
            { from: "pulse", to: "pg", label: { fr: "INSERT", en: "INSERT" }, kind: "data" },
            { from: "pg", to: "af", label: { fr: "lignes > watermark", en: "rows > watermark" }, kind: "data" },
            { from: "af", to: "bronze", label: { fr: "MERGE", en: "MERGE" }, kind: "data" },
            { from: "af", to: "dbt", label: { fr: "déclenche", en: "triggers" }, kind: "control" },
            { from: "dbt", to: "silver", label: { fr: "build", en: "build" }, kind: "control" },
            { from: "bronze", to: "silver", label: { fr: "incrémental", en: "incremental" }, kind: "data" },
            { from: "silver", to: "gold", label: { fr: "si tests OK", en: "if tests pass" }, kind: "data" },
            { from: "gold", to: "bi", label: { fr: "SQL Warehouse", en: "SQL Warehouse" }, kind: "data" },
            { from: "af", to: "obs", label: { fr: "métriques", en: "metrics" }, kind: "monitor" }
        ]
    },
    decisions: [
        { choice: { fr: "Curseur change_version posé par trigger", en: "Trigger-assigned change_version cursor" }, why: { fr: "Ordre total des changements de commandes et d'articles, donc une ingestion incrémentale sans trou ni doublon.", en: "Total ordering of order and item changes, so incremental ingestion with no gaps or duplicates." } },
        { choice: { fr: "Airflow pousse vers Bronze avec un MERGE", en: "Airflow pushes to Bronze with a MERGE" }, why: { fr: "Ingestion idempotente sans connecteur externe : rejouer une heure ne crée pas de doublons.", en: "Idempotent ingestion without an external connector: replaying an hour creates no duplicates." } },
        { choice: { fr: "obt_b avant la table de faits", en: "obt_b before the fact table" }, why: { fr: "Toutes les jointures métier conformées au même endroit, au prix d'une table large reconstruite à chaque run.", en: "All conformed business joins in one place, at the cost of a wide table rebuilt each run." } },
        { choice: { fr: "Dimensions courantes + historique SCD2 séparé", en: "Current dimensions + separate SCD2 history" }, why: { fr: "Une ligne par clé pour des relations BI simples, l'historique restant disponible pour l'audit.", en: "One row per key for simple BI relations, with history kept for audit." } },
        { choice: { fr: "Fait au niveau de l'article", en: "Line-level fact" }, why: { fr: "Analyses exactes par produit et quantité ; les totaux de commande demandent des mesures BI soignées.", en: "Exact product and quantity analytics; order totals need careful BI measures." } }
    ],
    results: {
        fr: ["Données Gold publiées seulement après 131 tests réussis.", "Historique complet des clients, produits, magasins et employés grâce aux snapshots SCD2.", "Plateforme reproductible : Docker Compose, lockfile uv, configuration par variables d'environnement.", "Chaque étape visible dans 4 dashboards Grafana avec alertes."],
        en: ["Gold data published only after 131 passing tests.", "Full customer, product, store and employee history through SCD2 snapshots.", "Reproducible platform: Docker Compose, uv lockfile, environment-driven configuration.", "Every step visible in 4 Grafana dashboards with alerts."]
    },
    next: {
        fr: ["Le débit est borné par le SQL Warehouse : adapté aux volumes de démonstration.", "Analyses « à date » via une jointure aux snapshots.", "Passage possible à un connecteur CDC managé pour de plus gros volumes."],
        en: ["Throughput is bounded by the SQL Warehouse: suited to demo volumes.", "\"As-of\" analysis needs a join to the snapshots.", "A managed CDC connector could take over for larger volumes."]
    }
});

DOC("cryptopulse", {
    context: {
        fr: "Les marchés crypto produisent des milliers de transactions par minute. Pour un tableau de bord, la donnée utile n'est pas chaque trade mais une vue agrégée, propre et alertée.",
        en: "Crypto markets produce thousands of trades per minute. For a dashboard, the useful data is not each trade but a clean, aggregated, alerted view."
    },
    pains: {
        fr: ["Stocker chaque transaction brute coûte cher et ne sert pas l'analyse.", "Messages incomplets ou invalides dans le flux.", "Coupures du WebSocket à gérer sans perdre ni doubler les données.", "Mouvements anormaux du marché repérés trop tard."],
        en: ["Storing every raw trade is costly and doesn't help analysis.", "Incomplete or invalid messages in the stream.", "WebSocket drops to handle without losing or duplicating data.", "Abnormal market moves spotted too late."]
    },
    solution: { fr: "Un pipeline asynchrone qui valide chaque trade, l'agrège en bougies OHLCV à la minute et détecte les événements.", en: "An async pipeline that validates every trade, aggregates it into one-minute OHLCV candles and detects events." },
    result: { fr: "Un modèle compact et idempotent, alimenté en continu et lisible par Power BI.", en: "A compact, idempotent model, fed continuously and readable by Power BI." },
    steps: [
        { title: { fr: "Se connecter au flux", en: "Connect to the stream" }, text: { fr: "Client WebSocket asynchrone sur les trades publics de Binance, limité à une liste de symboles autorisés.", en: "Async WebSocket client on Binance public trades, limited to an allow-list of symbols." }, tech: ["Binance", "Python"] },
        { title: { fr: "Valider chaque message", en: "Validate every message" }, text: { fr: "11 codes de rejet : symbole, prix, quantité, horodatage manquants ou invalides, JSON illisible. Chaque rejet est compté.", en: "11 reject codes: missing or invalid symbol, price, quantity, timestamp, malformed JSON. Every reject is counted." }, tech: ["Python"] },
        { title: { fr: "Agréger à la minute", en: "Aggregate per minute" }, text: { fr: "Par symbole et minute UTC : prix moyen, open, high, low, close, volume, nombre de trades et variation.", en: "Per symbol and UTC minute: average price, open, high, low, close, volume, trade count and change." }, tech: ["Python"] },
        { title: { fr: "Détecter les événements", en: "Detect events" }, text: { fr: "Règles price_spike, price_drop, volume anormal (vs moyenne des 20 dernières minutes) et high_volatility (> 5 %).", en: "price_spike, price_drop, abnormal volume (vs. 20-minute average) and high_volatility (> 5%) rules." }, tech: [] },
        { title: { fr: "Persister", en: "Persist" }, text: { fr: "Faits dans MySQL avec une clé unique symbole × minute ; événements et journaux d'exécution dans MongoDB.", en: "Facts in MySQL with a unique symbol × minute key; events and run logs in MongoDB." }, tech: ["MySQL", "MongoDB"] },
        { title: { fr: "Exposer et piloter", en: "Expose and operate" }, text: { fr: "Endpoints de santé FastAPI, reconnexion WebSocket et arrêt propre ; Power BI lit la couche persistée.", en: "FastAPI health endpoints, WebSocket reconnection and graceful shutdown; Power BI reads the persisted layer." }, tech: ["FastAPI", "Power BI"] }
    ],
    map: {
        zones: [
            { id: "src", title: { fr: "Source", en: "Source" }, nodes: [{ id: "bn", name: "Binance", tech: "Binance", note: { fr: "WebSocket public", en: "Public WebSocket" } }] },
            { id: "proc", title: { fr: "Pipeline Python", en: "Python pipeline" }, nodes: [
                { id: "ing", name: "Ingestion", tech: "Python", note: { fr: "asyncio", en: "asyncio" } },
                { id: "val", name: "Validation", tech: "Python", note: { fr: "11 codes de rejet", en: "11 reject codes" } },
                { id: "agg", name: "Agrégation", tech: "Python", note: { fr: "OHLCV / minute", en: "OHLCV / minute" } }
            ] },
            { id: "store", title: { fr: "Stockage", en: "Storage" }, nodes: [
                { id: "my", name: "MySQL", tech: "MySQL", note: { fr: "Faits, dimensions", en: "Facts, dimensions" } },
                { id: "mg", name: "MongoDB", tech: "MongoDB", note: { fr: "Événements, logs", en: "Events, logs" } }
            ] },
            { id: "use", title: { fr: "Usage", en: "Use" }, nodes: [
                { id: "bi", name: "Power BI", tech: "Power BI", note: { fr: "Tableaux de bord", en: "Dashboards" } },
                { id: "api", name: "FastAPI", tech: "FastAPI", note: { fr: "Santé du service", en: "Service health" } }
            ] }
        ],
        links: [
            { from: "bn", to: "ing", label: { fr: "trades JSON", en: "JSON trades" }, kind: "data" },
            { from: "ing", to: "val", label: { fr: "messages", en: "messages" }, kind: "data" },
            { from: "val", to: "agg", label: { fr: "valides", en: "valid" }, kind: "data" },
            { from: "agg", to: "my", label: { fr: "bougies", en: "candles" }, kind: "data" },
            { from: "agg", to: "mg", label: { fr: "événements", en: "events" }, kind: "data" },
            { from: "my", to: "bi", label: { fr: "SQL", en: "SQL" }, kind: "data" },
            { from: "api", to: "mg", label: { fr: "logs", en: "logs" }, kind: "monitor" }
        ]
    },
    decisions: [
        { choice: { fr: "Pas de Spark ni d'Airflow", en: "No Spark or Airflow" }, why: { fr: "Le volume ne le justifie pas : un pipeline Python asynchrone est plus simple à expliquer, tester et exploiter.", en: "The volume doesn't justify it: an async Python pipeline is simpler to explain, test and operate." } },
        { choice: { fr: "Trades bruts éphémères", en: "Ephemeral raw trades" }, why: { fr: "Seules les bougies minute sont conservées : le volume stocké baisse fortement sans perdre l'information utile.", en: "Only minute candles are kept: stored volume drops sharply without losing useful information." } },
        { choice: { fr: "Stockage hybride SQL + NoSQL", en: "Hybrid SQL + NoSQL storage" }, why: { fr: "Des faits structurés pour la BI, des documents souples pour les événements et les journaux.", en: "Structured facts for BI, flexible documents for events and logs." } },
        { choice: { fr: "UTC partout et clé unique par minute", en: "UTC everywhere and a unique key per minute" }, why: { fr: "Aucune ambiguïté de fuseau et aucun doublon en cas de nouvelle tentative.", en: "No time-zone ambiguity and no duplicates on retry." } }
    ],
    results: {
        fr: ["Un flux haute fréquence transformé en un modèle analytique compact.", "Qualité observable : messages reçus, valides et rejetés comptés à chaque run.", "Événements de marché détectés et expliqués, sans relire le flux brut."],
        en: ["A high-frequency stream turned into a compact analytical model.", "Observable quality: received, valid and rejected messages counted on every run.", "Market events detected and explained without re-reading the raw stream."]
    },
    next: {
        fr: ["Rétention automatisée et métriques Prometheus (décrites comme pistes d'industrialisation).", "Conteneurisation avec Docker Compose."],
        en: ["Automated retention and Prometheus metrics (described as industrialisation steps).", "Containerisation with Docker Compose."]
    }
});

DOC("walmart-lakehouse", {
    context: {
        fr: "Une enseigne de distribution veut des chiffres de ventes cohérents, historisés et gouvernés, à partir de sa base opérationnelle.",
        en: "A retailer wants consistent, historised and governed sales figures from its operational database."
    },
    pains: {
        fr: ["Rechargements complets lents.", "Indicateurs incohérents d'un rapport à l'autre.", "Historique des prix et des magasins écrasé.", "Défauts de données découverts après publication."],
        en: ["Slow full reloads.", "Indicators that differ from one report to another.", "Price and store history overwritten.", "Data defects discovered after publication."]
    },
    solution: { fr: "Une architecture Medallion sur Databricks alimentée par CDC, modélisée et testée par dbt, orchestrée par Airflow.", en: "A CDC-fed Medallion architecture on Databricks, modelled and tested by dbt, orchestrated by Airflow." },
    result: { fr: "Des produits de données certifiés en étoile, publiés seulement si les contrôles critiques passent.", en: "Certified star-schema data products, published only if critical checks pass." },
    steps: [
        { title: { fr: "Charger la source", en: "Load the source" }, text: { fr: "Ventes, produits, magasins et clients chargés dans PostgreSQL avec COPY via psycopg2, plutôt que ligne par ligne.", en: "Sales, products, stores and customers loaded into PostgreSQL with COPY through psycopg2, not row by row." }, tech: ["PostgreSQL", "Python"] },
        { title: { fr: "Capturer les changements", en: "Capture changes" }, text: { fr: "Seules les lignes nouvelles ou modifiées partent vers la plateforme.", en: "Only new or changed rows move to the platform." }, tech: ["Python"] },
        { title: { fr: "Construire le Medallion", en: "Build the Medallion" }, text: { fr: "Bronze brut avec métadonnées de lineage, Silver typé, dédoublonné et historisé (SCD1/SCD2), Gold sous Unity Catalog.", en: "Raw Bronze with lineage metadata, typed, deduplicated and historised Silver (SCD1/SCD2), Gold under Unity Catalog." }, tech: ["Databricks", "Delta Lake", "Spark"] },
        { title: { fr: "Modéliser et contrôler", en: "Model and check" }, text: { fr: "Étoile autour de fact_sales ; tests d'unicité, de relations, de fraîcheur, de réconciliation financière et de chevauchement SCD2.", en: "Star around fact_sales; uniqueness, relationship, freshness, financial reconciliation and SCD2 overlap tests." }, tech: ["dbt"] },
        { title: { fr: "Orchestrer", en: "Orchestrate" }, text: { fr: "Run horaire, 3 tentatives, un seul run à la fois, jobs Databricks lancés et suivis par le SDK.", en: "Hourly run, 3 retries, one run at a time, Databricks jobs launched and monitored by the SDK." }, tech: ["Airflow"] }
    ],
    map: {
        zones: [
            { id: "src", title: { fr: "Source", en: "Source" }, nodes: [{ id: "pg", name: "PostgreSQL", tech: "PostgreSQL", note: { fr: "Ventes, produits…", en: "Sales, products…" } }] },
            { id: "lake", title: { fr: "Databricks (Unity Catalog)", en: "Databricks (Unity Catalog)" }, nodes: [
                { id: "b", name: "Bronze", tech: "Delta Lake", note: { fr: "Brut + lineage", en: "Raw + lineage" } },
                { id: "s", name: "Silver", tech: "Delta Lake", note: { fr: "SCD1 / SCD2", en: "SCD1 / SCD2" } },
                { id: "g", name: "Gold", tech: "Delta Lake", note: { fr: "fact_sales", en: "fact_sales" } }
            ] },
            { id: "ctrl", title: { fr: "Pilotage", en: "Control" }, nodes: [
                { id: "af", name: "Airflow", tech: "Airflow", note: { fr: "Horaire, 3 retries", en: "Hourly, 3 retries" } },
                { id: "dbt", name: "dbt", tech: "dbt", note: { fr: "Modèles + tests", en: "Models + tests" } }
            ] },
            { id: "use", title: { fr: "Consommation", en: "Consumption" }, nodes: [{ id: "bi", name: "Power BI", tech: "Power BI", note: { fr: "Rapports certifiés", en: "Certified reports" } }] }
        ],
        links: [
            { from: "pg", to: "b", label: { fr: "CDC", en: "CDC" }, kind: "data" },
            { from: "b", to: "s", label: { fr: "nettoyage", en: "cleaning" }, kind: "data" },
            { from: "s", to: "g", label: { fr: "si contrôles OK", en: "if checks pass" }, kind: "data" },
            { from: "af", to: "b", label: { fr: "jobs SDK", en: "SDK jobs" }, kind: "control" },
            { from: "dbt", to: "g", label: { fr: "tests", en: "tests" }, kind: "control" },
            { from: "g", to: "bi", label: { fr: "SQL", en: "SQL" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "CDC incrémental et upserts Delta", en: "Incremental CDC and Delta upserts" }, why: { fr: "Moins de données déplacées et des rafraîchissements plus courts.", en: "Less data movement and shorter refreshes." } },
        { choice: { fr: "SCD2 sur produits et magasins", en: "SCD2 on products and stores" }, why: { fr: "Chaque vente reste liée aux attributs valables à sa date.", en: "Each sale stays linked to the attributes valid at its date." } },
        { choice: { fr: "Quarantaine plutôt que suppression", en: "Quarantine instead of deletion" }, why: { fr: "Les lignes invalides sont isolées avec une raison claire, jamais effacées en silence.", en: "Invalid rows are isolated with a clear reason, never silently dropped." } }
    ],
    results: {
        fr: ["Chiffre d'affaires, marge et quantités cohérents grâce à des dimensions conformes.", "Défauts détectés avant la publication Gold.", "Étapes en échec visibles et rejouables dans Airflow."],
        en: ["Consistent revenue, margin and quantities through conformed dimensions.", "Defects detected before Gold publication.", "Failed steps visible and replayable in Airflow."]
    },
    next: {
        fr: ["Évolution vers Walmart Streaming Flow : source en continu et observabilité complète."],
        en: ["Evolved into Walmart Streaming Flow: continuous source and full observability."]
    }
});

DOC("kafka-hdfs", {
    context: {
        fr: "Comprendre en pratique une chaîne Big Data classique : des événements produits en continu, transportés par un broker et stockés sur un système de fichiers distribué.",
        en: "Understand in practice a classic Big Data chain: events produced continuously, carried by a broker and stored on a distributed file system."
    },
    pains: {
        fr: ["Producteur et consommateur qui n'avancent pas au même rythme.", "Risque de perdre des événements si le consommateur ralentit.", "Stack lourde (Kafka, Hadoop, YARN) difficile à monter de façon reproductible."],
        en: ["Producer and consumer moving at different speeds.", "Risk of losing events if the consumer slows down.", "Heavy stack (Kafka, Hadoop, YARN) hard to set up reproducibly."]
    },
    solution: { fr: "Kafka découple le producteur du consommateur, HDFS assure la persistance, Docker Compose décrit toute la stack sur EC2.", en: "Kafka decouples producer and consumer, HDFS provides persistence, Docker Compose describes the whole stack on EC2." },
    result: { fr: "100 000 événements publiés et écrits dans HDFS, sur 9 services supervisés via leurs interfaces web.", en: "100,000 events published and written to HDFS, across 9 services monitored through their web UIs." },
    steps: [
        { title: { fr: "Préparer l'infrastructure", en: "Prepare the infrastructure" }, text: { fr: "Instance EC2 t2.large sous Ubuntu, groupe de sécurité limité aux ports nécessaires (SSH, NameNode, YARN, Kafka UI).", en: "EC2 t2.large Ubuntu instance, security group limited to the needed ports (SSH, NameNode, YARN, Kafka UI)." }, tech: ["AWS EC2"] },
        { title: { fr: "Décrire la stack", en: "Describe the stack" }, text: { fr: "9 services Docker Compose : NameNode, DataNode, ResourceManager, NodeManager, ZooKeeper, Kafka, Kafka UI, producteur, consommateur.", en: "9 Docker Compose services: NameNode, DataNode, ResourceManager, NodeManager, ZooKeeper, Kafka, Kafka UI, producer, consumer." }, tech: ["Docker"] },
        { title: { fr: "Publier", en: "Publish" }, text: { fr: "Le producteur Python lit hb-data.json ligne par ligne et publie chaque ProductView dans le topic hb.", en: "The Python producer reads hb-data.json line by line and publishes each ProductView to the hb topic." }, tech: ["Python", "Kafka"] },
        { title: { fr: "Consommer et stocker", en: "Consume and store" }, text: { fr: "Le consommateur s'abonne à hb et écrit chaque événement dans HDFS via WebHDFS.", en: "The consumer subscribes to hb and writes each event to HDFS through WebHDFS." }, tech: ["Python", "Hadoop"] },
        { title: { fr: "Vérifier", en: "Verify" }, text: { fr: "Kafka UI pour les topics et offsets, NameNode pour les fichiers, YARN pour les ressources.", en: "Kafka UI for topics and offsets, NameNode for files, YARN for resources." }, tech: ["Kafka"] }
    ],
    map: {
        zones: [
            { id: "src", title: { fr: "Production", en: "Production" }, nodes: [
                { id: "json", name: "hb-data.json", tech: "JSON", note: { fr: "100 000 événements", en: "100,000 events" } },
                { id: "prod", name: "Producteur", tech: "Python", note: { fr: "Python", en: "Python" } }
            ] },
            { id: "bus", title: { fr: "Transport", en: "Transport" }, nodes: [
                { id: "kafka", name: "Kafka", tech: "Kafka", note: { fr: "Topic hb", en: "hb topic" } },
                { id: "zk", name: "ZooKeeper", note: { fr: "Coordination", en: "Coordination" } },
                { id: "kui", name: "Kafka UI", tech: "Kafka", note: { fr: "Supervision", en: "Monitoring" } }
            ] },
            { id: "store", title: { fr: "Stockage Hadoop", en: "Hadoop storage" }, nodes: [
                { id: "cons", name: "Consommateur", tech: "Python", note: { fr: "Python", en: "Python" } },
                { id: "hdfs", name: "HDFS", tech: "Hadoop", note: { fr: "NameNode + DataNode", en: "NameNode + DataNode" } },
                { id: "yarn", name: "YARN", tech: "Hadoop", note: { fr: "Ressources", en: "Resources" } }
            ] }
        ],
        links: [
            { from: "json", to: "prod", label: { fr: "lecture", en: "read" }, kind: "data" },
            { from: "prod", to: "kafka", label: { fr: "publish", en: "publish" }, kind: "data" },
            { from: "zk", to: "kafka", label: { fr: "coordonne", en: "coordinates" }, kind: "control" },
            { from: "kafka", to: "cons", label: { fr: "subscribe", en: "subscribe" }, kind: "data" },
            { from: "cons", to: "hdfs", label: { fr: "WebHDFS", en: "WebHDFS" }, kind: "data" },
            { from: "kui", to: "kafka", label: { fr: "offsets", en: "offsets" }, kind: "monitor" },
            { from: "yarn", to: "hdfs", label: { fr: "ressources", en: "resources" }, kind: "control" }
        ]
    },
    decisions: [
        { choice: { fr: "Un broker entre producteur et consommateur", en: "A broker between producer and consumer" }, why: { fr: "Si le consommateur ralentit, les messages attendent dans Kafka pendant la rétention au lieu d'être perdus.", en: "If the consumer slows down, messages wait in Kafka during retention instead of being lost." } },
        { choice: { fr: "Tout en Docker Compose", en: "Everything in Docker Compose" }, why: { fr: "La stack se reconstruit à l'identique sur n'importe quelle instance.", en: "The stack rebuilds identically on any instance." } },
        { choice: { fr: "Ports ouverts au strict nécessaire", en: "Only the necessary ports open" }, why: { fr: "Les interfaces web n'ont pas d'authentification : elles ne doivent pas être exposées à tout Internet.", en: "The web UIs have no authentication: they must not be exposed to the whole Internet." } }
    ],
    results: {
        fr: ["Chaîne complète publication → transport → stockage, observable à chaque étape.", "Plateforme reproductible sur AWS en une commande."],
        en: ["Complete publish → transport → storage chain, observable at every step.", "Platform reproducible on AWS in one command."]
    },
    next: {
        fr: ["Mono-nœud : pas de haute disponibilité, réplication HDFS à 1.", "Un fichier HDFS par message : regrouper en lots, écrire en Parquet ou Avro, partitionner par date.", "Passer Kafka en mode KRaft, ajouter des healthchecks, Prometheus et Terraform."],
        en: ["Single node: no high availability, HDFS replication of 1.", "One HDFS file per message: batch, write Parquet or Avro, partition by date.", "Move Kafka to KRaft mode, add healthchecks, Prometheus and Terraform."]
    }
});

DOC("uber-streaming", {
    context: {
        fr: "En cours, « streaming » reste souvent abstrait. Ce projet montre concrètement ce qui change entre un traitement par lots et un flux continu, du clic d'un utilisateur à la donnée prête pour l'analyse.",
        en: "In class, \"streaming\" often stays abstract. This project shows concretely what changes between batch and continuous processing, from a user's click to analysis-ready data."
    },
    pains: {
        fr: ["Chaque événement doit être capté et transformé presque instantanément.", "Une erreur isolée ne doit pas bloquer tout le flux.", "Le producteur et le consommateur doivent rester indépendants."],
        en: ["Every event must be captured and transformed almost instantly.", "One faulty event must not block the whole stream.", "Producer and consumer must stay independent."]
    },
    solution: { fr: "Une application de réservation qui publie dans Azure Event Hubs, consommé en continu par PySpark Structured Streaming.", en: "A booking app that publishes to Azure Event Hubs, consumed continuously by PySpark Structured Streaming." },
    result: { fr: "Des courses réalistes traitées en micro-batchs et organisées en schéma en étoile prêt pour la BI.", en: "Realistic rides processed in micro-batches and organised into a BI-ready star schema." },
    steps: [
        { title: { fr: "Déclencher l'événement", en: "Trigger the event" }, text: { fr: "Un clic sur « Book Ride » dans l'application FastAPI lance une réservation.", en: "A click on \"Book Ride\" in the FastAPI app starts a booking." }, tech: ["FastAPI", "Jinja"] },
        { title: { fr: "Générer la course", en: "Generate the ride" }, text: { fr: "Faker crée passager, chauffeur, véhicule, trajet GPS, prix et statut final, sérialisés en JSON.", en: "Faker creates passenger, driver, vehicle, GPS route, price and final status, serialised as JSON." }, tech: ["Python"] },
        { title: { fr: "Publier dans le cloud", en: "Publish to the cloud" }, text: { fr: "EventHubProducerClient crée un batch et l'envoie à Event Hubs, avec gestion des erreurs de connexion.", en: "EventHubProducerClient builds a batch and sends it to Event Hubs, with connection error handling." }, tech: ["Azure Event Hubs"] },
        { title: { fr: "Traiter en continu", en: "Process continuously" }, text: { fr: "PySpark lit l'endpoint Kafka d'Event Hubs (SASL_SSL, port 9093) en micro-batchs et ne traite que les nouveaux événements.", en: "PySpark reads the Event Hubs Kafka endpoint (SASL_SSL, port 9093) in micro-batches and only processes new events." }, tech: ["Spark", "Kafka"] },
        { title: { fr: "Modéliser", en: "Model" }, text: { fr: "Courses en table de faits ; chauffeur, passager, véhicule et lieu en dimensions.", en: "Rides as the fact table; driver, passenger, vehicle and location as dimensions." }, tech: [] }
    ],
    map: {
        zones: [
            { id: "app", title: { fr: "Application", en: "Application" }, nodes: [
                { id: "ui", name: "Book Ride", tech: "Jinja", note: { fr: "Interface web", en: "Web UI" } },
                { id: "api", name: "FastAPI", tech: "FastAPI", note: { fr: "Faker + JSON", en: "Faker + JSON" } }
            ] },
            { id: "cloud", title: { fr: "Azure", en: "Azure" }, nodes: [{ id: "eh", name: "Event Hubs", tech: "Azure Event Hubs", note: { fr: "Interface Kafka", en: "Kafka interface" } }] },
            { id: "proc", title: { fr: "Traitement", en: "Processing" }, nodes: [{ id: "spark", name: "PySpark", tech: "Spark", note: { fr: "Structured Streaming", en: "Structured Streaming" } }] },
            { id: "model", title: { fr: "Modèle analytique", en: "Analytical model" }, nodes: [
                { id: "fact", name: "Faits courses", note: { fr: "Une ligne par course", en: "One row per ride" } },
                { id: "dims", name: "Dimensions", note: { fr: "Chauffeur, passager…", en: "Driver, passenger…" } }
            ] }
        ],
        links: [
            { from: "ui", to: "api", label: { fr: "HTTP", en: "HTTP" }, kind: "data" },
            { from: "api", to: "eh", label: { fr: "batch JSON", en: "JSON batch" }, kind: "data" },
            { from: "eh", to: "spark", label: { fr: "Kafka SASL_SSL", en: "Kafka SASL_SSL" }, kind: "data" },
            { from: "spark", to: "fact", label: { fr: "micro-batchs", en: "micro-batches" }, kind: "data" },
            { from: "spark", to: "dims", label: { fr: "upsert", en: "upsert" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Event Hubs via son interface Kafka", en: "Event Hubs through its Kafka interface" }, why: { fr: "Un service managé, mais lisible par n'importe quel client Kafka, dont Spark.", en: "A managed service, yet readable by any Kafka client, including Spark." } },
        { choice: { fr: "Traitement incrémental", en: "Incremental processing" }, why: { fr: "Spark ne relit pas tout : il traite seulement ce qui est nouveau depuis le dernier micro-batch.", en: "Spark doesn't re-read everything: it only processes what is new since the last micro-batch." } },
        { choice: { fr: "Secrets en variables d'environnement", en: "Secrets in environment variables" }, why: { fr: "La chaîne de connexion Event Hubs n'apparaît jamais dans le code.", en: "The Event Hubs connection string never appears in the code." } }
    ],
    results: {
        fr: ["Architecture événementielle complète, de l'interface au modèle en étoile.", "Rôles clairs du producteur, du broker et du consommateur."],
        en: ["Complete event-driven architecture, from the UI to the star schema.", "Clear roles for producer, broker and consumer."]
    },
    next: {
        fr: ["Modèles Pydantic, logs structurés et tests pytest.", "Écriture dans un lakehouse Delta et tableau de bord."],
        en: ["Pydantic models, structured logs and pytest tests.", "Writing to a Delta lakehouse and a dashboard."]
    }
});

DOC("terraform-azure", {
    context: {
        fr: "Point de départ : une architecture AWS avec un sous-réseau privé, un sous-réseau public, une NAT Gateway et des tables de routage. Objectif : la reproduire sur Azure.",
        en: "Starting point: an AWS architecture with a private subnet, a public subnet, a NAT Gateway and route tables. Goal: reproduce it on Azure."
    },
    pains: {
        fr: ["Le portail est lent et facile à rater.", "Aucune trace de ce qui a été fait.", "Impossible de recréer ou détruire l'environnement à l'identique."],
        en: ["The portal is slow and easy to get wrong.", "No trace of what was done.", "Impossible to recreate or destroy the environment identically."]
    },
    solution: { fr: "Le réseau décrit en Terraform, avec un state distant verrouillé dans Azure Blob Storage.", en: "The network described in Terraform, with a locked remote state in Azure Blob Storage." },
    result: { fr: "Un réseau Azure reproductible en une commande, relisible et versionné comme du code.", en: "An Azure network reproducible in one command, reviewable and versioned like code." },
    steps: [
        { title: { fr: "Traduire l'architecture", en: "Translate the architecture" }, text: { fr: "AWS et Azure ne correspondent pas 1:1 : pas d'Internet Gateway sur Azure, la NAT Gateway s'attache directement au sous-réseau privé.", en: "AWS and Azure don't map 1:1: Azure has no Internet Gateway, the NAT Gateway attaches directly to the private subnet." }, tech: ["Azure", "AWS"] },
        { title: { fr: "Écrire le code", en: "Write the code" }, text: { fr: "VNet, sous-réseau privé sans IP publique, sous-réseau public avec table de routage, NAT Gateway.", en: "VNet, private subnet without public IP, public subnet with route table, NAT Gateway." }, tech: ["Terraform"] },
        { title: { fr: "Sécuriser le state", en: "Secure the state" }, text: { fr: "State stocké à distance dans Blob Storage, avec un verrou pour éviter deux modifications simultanées.", en: "State stored remotely in Blob Storage, with a lock to prevent two concurrent changes." }, tech: ["Azure Blob Storage"] },
        { title: { fr: "Planifier puis appliquer", en: "Plan then apply" }, text: { fr: "plan montre les changements sans rien toucher ; apply crée les ressources indépendantes en parallèle.", en: "plan shows changes without touching anything; apply creates independent resources in parallel." }, tech: ["Terraform"] }
    ],
    map: {
        zones: [
            { id: "dev", title: { fr: "Poste de travail", en: "Workstation" }, nodes: [{ id: "code", name: "Code HCL", tech: "Terraform", note: { fr: "Le plan du réseau", en: "Network blueprint" } }] },
            { id: "tf", title: { fr: "Terraform", en: "Terraform" }, nodes: [
                { id: "core", name: "Terraform Core", tech: "Terraform", note: { fr: "Graphe de dépendances", en: "Dependency graph" } },
                { id: "prov", name: "azurerm", tech: "azurerm", note: { fr: "Provider Azure", en: "Azure provider" } }
            ] },
            { id: "az", title: { fr: "Microsoft Azure", en: "Microsoft Azure" }, nodes: [
                { id: "entra", name: "Entra ID", tech: "Entra ID", note: { fr: "Jeton", en: "Token" } },
                { id: "arm", name: "Resource Manager", tech: "Azure Resource Manager", note: { fr: "Crée les ressources", en: "Creates resources" } },
                { id: "blob", name: "Blob Storage", tech: "Azure Blob Storage", note: { fr: "State + verrou", en: "State + lock" } }
            ] },
            { id: "net", title: { fr: "Réseau créé", en: "Created network" }, nodes: [
                { id: "vnet", name: "VNet", tech: "VNet", note: { fr: "Sous-réseaux privé / public", en: "Private / public subnets" } },
                { id: "nat", name: "NAT Gateway", tech: "NAT Gateway", note: { fr: "Sortie Internet", en: "Outbound Internet" } }
            ] }
        ],
        links: [
            { from: "code", to: "core", label: { fr: "plan", en: "plan" }, kind: "control" },
            { from: "core", to: "prov", label: { fr: "apply", en: "apply" }, kind: "control" },
            { from: "prov", to: "entra", label: { fr: "auth", en: "auth" }, kind: "control" },
            { from: "prov", to: "arm", label: { fr: "API", en: "API" }, kind: "data" },
            { from: "core", to: "blob", label: { fr: "state", en: "state" }, kind: "data" },
            { from: "arm", to: "vnet", label: { fr: "crée", en: "creates" }, kind: "data" },
            { from: "arm", to: "nat", label: { fr: "crée", en: "creates" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Infrastructure as Code plutôt que le portail", en: "Infrastructure as Code instead of the portal" }, why: { fr: "Décrire ce que l'on veut, pas les étapes : relisible, versionné, reproductible et destructible en une commande.", en: "Describe what you want, not the steps: reviewable, versioned, reproducible and destroyable in one command." } },
        { choice: { fr: "State distant et verrouillé", en: "Remote, locked state" }, why: { fr: "Le state est précieux : stocké en local il se perd, partagé sans verrou il se corrompt.", en: "State is precious: kept locally it gets lost, shared without a lock it gets corrupted." } }
    ],
    results: {
        fr: ["Le même réseau recréé à l'identique à chaque exécution.", "Une bonne compréhension des différences réseau entre AWS et Azure."],
        en: ["The same network recreated identically on every run.", "A clear understanding of networking differences between AWS and Azure."]
    },
    next: {
        fr: ["Ajouter les machines virtuelles et des modules réutilisables.", "Lancer plan et apply depuis une chaîne CI/CD."],
        en: ["Add virtual machines and reusable modules.", "Run plan and apply from a CI/CD pipeline."]
    }
});

DOC("synapse-lakehouse", {
    context: {
        fr: "Construire un pipeline de type lakehouse dans Azure Synapse, en appliquant les principes plutôt qu'en enchaînant des clics : séparation stockage / calcul, formats, droits et zones.",
        en: "Build a lakehouse-style pipeline in Azure Synapse, applying principles rather than chaining clicks: storage / compute separation, formats, permissions and zones."
    },
    pains: {
        fr: ["Interroger des fichiers n'est pas posséder des données.", "Types implicites qui cassent au chargement dans un pool dédié.", "Accès trop larges si l'on se repose sur l'URL du stockage."],
        en: ["Querying files is not owning data.", "Implicit types that break when loading into a dedicated pool.", "Overly broad access when relying on the storage URL."]
    },
    solution: { fr: "Lecture sur place en Serverless SQL, conversion en Parquet par CETAS, chargement dans un pool dédié MPP, accès par SAS.", en: "In-place reads with Serverless SQL, Parquet conversion with CETAS, loading into a dedicated MPP pool, SAS access." },
    result: { fr: "Trois zones (brute, enrichie, modélisée) aux formats, droits et coûts distincts.", en: "Three zones (raw, enriched, modelled) with distinct formats, permissions and costs." },
    steps: [
        { title: { fr: "Lire sur place", en: "Read in place" }, text: { fr: "Tables externes en Serverless SQL sur les fichiers du data lake, sans copie, facturées à la donnée traitée.", en: "Serverless SQL external tables over data lake files, no copy, billed per data processed." }, tech: ["Serverless SQL", "ADLS Gen2"] },
        { title: { fr: "Écrire en Parquet", en: "Write Parquet" }, text: { fr: "CETAS écrit physiquement de nouveaux fichiers Parquet : colonnaires, compressés, schéma dans le fichier.", en: "CETAS physically writes new Parquet files: columnar, compressed, schema inside the file." }, tech: ["Parquet"] },
        { title: { fr: "Charger le modèle", en: "Load the model" }, text: { fr: "COPY INTO, puis PolyBase + CTAS vers des tables gérées dans un pool dédié MPP.", en: "COPY INTO, then PolyBase + CTAS into managed tables in a dedicated MPP pool." }, tech: ["Dedicated SQL pool", "T-SQL"] },
        { title: { fr: "Restreindre l'accès", en: "Restrict access" }, text: { fr: "Jeton SAS en lecture seule, l'écriture accordée seulement à l'étape qui écrit.", en: "Read-only SAS token, write granted only to the writing step." }, tech: ["SAS"] }
    ],
    map: {
        zones: [
            { id: "lake", title: { fr: "Data lake", en: "Data lake" }, nodes: [
                { id: "raw", name: "Zone brute", tech: "ADLS Gen2", note: { fr: "CSV / JSON", en: "CSV / JSON" } },
                { id: "enr", name: "Zone enrichie", tech: "ADLS Gen2", note: { fr: "Parquet typé", en: "Typed Parquet" } }
            ] },
            { id: "syn", title: { fr: "Synapse", en: "Synapse" }, nodes: [
                { id: "srv", name: "Serverless SQL", tech: "Serverless SQL", note: { fr: "Lecture sur place", en: "In-place reads" } },
                { id: "ded", name: "Pool dédié", tech: "Dedicated SQL pool", note: { fr: "Tables MPP", en: "MPP tables" } }
            ] },
            { id: "sec", title: { fr: "Sécurité", en: "Security" }, nodes: [{ id: "sas", name: "Jeton SAS", tech: "SAS", note: { fr: "Moindre privilège", en: "Least privilege" } }] }
        ],
        links: [
            { from: "raw", to: "srv", label: { fr: "tables externes", en: "external tables" }, kind: "data" },
            { from: "srv", to: "enr", label: { fr: "CETAS", en: "CETAS" }, kind: "data" },
            { from: "enr", to: "ded", label: { fr: "COPY INTO / CTAS", en: "COPY INTO / CTAS" }, kind: "data" },
            { from: "sas", to: "raw", label: { fr: "lecture seule", en: "read-only" }, kind: "control" }
        ]
    },
    decisions: [
        { choice: { fr: "Séparer stockage et calcul", en: "Separate storage and compute" }, why: { fr: "Les fichiers restent dans le lake ; le serverless lit sans copie, le pool dédié sert la vitesse et la concurrence.", en: "Files stay in the lake; serverless reads without copying, the dedicated pool serves speed and concurrency." } },
        { choice: { fr: "Le format est une décision de conception", en: "Format is a design decision" }, why: { fr: "Le Parquet rend les types explicites, ce qu'exigent les pools dédiés.", en: "Parquet makes types explicit, which dedicated pools require." } },
        { choice: { fr: "La sécurité vient de l'identité, pas du chemin", en: "Security comes from identity, not the path" }, why: { fr: "Une URL de stockage n'est pas une frontière : seul un jeton limité restreint vraiment l'accès.", en: "A storage URL is not a boundary: only a scoped token truly restricts access." } }
    ],
    results: {
        fr: ["Une chaîne lecture → transformation → chargement claire, chaque couche ayant un seul rôle.", "Problèmes de permissions, de types et de formats résolus en conditions réelles."],
        en: ["A clear read → transform → load chain, each layer with a single role.", "Permission, type and format issues solved in real conditions."]
    },
    next: {
        fr: ["Orchestrer la chaîne avec des pipelines Synapse ou Data Factory.", "Ajouter une couche de restitution Power BI."],
        en: ["Orchestrate the chain with Synapse or Data Factory pipelines.", "Add a Power BI serving layer."]
    }
});

DOC("adf-pipeline", {
    context: {
        fr: "Des fichiers arrivent régulièrement dans un data lake. Les traiter un par un avec un pipeline dédié ne tient pas à l'échelle.",
        en: "Files land regularly in a data lake. Processing them one by one with a dedicated pipeline doesn't scale."
    },
    pains: {
        fr: ["Un pipeline par fichier : duplication et maintenance lourde.", "Ingestion manuelle et sujette aux oublis.", "Peu de visibilité sur les exécutions en échec."],
        en: ["One pipeline per file: duplication and heavy maintenance.", "Manual ingestion, easy to forget.", "Little visibility on failed runs."]
    },
    solution: { fr: "Un pipeline Data Factory piloté par les métadonnées, qui découvre les fichiers et applique la même logique à chacun.", en: "A metadata-driven Data Factory pipeline that discovers files and applies the same logic to each one." },
    result: { fr: "Une ingestion industrialisée vers une zone de reporting, suivie et planifiée.", en: "Industrialised ingestion into a reporting zone, monitored and scheduled." },
    steps: [
        { title: { fr: "Découvrir", en: "Discover" }, text: { fr: "Get Metadata liste les fichiers présents dans le conteneur source.", en: "Get Metadata lists the files in the source container." }, tech: ["Data Factory"] },
        { title: { fr: "Itérer", en: "Iterate" }, text: { fr: "ForEach applique le même traitement à chaque fichier.", en: "ForEach applies the same processing to each file." }, tech: ["Data Factory"] },
        { title: { fr: "Transformer", en: "Transform" }, text: { fr: "Data Flow applique les règles de nettoyage, de transformation et d'agrégation.", en: "Data Flow applies cleaning, transformation and aggregation rules." }, tech: ["Data Flow"] },
        { title: { fr: "Publier et suivre", en: "Publish and monitor" }, text: { fr: "Écriture dans la zone reporting ; suivi des exécutions, gestion des erreurs et planification.", en: "Writing to the reporting zone; run monitoring, error handling and scheduling." }, tech: ["ADLS Gen2"] }
    ],
    map: {
        zones: [
            { id: "src", title: { fr: "Stockage source", en: "Source storage" }, nodes: [{ id: "in", name: "Conteneur source", tech: "ADLS Gen2", note: { fr: "Fichiers bruts", en: "Raw files" } }] },
            { id: "adf", title: { fr: "Data Factory", en: "Data Factory" }, nodes: [
                { id: "meta", name: "Get Metadata", tech: "Data Factory", note: { fr: "Inventaire", en: "Inventory" } },
                { id: "each", name: "ForEach", tech: "Data Factory", note: { fr: "Un fichier à la fois", en: "One file at a time" } },
                { id: "flow", name: "Data Flow", tech: "Data Flow", note: { fr: "Transformations", en: "Transformations" } }
            ] },
            { id: "out", title: { fr: "Destination", en: "Destination" }, nodes: [{ id: "rep", name: "Zone reporting", tech: "ADLS Gen2", note: { fr: "Données prêtes", en: "Ready data" } }] }
        ],
        links: [
            { from: "in", to: "meta", label: { fr: "liste", en: "list" }, kind: "control" },
            { from: "meta", to: "each", label: { fr: "noms de fichiers", en: "file names" }, kind: "control" },
            { from: "each", to: "flow", label: { fr: "par fichier", en: "per file" }, kind: "control" },
            { from: "in", to: "flow", label: { fr: "lecture", en: "read" }, kind: "data" },
            { from: "flow", to: "rep", label: { fr: "écriture", en: "write" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Piloté par les métadonnées", en: "Metadata-driven" }, why: { fr: "Un seul pipeline s'adapte aux fichiers trouvés : ajouter une source ne demande pas de nouveau pipeline.", en: "A single pipeline adapts to the files it finds: adding a source needs no new pipeline." } },
        { choice: { fr: "Data Flow pour les règles", en: "Data Flow for the rules" }, why: { fr: "Les transformations restent visuelles et maintenables, sans code dispersé.", en: "Transformations stay visual and maintainable, without scattered code." } }
    ],
    results: {
        fr: ["Ingestion automatisée et reproductible.", "Exécutions suivies, erreurs visibles."],
        en: ["Automated, reproducible ingestion.", "Monitored runs, visible errors."]
    },
    next: { fr: ["Paramétrer les règles par une table de configuration.", "Alerter sur les échecs."], en: ["Drive the rules from a configuration table.", "Alert on failures."] }
});

DOC("olist-audit", {
    context: {
        fr: "Olist est une marketplace brésilienne : 99 441 commandes réparties sur 9 tables. Question posée : quelles décisions prendre pour augmenter la satisfaction client ?",
        en: "Olist is a Brazilian marketplace: 99,441 orders across 9 tables. The question: which decisions would raise customer satisfaction?"
    },
    pains: {
        fr: ["Données multi-tables avec manquants et catégories inconnues.", "Aucune vue unifiée commande × client × vendeur × avis.", "Facteurs de mauvaise note mal identifiés."],
        en: ["Multi-table data with missing values and unknown categories.", "No unified order × customer × seller × review view.", "Drivers of bad ratings poorly identified."]
    },
    solution: { fr: "Un audit complet : nettoyage, table analytique centrale, KPIs et analyses métier argumentées.", en: "A full audit: cleaning, a central analytical table, KPIs and reasoned business analyses." },
    result: { fr: "Le retard de livraison est le facteur le plus influent : la note moyenne passe de 4,14 à 2,26.", en: "Late delivery is the strongest driver: the average rating drops from 4.14 to 2.26." },
    steps: [
        { title: { fr: "Explorer", en: "Explore" }, text: { fr: "Volumétrie et qualité des 9 tables : commandes, articles, clients, vendeurs, produits, paiements, avis, géolocalisation, traductions.", en: "Volume and quality of the 9 tables: orders, items, customers, sellers, products, payments, reviews, geolocation, translations." }, tech: ["pandas", "Jupyter"] },
        { title: { fr: "Nettoyer", en: "Clean" }, text: { fr: "Valeurs manquantes, catégories inconnues, doublons et cohérence des dates, en conservant les manquants porteurs de sens.", en: "Missing values, unknown categories, duplicates and date consistency, keeping meaningful missing values." }, tech: ["pandas"] },
        { title: { fr: "Centraliser", en: "Centralise" }, text: { fr: "Une table analytique de 113 425 lignes après jointures.", en: "An analytical table of 113,425 rows after joins." }, tech: ["pandas"] },
        { title: { fr: "Analyser", en: "Analyse" }, text: { fr: "Chiffre d'affaires mensuel, catégories, États, délais, retards et notes, vendeurs ; RFM et ML en bonus.", en: "Monthly revenue, categories, states, delays, lateness and ratings, sellers; RFM and ML as a bonus." }, tech: ["Matplotlib", "scikit-learn"] },
        { title: { fr: "Recommander", en: "Recommend" }, text: { fr: "Synthèse et décisions argumentées pour la marketplace.", en: "Summary and reasoned decisions for the marketplace." }, tech: [] }
    ],
    map: {
        zones: [
            { id: "raw", title: { fr: "Données brutes", en: "Raw data" }, nodes: [{ id: "csv", name: "9 tables Kaggle", note: { fr: "CSV", en: "CSV" } }] },
            { id: "prep", title: { fr: "Préparation", en: "Preparation" }, nodes: [
                { id: "clean", name: "cleaning.py", tech: "pandas", note: { fr: "Qualité", en: "Quality" } },
                { id: "obt", name: "Table analytique", tech: "pandas", note: { fr: "113 425 lignes", en: "113,425 rows" } }
            ] },
            { id: "ana", title: { fr: "Analyse", en: "Analysis" }, nodes: [
                { id: "kpi", name: "indicators.py", tech: "pandas", note: { fr: "KPIs", en: "KPIs" } },
                { id: "viz", name: "Visualisations", tech: "Matplotlib", note: { fr: "Figures", en: "Figures" } }
            ] },
            { id: "out", title: { fr: "Livrable", en: "Deliverable" }, nodes: [{ id: "rep", name: "Rapport", tech: "Jupyter", note: { fr: "Recommandations", en: "Recommendations" } }] }
        ],
        links: [
            { from: "csv", to: "clean", label: { fr: "chargement", en: "load" }, kind: "data" },
            { from: "clean", to: "obt", label: { fr: "jointures", en: "joins" }, kind: "data" },
            { from: "obt", to: "kpi", label: { fr: "agrégats", en: "aggregates" }, kind: "data" },
            { from: "obt", to: "viz", label: { fr: "graphiques", en: "charts" }, kind: "data" },
            { from: "kpi", to: "rep", label: { fr: "constats", en: "findings" }, kind: "data" },
            { from: "viz", to: "rep", label: { fr: "figures", en: "figures" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Une table analytique centrale", en: "One central analytical table" }, why: { fr: "Toutes les analyses partent de la même base : les chiffres restent cohérents d'une figure à l'autre.", en: "Every analysis starts from the same base: figures stay consistent across charts." } },
        { choice: { fr: "Code réutilisable dans src/", en: "Reusable code in src/" }, why: { fr: "Chargement, nettoyage et indicateurs testables hors des notebooks.", en: "Loading, cleaning and indicators testable outside the notebooks." } }
    ],
    results: {
        fr: ["Livraison à l'heure : note moyenne 4,14 ; en retard : 2,26.", "Le retard de livraison ressort comme le facteur le plus influent sur la satisfaction.", "Des recommandations argumentées et appuyées sur des visualisations."],
        en: ["On-time delivery: average rating 4.14; late: 2.26.", "Late delivery stands out as the strongest driver of satisfaction.", "Reasoned recommendations backed by visualisations."]
    },
    next: { fr: ["Automatiser l'audit en pipeline planifié et en tableau de bord."], en: ["Automate the audit as a scheduled pipeline and a dashboard."] }
});

/* ===================== IA & Machine Learning ===================== */

DOC("fraud-telecom", {
    context: {
        fr: "Un opérateur mobile marocain subit plusieurs fraudes à la fois : appels surtaxés internationaux (IRSF), SIM swap, spam SMS, réseaux organisés, mobile money et SIM volées. Chaque fraude laisse une signature différente.",
        en: "A Moroccan mobile operator faces several frauds at once: international revenue share fraud (IRSF), SIM swap, SMS spam, organised rings, mobile money and stolen SIMs. Each leaves a different signature."
    },
    pains: {
        fr: ["Un seul modèle ne capte pas des fraudes aussi différentes.", "Les fraudes en réseau sont invisibles quand on regarde chaque abonné isolément.", "L'alerte doit tomber pendant l'appel, pas le lendemain."],
        en: ["One model can't catch such different frauds.", "Ring frauds are invisible when each subscriber is looked at in isolation.", "The alert must fire during the call, not the next day."]
    },
    solution: { fr: "Un ensemble de modèles (classiques, autoencoder, graphe) servi en temps réel sur un flux Kafka.", en: "An ensemble of models (classic, autoencoder, graph) served in real time on a Kafka stream." },
    result: { fr: "AUC jusqu'à 0,998 et une latence p95 inférieure à 56 ms, avec un dashboard d'alertes.", en: "AUC up to 0.998 and p95 latency under 56 ms, with an alert dashboard." },
    steps: [
        { title: { fr: "Générer des données réalistes", en: "Generate realistic data" }, text: { fr: "100 000 CDR et 50 000 transactions synthétiques couvrant les 6 typologies de fraude.", en: "100,000 synthetic CDRs and 50,000 transactions covering the 6 fraud types." }, tech: ["Python"] },
        { title: { fr: "Préparer et enrichir", en: "Prepare and enrich" }, text: { fr: "ETL : normalisation E.164, validation de schéma, enrichissement temporel ; stockage en Parquet.", en: "ETL: E.164 normalisation, schema validation, time enrichment; stored as Parquet." }, tech: ["pandas"] },
        { title: { fr: "Construire 58 features", en: "Build 58 features" }, text: { fr: "Vélocité des appels, géographie, comportement de l'abonné et indicateurs issus du graphe d'appels.", en: "Call velocity, geography, subscriber behaviour and call-graph indicators." }, tech: [] },
        { title: { fr: "Entraîner trois familles de modèles", en: "Train three model families" }, text: { fr: "IsolationForest, LOF et OCSVM ; autoencoder PyTorch ; GraphSAGE sur le graphe des appels.", en: "IsolationForest, LOF and OCSVM; PyTorch autoencoder; GraphSAGE on the call graph." }, tech: ["scikit-learn", "PyTorch"] },
        { title: { fr: "Combiner les scores", en: "Combine scores" }, text: { fr: "Score d'ensemble pondéré : 35 % classique, 40 % autoencoder, 25 % GNN, avec un seuil de décision configurable.", en: "Weighted ensemble score: 35% classic, 40% autoencoder, 25% GNN, with a configurable decision threshold." }, tech: [] },
        { title: { fr: "Servir en temps réel", en: "Serve in real time" }, text: { fr: "Chaîne Kafka producteur → feature-processor → fraud-scorer, API FastAPI, Prometheus et Alertmanager, 7 services Docker.", en: "Kafka chain producer → feature-processor → fraud-scorer, FastAPI API, Prometheus and Alertmanager, 7 Docker services." }, tech: ["Kafka", "FastAPI", "Docker"] }
    ],
    map: {
        zones: [
            { id: "src", title: { fr: "Événements", en: "Events" }, nodes: [{ id: "prod", name: "cdr-producer", tech: "Python", note: { fr: "Appels, SMS, paiements", en: "Calls, SMS, payments" } }] },
            { id: "stream", title: { fr: "Flux Kafka", en: "Kafka stream" }, nodes: [
                { id: "feat", name: "feature-processor", tech: "Kafka", note: { fr: "58 features", en: "58 features" } },
                { id: "score", name: "fraud-scorer", tech: "Kafka", note: { fr: "Score d'ensemble", en: "Ensemble score" } }
            ] },
            { id: "models", title: { fr: "Modèles", en: "Models" }, nodes: [
                { id: "cls", name: "IsolationForest · LOF · OCSVM", tech: "scikit-learn", note: { fr: "35 %", en: "35%" } },
                { id: "ae", name: "Autoencoder", tech: "PyTorch", note: { fr: "40 %", en: "40%" } },
                { id: "gnn", name: "GraphSAGE", tech: "PyTorch", note: { fr: "25 %", en: "25%" } }
            ] },
            { id: "serve", title: { fr: "Service & supervision", en: "Serving & monitoring" }, nodes: [
                { id: "api", name: "fraud-api", tech: "FastAPI", note: { fr: "Alertes + dashboard", en: "Alerts + dashboard" } },
                { id: "prom", name: "Prometheus", tech: "Prometheus", note: { fr: "Latence, lag", en: "Latency, lag" } }
            ] }
        ],
        links: [
            { from: "prod", to: "feat", label: { fr: "CDR", en: "CDRs" }, kind: "data" },
            { from: "feat", to: "score", label: { fr: "features", en: "features" }, kind: "data" },
            { from: "score", to: "cls", label: { fr: "inférence", en: "inference" }, kind: "control" },
            { from: "score", to: "ae", label: { fr: "inférence", en: "inference" }, kind: "control" },
            { from: "score", to: "gnn", label: { fr: "inférence", en: "inference" }, kind: "control" },
            { from: "score", to: "api", label: { fr: "score ≥ seuil", en: "score ≥ threshold" }, kind: "data" },
            { from: "score", to: "prom", label: { fr: "métriques", en: "metrics" }, kind: "monitor" }
        ]
    },
    decisions: [
        { choice: { fr: "Un ensemble plutôt qu'un modèle unique", en: "An ensemble instead of one model" }, why: { fr: "Chaque famille capte un type de fraude : anomalies ponctuelles, comportements atypiques, réseaux d'appels.", en: "Each family catches a fraud type: point anomalies, atypical behaviour, call rings." } },
        { choice: { fr: "Un modèle de graphe", en: "A graph model" }, why: { fr: "Les réseaux de fraude se voient dans les relations entre numéros, pas dans un abonné isolé.", en: "Fraud rings show up in relations between numbers, not in a single subscriber." } },
        { choice: { fr: "Scoring sur un flux Kafka", en: "Scoring on a Kafka stream" }, why: { fr: "La décision arrive pendant l'activité, avec une latence mesurée en continu.", en: "The decision arrives during the activity, with continuously measured latency." } }
    ],
    results: {
        fr: ["AUC de 0,9933 (classique), 0,9984 (autoencoder) et 1,0 (GNN) sur les données de test.", "Latence p95 inférieure à 56 ms sur la chaîne de scoring.", "Pipeline complet lancé en une commande : 14 étapes, de la génération à l'API."],
        en: ["AUC of 0.9933 (classic), 0.9984 (autoencoder) and 1.0 (GNN) on test data.", "p95 latency under 56 ms on the scoring chain.", "Full pipeline launched in one command: 14 steps, from generation to the API."]
    },
    next: {
        fr: ["Données synthétiques : à valider sur des CDR réels (format ASN.1).", "Rapports d'alerte générés par LLM, export vers un SIEM, base TimescaleDB."],
        en: ["Synthetic data: to be validated on real CDRs (ASN.1 format).", "LLM-generated alert reports, SIEM export, TimescaleDB storage."]
    }
});

DOC("brainscan", {
    context: {
        fr: "Classer une IRM cérébrale (gliome, méningiome, tumeur pituitaire ou absence de tumeur) est un cas où la précision ne suffit pas : en milieu médical, il faut expliquer la décision et livrer un service fiable.",
        en: "Classifying a brain MRI (glioma, meningioma, pituitary tumour or no tumour) is a case where accuracy isn't enough: in a medical setting the decision must be explained and the service reliable."
    },
    pains: {
        fr: ["Un modèle « boîte noire » n'inspire pas confiance.", "Des classes déséquilibrées dans le jeu de données.", "Un notebook de recherche n'est pas un produit utilisable."],
        en: ["A \"black box\" model doesn't inspire trust.", "Imbalanced classes in the dataset.", "A research notebook is not a usable product."]
    },
    solution: { fr: "Un ResNet50 affiné en deux phases, servi par une API FastAPI qui renvoie aussi une carte Grad-CAM.", en: "A ResNet50 fine-tuned in two phases, served by a FastAPI API that also returns a Grad-CAM map." },
    result: { fr: "98,96 % d'accuracy sur 1 054 images de test, avec une interface web, des tests et une image Docker.", en: "98.96% accuracy on 1,054 test images, with a web interface, tests and a Docker image." },
    steps: [
        { title: { fr: "Préparer les images", en: "Prepare the images" }, text: { fr: "Split stratifié 70 / 15 / 15, redimensionnement 256 puis crop 224, normalisation ImageNet, augmentations Albumentations.", en: "Stratified 70 / 15 / 15 split, resize to 256 then crop 224, ImageNet normalisation, Albumentations augmentation." }, tech: ["Python", "NumPy"] },
        { title: { fr: "Entraîner en deux phases", en: "Train in two phases" }, text: { fr: "Phase 1 : backbone gelé, seule la tête 2048 → 512 → 4 apprend (lr 1e-3). Phase 2 : 30 dernières couches dégelées (lr 1e-4).", en: "Phase 1: frozen backbone, only the 2048 → 512 → 4 head learns (lr 1e-3). Phase 2: last 30 layers unfrozen (lr 1e-4)." }, tech: ["PyTorch"] },
        { title: { fr: "Corriger le déséquilibre", en: "Fix the imbalance" }, text: { fr: "Poids de classes dans la CrossEntropyLoss.", en: "Class weights in the CrossEntropyLoss." }, tech: ["PyTorch"] },
        { title: { fr: "Évaluer", en: "Evaluate" }, text: { fr: "22 analyses : matrice de confusion, ROC, PR, calibration, top-K et étude des erreurs.", en: "22 analyses: confusion matrix, ROC, PR, calibration, top-K and error study." }, tech: ["scikit-learn", "Matplotlib"] },
        { title: { fr: "Expliquer", en: "Explain" }, text: { fr: "Grad-CAM en PyTorch pur, avec des hooks sur layer4[-1], pour surligner les zones de décision.", en: "Pure PyTorch Grad-CAM with hooks on layer4[-1], to highlight decision regions." }, tech: ["PyTorch"] },
        { title: { fr: "Industrialiser", en: "Productionise" }, text: { fr: "API FastAPI (7 endpoints, modèle chargé une fois, rate limiting), Docker multi-stage non-root, 17 tests, CI GitHub Actions.", en: "FastAPI API (7 endpoints, model loaded once, rate limiting), multi-stage non-root Docker, 17 tests, GitHub Actions CI." }, tech: ["FastAPI", "Docker", "GitHub Actions"] }
    ],
    map: {
        zones: [
            { id: "user", title: { fr: "Utilisateur", en: "User" }, nodes: [
                { id: "web", name: "App web", tech: "JavaScript", note: { fr: "Port 3000", en: "Port 3000" } },
                { id: "st", name: "Streamlit", tech: "Streamlit", note: { fr: "Alternative", en: "Alternative" } }
            ] },
            { id: "api", title: { fr: "Service (Docker + Nginx)", en: "Service (Docker + Nginx)" }, nodes: [
                { id: "fast", name: "FastAPI", tech: "FastAPI", note: { fr: "/predict, /explain…", en: "/predict, /explain…" } },
                { id: "model", name: "ResNet50", tech: "PyTorch", note: { fr: "Chargé une fois", en: "Loaded once" } },
                { id: "cam", name: "Grad-CAM", tech: "PyTorch", note: { fr: "Carte thermique", en: "Heat map" } }
            ] },
            { id: "train", title: { fr: "Entraînement", en: "Training" }, nodes: [
                { id: "data", name: "Dataset IRM", note: { fr: "4 classes", en: "4 classes" } },
                { id: "trainer", name: "Trainer 2 phases", tech: "PyTorch", note: { fr: "Checkpoint .pth", en: ".pth checkpoint" } }
            ] }
        ],
        links: [
            { from: "web", to: "fast", label: { fr: "image IRM", en: "MRI image" }, kind: "data" },
            { from: "st", to: "model", label: { fr: "inférence", en: "inference" }, kind: "data" },
            { from: "fast", to: "model", label: { fr: "tenseur", en: "tensor" }, kind: "data" },
            { from: "model", to: "cam", label: { fr: "activations", en: "activations" }, kind: "data" },
            { from: "data", to: "trainer", label: { fr: "70/15/15", en: "70/15/15" }, kind: "data" },
            { from: "trainer", to: "model", label: { fr: "poids", en: "weights" }, kind: "control" }
        ]
    },
    decisions: [
        { choice: { fr: "Transfer learning en deux phases", en: "Two-phase transfer learning" }, why: { fr: "Éviter l'oubli catastrophique : la tête apprend d'abord, puis les dernières couches s'ajustent finement.", en: "Avoid catastrophic forgetting: the head learns first, then the last layers fine-tune." } },
        { choice: { fr: "Modèle chargé une seule fois (singleton)", en: "Model loaded once (singleton)" }, why: { fr: "Moins de mémoire et de latence : chaque requête réutilise le même modèle en mémoire.", en: "Less memory and latency: every request reuses the same in-memory model." } },
        { choice: { fr: "Grad-CAM systématique", en: "Systematic Grad-CAM" }, why: { fr: "En médical, l'effet boîte noire est proscrit : le praticien voit où le modèle regarde.", en: "In medicine, a black box is unacceptable: the practitioner sees where the model looks." } }
    ],
    results: {
        fr: ["98,96 % d'accuracy sur 1 054 images de test.", "Inférence d'environ 36 ms par image sur CPU et 10 ms sur GPU.", "17 tests réussis, CI et image Docker prête à déployer."],
        en: ["98.96% accuracy on 1,054 test images.", "Inference around 36 ms per image on CPU and 10 ms on GPU.", "17 passing tests, CI and a deploy-ready Docker image."]
    },
    next: { fr: ["Outil pédagogique : aucune valeur de diagnostic médical."], en: ["Educational tool: no medical diagnostic value."] }
});

DOC("ai-data-agent", {
    context: {
        fr: "Les équipes métier ne savent pas écrire de SQL, et les data engineers passent du temps à réécrire les mêmes extractions et transformations.",
        en: "Business teams can't write SQL, and data engineers spend time rewriting the same extractions and transformations."
    },
    pains: {
        fr: ["Chaque question chiffrée passe par un analyste.", "Du code d'extraction répétitif écrit à la main.", "Laisser un LLM générer du SQL ou du code est risqué pour la base."],
        en: ["Every numeric question goes through an analyst.", "Repetitive extraction code written by hand.", "Letting an LLM generate SQL or code is risky for the database."]
    },
    solution: { fr: "Un routeur LangGraph qui envoie chaque demande à un agent SQL ou ETL spécialisé, entouré de garde-fous.", en: "A LangGraph router that sends each request to a specialised SQL or ETL agent, surrounded by guardrails." },
    result: { fr: "Une interface en langage naturel pour interroger et transformer les données, sans aucune écriture possible en base.", en: "A natural-language interface to query and transform data, with no database writes possible." },
    steps: [
        { title: { fr: "Router la demande", en: "Route the request" }, text: { fr: "Le nœud routeur classe l'intention en sql ou etl avec une sortie structurée Pydantic (RouterSchema).", en: "The router node classifies intent as sql or etl with a structured Pydantic output (RouterSchema)." }, tech: ["LangGraph", "Pydantic"] },
        { title: { fr: "Agent SQL", en: "SQL agent" }, text: { fr: "Reformulation, lecture du schéma réel, construction du prompt, génération SQL, contrôle de sécurité, exécution, réponse en langage simple.", en: "Rephrasing, real schema lookup, prompt building, SQL generation, safety check, execution, plain-language answer." }, tech: ["PostgreSQL", "LangChain"] },
        { title: { fr: "Agent ETL", en: "ETL agent" }, text: { fr: "Extraction depuis une API ou un fichier, transformation pandas, validation et exécution contrôlée, export CSV, JSON ou Parquet.", en: "Extraction from an API or file, pandas transformation, validation and controlled execution, CSV, JSON or Parquet export." }, tech: ["pandas"] },
        { title: { fr: "Choisir le bon modèle", en: "Pick the right model" }, text: { fr: "Modèle rapide et économique pour les tâches simples, modèle plus puissant pour le raisonnement complexe.", en: "Fast, cheap model for simple tasks, stronger model for complex reasoning." }, tech: ["OpenAI", "Claude"] }
    ],
    map: {
        zones: [
            { id: "in", title: { fr: "Entrée", en: "Input" }, nodes: [{ id: "q", name: "Question", note: { fr: "Langage naturel", en: "Plain language" } }] },
            { id: "graph", title: { fr: "Graphe LangGraph", en: "LangGraph graph" }, nodes: [
                { id: "router", name: "Router", tech: "LangGraph", note: { fr: "sql ou etl", en: "sql or etl" } },
                { id: "sql", name: "Agent SQL", tech: "LangChain", note: { fr: "Lecture seule", en: "Read-only" } },
                { id: "etl", name: "Agent ETL", tech: "pandas", note: { fr: "Exécution contrôlée", en: "Controlled execution" } }
            ] },
            { id: "res", title: { fr: "Ressources", en: "Resources" }, nodes: [
                { id: "pg", name: "PostgreSQL", tech: "PostgreSQL", note: { fr: "Schéma réel", en: "Real schema" } },
                { id: "llm", name: "LLM", tech: "OpenAI", note: { fr: "OpenAI / Claude", en: "OpenAI / Claude" } },
                { id: "files", name: "Fichiers", note: { fr: "CSV · JSON · Parquet", en: "CSV · JSON · Parquet" } }
            ] }
        ],
        links: [
            { from: "q", to: "router", label: { fr: "état partagé", en: "shared state" }, kind: "data" },
            { from: "router", to: "sql", label: { fr: "sql", en: "sql" }, kind: "control" },
            { from: "router", to: "etl", label: { fr: "etl", en: "etl" }, kind: "control" },
            { from: "sql", to: "pg", label: { fr: "SELECT validé", en: "validated SELECT" }, kind: "data" },
            { from: "sql", to: "llm", label: { fr: "génération", en: "generation" }, kind: "control" },
            { from: "etl", to: "files", label: { fr: "export", en: "export" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Un routeur et des agents spécialisés", en: "A router and specialised agents" }, why: { fr: "Chaque agent reste simple et testable ; ajouter un agent ne touche pas aux autres.", en: "Each agent stays simple and testable; adding an agent doesn't touch the others." } },
        { choice: { fr: "Sécurité dès la conception", en: "Security by design" }, why: { fr: "INSERT, UPDATE, DELETE, DROP et ALTER bloqués avant exécution, résultats limités, secrets hors du code.", en: "INSERT, UPDATE, DELETE, DROP and ALTER blocked before execution, results limited, secrets out of the code." } },
        { choice: { fr: "Modèle adapté à la complexité", en: "Model matched to complexity" }, why: { fr: "Le modèle coûteux est réservé aux tâches qui en ont besoin : coût maîtrisé sans perte de qualité.", en: "The expensive model is kept for tasks that need it: controlled cost without losing quality." } }
    ],
    results: {
        fr: ["Questions métier traduites en SQL et expliquées, sans écrire de code.", "Extractions et transformations automatisées avec export multi-format.", "Deux barrières indépendantes avant toute action irréversible."],
        en: ["Business questions turned into SQL and explained, with no code to write.", "Automated extractions and transformations with multi-format export.", "Two independent barriers before any irreversible action."]
    },
    next: { fr: ["Utilisateur PostgreSQL dédié en lecture seule, timeouts et journalisation de chaque requête générée.", "Code ETL exécuté dans un conteneur isolé."], en: ["Dedicated read-only PostgreSQL user, timeouts and logging of every generated query.", "ETL code run in an isolated container."] }
});

DOC("mcp-rag-server", {
    context: {
        fr: "Une entreprise veut qu'un assistant IA réponde à partir de sa base de données et de ses documents internes, sans que ces données partent dans le cloud.",
        en: "A company wants an AI assistant to answer from its database and internal documents, without that data going to the cloud."
    },
    pains: {
        fr: ["Données confidentielles qui ne doivent pas quitter la machine.", "Un assistant ne doit jamais pouvoir modifier la base.", "Les réponses doivent citer leur source exacte."],
        en: ["Confidential data that must not leave the machine.", "An assistant must never be able to modify the database.", "Answers must cite their exact source."]
    },
    solution: { fr: "Un serveur MCP local qui expose trois outils sûrs à Claude Desktop : SQL en lecture seule, recherche sémantique et citation.", en: "A local MCP server that exposes three safe tools to Claude Desktop: read-only SQL, semantic search and citation." },
    result: { fr: "Un assistant qui interroge données et documents en local, sans clé API, avec des passages citables.", en: "An assistant that queries data and documents locally, with no API key, and citable passages." },
    steps: [
        { title: { fr: "Exposer des outils MCP", en: "Expose MCP tools" }, text: { fr: "db_query, rag_search et rag_get, appelés par Claude Desktop via stdio.", en: "db_query, rag_search and rag_get, called by Claude Desktop over stdio." }, tech: ["MCP", "Python"] },
        { title: { fr: "Verrouiller le SQL", en: "Lock down SQL" }, text: { fr: "Liste blanche (SELECT, WITH, EXPLAIN, PRAGMA), liste noire de 17 mots-clés et SQLite ouvert en lecture seule.", en: "Allow-list (SELECT, WITH, EXPLAIN, PRAGMA), deny-list of 17 keywords and SQLite opened read-only." }, tech: ["SQLite"] },
        { title: { fr: "Indexer les documents", en: "Index the documents" }, text: { fr: "Documents .txt et .md découpés, vectorisés avec all-MiniLM-L6-v2 en local et indexés dans FAISS.", en: ".txt and .md documents chunked, embedded locally with all-MiniLM-L6-v2 and indexed in FAISS." }, tech: ["Hugging Face", "FAISS"] },
        { title: { fr: "Citer", en: "Cite" }, text: { fr: "rag_get renvoie le passage exact avec doc_id et chunk_id.", en: "rag_get returns the exact passage with doc_id and chunk_id." }, tech: [] }
    ],
    map: {
        zones: [
            { id: "client", title: { fr: "Client", en: "Client" }, nodes: [{ id: "claude", name: "Claude Desktop", tech: "Claude", note: { fr: "stdio", en: "stdio" } }] },
            { id: "server", title: { fr: "Serveur MCP local", en: "Local MCP server" }, nodes: [
                { id: "db", name: "db_query", tech: "MCP", note: { fr: "SQL lecture seule", en: "Read-only SQL" } },
                { id: "search", name: "rag_search", tech: "MCP", note: { fr: "Recherche sémantique", en: "Semantic search" } },
                { id: "get", name: "rag_get", tech: "MCP", note: { fr: "Passage exact", en: "Exact passage" } }
            ] },
            { id: "data", title: { fr: "Données locales", en: "Local data" }, nodes: [
                { id: "sqlite", name: "app.db", tech: "SQLite", note: { fr: "Mode uri=ro", en: "uri=ro mode" } },
                { id: "faiss", name: "Index FAISS", tech: "FAISS", note: { fr: "+ métadonnées", en: "+ metadata" } },
                { id: "emb", name: "Embeddings", tech: "Hugging Face", note: { fr: "all-MiniLM-L6-v2", en: "all-MiniLM-L6-v2" } }
            ] }
        ],
        links: [
            { from: "claude", to: "db", label: { fr: "appel d'outil", en: "tool call" }, kind: "control" },
            { from: "claude", to: "search", label: { fr: "appel d'outil", en: "tool call" }, kind: "control" },
            { from: "claude", to: "get", label: { fr: "citation", en: "citation" }, kind: "control" },
            { from: "db", to: "sqlite", label: { fr: "SELECT", en: "SELECT" }, kind: "data" },
            { from: "search", to: "faiss", label: { fr: "top-k", en: "top-k" }, kind: "data" },
            { from: "emb", to: "faiss", label: { fr: "vecteurs", en: "vectors" }, kind: "data" },
            { from: "get", to: "faiss", label: { fr: "doc_id, chunk_id", en: "doc_id, chunk_id" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Tout en local", en: "Everything local" }, why: { fr: "Ni cloud, ni Docker, ni clé API : les données sensibles ne sortent jamais du poste.", en: "No cloud, no Docker, no API key: sensitive data never leaves the machine." } },
        { choice: { fr: "Trois couches de protection SQL", en: "Three SQL protection layers" }, why: { fr: "Même si une règle est contournée, la connexion en lecture seule empêche toute écriture.", en: "Even if one rule is bypassed, the read-only connection prevents any write." } }
    ],
    results: {
        fr: ["Questions en langage naturel traduites en SQL ou en recherche sémantique.", "Réponses vérifiables grâce aux passages cités."],
        en: ["Plain-language questions turned into SQL or semantic search.", "Verifiable answers thanks to cited passages."]
    },
    next: { fr: ["Prendre en charge les PDF et une recherche hybride (mots-clés + vecteurs)."], en: ["Support PDFs and hybrid search (keywords + vectors)."] }
});

DOC("rag-agentic", {
    context: {
        fr: "Les LLM manquent de contexte sur des documents privés et peuvent inventer. Un RAG les relie à une base documentaire, mais il doit rester traçable et sécurisé pour plusieurs utilisateurs.",
        en: "LLMs lack context on private documents and can make things up. A RAG connects them to a document base, but it must stay traceable and secure for multiple users."
    },
    pains: {
        fr: ["Hallucinations sur des questions spécifiques.", "Réponses sans source vérifiable.", "Documents d'utilisateurs différents à isoler."],
        en: ["Hallucinations on specific questions.", "Answers without a verifiable source.", "Documents from different users to isolate."]
    },
    solution: { fr: "Une application RAG agentique : le modèle décide quand chercher, cite ses sources et répond en streaming.", en: "An agentic RAG app: the model decides when to search, cites its sources and streams its answer." },
    result: { fr: "Une base d'application complète : comptes, conversations, ingestion, recherche vectorielle et traçabilité.", en: "A complete application base: accounts, conversations, ingestion, vector search and tracing." },
    steps: [
        { title: { fr: "Gérer les utilisateurs", en: "Manage users" }, text: { fr: "Inscription et connexion Supabase Auth, JWT vérifié côté serveur, conversations stockées dans PostgreSQL.", en: "Supabase Auth sign-up and sign-in, JWT verified server-side, conversations stored in PostgreSQL." }, tech: ["Supabase", "FastAPI"] },
        { title: { fr: "Ingérer", en: "Ingest" }, text: { fr: "Fichiers .txt et .md importés, découpés en blocs de 1 000 caractères avec 200 de recouvrement, puis vectorisés.", en: ".txt and .md files uploaded, split into 1,000-character chunks with 200 overlap, then embedded." }, tech: ["FastAPI", "OpenAI"] },
        { title: { fr: "Chercher", en: "Search" }, text: { fr: "pgvector et similarité cosinus, avec des politiques RLS par utilisateur.", en: "pgvector with cosine similarity and per-user RLS policies." }, tech: ["PostgreSQL", "Supabase"] },
        { title: { fr: "Répondre", en: "Answer" }, text: { fr: "Le modèle choisit d'appeler ou non l'outil de recherche, cite le fichier et le score, et répond en streaming SSE.", en: "The model chooses whether to call the search tool, cites file and score, and streams its answer over SSE." }, tech: ["OpenAI", "React"] }
    ],
    map: {
        zones: [
            { id: "front", title: { fr: "Frontend", en: "Front end" }, nodes: [{ id: "ui", name: "React + Vite", tech: "React", note: { fr: "Chat, documents", en: "Chat, documents" } }] },
            { id: "back", title: { fr: "Backend", en: "Back end" }, nodes: [
                { id: "api", name: "FastAPI", tech: "FastAPI", note: { fr: "SSE, ingestion", en: "SSE, ingestion" } },
                { id: "llm", name: "LLM", tech: "OpenAI", note: { fr: "Endpoint compatible", en: "Compatible endpoint" } }
            ] },
            { id: "supa", title: { fr: "Supabase", en: "Supabase" }, nodes: [
                { id: "auth", name: "Auth", tech: "Supabase", note: { fr: "JWT", en: "JWT" } },
                { id: "pgv", name: "PostgreSQL + pgvector", tech: "PostgreSQL", note: { fr: "RLS", en: "RLS" } },
                { id: "store", name: "Storage", tech: "Supabase", note: { fr: "Bucket privé", en: "Private bucket" } }
            ] }
        ],
        links: [
            { from: "ui", to: "auth", label: { fr: "connexion", en: "sign-in" }, kind: "control" },
            { from: "ui", to: "api", label: { fr: "question", en: "question" }, kind: "data" },
            { from: "api", to: "ui", label: { fr: "SSE", en: "SSE" }, kind: "data" },
            { from: "api", to: "store", label: { fr: "fichiers", en: "files" }, kind: "data" },
            { from: "api", to: "pgv", label: { fr: "vecteurs", en: "vectors" }, kind: "data" },
            { from: "api", to: "llm", label: { fr: "contexte", en: "context" }, kind: "data" },
            { from: "pgv", to: "ui", label: { fr: "Realtime", en: "Realtime" }, kind: "monitor" }
        ]
    },
    decisions: [
        { choice: { fr: "RAG agentique", en: "Agentic RAG" }, why: { fr: "Le modèle ne cherche que si la question le demande : moins d'appels inutiles et de bruit.", en: "The model only searches when the question needs it: fewer useless calls and less noise." } },
        { choice: { fr: "Isolation par RLS", en: "RLS isolation" }, why: { fr: "Chaque utilisateur ne voit que ses documents, garanti par la base elle-même.", en: "Each user only sees their documents, enforced by the database itself." } },
        { choice: { fr: "Fournisseur IA interchangeable", en: "Swappable AI provider" }, why: { fr: "Tout endpoint compatible OpenAI convient : pas de dépendance à un seul fournisseur.", en: "Any OpenAI-compatible endpoint works: no lock-in to one provider." } }
    ],
    results: {
        fr: ["Réponses traçables : nom du fichier source et score de similarité.", "Statut d'ingestion suivi en temps réel dans l'interface."],
        en: ["Traceable answers: source file name and similarity score.", "Ingestion status tracked live in the interface."]
    },
    next: { fr: ["Modules suivants : PDF et DOCX, recherche hybride, reranking, Text-to-SQL, sous-agents."], en: ["Next modules: PDF and DOCX, hybrid search, reranking, Text-to-SQL, sub-agents."] }
});

DOC("streaming-subtitle", {
    context: {
        fr: "Objectif : sous-titrer et traduire la parole en direct avec un modèle de langage. Problème : le modèle choisi ne traite pas l'audio.",
        en: "Goal: subtitle and translate speech live with a language model. Problem: the chosen model can't process audio."
    },
    pains: {
        fr: ["Incompatibilité de modalité : envoyer de l'audio au modèle ne fonctionne pas.", "Le jeton du fournisseur ne doit jamais atteindre le navigateur.", "Le flux SSE arrive en morceaux arbitraires.", "Les résultats intermédiaires multiplient les appels et rendent l'affichage instable."],
        en: ["Modality mismatch: sending audio to the model doesn't work.", "The provider token must never reach the browser.", "The SSE stream arrives in arbitrary chunks.", "Interim results multiply calls and make the display unstable."]
    },
    solution: { fr: "Séparer reconnaissance vocale et traitement : le navigateur transcrit, une route Next.js appelle le modèle sur du texte.", en: "Split speech recognition from processing: the browser transcribes, a Next.js route calls the model on text." },
    result: { fr: "Des sous-titres ou une traduction affichés par blocs complets et lisibles, sans exposer de secret.", en: "Subtitles or a translation shown in complete, readable blocks, without exposing any secret." },
    steps: [
        { title: { fr: "Capter la voix", en: "Capture the voice" }, text: { fr: "Accès micro après consentement ; le MediaStream alimente aussi un visualiseur.", en: "Microphone access after consent; the MediaStream also feeds a visualiser." }, tech: ["JavaScript"] },
        { title: { fr: "Transcrire", en: "Transcribe" }, text: { fr: "Web Speech API en mode continu ; seuls les résultats finaux, nettoyés et non vides, sont envoyés.", en: "Web Speech API in continuous mode; only final, trimmed, non-empty results are sent." }, tech: [] },
        { title: { fr: "Protéger et préparer", en: "Protect and prepare" }, text: { fr: "Route Next.js (Backend for Frontend) : validation des champs, prompt selon le mode et la langue, jeton côté serveur.", en: "Next.js route (Backend for Frontend): field validation, prompt per mode and language, server-side token." }, tech: ["Next.js"] },
        { title: { fr: "Générer", en: "Generate" }, text: { fr: "Appel en streaming à DiffusionGemma pour reformuler ou traduire.", en: "Streaming call to DiffusionGemma to rewrite or translate." }, tech: [] },
        { title: { fr: "Afficher", en: "Display" }, text: { fr: "Buffer qui reconstruit les événements SSE coupés, affichage par blocs complets, historique de 3 blocs, latence affichée.", en: "Buffer that rebuilds split SSE events, display in complete blocks, 3-block history, latency shown." }, tech: ["React", "TypeScript"] }
    ],
    map: {
        zones: [
            { id: "browser", title: { fr: "Navigateur", en: "Browser" }, nodes: [
                { id: "mic", name: "Micro", note: { fr: "MediaStream", en: "MediaStream" } },
                { id: "stt", name: "Web Speech API", note: { fr: "Transcript final", en: "Final transcript" } },
                { id: "ui", name: "Interface React", tech: "React", note: { fr: "Blocs + latence", en: "Blocks + latency" } }
            ] },
            { id: "server", title: { fr: "Serveur Next.js", en: "Next.js server" }, nodes: [{ id: "route", name: "/api route", tech: "Next.js", note: { fr: "Validation + prompt", en: "Validation + prompt" } }] },
            { id: "ext", title: { fr: "Fournisseur", en: "Provider" }, nodes: [{ id: "model", name: "DiffusionGemma", tech: "DiffusionGemma", note: { fr: "Texte uniquement", en: "Text only" } }] }
        ],
        links: [
            { from: "mic", to: "stt", label: { fr: "audio", en: "audio" }, kind: "data" },
            { from: "stt", to: "route", label: { fr: "FormData texte", en: "text FormData" }, kind: "data" },
            { from: "route", to: "model", label: { fr: "Bearer + prompt", en: "Bearer + prompt" }, kind: "data" },
            { from: "model", to: "route", label: { fr: "flux", en: "stream" }, kind: "data" },
            { from: "route", to: "ui", label: { fr: "SSE", en: "SSE" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Reconnaissance vocale séparée du modèle", en: "Speech recognition separate from the model" }, why: { fr: "Le modèle reçoit seulement ce qu'il sait traiter : du texte. Chaque étape devient observable.", en: "The model only receives what it can handle: text. Each step becomes observable." } },
        { choice: { fr: "Résultats intermédiaires désactivés", en: "Interim results disabled" }, why: { fr: "Sinon : appels redondants, fragments répétés, coût en hausse et interface instable.", en: "Otherwise: redundant calls, repeated fragments, higher cost and an unstable UI." } },
        { choice: { fr: "Route serveur (BFF)", en: "Server route (BFF)" }, why: { fr: "Le secret ne traverse jamais les props, le HTML, les variables publiques ni le stockage local.", en: "The secret never crosses props, HTML, public variables or local storage." } }
    ],
    results: {
        fr: ["Sous-titrage et traduction en direct, affichés par unités de sens.", "Une architecture où chaque transformation de la donnée est tracée, du son à l'écran."],
        en: ["Live subtitles and translation, shown as units of meaning.", "An architecture where every data transformation is traced, from sound to screen."]
    },
    next: { fr: ["Transcription de fichiers côté serveur (/api/transcribe-file), avec limite de taille et suppression immédiate."], en: ["Server-side file transcription (/api/transcribe-file), with size limit and immediate deletion."] }
});

DOC("customer-support", {
    context: {
        fr: "Un support client reçoit souvent les mêmes questions. Un chatbot peut y répondre, à condition de s'appuyer sur la FAQ réelle plutôt que sur la mémoire du modèle.",
        en: "Customer support often gets the same questions. A chatbot can answer them, provided it relies on the real FAQ rather than the model's memory."
    },
    pains: {
        fr: ["Réponses inventées par le modèle.", "FAQ difficile à interroger par mots-clés exacts."],
        en: ["Answers made up by the model.", "FAQ hard to query with exact keywords."]
    },
    solution: { fr: "Un RAG : recherche sémantique dans une FAQ vectorisée, puis réponse générée à partir des passages trouvés.", en: "A RAG: semantic search over a vectorised FAQ, then an answer generated from the passages found." },
    result: { fr: "Des réponses ancrées dans la FAQ, avec un historique de conversation.", en: "Answers grounded in the FAQ, with conversation history." },
    steps: [
        { title: { fr: "Charger la FAQ", en: "Load the FAQ" }, text: { fr: "Dataset Hugging Face converti en Documents LangChain.", en: "Hugging Face dataset converted to LangChain Documents." }, tech: ["Hugging Face", "LangChain"] },
        { title: { fr: "Vectoriser", en: "Embed" }, text: { fr: "Embeddings OpenAI stockés dans un index FAISS.", en: "OpenAI embeddings stored in a FAISS index." }, tech: ["OpenAI", "FAISS"] },
        { title: { fr: "Retrouver", en: "Retrieve" }, text: { fr: "Top-K des entrées les plus proches de la question.", en: "Top-K entries closest to the question." }, tech: ["FAISS"] },
        { title: { fr: "Répondre", en: "Answer" }, text: { fr: "Prompt construit avec le contexte retrouvé ; GPT-3.5 répond en gardant l'historique.", en: "Prompt built with the retrieved context; GPT-3.5 answers while keeping history." }, tech: ["OpenAI"] }
    ],
    map: {
        zones: [
            { id: "kb", title: { fr: "Base de connaissances", en: "Knowledge base" }, nodes: [
                { id: "ds", name: "FAQ", tech: "Hugging Face", note: { fr: "Dataset", en: "Dataset" } },
                { id: "idx", name: "FAISS", tech: "FAISS", note: { fr: "Vecteurs", en: "Vectors" } }
            ] },
            { id: "chain", title: { fr: "Chaîne LangChain", en: "LangChain chain" }, nodes: [
                { id: "ret", name: "Retriever", tech: "LangChain", note: { fr: "Top-K", en: "Top-K" } },
                { id: "gen", name: "GPT-3.5", tech: "OpenAI", note: { fr: "Réponse", en: "Answer" } }
            ] },
            { id: "user", title: { fr: "Utilisateur", en: "User" }, nodes: [{ id: "chat", name: "Chat", note: { fr: "Historique", en: "History" } }] }
        ],
        links: [
            { from: "ds", to: "idx", label: { fr: "embeddings", en: "embeddings" }, kind: "data" },
            { from: "chat", to: "ret", label: { fr: "question", en: "question" }, kind: "data" },
            { from: "ret", to: "idx", label: { fr: "similarité", en: "similarity" }, kind: "data" },
            { from: "ret", to: "gen", label: { fr: "contexte", en: "context" }, kind: "data" },
            { from: "gen", to: "chat", label: { fr: "réponse", en: "answer" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Recherche avant génération", en: "Retrieve before generating" }, why: { fr: "Le modèle reformule une réponse existante au lieu d'en inventer une.", en: "The model rephrases an existing answer instead of inventing one." } }
    ],
    results: { fr: ["Réponses plus justes et moins d'hallucinations sur les questions de support."], en: ["More accurate answers and fewer hallucinations on support questions."] },
    next: { fr: ["Interface Streamlit, API FastAPI, recherche hybride, reranking et citation des sources."], en: ["Streamlit UI, FastAPI API, hybrid search, reranking and source citation."] }
});

DOC("health-analysis", {
    context: {
        fr: "Un bilan sanguin est difficile à lire pour un non-spécialiste. Ce projet, réalisé pendant le stage LLMaaS pour pratiquer l'IA générative, le rend lisible et propose des conseils alimentaires adaptés au Maroc.",
        en: "A blood test is hard to read for a non-specialist. This project, built during the LLMaaS internship to practise generative AI, makes it readable and suggests diet advice suited to Morocco."
    },
    pains: {
        fr: ["Valeurs et normes difficiles à interpréter.", "Réponses libres d'un LLM difficiles à exploiter par programme."],
        en: ["Values and ranges hard to interpret.", "Free-form LLM answers hard to use programmatically."]
    },
    solution: { fr: "Un pipeline LLM en deux étapes, chacune avec un format de sortie strict.", en: "A two-step LLM pipeline, each step with a strict output format." },
    result: { fr: "Un tableau des anomalies, un résumé simple et un plan alimentaire marocain, en quelques secondes.", en: "A table of anomalies, a plain summary and a Moroccan meal plan, in seconds." },
    steps: [
        { title: { fr: "Importer le bilan", en: "Import the test" }, text: { fr: "Texte collé ou fichier .txt dans l'interface Streamlit.", en: "Pasted text or a .txt file in the Streamlit interface." }, tech: ["Streamlit"] },
        { title: { fr: "Extraire", en: "Extract" }, text: { fr: "Étape 1 : JSON strict (analyse, valeur, statut HIGH / LOW / NORMAL, référence) selon les normes du rapport lui-même.", en: "Step 1: strict JSON (test, value, HIGH / LOW / NORMAL status, reference) based on the report's own ranges." }, tech: ["LangChain", "Llama 3.3"] },
        { title: { fr: "Synthétiser", en: "Summarise" }, text: { fr: "Étape 2 : résumé et plan alimentaire, balisés ###RESUME### et ###PLAN### pour un découpage fiable.", en: "Step 2: summary and meal plan, tagged ###RESUME### and ###PLAN### for reliable splitting." }, tech: ["Groq"] },
        { title: { fr: "Restituer", en: "Present" }, text: { fr: "Tableau coloré par statut, export du rapport et messages d'erreur explicites.", en: "Status-coloured table, report export and explicit error messages." }, tech: ["pandas"] }
    ],
    map: {
        zones: [
            { id: "ui", title: { fr: "Interface", en: "Interface" }, nodes: [{ id: "st", name: "Streamlit", tech: "Streamlit", note: { fr: "Import + affichage", en: "Import + display" } }] },
            { id: "chain", title: { fr: "Pipeline LangChain", en: "LangChain pipeline" }, nodes: [
                { id: "s1", name: "Étape 1", tech: "LangChain", note: { fr: "JSON strict", en: "Strict JSON" } },
                { id: "s2", name: "Étape 2", tech: "LangChain", note: { fr: "Résumé + plan", en: "Summary + plan" } }
            ] },
            { id: "llm", title: { fr: "Inférence", en: "Inference" }, nodes: [{ id: "groq", name: "Groq · Llama 3.3 70B", tech: "Llama 3.3", note: { fr: "Inférence rapide", en: "Fast inference" } }] }
        ],
        links: [
            { from: "st", to: "s1", label: { fr: "texte du bilan", en: "test text" }, kind: "data" },
            { from: "s1", to: "groq", label: { fr: "prompt", en: "prompt" }, kind: "data" },
            { from: "s1", to: "s2", label: { fr: "anomalies", en: "anomalies" }, kind: "data" },
            { from: "s2", to: "groq", label: { fr: "prompt", en: "prompt" }, kind: "data" },
            { from: "s2", to: "st", label: { fr: "résumé + plan", en: "summary + plan" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Formats de sortie explicites", en: "Explicit output formats" }, why: { fr: "JSON strict puis balises : le parsing devient fiable, sans heuristiques fragiles sur du texte libre.", en: "Strict JSON then tags: parsing becomes reliable, with no fragile heuristics on free text." } }
    ],
    results: { fr: ["Une compréhension concrète des pipelines LLM multi-étapes et des compromis qualité, vitesse et coût."], en: ["A concrete grasp of multi-step LLM pipelines and quality, speed and cost trade-offs."] },
    next: { fr: ["Outil pédagogique : aucun diagnostic médical.", "Validation Pydantic des sorties, OCR des bilans en PDF ou image."], en: ["Educational tool: no medical diagnosis.", "Pydantic validation of outputs, OCR for PDF or image tests."] }
});

DOC("insightlens", {
    context: {
        fr: "Les outils d'analyse IA envoient les fichiers vers des serveurs distants. Pour des données clients, financières ou RH, ce n'est pas acceptable.",
        en: "AI analytics tools send files to remote servers. For customer, finance or HR data, that is not acceptable."
    },
    pains: {
        fr: ["Données sensibles envoyées dans le cloud.", "Formats de fichiers hétérogènes.", "Besoin de graphiques et d'explications sans écrire de code."],
        en: ["Sensitive data sent to the cloud.", "Heterogeneous file formats.", "Need for charts and explanations without writing code."]
    },
    solution: { fr: "Une application d'analyse entièrement locale : l'IA tourne sur le poste via Ollama.", en: "A fully local analytics app: the AI runs on the machine through Ollama." },
    result: { fr: "Aucune donnée transférée, aucune clé API, aucune télémétrie, et un fonctionnement hors ligne.", en: "No data transferred, no API key, no telemetry, and offline operation." },
    steps: [
        { title: { fr: "Importer", en: "Import" }, text: { fr: "CSV, Excel, JSON ou TXT jusqu'à 50 Mo, séparateur et encodage détectés.", en: "CSV, Excel, JSON or TXT up to 50 MB, delimiter and encoding detected." }, tech: ["JavaScript"] },
        { title: { fr: "Profiler", en: "Profile" }, text: { fr: "Types de colonnes, statistiques, anomalies Z-score et IQR, régression et corrélation.", en: "Column types, statistics, Z-score and IQR anomalies, regression and correlation." }, tech: ["JavaScript"] },
        { title: { fr: "Dialoguer", en: "Chat" }, text: { fr: "Questions à un LLM local (llama3.2:3b par défaut) avec réponses en streaming et mémoire métier.", en: "Questions to a local LLM (llama3.2:3b by default) with streamed answers and business memory." }, tech: ["Ollama", "Llama 3.2"] },
        { title: { fr: "Visualiser et exporter", en: "Visualise and export" }, text: { fr: "8 types de graphiques, cross-filtering, export PDF et PowerPoint.", en: "8 chart types, cross-filtering, PDF and PowerPoint export." }, tech: ["Chart.js"] }
    ],
    map: {
        zones: [
            { id: "browser", title: { fr: "Navigateur", en: "Browser" }, nodes: [
                { id: "file", name: "fileManager", tech: "JavaScript", note: { fr: "Parsing", en: "Parsing" } },
                { id: "eng", name: "dataEngine", tech: "JavaScript", note: { fr: "Stats, anomalies", en: "Stats, anomalies" } },
                { id: "chart", name: "chartEngine", tech: "Chart.js", note: { fr: "8 graphiques", en: "8 charts" } }
            ] },
            { id: "local", title: { fr: "Poste local", en: "Local machine" }, nodes: [
                { id: "ollama", name: "Ollama", tech: "Ollama", note: { fr: "llama3.2:3b", en: "llama3.2:3b" } },
                { id: "ls", name: "LocalStorage", note: { fr: "Sessions", en: "Sessions" } }
            ] }
        ],
        links: [
            { from: "file", to: "eng", label: { fr: "tableau", en: "table" }, kind: "data" },
            { from: "eng", to: "chart", label: { fr: "séries", en: "series" }, kind: "data" },
            { from: "eng", to: "ollama", label: { fr: "contexte", en: "context" }, kind: "data" },
            { from: "ollama", to: "eng", label: { fr: "streaming", en: "streaming" }, kind: "data" },
            { from: "eng", to: "ls", label: { fr: "mémoire", en: "memory" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Confidentialité par conception", en: "Privacy by design" }, why: { fr: "Pas d'API cloud ni de télémétrie : c'est un principe de départ, pas une option.", en: "No cloud API or telemetry: a founding principle, not an option." } }
    ],
    results: { fr: ["Analyse IA de fichiers sensibles sans qu'aucune donnée quitte la machine."], en: ["AI analysis of sensitive files without any data leaving the machine."] },
    next: { fr: ["Modèles plus grands (llama3.1:8b, mistral:7b) selon la RAM disponible."], en: ["Larger models (llama3.1:8b, mistral:7b) depending on available RAM."] }
});

DOC("ai-trader", {
    context: {
        fr: "Étude de la plateforme open source AI-Trader v2 (HKUDS), où des agents IA publient, débattent et copient des signaux de trading.",
        en: "Study of the open-source AI-Trader v2 platform (HKUDS), where AI agents publish, debate and copy trading signals."
    },
    pains: { fr: ["Comprendre comment des agents autonomes coopèrent autour de décisions de marché."], en: ["Understand how autonomous agents cooperate around market decisions."] },
    solution: { fr: "Analyse et adaptation de la plateforme : agents, signaux, copy trading et paper trading.", en: "Analysis and adaptation of the platform: agents, signals, copy trading and paper trading." },
    result: { fr: "Une compréhension pratique des systèmes multi-agents appliqués à la finance.", en: "A practical understanding of multi-agent systems applied to finance." },
    steps: [
        { title: { fr: "Connecter des agents", en: "Connect agents" }, text: { fr: "Des agents compatibles OpenClaw s'enregistrent et publient stratégies, opérations et discussions.", en: "OpenClaw-compatible agents register and publish strategies, trades and discussions." }, tech: [] },
        { title: { fr: "Servir la plateforme", en: "Serve the platform" }, text: { fr: "Backend FastAPI et frontend React.", en: "FastAPI back end and React front end." }, tech: ["FastAPI", "React"] },
        { title: { fr: "Simuler", en: "Simulate" }, text: { fr: "Copy trading et paper trading sur Polymarket avec règlement automatique des marchés résolus.", en: "Copy trading and Polymarket paper trading with automatic settlement of resolved markets." }, tech: [] }
    ],
    map: {
        zones: [
            { id: "agents", title: { fr: "Agents", en: "Agents" }, nodes: [{ id: "ag", name: "Agents OpenClaw", note: { fr: "Signaux", en: "Signals" } }] },
            { id: "platform", title: { fr: "Plateforme", en: "Platform" }, nodes: [
                { id: "api", name: "FastAPI", tech: "FastAPI", note: { fr: "Backend", en: "Back end" } },
                { id: "ui", name: "React", tech: "React", note: { fr: "Interface", en: "Interface" } }
            ] },
            { id: "markets", title: { fr: "Marchés", en: "Markets" }, nodes: [{ id: "mk", name: "Paper trading", note: { fr: "Polymarket, actions…", en: "Polymarket, stocks…" } }] }
        ],
        links: [
            { from: "ag", to: "api", label: { fr: "signaux", en: "signals" }, kind: "data" },
            { from: "api", to: "ui", label: { fr: "flux", en: "feed" }, kind: "data" },
            { from: "api", to: "mk", label: { fr: "ordres simulés", en: "simulated orders" }, kind: "data" }
        ]
    },
    decisions: [],
    results: { fr: ["Étude d'un projet open source existant (HKUDS/AI-Trader), et non une création originale."], en: ["Study of an existing open-source project (HKUDS/AI-Trader), not an original creation."] },
    next: []
});

/* ===================== Software ===================== */

DOC("perfume-vmax", {
    context: {
        fr: "Une marque de parfums masculins veut une boutique en ligne premium, rapide et sécurisée, sans dépendre d'un framework front.",
        en: "A men's fragrance brand wants a fast, secure, premium online shop without depending on a front-end framework."
    },
    pains: {
        fr: ["Comptes clients à protéger, même via Google.", "Paiement en ligne et paiement à la livraison à gérer.", "Expérience de choix d'un parfum difficile en ligne."],
        en: ["Customer accounts to protect, even via Google.", "Online payment and cash on delivery to handle.", "Choosing a fragrance online is hard."]
    },
    solution: { fr: "Un site full-stack HTML/CSS/JS vanilla avec une API Express, une double authentification et un quiz olfactif.", en: "A full-stack vanilla HTML/CSS/JS site with an Express API, two-factor authentication and a scent quiz." },
    result: { fr: "22 parfums, 28 routes API et 6 tables, en 9 640 lignes de code.", en: "22 fragrances, 28 API routes and 6 tables, in 9,640 lines of code." },
    steps: [
        { title: { fr: "Construire l'expérience", en: "Build the experience" }, text: { fr: "Vidéo d'accueil, pyramide olfactive interactive, quiz de 7 questions pondérées qui recommande 2 à 3 parfums.", en: "Video hero, interactive scent pyramid, 7-question weighted quiz recommending 2 to 3 fragrances." }, tech: ["HTML", "CSS", "JavaScript"] },
        { title: { fr: "Écrire l'API", en: "Write the API" }, text: { fr: "28 routes Express : catalogue, panier, commandes, boutiques, analytics.", en: "28 Express routes: catalogue, cart, orders, stores, analytics." }, tech: ["Node.js", "Express"] },
        { title: { fr: "Sécuriser les comptes", en: "Secure accounts" }, text: { fr: "Mots de passe bcrypt, OTP de 6 chiffres par email, OTP exigé même après Google OAuth, JWT.", en: "bcrypt passwords, 6-digit email OTP, OTP required even after Google OAuth, JWT." }, tech: ["JWT", "Google"] },
        { title: { fr: "Encaisser", en: "Take payment" }, text: { fr: "Stripe ou paiement à la livraison, codes promo.", en: "Stripe or cash on delivery, promo codes." }, tech: ["Stripe", "SQLite"] }
    ],
    map: {
        zones: [
            { id: "front", title: { fr: "Navigateur", en: "Browser" }, nodes: [
                { id: "site", name: "Boutique", tech: "JavaScript", note: { fr: "Zéro dépendance", en: "Zero dependencies" } },
                { id: "quiz", name: "Quiz olfactif", tech: "JavaScript", note: { fr: "7 questions", en: "7 questions" } }
            ] },
            { id: "back", title: { fr: "Serveur", en: "Server" }, nodes: [
                { id: "api", name: "Express", tech: "Express", note: { fr: "28 routes", en: "28 routes" } },
                { id: "db", name: "SQLite", tech: "SQLite", note: { fr: "6 tables", en: "6 tables" } }
            ] },
            { id: "ext", title: { fr: "Services externes", en: "External services" }, nodes: [
                { id: "google", name: "Google OAuth", tech: "Google", note: { fr: "Connexion", en: "Sign-in" } },
                { id: "mail", name: "Email OTP", note: { fr: "Gmail", en: "Gmail" } },
                { id: "stripe", name: "Stripe", tech: "Stripe", note: { fr: "Paiement", en: "Payment" } }
            ] }
        ],
        links: [
            { from: "site", to: "api", label: { fr: "REST + JWT", en: "REST + JWT" }, kind: "data" },
            { from: "quiz", to: "api", label: { fr: "résultats", en: "results" }, kind: "data" },
            { from: "api", to: "db", label: { fr: "SQL", en: "SQL" }, kind: "data" },
            { from: "api", to: "google", label: { fr: "OAuth", en: "OAuth" }, kind: "control" },
            { from: "api", to: "mail", label: { fr: "OTP", en: "OTP" }, kind: "control" },
            { from: "api", to: "stripe", label: { fr: "checkout", en: "checkout" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Zéro dépendance front", en: "Zero front-end dependencies" }, why: { fr: "Trois fichiers servis : performance maximale et rien à mettre à jour.", en: "Three files served: maximum performance and nothing to update." } },
        { choice: { fr: "OTP obligatoire même avec Google", en: "OTP required even with Google" }, why: { fr: "Un cookie Google volé ne suffit pas : il faut aussi l'accès à la boîte mail.", en: "A stolen Google cookie isn't enough: email access is also needed." } }
    ],
    results: { fr: ["Une boutique complète et sécurisée : authentification, paiement, quiz et analytics."], en: ["A complete, secure shop: authentication, payment, quiz and analytics."] },
    next: { fr: ["Réactiver la page d'administration."], en: ["Re-enable the admin page."] }
});

DOC("data-preprocessing-lab", {
    context: {
        fr: "Avant d'entraîner un modèle, on standardise, normalise et nettoie les données, souvent sans voir l'effet de ces transformations.",
        en: "Before training a model, data is standardised, normalised and cleaned, often without seeing what those transformations do."
    },
    pains: { fr: ["Méthodes appliquées à l'aveugle.", "Choix de la méthode peu justifié."], en: ["Methods applied blindly.", "Method choice poorly justified."] },
    solution: { fr: "Trois outils web autonomes qui montrent l'avant / après et recommandent une méthode.", en: "Three standalone web tools that show before / after and recommend a method." },
    result: { fr: "9 méthodes expliquées visuellement, sans installation ni serveur.", en: "9 methods explained visually, with no install or server." },
    steps: [
        { title: { fr: "Saisir les données", en: "Enter data" }, text: { fr: "Liste, CSV ou copier-coller, chaque onglet gardant son propre état.", en: "List, CSV or paste, each tab keeping its own state." }, tech: ["HTML"] },
        { title: { fr: "Diagnostiquer", en: "Diagnose" }, text: { fr: "Analyse des propriétés statistiques et recommandation de la méthode adaptée.", en: "Analysis of statistical properties and recommendation of the right method." }, tech: ["JavaScript"] },
        { title: { fr: "Transformer et comparer", en: "Transform and compare" }, text: { fr: "Z-score, Robust Scaler, Min-Max, quantiles… avec statistiques et histogrammes avant / après, et export CSV.", en: "Z-score, Robust Scaler, Min-Max, quantiles… with before / after stats and histograms, and CSV export." }, tech: ["Chart.js"] }
    ],
    map: {
        zones: [
            { id: "in", title: { fr: "Entrée", en: "Input" }, nodes: [{ id: "data", name: "Données", note: { fr: "Liste, CSV, collage", en: "List, CSV, paste" } }] },
            { id: "tool", title: { fr: "Outil (navigateur)", en: "Tool (browser)" }, nodes: [
                { id: "diag", name: "Diagnostic", tech: "JavaScript", note: { fr: "Recommandation", en: "Recommendation" } },
                { id: "tr", name: "Transformations", tech: "JavaScript", note: { fr: "9 méthodes", en: "9 methods" } }
            ] },
            { id: "out", title: { fr: "Sortie", en: "Output" }, nodes: [
                { id: "viz", name: "Avant / après", tech: "Chart.js", note: { fr: "Histogrammes", en: "Histograms" } },
                { id: "csv", name: "Export CSV", note: { fr: "Données transformées", en: "Transformed data" } }
            ] }
        ],
        links: [
            { from: "data", to: "diag", label: { fr: "analyse", en: "analysis" }, kind: "data" },
            { from: "diag", to: "tr", label: { fr: "méthode", en: "method" }, kind: "control" },
            { from: "tr", to: "viz", label: { fr: "statistiques", en: "statistics" }, kind: "data" },
            { from: "tr", to: "csv", label: { fr: "export", en: "export" }, kind: "data" }
        ]
    },
    decisions: [{ choice: { fr: "100 % HTML/CSS/JS", en: "100% HTML/CSS/JS" }, why: { fr: "Chaque outil s'ouvre d'un double-clic, sans dépendance.", en: "Each tool opens with a double-click, with no dependency." } }],
    results: { fr: ["Les effets de chaque transformation deviennent visibles et compréhensibles."], en: ["The effect of each transformation becomes visible and understandable."] },
    next: { fr: ["Diagnostic multi-colonnes."], en: ["Multi-column diagnosis."] }
});

DOC("burger-queen", {
    context: { fr: "Projet du module Développement mobile de l'ENSA : reproduire une application de restauration rapide fidèle à une maquette professionnelle.", en: "ENSA Mobile Development course project: reproduce a fast-food app faithful to a professional mock-up." },
    pains: { fr: ["Deux plateformes à couvrir.", "Fidélité visuelle à la maquette."], en: ["Two platforms to cover.", "Visual fidelity to the mock-up."] },
    solution: { fr: "Une application Flutter avec un seul code source pour Android et iOS.", en: "A Flutter app with a single code base for Android and iOS." },
    result: { fr: "7 sections fidèles à la maquette, en Material Design 3.", en: "7 sections faithful to the mock-up, in Material Design 3." },
    steps: [
        { title: { fr: "Structurer", en: "Structure" }, text: { fr: "Barre d'app, restaurant proche, bannière promo, burgers, accompagnements, boissons, desserts.", en: "App bar, nearest restaurant, promo banner, burgers, sides, drinks, desserts." }, tech: ["Flutter", "Dart"] },
        { title: { fr: "Composer l'interface", en: "Compose the UI" }, text: { fr: "Listes horizontales, grilles et assets multimédias.", en: "Horizontal lists, grids and media assets." }, tech: ["Flutter"] }
    ],
    map: {
        zones: [
            { id: "code", title: { fr: "Code Flutter", en: "Flutter code" }, nodes: [{ id: "app", name: "Application", tech: "Flutter", note: { fr: "Widgets", en: "Widgets" } }, { id: "assets", name: "Assets", note: { fr: "Images", en: "Images" } }] },
            { id: "targets", title: { fr: "Plateformes", en: "Platforms" }, nodes: [{ id: "android", name: "Android" }, { id: "ios", name: "iOS" }] }
        ],
        links: [
            { from: "assets", to: "app", label: { fr: "visuels", en: "visuals" }, kind: "data" },
            { from: "app", to: "android", label: { fr: "build", en: "build" }, kind: "control" },
            { from: "app", to: "ios", label: { fr: "build", en: "build" }, kind: "control" }
        ]
    },
    decisions: [{ choice: { fr: "Flutter", en: "Flutter" }, why: { fr: "Un seul code pour deux plateformes.", en: "One code base for two platforms." } }],
    results: { fr: ["Maîtrise de Flutter, de Dart et de l'organisation d'une application mobile."], en: ["Command of Flutter, Dart and mobile app structure."] },
    next: []
});

DOC("medischool", {
    context: { fr: "Une infirmerie scolaire suit élèves, consultations et vaccins sur papier.", en: "A school infirmary tracks pupils, consultations and vaccines on paper." },
    pains: { fr: ["Historique médical difficile à retrouver.", "Aucune traçabilité des actions."], en: ["Medical history hard to find.", "No traceability of actions."] },
    solution: { fr: "Une application Flask qui centralise dossiers, consultations, vaccinations et ordonnances.", en: "A Flask app centralising records, consultations, vaccinations and prescriptions." },
    result: { fr: "Un tableau de bord unique et un journal de toutes les actions.", en: "A single dashboard and a log of every action." },
    steps: [
        { title: { fr: "Modéliser", en: "Model" }, text: { fr: "7 tables : élève, personnel, dossier médical, consultation, vaccination, ordonnance, journal.", en: "7 tables: pupil, staff, medical record, consultation, vaccination, prescription, log." }, tech: ["MySQL"] },
        { title: { fr: "Développer", en: "Develop" }, text: { fr: "Flask organisé en blueprints, modèle MVC simplifié, templates Jinja2.", en: "Flask organised in blueprints, simplified MVC, Jinja2 templates." }, tech: ["Flask", "Jinja"] }
    ],
    map: {
        zones: [
            { id: "ui", title: { fr: "Interface", en: "Interface" }, nodes: [{ id: "tpl", name: "Templates", tech: "Jinja", note: { fr: "Tableau de bord", en: "Dashboard" } }] },
            { id: "app", title: { fr: "Application", en: "Application" }, nodes: [{ id: "flask", name: "Flask", tech: "Flask", note: { fr: "Blueprints", en: "Blueprints" } }] },
            { id: "db", title: { fr: "Données", en: "Data" }, nodes: [{ id: "mysql", name: "MySQL", tech: "MySQL", note: { fr: "7 tables", en: "7 tables" } }, { id: "log", name: "LOG_ACTIONS", tech: "MySQL", note: { fr: "Traçabilité", en: "Traceability" } }] }
        ],
        links: [
            { from: "tpl", to: "flask", label: { fr: "formulaires", en: "forms" }, kind: "data" },
            { from: "flask", to: "mysql", label: { fr: "SQL", en: "SQL" }, kind: "data" },
            { from: "flask", to: "log", label: { fr: "journal", en: "log" }, kind: "monitor" }
        ]
    },
    decisions: [{ choice: { fr: "Blueprints par domaine", en: "Blueprints per domain" }, why: { fr: "Chaque module (élèves, consultations…) reste indépendant et lisible.", en: "Each module (pupils, consultations…) stays independent and readable." } }],
    results: { fr: ["Suivi médical numérisé et traçable."], en: ["Digital, traceable medical follow-up."] },
    next: { fr: ["Rôles et authentification, alertes de rappel de vaccin, ordonnances en PDF."], en: ["Roles and authentication, vaccine reminder alerts, PDF prescriptions."] }
});

DOC("medischool-desktop", {
    context: { fr: "Les étudiants en médecine ont besoin d'un outil d'étude simple, utilisable hors ligne.", en: "Medical students need a simple study tool that works offline." },
    pains: { fr: ["Cours et ressources dispersés."], en: ["Scattered courses and resources."] },
    solution: { fr: "Une application de bureau PyQt pour organiser cours, quiz et ressources.", en: "A PyQt desktop app to organise courses, quizzes and resources." },
    result: { fr: "Un outil léger, rapide et utilisable sans connexion.", en: "A light, fast tool usable without a connection." },
    steps: [{ title: { fr: "Construire l'interface", en: "Build the interface" }, text: { fr: "Fenêtres PyQt pour les cours, les quiz et les ressources, stockage SQLite optionnel.", en: "PyQt windows for courses, quizzes and resources, optional SQLite storage." }, tech: ["Qt", "Python", "SQLite"] }],
    map: {
        zones: [
            { id: "ui", title: { fr: "Bureau", en: "Desktop" }, nodes: [{ id: "qt", name: "PyQt", tech: "Qt", note: { fr: "Interface", en: "Interface" } }] },
            { id: "data", title: { fr: "Données", en: "Data" }, nodes: [{ id: "db", name: "SQLite", tech: "SQLite", note: { fr: "Local", en: "Local" } }] }
        ],
        links: [{ from: "qt", to: "db", label: { fr: "lecture / écriture", en: "read / write" }, kind: "data" }]
    },
    decisions: [],
    results: { fr: ["Une base d'application d'étude extensible."], en: ["An extensible study app base."] },
    next: []
});

DOC("botola-pro", {
    context: { fr: "Gérer un championnat de football implique équipes, joueurs, matchs, arbitres et un classement à tenir juste.", en: "Running a football league means teams, players, matches, referees and standings to keep correct." },
    pains: { fr: ["Classement à recalculer à chaque match.", "Transferts et historiques des joueurs."], en: ["Standings to recompute after every match.", "Player transfers and history."] },
    solution: { fr: "Une application web Flask avec API REST et base SQLite pour la Botola Pro.", en: "A Flask web app with a REST API and SQLite database for the Botola Pro." },
    result: { fr: "Matchs saisis ou simulés, classement mis à jour automatiquement.", en: "Entered or simulated matches, standings updated automatically." },
    steps: [
        { title: { fr: "Modéliser le championnat", en: "Model the league" }, text: { fr: "Équipes, joueurs par poste, arbitres, entraîneurs, présidents, matchs.", en: "Teams, players by position, referees, coaches, presidents, matches." }, tech: ["SQLite"] },
        { title: { fr: "Exposer une API", en: "Expose an API" }, text: { fr: "Routes REST Flask pour gérer, simuler et classer.", en: "Flask REST routes to manage, simulate and rank." }, tech: ["Flask"] },
        { title: { fr: "Afficher", en: "Display" }, text: { fr: "Interface HTML / CSS / JavaScript avec podium et statistiques.", en: "HTML / CSS / JavaScript interface with podium and statistics." }, tech: ["JavaScript"] }
    ],
    map: {
        zones: [
            { id: "ui", title: { fr: "Interface", en: "Interface" }, nodes: [{ id: "web", name: "Pages web", tech: "JavaScript", note: { fr: "Classement", en: "Standings" } }] },
            { id: "api", title: { fr: "API", en: "API" }, nodes: [{ id: "flask", name: "Flask", tech: "Flask", note: { fr: "REST", en: "REST" } }] },
            { id: "db", title: { fr: "Données", en: "Data" }, nodes: [{ id: "sqlite", name: "SQLite", tech: "SQLite", note: { fr: "Championnat", en: "League" } }] }
        ],
        links: [
            { from: "web", to: "flask", label: { fr: "REST", en: "REST" }, kind: "data" },
            { from: "flask", to: "sqlite", label: { fr: "SQL", en: "SQL" }, kind: "data" }
        ]
    },
    decisions: [],
    results: { fr: ["Un championnat complet géré de bout en bout."], en: ["A complete league managed end to end."] },
    next: []
});

/* Noms de composants à traduire en anglais (les autres noms sont des noms propres). */
window.PORTFOLIO_DOCS_EN_NAMES = {
    "Agents IA": "AI agents", "Parquet bruts": "Raw Parquet", "Stockage objet": "Object storage", "Agrégation": "Aggregation", "Producteur": "Producer",
    "Consommateur": "Consumer", "Faits courses": "Ride facts", "Zone brute": "Raw zone", "Zone enrichie": "Enriched zone",
    "Pool dédié": "Dedicated pool", "Jeton SAS": "SAS token", "Conteneur source": "Source container", "Zone reporting": "Reporting zone",
    "Table analytique": "Analytical table", "Visualisations": "Visualisations", "Rapport": "Report", "App web": "Web app",
    "Dataset IRM": "MRI dataset", "Trainer 2 phases": "Two-phase trainer", "Fichiers": "Files", "Micro": "Microphone",
    "Interface React": "React UI", "Étape 1": "Step 1", "Étape 2": "Step 2", "Agents OpenClaw": "OpenClaw agents",
    "Boutique": "Shop", "Quiz olfactif": "Scent quiz", "Données": "Data", "Avant / après": "Before / after",
    "Pages web": "Web pages", "9 tables Kaggle": "9 Kaggle tables"
};
