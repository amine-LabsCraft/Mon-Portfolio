/*
 * Source unique des projets.
 * Chaque texte existe en français (fr) et en anglais (en).
 * source: "github" (dépôt public) ou "cloud" (réalisé dans un portail cloud, présenté sur LinkedIn).
 * Les images vivent dans images/projects/<id>/.
 */
window.PORTFOLIO_PROJECTS = [
    {
        id: "spotify-pipeline",
        group: "data",
        featured: true,
        title: "Spotify Data Pipeline",
        source: "github",
        repo: "Spotify-pepline",
        categories: ["data", "cloud"],
        isNew: true,
        updated: "2026-10-31",
        kind: { fr: "Lakehouse Azure incrémental", en: "Incremental Azure lakehouse" },
        tagline: {
            fr: "Les données d'écoute d'une appli de streaming musical chargées en incrémental par Azure Data Factory, nettoyées par Auto Loader et historisées en SCD 2 avec Delta Live Tables.",
            en: "Listening data from a music streaming app loaded incrementally by Azure Data Factory, cleaned by Auto Loader and historised as SCD 2 with Delta Live Tables."
        },
        problem: {
            fr: "Recopier toute la base à chaque run coûte cher, un pipeline par table ne passe pas à l'échelle, et les dimensions changent dans le temps (un abonné passe de Free à Premium) : il fallait ne charger que les nouveautés, avec un seul pipeline, sans perdre l'historique.",
            en: "Copying the whole database on every run is costly, one pipeline per table does not scale, and dimensions change over time (a subscriber moves from Free to Premium): the goal was to load only what changed, with a single pipeline, without losing history."
        },
        built: {
            fr: [
                "Base Azure SQL en schéma en étoile : FactStream (écoutes) et quatre dimensions (abonnés, artistes, titres, dates), 2 865 lignes initiales puis 470 lignes incrémentales.",
                "Un seul pipeline ADF piloté par loop_input.json (lu sur GitHub) : une boucle ForEach charge les 5 tables avec la même logique.",
                "Chargement incrémental par filigrane : un fichier cdc.json par table dans Bronze, une requête cdc_col > dernier filigrane, puis MAX(cdc_col) pour avancer l'état.",
                "Suppression automatique des fichiers Parquet vides quand un run ne trouve aucune nouvelle ligne.",
                "Silver avec Databricks Auto Loader : dédoublonnage, noms en majuscules, catégorie de durée des titres, écriture Delta sous Unity Catalog.",
                "Gold avec Delta Live Tables et create_auto_cdc_flow : dimensions en SCD 2, faits en SCD 1, règle qualité user_id IS NOT NULL.",
                "Alerte e-mail par Azure Logic Apps avec le nom du pipeline et l'identifiant du run, requêtes d'analyse générées avec Jinja2."
            ],
            en: [
                "Azure SQL database as a star schema: FactStream (plays) and four dimensions (subscribers, artists, tracks, dates), 2,865 initial rows then 470 incremental rows.",
                "A single ADF pipeline driven by loop_input.json (read from GitHub): a ForEach loop loads all 5 tables with the same logic.",
                "Watermark-based incremental loading: one cdc.json file per table in Bronze, a cdc_col > last watermark query, then MAX(cdc_col) to move the state forward.",
                "Empty Parquet files deleted automatically when a run finds no new rows.",
                "Silver with Databricks Auto Loader: deduplication, upper-cased names, track duration category, Delta writes under Unity Catalog.",
                "Gold with Delta Live Tables and create_auto_cdc_flow: SCD 2 dimensions, SCD 1 facts, a user_id IS NOT NULL quality rule.",
                "E-mail alert through Azure Logic Apps with the pipeline name and run ID, analysis queries generated with Jinja2."
            ]
        },
        metrics: [
            { value: "1", label: { fr: "pipeline pour 5 tables", en: "pipeline for 5 tables" } },
            { value: "470", label: { fr: "lignes au 2e run (sur 3 335)", en: "rows on the 2nd run (out of 3,335)" } },
            { value: "SCD 2", label: { fr: "sur les dimensions Gold", en: "on Gold dimensions" } },
            { value: "3", label: { fr: "couches Bronze, Silver, Gold", en: "layers: Bronze, Silver, Gold" } }
        ],
        stack: ["Azure Data Factory", "Azure SQL", "ADLS Gen2", "Databricks", "Auto Loader", "Delta Live Tables", "Unity Catalog", "PySpark", "Logic Apps", "Jinja2"],
        images: [
            { file: "01-architecture.webp", caption: { fr: "Architecture globale : Azure SQL, ADF, Bronze, Silver, Gold", en: "Overall architecture: Azure SQL, ADF, Bronze, Silver, Gold" } },
            { file: "02-pipeline-adf.webp", caption: { fr: "Pipeline ADF incremental_loop : une boucle, un filigrane par table", en: "ADF incremental_loop pipeline: one loop, one watermark per table" } },
            { file: "03-modele-etoile.webp", caption: { fr: "Modèle en étoile et colonnes CDC", en: "Star schema and CDC columns" } },
            { file: "04-bronze-silver-gold.webp", caption: { fr: "Transformations Databricks de Bronze à Gold", en: "Databricks transformations from Bronze to Gold" } }
        ]
    },
    {
        id: "lakebase",
        group: "data",
        featured: true,
        title: "Databricks Lakebase",
        source: "cloud",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7518371673306202113/",
        categories: ["data", "cloud"],
        isNew: true,
        updated: "2026-10-20",
        kind: { fr: "Base transactionnelle sur le Lakehouse", en: "Transactional database on the Lakehouse" },
        tagline: {
            fr: "Un projet Lakebase sur Databricks : PostgreSQL 17 serverless pour les applications et les agents IA, avec des données lisibles directement par le Lakehouse.",
            en: "A Lakebase project on Databricks: serverless PostgreSQL 17 for applications and AI agents, with data the Lakehouse can read directly."
        },
        problem: {
            fr: "Une base transactionnelle (OLTP) et un lakehouse analytique (OLAP) vivent d'habitude séparés : il faut des pipelines ETL et des copies pour relier les deux, et chaque environnement de test duplique toute la base.",
            en: "A transactional database (OLTP) and an analytical lakehouse (OLAP) usually live apart: ETL pipelines and copies are needed to connect them, and every test environment duplicates the whole database."
        },
        built: {
            fr: [
                "Création d'un projet Lakebase sur AWS (us-east-2) avec PostgreSQL 17, rétention d'historique de 7 jours et télémétrie Postgres activée.",
                "Deux branches, production et développement, chacune avec son compute primaire de 1 CU : la branche de développement est créée en copy-on-write, sans dupliquer les données.",
                "Suivi des branches et des computes dans la console : CU allouées, RAM, état actif ou inactif.",
                "Étude de l'architecture : compute Postgres sans état, WAL répliqué par les Safekeepers (quorum Paxos), pages reconstruites par les Pageservers, stockage objet S3 ou Azure Blob.",
                "Lien avec le Lakehouse : données exposées en Parquet / Delta sous Unity Catalog, read replicas pour les lectures lourdes, Lakehouse Sync vers les applications.",
                "Deux schémas d'architecture qui expliquent le flux des données de bout en bout."
            ],
            en: [
                "Created a Lakebase project on AWS (us-east-2) with PostgreSQL 17, 7-day history retention and Postgres telemetry enabled.",
                "Two branches, production and development, each with a 1 CU primary compute: the development branch is copy-on-write, with no data duplication.",
                "Monitored branches and computes in the console: allocated CU, RAM, active or idle state.",
                "Studied the architecture: stateless Postgres compute, WAL replicated by Safekeepers (Paxos quorum), pages rebuilt by Pageservers, S3 or Azure Blob object storage.",
                "Connection to the Lakehouse: data exposed as Parquet / Delta under Unity Catalog, read replicas for heavy reads, Lakehouse Sync back to applications.",
                "Two architecture diagrams explaining the end-to-end data flow."
            ]
        },
        metrics: [
            { value: "17", label: { fr: "version de PostgreSQL", en: "PostgreSQL version" } },
            { value: "2", label: { fr: "branches copy-on-write", en: "copy-on-write branches" } },
            { value: "7 j", label: { fr: "d'historique", en: "history retention" } },
            { value: "1 CU", label: { fr: "par compute", en: "per compute" } }
        ],
        stack: ["Databricks", "PostgreSQL", "AWS", "Delta Lake", "Unity Catalog", "Parquet", "Spark"],
        images: [
            { file: "01-architecture.webp", caption: { fr: "Architecture Lakebase et flux de données", en: "Lakebase architecture and data flow" } },
            { file: "02-flux-global.webp", caption: { fr: "Écriture, lecture et stockage : compute sans état, Safekeepers, Pageservers", en: "Writes, reads and storage: stateless compute, Safekeepers, Pageservers" } },
            { file: "03-console.webp", caption: { fr: "Console du projet : branches, computes et réglages", en: "Project console: branches, computes and settings" } }
        ]
    },
    {
        id: "walmart-streaming-flow",
        group: "data",
        featured: true,
        title: "Walmart Streaming Flow",
        source: "github",
        repo: "Walmart_streaming_Flow",
        categories: ["data"],
        updated: "2026-10-18",
        kind: { fr: "Plateforme data retail", en: "Retail data platform" },
        tagline: {
            fr: "Des commandes générées en continu dans PostgreSQL, promues chaque heure jusqu'à un schéma en étoile Gold lu par Power BI.",
            en: "Orders written continuously to PostgreSQL, promoted every hour up to a Gold star schema read by Power BI."
        },
        problem: {
            fr: "Une vraie plateforme data vit avec deux horloges : la boutique écrit des commandes toutes les quelques secondes, l'analyse veut des chiffres stables et historisés. Il fallait faire cohabiter les deux sans perdre une ligne ni casser les rapports.",
            en: "A real data platform runs on two clocks: the store writes orders every few seconds, while analytics needs stable, historised numbers. The two had to coexist without losing a row or breaking reports."
        },
        built: {
            fr: [
                "Order Pulse : un générateur qui écrit des commandes cohérentes (25 supercentres, horaires locaux, paniers 1 à 5 articles) dans un PostgreSQL Docker.",
                "Capture de changements par un change_version monotone posé par trigger, puis MERGE idempotent vers Bronze.",
                "Bronze → Silver → Gold sur Databricks / Delta Lake, snapshots dbt (SCD2) et schéma en étoile.",
                "Airflow 3 (CeleryExecutor, Redis) orchestre le cycle horaire et bloque la promotion si un test échoue.",
                "Observabilité complète : Prometheus, Grafana (4 dashboards), Loki, Alloy, exporter maison et règles d'alerte."
            ],
            en: [
                "Order Pulse: a generator that writes coherent orders (25 supercentres, local opening hours, 1–5 item baskets) into a Docker PostgreSQL.",
                "Change capture through a trigger-assigned monotonic change_version, then an idempotent MERGE into Bronze.",
                "Bronze → Silver → Gold on Databricks / Delta Lake, dbt snapshots (SCD2) and a star schema.",
                "Airflow 3 (CeleryExecutor, Redis) runs the hourly cycle and blocks promotion when a test fails.",
                "Full observability: Prometheus, Grafana (4 dashboards), Loki, Alloy, a custom exporter and alert rules."
            ]
        },
        metrics: [
            { value: "131", label: { fr: "tests dbt", en: "dbt tests" } },
            { value: "1 h", label: { fr: "cycle analytique", en: "analytics cycle" } },
            { value: "4", label: { fr: "dashboards Grafana", en: "Grafana dashboards" } },
            { value: "25", label: { fr: "magasins simulés", en: "simulated stores" } }
        ],
        stack: ["PostgreSQL", "Python", "Airflow 3", "Celery", "Redis", "Databricks", "Delta Lake", "dbt", "Power BI", "Prometheus", "Grafana", "Loki", "Docker", "uv"],
        images: [
            { file: "01-overview.webp", caption: { fr: "Vue d'ensemble des technologies", en: "Technology overview" } },
            { file: "02-architecture.webp", caption: { fr: "Architecture complète", en: "Full architecture" } },
            { file: "03-airflow_dag.webp", caption: { fr: "DAG Airflow", en: "Airflow DAG" } },
            { file: "04-dbt_lineage.webp", caption: { fr: "Lineage dbt", en: "dbt lineage" } },
            { file: "05-star_schema.webp", caption: { fr: "Schéma en étoile Gold", en: "Gold star schema" } }
        ]
    },
    {
        id: "cryptopulse",
        group: "data",
        featured: true,
        title: "CryptoPulse ETL",
        source: "github",
        repo: "Streaming-CryptoPulse-ETL",
        categories: ["data"],
        isNew: true,
        updated: "2026-09-05",
        kind: { fr: "Pipeline temps réel", en: "Real-time pipeline" },
        tagline: {
            fr: "Le flux WebSocket de Binance réduit en bougies OHLCV à la minute, avec détection d'événements de marché et restitution Power BI.",
            en: "Binance's WebSocket stream reduced to one-minute OHLCV candles, with market-event detection and Power BI reporting."
        },
        problem: {
            fr: "Un flux de transactions crypto arrive à haute fréquence. Tout stocker coûte cher et ne sert pas l'analyse ; il fallait garder l'utile, contrôler la qualité et signaler les mouvements anormaux.",
            en: "Crypto trades arrive at high frequency. Storing everything is costly and does not help analysis; the goal was to keep what matters, check quality and flag unusual moves."
        },
        built: {
            fr: [
                "Ingestion asynchrone du WebSocket public Binance, filtrée sur une liste de symboles autorisés.",
                "Validation de chaque message (présence, type, positivité, date) avec comptage des rejets.",
                "Agrégation par symbole et par minute UTC : prix moyen, OHLC, volume, nombre de trades, variation.",
                "Idempotence garantie par une contrainte unique instrument × minute.",
                "Stockage hybride : faits et dimensions dans MySQL, événements et journaux dans MongoDB.",
                "Détection de price_spike, price_drop, volume anormal et high_volatility ; santé exposée par FastAPI."
            ],
            en: [
                "Async ingestion of Binance's public WebSocket, filtered to an allow-list of symbols.",
                "Validation of every message (presence, type, positivity, date) with rejected-message counts.",
                "Aggregation per symbol and UTC minute: average price, OHLC, volume, trade count, change.",
                "Idempotency enforced by a unique instrument × minute constraint.",
                "Hybrid storage: facts and dimensions in MySQL, events and logs in MongoDB.",
                "Detection of price_spike, price_drop, abnormal volume and high_volatility; health exposed through FastAPI."
            ]
        },
        metrics: [
            { value: "1 min", label: { fr: "granularité OHLCV", en: "OHLCV granularity" } },
            { value: "4", label: { fr: "types d'événements", en: "event types" } },
            { value: "2", label: { fr: "bases (SQL + NoSQL)", en: "stores (SQL + NoSQL)" } }
        ],
        stack: ["Python", "asyncio", "WebSocket", "MySQL", "MongoDB", "FastAPI", "Power BI"],
        images: [
            { file: "01-overall.webp", caption: { fr: "Architecture globale", en: "Overall architecture" } },
            { file: "02-pepline.webp", caption: { fr: "Vue du pipeline", en: "Pipeline view" } }
        ]
    },
    {
        id: "fraud-telecom",
        group: "ai",
        featured: true,
        title: "Mobile Fraud Detection AI",
        source: "github",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7439470912594313216/",
        repo: "FaudeTelecom",
        categories: ["ai", "data"],
        updated: "2026-08-21",
        kind: { fr: "ML temps réel", en: "Real-time ML" },
        tagline: {
            fr: "Détection en temps réel de six fraudes télécom pour un opérateur mobile marocain, par un ensemble de modèles classiques, deep learning et graphe.",
            en: "Real-time detection of six telecom fraud types for a Moroccan mobile operator, using an ensemble of classic, deep learning and graph models."
        },
        problem: {
            fr: "IRSF, SIM swap, spam SMS, réseaux de fraude, mobile money, SIM volées : chaque fraude laisse une signature différente, et l'alerte doit tomber pendant l'appel, pas le lendemain.",
            en: "IRSF, SIM swap, SMS spam, fraud rings, mobile money, stolen SIMs: each fraud leaves a different signature, and the alert must fire during the call, not the next day."
        },
        built: {
            fr: [
                "100 000 CDR et 50 000 transactions synthétiques couvrant les six typologies.",
                "ETL (normalisation E.164, validation de schéma) et 58 features : vélocité, géographie, comportement, proxy graphe.",
                "Ensemble IsolationForest + LOF + OCSVM, autoencoder PyTorch et GraphSAGE : 35 % / 40 % / 25 %.",
                "Chaîne Kafka producteur → features → scoring, servie par FastAPI avec un dashboard web.",
                "Monitoring Prometheus, tests pytest et déploiement Docker Compose."
            ],
            en: [
                "100,000 synthetic CDRs and 50,000 transactions covering the six fraud types.",
                "ETL (E.164 normalisation, schema validation) and 58 features: velocity, geography, behaviour, graph proxies.",
                "Ensemble of IsolationForest + LOF + OCSVM, a PyTorch autoencoder and GraphSAGE: 35% / 40% / 25%.",
                "Kafka chain producer → features → scorer, served by FastAPI with a web dashboard.",
                "Prometheus monitoring, pytest suite and Docker Compose deployment."
            ]
        },
        metrics: [
            { value: "56 ms", label: { fr: "latence p95", en: "p95 latency" } },
            { value: "0,998", label: { fr: "AUC autoencoder", en: "autoencoder AUC" } },
            { value: "58", label: { fr: "features", en: "features" } },
            { value: "6", label: { fr: "types de fraude", en: "fraud types" } }
        ],
        stack: ["Python", "scikit-learn", "PyTorch", "GraphSAGE", "Kafka", "FastAPI", "Pydantic", "Prometheus", "Docker", "pytest"],
        images: [
            { file: "01-01_roc_curves.webp", caption: { fr: "Courbes ROC des modèles", en: "Model ROC curves" } },
            { file: "02-06_fraud_network.webp", caption: { fr: "Réseau de fraude détecté", en: "Detected fraud network" } },
            { file: "03-08_kafka_latency.webp", caption: { fr: "Latence de la chaîne Kafka", en: "Kafka chain latency" } },
            { file: "04-05_feature_importance.webp", caption: { fr: "Importance des features", en: "Feature importance" } },
            { file: "05-pr_curves.webp", caption: { fr: "Courbes précision-rappel", en: "Precision-recall curves" } },
            { file: "06-score_distributions.webp", caption: { fr: "Distribution des scores", en: "Score distributions" } },
            { file: "07-confusion.webp", caption: { fr: "Matrices de confusion", en: "Confusion matrices" } },
            { file: "08-gnn_tsne.webp", caption: { fr: "Projection t-SNE du GNN", en: "GNN t-SNE projection" } }
        ]
    },
    {
        id: "brainscan",
        group: "ai",
        featured: true,
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7475988557107634176/",
        title: "BrainScan AI",
        source: "github",
        repo: "CNN_DETECTION_BRAIN_TUMOR_MRI",
        categories: ["ai"],
        pinned: true,
        updated: "2026-08-28",
        kind: { fr: "Vision par ordinateur", en: "Computer vision" },
        tagline: {
            fr: "Classification de tumeurs cérébrales sur IRM, de l'entraînement à une prédiction expliquée et servie par API.",
            en: "Brain tumour classification on MRI, from training to an explained prediction served by an API."
        },
        problem: {
            fr: "Un modèle précis ne suffit pas en contexte médical : il faut pouvoir montrer où il regarde, le servir de façon fiable et le tester.",
            en: "An accurate model is not enough in a medical setting: you need to show where it looks, serve it reliably and test it."
        },
        built: {
            fr: [
                "ResNet50 pré-entraîné en deux phases : tête seule (lr 1e-3), puis dégel des 30 dernières couches (lr 1e-4), avec poids de classes.",
                "Grad-CAM pour afficher les zones qui ont guidé la décision.",
                "API FastAPI avec clé optionnelle, rate limiting et CORS configurables par .env.",
                "Interface web, alternative Streamlit et 22 analyses statistiques du dataset.",
                "Image Docker multi-stage, utilisateur non-root, 17 tests et CI GitHub Actions."
            ],
            en: [
                "Pre-trained ResNet50 in two phases: head only (lr 1e-3), then the last 30 layers unfrozen (lr 1e-4), with class weights.",
                "Grad-CAM to show the regions behind each decision.",
                "FastAPI API with optional key, rate limiting and CORS configured through .env.",
                "Web interface, a Streamlit alternative and 22 dataset analyses.",
                "Multi-stage Docker image, non-root user, 17 tests and GitHub Actions CI."
            ]
        },
        metrics: [
            { value: "98,96 %", label: { fr: "accuracy en test", en: "test accuracy" } },
            { value: "1 054", label: { fr: "images de test", en: "test images" } },
            { value: "17/17", label: { fr: "tests réussis", en: "tests passing" } }
        ],
        stack: ["Python", "PyTorch", "ResNet50", "Grad-CAM", "FastAPI", "Streamlit", "Docker", "Nginx", "pytest", "GitHub Actions"],
        images: [
            { file: "01-flux.webp", caption: { fr: "Flux de l'application", en: "Application flow" } },
            { file: "02-flux2.webp", caption: { fr: "Chaîne d'inférence", en: "Inference chain" } }
        ]
    },
    {
        id: "ai-data-agent",
        group: "ai",
        featured: true,
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7514313820283064321/",
        title: "AI Data Agent",
        source: "github",
        repo: "AI-Data-Agent",
        categories: ["ai", "data"],
        updated: "2026-08-30",
        kind: { fr: "Système multi-agents", en: "Multi-agent system" },
        tagline: {
            fr: "On pose une question en français ; un routeur LangGraph l'envoie à un agent SQL ou ETL qui l'exécute sans risque pour la base.",
            en: "Ask a question in plain language; a LangGraph router sends it to a SQL or ETL agent that runs it without putting the database at risk."
        },
        problem: {
            fr: "Les équipes métier ne parlent pas SQL, et les analystes réécrivent sans cesse les mêmes extractions. Laisser un LLM toucher la base demande des garde-fous stricts.",
            en: "Business teams don't speak SQL, and analysts keep rewriting the same extractions. Letting an LLM touch the database calls for strict guardrails."
        },
        built: {
            fr: [
                "Routeur LangGraph qui classe chaque demande en sql ou etl.",
                "Agent SQL : lit le schéma PostgreSQL réel, génère la requête, bloque toute commande destructive.",
                "Agent ETL : extrait, transforme avec pandas et exporte en CSV, JSON ou Parquet.",
                "États et sorties validés par Pydantic ; choix du modèle (OpenAI ou Claude) selon la complexité."
            ],
            en: [
                "LangGraph router that classifies every request as sql or etl.",
                "SQL agent: reads the real PostgreSQL schema, writes the query, blocks any destructive command.",
                "ETL agent: extracts, transforms with pandas and exports to CSV, JSON or Parquet.",
                "States and outputs validated with Pydantic; model choice (OpenAI or Claude) based on task complexity."
            ]
        },
        metrics: [
            { value: "2", label: { fr: "agents spécialisés", en: "specialist agents" } },
            { value: "3", label: { fr: "formats d'export", en: "export formats" } },
            { value: "0", label: { fr: "écriture SQL autorisée", en: "SQL writes allowed" } }
        ],
        stack: ["Python", "LangGraph", "LangChain", "PostgreSQL", "pandas", "Pydantic", "OpenAI", "Claude"],
        images: [
            { file: "01-overview.webp", caption: { fr: "Vue d'ensemble", en: "Overview" } },
            { file: "02-designer.webp", caption: { fr: "Architecture des agents", en: "Agent architecture" } },
            { file: "03-pepline.webp", caption: { fr: "Pipeline", en: "Pipeline" } },
            { file: "04-sql-agent.webp", caption: { fr: "Agent SQL", en: "SQL agent" } },
            { file: "05-etl-agent.webp", caption: { fr: "Agent ETL", en: "ETL agent" } }
        ]
    },
    {
        id: "mcp-rag-server",
        group: "ai",
        featured: true,
        title: "MCP RAG Server",
        source: "github",
        repo: "MCP-RAG-Server",
        categories: ["ai"],
        pinned: true,
        updated: "2026-08-21",
        kind: { fr: "GenAI local", en: "Local GenAI" },
        tagline: {
            fr: "Un serveur MCP qui laisse Claude Desktop interroger une base SQLite et des documents internes, sans cloud ni clé API.",
            en: "An MCP server that lets Claude Desktop query a SQLite database and internal documents, with no cloud and no API key."
        },
        problem: {
            fr: "Rendre les connaissances internes consultables par un assistant IA, sans que les données quittent la machine et sans risque d'écriture.",
            en: "Make internal knowledge searchable by an AI assistant, without data leaving the machine and without any write risk."
        },
        built: {
            fr: [
                "Outil db_query : SQL en lecture seule, INSERT / UPDATE / DELETE / DROP bloqués.",
                "Outil rag_search : recherche sémantique FAISS avec embeddings all-MiniLM-L6-v2 en local.",
                "Outil rag_get : renvoie le passage exact (doc_id, chunk_id) pour citer la source.",
                "Configuration validée par Pydantic et accès SQLite asynchrone."
            ],
            en: [
                "db_query tool: read-only SQL, INSERT / UPDATE / DELETE / DROP blocked.",
                "rag_search tool: FAISS semantic search with local all-MiniLM-L6-v2 embeddings.",
                "rag_get tool: returns the exact passage (doc_id, chunk_id) to cite the source.",
                "Pydantic-validated configuration and async SQLite access."
            ]
        },
        metrics: [
            { value: "3", label: { fr: "outils MCP", en: "MCP tools" } },
            { value: "100 %", label: { fr: "local", en: "local" } }
        ],
        stack: ["Python", "MCP", "FAISS", "sentence-transformers", "SQLite", "aiosqlite", "Pydantic"],
        images: []
    },
    {
        id: "terraform-azure",
        group: "data",
        title: "AWS → Azure en Terraform",
        titleEn: "AWS → Azure with Terraform",
        source: "cloud",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7517294502638772224/",
        categories: ["cloud"],
        isNew: true,
        updated: "2026-10-17",
        kind: { fr: "Infrastructure as Code", en: "Infrastructure as Code" },
        tagline: {
            fr: "Une architecture réseau AWS (sous-réseau privé, NAT, tables de routage) reconstruite sur Azure, entièrement décrite en code.",
            en: "An AWS network design (private subnet, NAT, route tables) rebuilt on Azure, described entirely as code."
        },
        problem: {
            fr: "Refaire ce réseau à la main dans le portail est lent, facile à rater et ne laisse aucune trace. Il fallait une version reproductible, relisible et versionnée.",
            en: "Rebuilding the network by hand in the portal is slow, error-prone and leaves no trace. It needed a reproducible, reviewable, versioned version."
        },
        built: {
            fr: [
                "Un VNet, un sous-réseau privé pour le serveur (sans IP publique) et un sous-réseau public avec sa table de routage.",
                "Une NAT Gateway qui donne au serveur privé un accès sortant à Internet.",
                "Authentification par Microsoft Entra ID, création via Azure Resource Manager (provider azurerm).",
                "State Terraform stocké à distance dans Azure Blob Storage, avec verrou contre les modifications concurrentes.",
                "Cycle init → plan → apply → destroy : on voit ce qui va changer avant d'y toucher."
            ],
            en: [
                "A VNet, a private subnet for the server (no public IP) and a public subnet with its own route table.",
                "A NAT Gateway giving the private server outbound Internet access.",
                "Authentication through Microsoft Entra ID, creation through Azure Resource Manager (azurerm provider).",
                "Terraform state stored remotely in Azure Blob Storage, locked against concurrent changes.",
                "init → plan → apply → destroy cycle: you see what will change before touching anything."
            ]
        },
        metrics: [],
        stack: ["Terraform", "Azure", "azurerm", "VNet", "NAT Gateway", "Entra ID", "Blob Storage"],
        images: [
            { file: "01.webp", caption: { fr: "Terraform et Azure, étape par étape", en: "Terraform and Azure, step by step" } },
            { file: "02.webp", caption: { fr: "Graphe des ressources créées", en: "Graph of created resources" } }
        ]
    },
    {
        id: "synapse-lakehouse",
        group: "data",
        featured: true,
        title: "Lakehouse Azure Synapse",
        titleEn: "Azure Synapse Lakehouse",
        source: "cloud",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7512213595175383040/",
        categories: ["cloud", "data"],
        isNew: true,
        updated: "2026-10-03",
        kind: { fr: "Lakehouse cloud", en: "Cloud lakehouse" },
        tagline: {
            fr: "Un pipeline de type lakehouse dans Azure Synapse : lire les fichiers sur place, les convertir en Parquet, puis les charger dans un pool dédié.",
            en: "A lakehouse-style pipeline in Azure Synapse: read files in place, convert them to Parquet, then load them into a dedicated pool."
        },
        problem: {
            fr: "Interroger des fichiers n'est pas posséder des données. Il fallait séparer stockage et calcul, typer les données et limiter l'accès au strict nécessaire.",
            en: "Querying files is not owning data. Storage and compute had to be separated, data typed, and access limited to the bare minimum."
        },
        built: {
            fr: [
                "Serverless SQL qui lit les fichiers du data lake sans copie (paiement à la donnée traitée).",
                "CETAS pour écrire physiquement de nouveaux fichiers, COPY INTO et PolyBase + CTAS vers un pool dédié MPP.",
                "Passage au Parquet : format colonnaire compressé, schéma stocké dans le fichier, types explicites.",
                "Accès par jeton SAS en lecture seule et moindre privilège ; l'écriture seulement pour l'étape qui écrit.",
                "Zones brute, enrichie et modélisée séparées, chacune avec ses formats, droits et coûts."
            ],
            en: [
                "Serverless SQL reading data lake files in place, with no copy (pay per data processed).",
                "CETAS to physically write new files, COPY INTO and PolyBase + CTAS into a dedicated MPP pool.",
                "Move to Parquet: compressed columnar format, schema stored in the file, explicit types.",
                "Read-only, least-privilege SAS token access; write permission only for the step that writes.",
                "Separate raw, enriched and modelled zones, each with its own formats, rights and costs."
            ]
        },
        metrics: [],
        stack: ["Azure Synapse", "Serverless SQL", "Dedicated SQL pool", "ADLS Gen2", "Parquet", "PolyBase", "T-SQL"],
        images: [
            { file: "01.webp", caption: { fr: "Synapse Studio : tables externes et format Parquet", en: "Synapse Studio: external tables and Parquet format" } },
            { file: "02.webp", caption: { fr: "Pool dédié et pool serverless", en: "Dedicated and serverless pools" } }
        ]
    },
    {
        id: "adf-pipeline",
        group: "data",
        title: "Pipeline Azure Data Factory",
        titleEn: "Azure Data Factory Pipeline",
        source: "cloud",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7510128325294641154/",
        categories: ["cloud", "data"],
        isNew: true,
        updated: "2026-09-28",
        kind: { fr: "Orchestration cloud", en: "Cloud orchestration" },
        tagline: {
            fr: "Un pipeline ADF piloté par les métadonnées qui parcourt les fichiers d'un data lake et les transforme en données prêtes pour le reporting.",
            en: "A metadata-driven ADF pipeline that walks through data lake files and turns them into reporting-ready data."
        },
        problem: {
            fr: "Industrialiser l'ingestion : pas un pipeline par fichier, mais un seul pipeline qui s'adapte à ce qu'il trouve.",
            en: "Industrialise ingestion: not one pipeline per file, but a single pipeline that adapts to what it finds."
        },
        built: {
            fr: [
                "Get Metadata pour lister les fichiers, puis ForEach pour traiter chacun.",
                "Data Flow pour les règles de transformation et d'agrégation.",
                "Routage vers une zone de reporting dans un compte de stockage ADLS.",
                "Suivi des exécutions, gestion des erreurs et planification."
            ],
            en: [
                "Get Metadata to list files, then ForEach to process each one.",
                "Data Flow for transformation and aggregation rules.",
                "Routing to a reporting zone in an ADLS storage account.",
                "Run monitoring, error handling and scheduling."
            ]
        },
        metrics: [],
        stack: ["Azure Data Factory", "Data Flow", "ADLS Gen2", "Metadata-driven"],
        images: [
            { file: "02.webp", caption: { fr: "Le pipeline : Get Metadata, ForEach, Data Flow", en: "The pipeline: Get Metadata, ForEach, Data Flow" } },
            { file: "01.webp", caption: { fr: "Ressources du groupe Azure", en: "Azure resource group" } },
            { file: "03.webp", caption: { fr: "Conteneurs du compte de stockage", en: "Storage account containers" } }
        ]
    },
    {
        id: "kafka-hdfs",
        group: "data",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7500232467652661250/",
        title: "Kafka → HDFS Pipeline",
        source: "github",
        repo: "Real-time-kafka-HDFS-pipline",
        categories: ["data", "cloud"],
        updated: "2026-08-31",
        kind: { fr: "Big Data sur AWS", en: "Big Data on AWS" },
        tagline: {
            fr: "100 000 événements e-commerce publiés dans Kafka puis écrits dans HDFS, sur neuf conteneurs déployés sur une instance AWS EC2.",
            en: "100,000 e-commerce events published to Kafka then written to HDFS, on nine containers running on an AWS EC2 instance."
        },
        problem: {
            fr: "Monter de bout en bout une chaîne Big Data classique (broker, stockage distribué, gestionnaire de ressources) et la superviser sur une vraie machine cloud.",
            en: "Build a classic Big Data chain end to end (broker, distributed storage, resource manager) and monitor it on a real cloud machine."
        },
        built: {
            fr: [
                "Producteur Python qui publie les événements ProductView dans le topic hb.",
                "Consommateur qui écrit chaque événement dans HDFS via WebHDFS.",
                "NameNode, DataNode, ResourceManager, NodeManager, ZooKeeper, Kafka et Kafka UI sous Docker Compose.",
                "Déploiement sur EC2 Ubuntu avec règles de groupe de sécurité dédiées."
            ],
            en: [
                "Python producer publishing ProductView events to the hb topic.",
                "Consumer writing every event to HDFS through WebHDFS.",
                "NameNode, DataNode, ResourceManager, NodeManager, ZooKeeper, Kafka and Kafka UI under Docker Compose.",
                "Deployment on EC2 Ubuntu with dedicated security-group rules."
            ]
        },
        metrics: [
            { value: "100 000", label: { fr: "événements", en: "events" } },
            { value: "9", label: { fr: "services conteneurisés", en: "containerised services" } }
        ],
        stack: ["Python", "Kafka", "ZooKeeper", "Hadoop HDFS", "YARN", "Docker Compose", "AWS EC2"],
        images: [
            { file: "01-map.webp", caption: { fr: "Architecture du pipeline", en: "Pipeline architecture" } },
            { file: "02-overall.webp", caption: { fr: "Vue d'ensemble", en: "Overview" } },
            { file: "03-kafka_ui.webp", caption: { fr: "Kafka UI, topic hb", en: "Kafka UI, hb topic" } },
            { file: "04-hdfs_datanode.webp", caption: { fr: "DataNode HDFS", en: "HDFS DataNode" } },
            { file: "05-instance.webp", caption: { fr: "Instance AWS EC2", en: "AWS EC2 instance" } },
            { file: "06-ingress.webp", caption: { fr: "Règles entrantes du groupe de sécurité", en: "Security group inbound rules" } },
            { file: "07-hdfs_data.webp", caption: { fr: "Données écrites dans HDFS", en: "Data written to HDFS" } },
            { file: "08-hadoop.webp", caption: { fr: "YARN ResourceManager", en: "YARN ResourceManager" } }
        ]
    },
    {
        id: "uber-streaming",
        group: "data",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7496180715328360449/",
        title: "Uber Real-Time Data Engineering",
        source: "github",
        repo: "Uber_data_Engineering-Streaming",
        categories: ["data", "cloud"],
        updated: "2026-07-31",
        kind: { fr: "Streaming Azure", en: "Azure streaming" },
        tagline: {
            fr: "Un clic sur « Book Ride » génère une course réaliste, publiée dans Azure Event Hubs puis traitée en continu par PySpark.",
            en: "A click on \"Book Ride\" generates a realistic trip, published to Azure Event Hubs and processed continuously by PySpark."
        },
        problem: {
            fr: "Relier une application transactionnelle à une chaîne de streaming cloud sécurisée, prête à alimenter un lakehouse.",
            en: "Connect a transactional app to a secure cloud streaming chain, ready to feed a lakehouse."
        },
        built: {
            fr: [
                "Application FastAPI qui génère passager, chauffeur, véhicule, trajet GPS, prix et statut.",
                "Publication JSON dans Azure Event Hubs.",
                "Consommation par PySpark Structured Streaming via l'interface Kafka d'Event Hubs (SASL/SSL), en micro-batchs.",
                "Sortie organisée en schéma en étoile : courses en table de faits ; chauffeur, passager, véhicule et lieu en dimensions."
            ],
            en: [
                "FastAPI app generating passenger, driver, vehicle, GPS route, price and status.",
                "JSON publishing to Azure Event Hubs.",
                "Consumption by PySpark Structured Streaming through Event Hubs' Kafka interface (SASL/SSL), in micro-batches.",
                "Output modelled as a star schema: rides as the fact table; driver, passenger, vehicle and location as dimensions."
            ]
        },
        metrics: [],
        stack: ["Python", "FastAPI", "Azure Event Hubs", "Kafka protocol", "PySpark"],
        images: [{ file: "01-architecture.webp", caption: { fr: "Architecture", en: "Architecture" } }]
    },
    {
        id: "walmart-lakehouse",
        group: "data",
        title: "Walmart Lakehouse Pipeline",
        source: "github",
        repo: "Walmart_Data_Engineering",
        categories: ["data"],
        updated: "2026-09-05",
        kind: { fr: "Lakehouse batch", en: "Batch lakehouse" },
        tagline: {
            fr: "La première version de la plateforme Walmart : CDC depuis PostgreSQL, Medallion sur Databricks, schéma en étoile testé par dbt.",
            en: "The first version of the Walmart platform: CDC from PostgreSQL, Medallion on Databricks, a dbt-tested star schema."
        },
        problem: {
            fr: "Transformer des transactions opérationnelles en produits de données gouvernés, historisés et fiables pour le reporting.",
            en: "Turn operational transactions into governed, historised and trustworthy data products for reporting."
        },
        built: {
            fr: [
                "Chargement rapide avec psycopg2 et COPY, puis capture incrémentale des changements.",
                "Bronze, Silver, Gold sur Delta Lake avec SCD Type 1 et Type 2.",
                "Modèles, snapshots, tests et lineage dbt ; gouvernance Unity Catalog.",
                "Orchestration horaire Airflow et pilotage des jobs via le SDK Databricks."
            ],
            en: [
                "Fast loading with psycopg2 and COPY, then incremental change capture.",
                "Bronze, Silver, Gold on Delta Lake with SCD Type 1 and Type 2.",
                "dbt models, snapshots, tests and lineage; Unity Catalog governance.",
                "Hourly Airflow orchestration and Databricks jobs driven through the SDK."
            ]
        },
        metrics: [],
        stack: ["PostgreSQL", "Databricks", "Spark", "Delta Lake", "dbt", "Airflow", "Unity Catalog"],
        images: [
            { file: "01-e2e.webp", caption: { fr: "Chaîne de bout en bout", en: "End-to-end chain" } },
            { file: "02-architecture.webp", caption: { fr: "Architecture", en: "Architecture" } },
            { file: "03-walmart-star-schema-design.webp", caption: { fr: "Schéma en étoile", en: "Star schema" } },
            { file: "04-pepline.webp", caption: { fr: "Pipeline", en: "Pipeline" } },
            { file: "05-schema.webp", caption: { fr: "Schéma de la base source", en: "Source database schema" } }
        ]
    },
    {
        id: "rag-agentic",
        group: "ai",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7498934673746870273/",
        title: "Agentic RAG Masterclass",
        source: "github",
        repo: "RAG_Agentic-",
        categories: ["ai"],
        updated: "2026-09-03",
        kind: { fr: "Application RAG", en: "RAG application" },
        tagline: {
            fr: "Une application web pour importer ses documents et discuter avec un modèle qui y cherche le contexte avant de répondre.",
            en: "A web app to upload your documents and chat with a model that searches them for context before answering."
        },
        problem: {
            fr: "Comprendre et construire un RAG complet, de l'ingestion à la réponse en streaming, avec une vraie base utilisateurs.",
            en: "Understand and build a complete RAG, from ingestion to streamed answers, on top of a real user base."
        },
        built: {
            fr: [
                "Front React 18 + TypeScript + Tailwind, back FastAPI avec streaming SSE.",
                "Supabase : Auth, PostgreSQL, pgvector, Storage et Realtime.",
                "Fournisseur IA interchangeable (tout endpoint compatible OpenAI) et traçabilité LangSmith.",
                "Modules 1 et 2 terminés ; recherche hybride, reranking et sous-agents à venir."
            ],
            en: [
                "React 18 + TypeScript + Tailwind front end, FastAPI back end with SSE streaming.",
                "Supabase: Auth, PostgreSQL, pgvector, Storage and Realtime.",
                "Swappable AI provider (any OpenAI-compatible endpoint) and LangSmith tracing.",
                "Modules 1 and 2 done; hybrid search, reranking and sub-agents next."
            ]
        },
        metrics: [],
        stack: ["React", "TypeScript", "Vite", "Tailwind", "FastAPI", "Supabase", "pgvector", "LangSmith"],
        images: [
            { file: "01-rag.webp", caption: { fr: "Architecture RAG", en: "RAG architecture" } },
            { file: "02-welcome.webp", caption: { fr: "Écran d'accueil", en: "Welcome screen" } },
            { file: "03-chat.webp", caption: { fr: "Conversation avec sources", en: "Chat with sources" } },
            { file: "04-settings.webp", caption: { fr: "Réglages des modèles", en: "Model settings" } }
        ]
    },
    {
        id: "streaming-subtitle",
        group: "ai",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7501980589634265088/",
        title: "Diffusion Subtitle",
        source: "github",
        repo: "Streaming_Subtitle",
        categories: ["ai"],
        updated: "2026-08-28",
        kind: { fr: "Sous-titrage temps réel", en: "Live subtitles" },
        tagline: {
            fr: "La parole captée dans le navigateur devient des sous-titres ou une traduction en direct, publiés par blocs lisibles.",
            en: "Speech captured in the browser becomes live subtitles or a translation, published as readable blocks."
        },
        problem: {
            fr: "Le modèle de langage choisi n'entend pas l'audio : il fallait séparer reconnaissance vocale et reformulation, sans effet machine à écrire fatigant.",
            en: "The chosen language model has no audio input: speech recognition and rewriting had to be split, without a tiring typewriter effect."
        },
        built: {
            fr: [
                "Reconnaissance vocale du navigateur (Web Speech API) en mode continu.",
                "Envoi du transcript au backend, prompt dynamique et appel DiffusionGemma en streaming.",
                "Deux modes : sous-titrage et traduction ; historique glissant de trois blocs."
            ],
            en: [
                "Browser speech recognition (Web Speech API) in continuous mode.",
                "Transcript sent to the back end, dynamic prompt and streamed DiffusionGemma call.",
                "Two modes: subtitles and translation; rolling history of three blocks."
            ]
        },
        metrics: [],
        stack: ["Next.js", "React", "TypeScript", "Tailwind", "DiffusionGemma"],
        images: [
            { file: "00-overview.webp", caption: { fr: "Vue d'ensemble", en: "Overview" } },
            { file: "01-pepline.webp", caption: { fr: "Pipeline", en: "Pipeline" } },
            { file: "02-steps.webp", caption: { fr: "Étapes", en: "Steps" } },
            { file: "03-ui.webp", caption: { fr: "Interface", en: "Interface" } }
        ]
    },
    {
        id: "insightlens",
        group: "ai",
        title: "InsightLens",
        source: "github",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7449419370952298496/",
        repo: "InsightLens-",
        categories: ["ai", "data"],
        pinned: true,
        updated: "2026-04-13",
        kind: { fr: "Analyse IA locale", en: "Local AI analytics" },
        tagline: {
            fr: "Une plateforme d'analyse de fichiers propulsée par l'IA, entièrement locale grâce à Ollama : les données ne quittent jamais le poste.",
            en: "An AI-powered file analytics platform that runs fully locally with Ollama: data never leaves the machine."
        },
        problem: {
            fr: "Les outils d'analyse IA envoient fichiers clients, finances ou RH vers le cloud, un risque inacceptable pour beaucoup d'entreprises.",
            en: "AI analytics tools send customer, finance or HR files to the cloud, an unacceptable risk for many companies."
        },
        built: {
            fr: [
                "Import CSV, Excel, JSON et TXT jusqu'à 50 Mo, avec auto-profiling immédiat.",
                "8 types de graphiques, dashboard en un clic et cross-filtering.",
                "Anomalies (Z-score, IQR), prévision linéaire avec intervalle de confiance.",
                "LLM local (llama3.2) en streaming, export PDF et PowerPoint."
            ],
            en: [
                "CSV, Excel, JSON and TXT import up to 50 MB, with instant auto-profiling.",
                "8 chart types, one-click dashboard and cross-filtering.",
                "Anomalies (Z-score, IQR), linear forecasting with confidence interval.",
                "Local LLM (llama3.2) streaming, PDF and PowerPoint export."
            ]
        },
        metrics: [{ value: "0 %", label: { fr: "cloud", en: "cloud" } }],
        stack: ["JavaScript", "Ollama", "Llama 3.2", "SheetJS", "jsPDF"],
        images: []
    },
    {
        id: "olist-audit",
        group: "data",
        title: "Olist E-commerce Audit",
        source: "github",
        repo: "olist-ecommerce-data-audit",
        categories: ["data"],
        pinned: true,
        updated: "2026-06-14",
        kind: { fr: "Audit data", en: "Data audit" },
        tagline: {
            fr: "Audit complet d'une marketplace brésilienne : 99 441 commandes, 9 tables, et des recommandations pour améliorer la satisfaction client.",
            en: "Full audit of a Brazilian marketplace: 99,441 orders, 9 tables and recommendations to improve customer satisfaction."
        },
        problem: {
            fr: "Si nous dirigions cette marketplace, quelles décisions prendrions-nous pour augmenter la satisfaction et la performance ?",
            en: "If we ran this marketplace, which decisions would raise satisfaction and overall performance?"
        },
        built: {
            fr: ["Nettoyage et contrôle qualité des 9 tables.", "Table analytique centrale (113 425 lignes) et KPIs.", "Analyse des retards de livraison et de leur effet sur les notes, RFM et ML en bonus."],
            en: ["Cleaning and quality checks on all 9 tables.", "Central analytical table (113,425 rows) and KPIs.", "Analysis of delivery delays and their effect on ratings, plus RFM and ML."]
        },
        metrics: [
            { value: "99 441", label: { fr: "commandes", en: "orders" } },
            { value: "9", label: { fr: "tables", en: "tables" } }
        ],
        stack: ["Python", "pandas", "Matplotlib", "Seaborn", "Jupyter"],
        images: [
            { file: "01-erd_schema.webp", caption: { fr: "Schéma relationnel", en: "Relational schema" } },
            { file: "02-viz01_ca_mensuel.webp", caption: { fr: "Chiffre d'affaires mensuel", en: "Monthly revenue" } },
            { file: "03-viz_a1_retard_vs_note.webp", caption: { fr: "Retard et note client", en: "Delay vs. review score" } }
        ]
    },
    {
        id: "customer-support",
        group: "ai",
        title: "Customer Support RAG",
        source: "github",
        repo: "CUSTUMOR-SUPPORT",
        categories: ["ai"],
        updated: "2026-08-21",
        kind: { fr: "Chatbot RAG", en: "RAG chatbot" },
        tagline: {
            fr: "Un chatbot qui cherche d'abord dans une FAQ vectorisée avant de répondre, pour limiter les hallucinations.",
            en: "A chatbot that searches a vectorised FAQ before answering, to limit hallucinations."
        },
        problem: { fr: "Répondre juste aux questions clients sans laisser le modèle inventer.", en: "Answer customer questions accurately without letting the model make things up." },
        built: {
            fr: ["FAQ chargée depuis Hugging Face Datasets et convertie en Documents LangChain.", "Embeddings OpenAI stockés dans FAISS, top-K par similarité.", "Réponse GPT-3.5 contextualisée avec historique de conversation."],
            en: ["FAQ loaded from Hugging Face Datasets and converted to LangChain Documents.", "OpenAI embeddings stored in FAISS, top-K similarity search.", "Contextual GPT-3.5 answer with conversation history."]
        },
        metrics: [],
        stack: ["Python", "LangChain", "OpenAI", "FAISS", "Hugging Face"],
        images: [
            { file: "01-customer_rag.webp", caption: { fr: "Pipeline RAG", en: "RAG pipeline" } },
            { file: "02-flow.webp", caption: { fr: "Flux", en: "Flow" } }
        ]
    },
    {
        id: "health-analysis",
        group: "ai",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7480212252449640448/",
        title: "Analyseur de bilan sanguin",
        titleEn: "Blood Test Analyser",
        source: "github",
        repo: "health_analysis",
        categories: ["ai"],
        updated: "2026-08-21",
        kind: { fr: "Pipeline LLM", en: "LLM pipeline" },
        tagline: {
            fr: "Deux appels LLM : extraire les valeurs anormales d'un bilan, puis proposer un plan alimentaire adapté à la cuisine marocaine.",
            en: "Two LLM calls: extract abnormal values from a blood test, then suggest a meal plan adapted to Moroccan cuisine."
        },
        problem: { fr: "Rendre un bilan sanguin lisible pour un non-spécialiste, sans jamais poser de diagnostic.", en: "Make a blood test readable for a non-specialist, without ever giving a diagnosis." },
        built: {
            fr: ["Étape 1 : extraction JSON stricte avec statut HIGH / LOW / NORMAL.", "Étape 2 : résumé simple et plan alimentaire en deux sections.", "Orchestration LangChain, inférence rapide via Groq avec Llama 3.3 70B, interface Streamlit."],
            en: ["Step 1: strict JSON extraction with HIGH / LOW / NORMAL status.", "Step 2: plain summary and two-part meal plan.", "LangChain orchestration, fast inference through Groq with Llama 3.3 70B, Streamlit interface."]
        },
        metrics: [],
        stack: ["Python", "LangChain", "Groq", "Llama 3.3 70B", "Streamlit", "pandas"],
        images: []
    },
    {
        id: "ai-trader",
        group: "ai",
        title: "AI Trader",
        source: "github",
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7446030979711799296/",
        repo: "Ai-___Trader",
        categories: ["ai"],
        updated: "2026-08-21",
        kind: { fr: "Agents IA", en: "AI agents" },
        tagline: {
            fr: "Exploration d'AI-Trader v2 (HKUDS) : une place de marché où des agents IA publient, débattent et copient des signaux de trading.",
            en: "Exploring AI-Trader v2 (HKUDS): a marketplace where AI agents publish, debate and copy trading signals."
        },
        problem: { fr: "Comprendre comment des agents autonomes coopèrent autour de décisions de marché.", en: "Understand how autonomous agents cooperate around market decisions." },
        built: {
            fr: ["Étude et adaptation de la plateforme open source.", "Signaux, copy trading et paper trading Polymarket."],
            en: ["Study and adaptation of the open-source platform.", "Signals, copy trading and Polymarket paper trading."]
        },
        metrics: [],
        stack: ["Python", "AI agents"],
        images: []
    },
    {
        id: "perfume-vmax",
        group: "software",
        featured: true,
        title: "VMAX Parfums",
        source: "github",
        repo: "PERFUME_VMAX",
        categories: ["apps"],
        pinned: true,
        updated: "2026-06-14",
        kind: { fr: "E-commerce full-stack", en: "Full-stack e-commerce" },
        tagline: {
            fr: "Une boutique premium de 22 parfums en HTML/CSS/JS sans framework, avec Node.js, SQLite, OAuth Google et paiement Stripe.",
            en: "A premium shop for 22 fragrances in framework-free HTML/CSS/JS, with Node.js, SQLite, Google OAuth and Stripe payments."
        },
        problem: { fr: "Construire un e-commerce complet et sécurisé sans framework front.", en: "Build a complete, secure e-commerce site without a front-end framework." },
        built: {
            fr: ["28 routes API Express, 6 tables SQLite.", "Authentification email + OTP, Google OAuth, JWT.", "Quiz olfactif, pyramide de notes, Stripe et paiement à la livraison."],
            en: ["28 Express API routes, 6 SQLite tables.", "Email + OTP auth, Google OAuth, JWT.", "Scent quiz, note pyramid, Stripe and cash on delivery."]
        },
        metrics: [
            { value: "28", label: { fr: "routes API", en: "API routes" } },
            { value: "9 640", label: { fr: "lignes de code", en: "lines of code" } }
        ],
        stack: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "SQLite", "Stripe", "OAuth"],
        images: [
            { file: "02-parfum-nocturne.webp", caption: { fr: "Visuel produit", en: "Product visual" } }
        ]
    },
    {
        id: "data-preprocessing-lab",
        group: "software",
        title: "Data Preprocessing Lab",
        source: "github",
        repo: "ClearEtNet",
        categories: ["data", "apps"],
        updated: "2026-08-21",
        kind: { fr: "Outil pédagogique", en: "Teaching tool" },
        tagline: {
            fr: "Trois outils web autonomes pour voir l'effet de la standardisation, de la normalisation et du nettoyage sur ses données.",
            en: "Three standalone web tools to see what standardisation, normalisation and cleaning do to your data."
        },
        problem: { fr: "Rendre visibles des transformations souvent appliquées à l'aveugle avant un modèle.", en: "Make visible the transformations often applied blindly before training a model." },
        built: {
            fr: ["Aperçu avant/après avec statistiques et histogrammes (Chart.js).", "Diagnostic automatique qui recommande la méthode adaptée.", "9 méthodes couvertes, 100 % HTML/CSS/JS."],
            en: ["Before/after preview with statistics and histograms (Chart.js).", "Automatic diagnosis recommending the right method.", "9 methods covered, 100% HTML/CSS/JS."]
        },
        metrics: [],
        stack: ["HTML", "CSS", "JavaScript", "Chart.js"],
        images: []
    },
    {
        id: "burger-queen",
        group: "software",
        title: "Burger Queen",
        source: "github",
        repo: "Application-mobile-de-restauration",
        categories: ["apps"],
        updated: "2026-09-27",
        kind: { fr: "Application mobile", en: "Mobile app" },
        tagline: {
            fr: "Application de restauration rapide en Flutter pour Android et iOS : restaurant proche, offres, menus burgers, boissons et desserts.",
            en: "A Flutter fast-food app for Android and iOS: nearest restaurant, offers, burger, drink and dessert menus."
        },
        problem: { fr: "Reproduire fidèlement une maquette professionnelle avec un seul code source mobile.", en: "Faithfully reproduce a professional mock-up from a single mobile code base." },
        built: {
            fr: ["7 sections : barre d'app, restaurant proche, bannière, burgers, accompagnements, boissons, desserts.", "Material Design 3 et gestion des assets."],
            en: ["7 sections: app bar, nearest restaurant, banner, burgers, sides, drinks, desserts.", "Material Design 3 and asset handling."]
        },
        metrics: [],
        stack: ["Flutter", "Dart", "Material 3"],
        images: [{ file: "01-big-queen.webp", caption: { fr: "Visuel du menu", en: "Menu visual" } }]
    },
    {
        id: "medischool",
        group: "software",
        title: "MediSchool",
        source: "github",
        repo: "Medischool",
        categories: ["apps"],
        updated: "2026-08-21",
        kind: { fr: "Application web", en: "Web app" },
        tagline: {
            fr: "La gestion de l'infirmerie scolaire numérisée : dossiers médicaux, consultations, vaccinations et ordonnances des élèves.",
            en: "School infirmary management made digital: pupils' medical records, consultations, vaccinations and prescriptions."
        },
        problem: { fr: "Remplacer le suivi papier par un outil fiable et traçable.", en: "Replace paper records with a reliable, traceable tool." },
        built: {
            fr: ["Flask en blueprints, MySQL, 7 tables principales.", "Tableau de bord et journal des actions."],
            en: ["Flask blueprints, MySQL, 7 main tables.", "Dashboard and action log."]
        },
        metrics: [],
        stack: ["Python", "Flask", "MySQL", "Jinja2"],
        images: []
    },
    {
        id: "medischool-desktop",
        group: "software",
        title: "MediSchool Desktop",
        source: "github",
        repo: "Medischool_app",
        categories: ["apps"],
        updated: "2026-06-16",
        kind: { fr: "Application desktop", en: "Desktop app" },
        tagline: {
            fr: "Application PyQt pour aider les étudiants en médecine à organiser cours, quiz et ressources.",
            en: "A PyQt app helping medical students organise courses, quizzes and resources."
        },
        problem: { fr: "Un outil d'étude léger qui fonctionne hors ligne.", en: "A lightweight study tool that works offline." },
        built: { fr: ["Cours organisés, quiz interactifs, gestionnaire de ressources."], en: ["Organised courses, interactive quizzes, resource manager."] },
        metrics: [],
        stack: ["Python", "PyQt", "SQLite"],
        images: []
    },
    {
        id: "botola-pro",
        group: "software",
        title: "Botola Pro",
        source: "github",
        repo: "web_botola",
        categories: ["apps"],
        updated: "2025-12-24",
        kind: { fr: "Application web", en: "Web app" },
        tagline: {
            fr: "Gestion complète du championnat marocain de football : équipes, joueurs, transferts, matchs simulés et classement en direct.",
            en: "Full management of the Moroccan football league: teams, players, transfers, simulated matches and live standings."
        },
        problem: { fr: "Modéliser un championnat et garder le classement juste à chaque match.", en: "Model a league and keep the standings correct after every match." },
        built: {
            fr: ["API REST Flask et base SQLite.", "Matchs saisis ou simulés, classement automatique, staff et arbitres."],
            en: ["Flask REST API and SQLite database.", "Entered or simulated matches, automatic standings, staff and referees."]
        },
        metrics: [],
        stack: ["Python", "Flask", "SQLite", "JavaScript"],
        images: []
    }
];
