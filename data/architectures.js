/*
 * Architecture détaillée de chaque projet, tirée des README des dépôts et des posts LinkedIn.
 * stages  : étapes dans l'ordre du flux. Une étape a des "items" (technologies, affichées avec leur logo)
 *           et un "detail", ou bien des "branches" (traitements parallèles).
 * bands   : éléments transverses (supervision, sécurité, infrastructure…), affichés sous le schéma.
 */
window.PORTFOLIO_ARCHITECTURES = {
    "spotify-pipeline": {
        stages: [
            { title: { fr: "Source", en: "Source" }, items: ["Azure SQL"], detail: { fr: "5 tables en étoile (FactStream, DimUser, DimArtist, DimTrack, DimDate), chacune avec une colonne de date de mise à jour.", en: "5 star-schema tables (FactStream, DimUser, DimArtist, DimTrack, DimDate), each with an update timestamp column." } },
            { title: { fr: "Ingestion incrémentale", en: "Incremental ingestion" }, items: ["Azure Data Factory"], detail: { fr: "Lookup de loop_input.json, ForEach sur les tables, copie des lignes plus récentes que le filigrane, mise à jour de cdc.json ou suppression du fichier vide.", en: "Lookup of loop_input.json, ForEach over the tables, copy of rows newer than the watermark, cdc.json update or empty-file deletion." } },
            { title: { fr: "Bronze", en: "Bronze" }, items: ["ADLS Gen2", "Parquet"], detail: { fr: "Un dossier Parquet par table et un fichier d'état {table}_cdc/cdc.json.", en: "One Parquet folder per table and a {table}_cdc/cdc.json state file." } },
            { title: { fr: "Silver", en: "Silver" }, items: ["Auto Loader", "PySpark"], detail: { fr: "Lecture cloudFiles en streaming (trigger once), dédoublonnage et nettoyage, écriture Delta dans spotify_cata.silver.", en: "Streaming cloudFiles read (trigger once), deduplication and cleaning, Delta writes to spotify_cata.silver." } },
            { title: { fr: "Gold", en: "Gold" }, items: ["Delta Live Tables"], detail: { fr: "create_auto_cdc_flow : dimensions en SCD 2, faits en SCD 1, règle qualité expect_all_or_drop sur dimuser.", en: "create_auto_cdc_flow: SCD 2 dimensions, SCD 1 facts, expect_all_or_drop quality rule on dimuser." } }
        ],
        bands: [
            { title: { fr: "Gouvernance", en: "Governance" }, items: ["Unity Catalog"], detail: { fr: "Catalogue spotify_cata, External Locations et identité managée : aucun montage ni clé dans le code.", en: "spotify_cata catalog, External Locations and managed identity: no mounts or keys in code." } },
            { title: { fr: "Supervision", en: "Monitoring" }, items: ["Logic Apps"], detail: { fr: "Appel HTTP en fin de boucle ; e-mail avec le nom du pipeline et le Run ID.", en: "HTTP call at the end of the loop; e-mail with the pipeline name and run ID." } },
            { title: { fr: "Configuration", en: "Configuration" }, items: ["GitHub"], detail: { fr: "loop_input.json versionné : ajouter une table ne demande aucun nouveau pipeline.", en: "Versioned loop_input.json: adding a table needs no new pipeline." } }
        ]
    },
    "lakebase": {
        stages: [
            { title: { fr: "Applications & agents IA", en: "Applications & AI agents" }, items: [], detail: { fr: "Envoient des requêtes SQL transactionnelles (OLTP) via l'interface Postgres standard.", en: "Send transactional SQL queries (OLTP) through the standard Postgres interface." } },
            { title: { fr: "Compute sans état", en: "Stateless compute" }, items: ["PostgreSQL"], detail: { fr: "Postgres 17 (SQL, MVCC, index), cache local des pages récentes, compute secondaire qui prend le relais ; autoscaling, 1 CU par branche.", en: "Postgres 17 (SQL, MVCC, indexes), local cache of recent pages, secondary compute for failover; autoscaling, 1 CU per branch." } },
            { title: { fr: "Journal & pages", en: "Log & pages" }, branches: [
                { title: { fr: "Safekeepers", en: "Safekeepers" }, items: [], detail: { fr: "WAL répliqué par quorum Paxos, acquitté avant le commit.", en: "WAL replicated by Paxos quorum, acknowledged before commit." } },
                { title: { fr: "Pageservers", en: "Pageservers" }, items: [], detail: { fr: "Pages reconstruites depuis le WAL ; branches en copy-on-write.", en: "Pages rebuilt from the WAL; copy-on-write branches." } }
            ] },
            { title: { fr: "Stockage durable", en: "Durable storage" }, items: ["AWS"], detail: { fr: "Couches de pages dans le stockage objet (S3 en us-east-2, ou Azure Blob), séparé du compute.", en: "Page layers in object storage (S3 in us-east-2, or Azure Blob), separate from compute." } },
            { title: { fr: "Lakehouse", en: "Lakehouse" }, items: ["Databricks", "Delta Lake", "Unity Catalog"], detail: { fr: "Données exposées en Parquet / Delta : Spark, SQL, BI et ML les lisent sans ETL ni copie.", en: "Data exposed as Parquet / Delta: Spark, SQL, BI and ML read it with no ETL or copy." } }
        ],
        bands: [
            { title: { fr: "Branching", en: "Branching" }, items: [], detail: { fr: "Branches production et développement : des pointeurs vers les mêmes données, seules les pages modifiées sont copiées ; 7 jours d'historique.", en: "Production and development branches: pointers to the same data, only modified pages are copied; 7 days of history." } },
            { title: { fr: "Read replicas", en: "Read replicas" }, items: ["PostgreSQL"], detail: { fr: "Computes en lecture seule, synchronisés en asynchrone via le WAL, pour décharger tableaux de bord et rapports.", en: "Read-only computes, synced asynchronously through the WAL, to offload dashboards and reports." } },
            { title: { fr: "Gouvernance", en: "Governance" }, items: ["Unity Catalog"], detail: { fr: "Contrôle d'accès unifié ; Lakehouse Sync ramène les tables analytiques vers les applications et les agents.", en: "Unified access control; Lakehouse Sync brings analytical tables back to applications and agents." } }
        ]
    },
    "walmart-streaming-flow": {
        stages: [
            { title: { fr: "Source transactionnelle", en: "Transactional source" }, items: ["Flask", "PostgreSQL"], detail: { fr: "Order Pulse écrit chaque commande et ses articles dans une seule transaction ; un trigger pose un change_version monotone.", en: "Order Pulse writes each order and its items in one transaction; a trigger assigns a monotonic change_version." } },
            { title: { fr: "Ingestion CDC", en: "CDC ingestion" }, items: ["Airflow", "Celery", "Redis"], detail: { fr: "Le DAG horaire orchestrate lance ingest_cdc : lecture au-delà du watermark puis MERGE idempotent vers Bronze.", en: "The hourly orchestrate DAG runs ingest_cdc: read past the watermark, then idempotent MERGE into Bronze." } },
            { title: { fr: "Lakehouse", en: "Lakehouse" }, items: ["Databricks", "Delta Lake"], detail: { fr: "Bronze (6 tables Delta) → Silver technique incrémental → Silver métier obt_b, une ligne par article.", en: "Bronze (6 Delta tables) → incremental technical Silver → business Silver obt_b, one row per item." } },
            { title: { fr: "Modélisation Gold", en: "Gold modelling" }, items: ["dbt"], detail: { fr: "5 snapshots SCD2, 7 dimensions et fact_orders. 131 tests : un échec bloque la publication.", en: "5 SCD2 snapshots, 7 dimensions and fact_orders. 131 tests: one failure blocks publication." } },
            { title: { fr: "Restitution", en: "Serving" }, items: ["Power BI"], detail: { fr: "Power BI lit le schéma en étoile Gold via le SQL Warehouse Databricks.", en: "Power BI reads the Gold star schema through the Databricks SQL Warehouse." } }
        ],
        bands: [
            { title: { fr: "Observabilité", en: "Observability" }, items: ["Prometheus", "Grafana", "Loki"], detail: { fr: "4 dashboards Grafana, exporter maison, Alloy et règles d'alerte sur chaque étape.", en: "4 Grafana dashboards, custom exporter, Alloy and alert rules on every step." } },
            { title: { fr: "Reproductibilité", en: "Reproducibility" }, items: ["Docker", "uv"], detail: { fr: "Docker Compose, lockfile uv et configuration par variables d'environnement.", en: "Docker Compose, uv lockfile and environment-driven configuration." } }
        ]
    },
    "cryptopulse": {
        stages: [
            { title: { fr: "Source", en: "Source" }, items: ["Binance", "WebSocket"], detail: { fr: "Flux public de transactions de marché, limité à une liste de symboles autorisés.", en: "Public market trade stream, limited to an allow-list of symbols." } },
            { title: { fr: "Ingestion & qualité", en: "Ingestion & quality" }, items: ["Python"], detail: { fr: "Client asyncio ; chaque message est contrôlé (présence, type, positivité, date) et les rejets sont comptés.", en: "asyncio client; every message is checked (presence, type, positivity, date) and rejects are counted." } },
            { title: { fr: "Agrégation & détection", en: "Aggregation & detection" }, items: ["Python"], detail: { fr: "Bougies OHLCV par symbole et minute UTC ; règles price_spike, price_drop, volume et high_volatility.", en: "OHLCV candles per symbol and UTC minute; price_spike, price_drop, volume and high_volatility rules." } },
            { title: { fr: "Stockage hybride", en: "Hybrid storage" }, branches: [
                { title: { fr: "Faits analytiques", en: "Analytical facts" }, items: ["MySQL"], detail: { fr: "Clé unique instrument × minute : idempotent.", en: "Unique instrument × minute key: idempotent." } },
                { title: { fr: "Événements & logs", en: "Events & logs" }, items: ["MongoDB"], detail: { fr: "Événements de marché et pipeline_logs.", en: "Market events and pipeline_logs." } }
            ] },
            { title: { fr: "Restitution", en: "Serving" }, items: ["Power BI"], detail: { fr: "Les rapports lisent la couche persistée, jamais le flux direct.", en: "Reports read the persisted layer, never the live stream." } }
        ],
        bands: [
            { title: { fr: "Exploitation", en: "Operations" }, items: ["FastAPI"], detail: { fr: "Endpoints de santé, reconnexion WebSocket, arrêt propre et compteurs de qualité.", en: "Health endpoints, WebSocket reconnection, graceful shutdown and quality counters." } }
        ]
    },
    "walmart-lakehouse": {
        stages: [
            { title: { fr: "Source", en: "Source" }, items: ["PostgreSQL"], detail: { fr: "Ventes, produits, magasins, clients ; chargement rapide avec psycopg2 et COPY.", en: "Sales, products, stores, customers; fast loading with psycopg2 and COPY." } },
            { title: { fr: "Capture de changements", en: "Change capture" }, items: ["Python"], detail: { fr: "Seules les lignes nouvelles ou modifiées partent vers la plateforme.", en: "Only new or changed rows move to the platform." } },
            { title: { fr: "Medallion", en: "Medallion" }, items: ["Databricks", "Delta Lake", "Spark"], detail: { fr: "Bronze brut, Silver typé et dédoublonné avec SCD1/SCD2, Gold sous Unity Catalog.", en: "Raw Bronze, typed and deduplicated Silver with SCD1/SCD2, Gold under Unity Catalog." } },
            { title: { fr: "Modélisation", en: "Modelling" }, items: ["dbt"], detail: { fr: "Schéma en étoile autour de fact_sales : modèles, snapshots, tests, docs et lineage.", en: "Star schema around fact_sales: models, snapshots, tests, docs and lineage." } },
            { title: { fr: "Consommation", en: "Consumption" }, items: ["Power BI"], detail: { fr: "Jeux de données certifiés pour les tableaux de bord et rapports.", en: "Certified datasets for dashboards and reports." } }
        ],
        bands: [
            { title: { fr: "Orchestration", en: "Orchestration" }, items: ["Airflow"], detail: { fr: "Exécution horaire, 3 tentatives, un seul run à la fois, jobs Databricks pilotés par le SDK.", en: "Hourly runs, 3 retries, one run at a time, Databricks jobs driven by the SDK." } }
        ]
    },
    "kafka-hdfs": {
        stages: [
            { title: { fr: "Source", en: "Source" }, items: ["JSON"], detail: { fr: "hb-data.json : 100 000 événements ProductView.", en: "hb-data.json: 100,000 ProductView events." } },
            { title: { fr: "Producteur", en: "Producer" }, items: ["Python"], detail: { fr: "Lit le fichier ligne par ligne et publie dans le topic hb.", en: "Reads the file line by line and publishes to the hb topic." } },
            { title: { fr: "Streaming", en: "Streaming" }, items: ["Kafka", "ZooKeeper"], detail: { fr: "Le broker absorbe les écarts de débit ; Kafka UI montre topics, partitions et offsets.", en: "The broker absorbs throughput gaps; Kafka UI shows topics, partitions and offsets." } },
            { title: { fr: "Consommateur", en: "Consumer" }, items: ["Python"], detail: { fr: "S'abonne à hb et écrit chaque événement via WebHDFS.", en: "Subscribes to hb and writes every event through WebHDFS." } },
            { title: { fr: "Stockage distribué", en: "Distributed storage" }, items: ["Hadoop"], detail: { fr: "NameNode et DataNode HDFS, ressources gérées par YARN.", en: "HDFS NameNode and DataNode, resources managed by YARN." } }
        ],
        bands: [
            { title: { fr: "Infrastructure", en: "Infrastructure" }, items: ["Docker", "AWS EC2"], detail: { fr: "9 services Docker Compose sur une instance EC2 Ubuntu, avec groupes de sécurité dédiés.", en: "9 Docker Compose services on an Ubuntu EC2 instance, with dedicated security groups." } }
        ]
    },
    "uber-streaming": {
        stages: [
            { title: { fr: "Réservation", en: "Booking" }, items: ["FastAPI", "Jinja"], detail: { fr: "Un clic sur « Book Ride » déclenche la génération d'une course.", en: "A click on \"Book Ride\" triggers a trip." } },
            { title: { fr: "Génération", en: "Generation" }, items: ["Python"], detail: { fr: "Faker crée passager, chauffeur, véhicule, trajet GPS, prix et statut, puis sérialise en JSON.", en: "Faker creates passenger, driver, vehicle, GPS route, price and status, then serialises to JSON." } },
            { title: { fr: "Ingestion cloud", en: "Cloud ingestion" }, items: ["Azure Event Hubs"], detail: { fr: "EventHubProducerClient publie les événements par batch.", en: "EventHubProducerClient publishes events in batches." } },
            { title: { fr: "Traitement continu", en: "Stream processing" }, items: ["Spark", "Kafka"], detail: { fr: "PySpark Structured Streaming lit l'endpoint Kafka (SASL_SSL, port 9093) en micro-batchs.", en: "PySpark Structured Streaming reads the Kafka endpoint (SASL_SSL, port 9093) in micro-batches." } },
            { title: { fr: "Modèle analytique", en: "Analytical model" }, items: [], detail: { fr: "Schéma en étoile : courses en faits ; chauffeur, passager, véhicule et lieu en dimensions.", en: "Star schema: rides as facts; driver, passenger, vehicle and location as dimensions." } }
        ],
        bands: []
    },
    "terraform-azure": {
        stages: [
            { title: { fr: "Plan en code", en: "Blueprint as code" }, items: ["Terraform"], detail: { fr: "Réseau décrit en HCL : VNet, sous-réseaux, NAT Gateway, table de routage.", en: "Network described in HCL: VNet, subnets, NAT Gateway, route table." } },
            { title: { fr: "plan", en: "plan" }, items: ["Terraform"], detail: { fr: "Graphe de dépendances comparé à l'existant : on voit les changements avant d'agir.", en: "Dependency graph compared with what exists: changes are visible before acting." } },
            { title: { fr: "Authentification", en: "Authentication" }, items: ["Entra ID"], detail: { fr: "Le provider azurerm obtient un jeton.", en: "The azurerm provider gets a token." } },
            { title: { fr: "apply", en: "apply" }, items: ["Azure Resource Manager"], detail: { fr: "Les ressources indépendantes sont créées en parallèle.", en: "Independent resources are created in parallel." } },
            { title: { fr: "Réseau Azure", en: "Azure network" }, items: ["Azure"], detail: { fr: "Sous-réseau privé sans IP publique, sous-réseau public routé, NAT pour la sortie Internet.", en: "Private subnet without public IP, routed public subnet, NAT for outbound Internet." } }
        ],
        bands: [
            { title: { fr: "State distant", en: "Remote state" }, items: ["Azure Blob Storage"], detail: { fr: "Le state est stocké à distance avec un verrou contre les modifications simultanées.", en: "State is stored remotely with a lock against concurrent changes." } }
        ]
    },
    "synapse-lakehouse": {
        stages: [
            { title: { fr: "Zone brute", en: "Raw zone" }, items: ["ADLS Gen2"], detail: { fr: "Fichiers déposés dans le data lake.", en: "Files landed in the data lake." } },
            { title: { fr: "Lecture sur place", en: "In-place reads" }, items: ["Serverless SQL"], detail: { fr: "Tables externes interrogées sans copie, paiement à la donnée traitée.", en: "External tables queried without copying, pay per data processed." } },
            { title: { fr: "Zone enrichie", en: "Enriched zone" }, items: ["Parquet"], detail: { fr: "CETAS écrit de nouveaux fichiers Parquet typés et compressés.", en: "CETAS writes new typed, compressed Parquet files." } },
            { title: { fr: "Zone modélisée", en: "Modelled zone" }, items: ["Dedicated SQL pool"], detail: { fr: "COPY INTO et PolyBase + CTAS chargent des tables MPP distribuées.", en: "COPY INTO and PolyBase + CTAS load distributed MPP tables." } }
        ],
        bands: [
            { title: { fr: "Sécurité", en: "Security" }, items: ["SAS"], detail: { fr: "Jeton en lecture seule et moindre privilège ; l'écriture seulement pour l'étape qui écrit.", en: "Read-only, least-privilege token; write access only for the writing step." } }
        ]
    },
    "adf-pipeline": {
        stages: [
            { title: { fr: "Sources", en: "Sources" }, items: ["ADLS Gen2"], detail: { fr: "Conteneurs de fichiers dans le compte de stockage.", en: "File containers in the storage account." } },
            { title: { fr: "Inventaire", en: "Inventory" }, items: ["Data Factory"], detail: { fr: "Get Metadata liste les fichiers présents.", en: "Get Metadata lists the files present." } },
            { title: { fr: "Boucle", en: "Loop" }, items: ["Data Factory"], detail: { fr: "ForEach traite chaque fichier avec la même logique.", en: "ForEach processes each file with the same logic." } },
            { title: { fr: "Transformation", en: "Transformation" }, items: ["Data Flow"], detail: { fr: "Règles de nettoyage, transformation et agrégation.", en: "Cleaning, transformation and aggregation rules." } },
            { title: { fr: "Reporting", en: "Reporting" }, items: ["ADLS Gen2"], detail: { fr: "Données prêtes pour l'analyse dans une zone dédiée.", en: "Analysis-ready data in a dedicated zone." } }
        ],
        bands: [
            { title: { fr: "Supervision", en: "Monitoring" }, items: ["Data Factory"], detail: { fr: "Suivi des exécutions, gestion des erreurs et planification.", en: "Run monitoring, error handling and scheduling." } }
        ]
    },
    "olist-audit": {
        stages: [
            { title: { fr: "Données brutes", en: "Raw data" }, items: ["pandas"], detail: { fr: "9 tables Kaggle : commandes, articles, clients, vendeurs, paiements, avis…", en: "9 Kaggle tables: orders, items, customers, sellers, payments, reviews…" } },
            { title: { fr: "Nettoyage", en: "Cleaning" }, items: ["pandas"], detail: { fr: "Valeurs manquantes, doublons, types et cohérence des dates.", en: "Missing values, duplicates, types and date consistency." } },
            { title: { fr: "Table analytique", en: "Analytical table" }, items: ["pandas"], detail: { fr: "113 425 lignes après jointure, KPIs stratégiques.", en: "113,425 rows after joins, strategic KPIs." } },
            { title: { fr: "Analyses", en: "Analyses" }, items: ["Matplotlib", "scikit-learn"], detail: { fr: "Retards et notes, vendeurs, géographie, RFM et ML en bonus.", en: "Delays and ratings, sellers, geography, plus RFM and ML." } },
            { title: { fr: "Recommandations", en: "Recommendations" }, items: ["Jupyter"], detail: { fr: "Rapport final et décisions argumentées pour la marketplace.", en: "Final report and reasoned decisions for the marketplace." } }
        ],
        bands: []
    },
    "fraud-telecom": {
        stages: [
            { title: { fr: "Données", en: "Data" }, items: ["Python"], detail: { fr: "100 000 CDR et 50 000 transactions synthétiques, 6 typologies de fraude.", en: "100,000 synthetic CDRs and 50,000 transactions, 6 fraud types." } },
            { title: { fr: "ETL & features", en: "ETL & features" }, items: ["pandas"], detail: { fr: "Normalisation E.164, validation de schéma, 58 features stockées en Parquet.", en: "E.164 normalisation, schema validation, 58 features stored as Parquet." } },
            { title: { fr: "Modèles", en: "Models" }, branches: [
                { title: { fr: "Classiques", en: "Classic" }, items: ["scikit-learn"], detail: { fr: "IsolationForest, LOF, OCSVM.", en: "IsolationForest, LOF, OCSVM." } },
                { title: { fr: "Deep & graphe", en: "Deep & graph" }, items: ["PyTorch"], detail: { fr: "Autoencoder et GraphSAGE.", en: "Autoencoder and GraphSAGE." } }
            ] },
            { title: { fr: "Scoring en flux", en: "Stream scoring" }, items: ["Kafka"], detail: { fr: "Producteur CDR → feature-processor → fraud-scorer ; ensemble 35 / 40 / 25 %, p95 < 56 ms.", en: "CDR producer → feature-processor → fraud-scorer; 35 / 40 / 25% ensemble, p95 < 56 ms." } },
            { title: { fr: "Service", en: "Service" }, items: ["FastAPI", "Pydantic"], detail: { fr: "API de scoring et dashboard web des alertes.", en: "Scoring API and web alert dashboard." } }
        ],
        bands: [
            { title: { fr: "Exploitation", en: "Operations" }, items: ["Prometheus", "Grafana", "Docker"], detail: { fr: "7 services Docker Compose, Alertmanager, tests pytest.", en: "7 Docker Compose services, Alertmanager, pytest suite." } }
        ]
    },
    "brainscan": {
        stages: [
            { title: { fr: "Données IRM", en: "MRI data" }, items: ["Python", "NumPy"], detail: { fr: "4 classes, split stratifié 70/15/15, resize 256 → crop 224, augmentations Albumentations.", en: "4 classes, stratified 70/15/15 split, resize 256 → crop 224, Albumentations augmentation." } },
            { title: { fr: "Entraînement", en: "Training" }, items: ["PyTorch"], detail: { fr: "ResNet50 + tête 2048→512→4 : tête seule (1e-3), puis 30 couches dégelées (1e-4).", en: "ResNet50 + 2048→512→4 head: head only (1e-3), then 30 unfrozen layers (1e-4)." } },
            { title: { fr: "Évaluation", en: "Evaluation" }, items: ["scikit-learn", "Matplotlib"], detail: { fr: "98,96 % sur 1 054 images ; 22 analyses : confusion, ROC, PR, calibration.", en: "98.96% on 1,054 images; 22 analyses: confusion, ROC, PR, calibration." } },
            { title: { fr: "API d'inférence", en: "Inference API" }, items: ["FastAPI"], detail: { fr: "7 endpoints, modèle chargé une fois, rate limiting ; Grad-CAM sur layer4[-1].", en: "7 endpoints, model loaded once, rate limiting; Grad-CAM on layer4[-1]." } },
            { title: { fr: "Interfaces", en: "Interfaces" }, items: ["JavaScript", "Chart.js", "Streamlit"], detail: { fr: "App web avec historique et export PDF/PNG/CSV, ou Streamlit.", en: "Web app with history and PDF/PNG/CSV export, or Streamlit." } }
        ],
        bands: [
            { title: { fr: "Livraison", en: "Delivery" }, items: ["Docker", "Nginx", "GitHub Actions"], detail: { fr: "Image multi-stage non-root, 17 tests pytest, CI à chaque itération.", en: "Multi-stage non-root image, 17 pytest tests, CI on every iteration." } }
        ]
    },
    "ai-data-agent": {
        stages: [
            { title: { fr: "Demande", en: "Request" }, items: [], detail: { fr: "Une question en langage naturel : un chiffre, un filtre, un export.", en: "A plain-language question: a figure, a filter, an export." } },
            { title: { fr: "Routeur", en: "Router" }, items: ["LangGraph", "Pydantic"], detail: { fr: "RouterSchema classe l'intention en sql ou etl ; état partagé strictement typé.", en: "RouterSchema classifies intent as sql or etl; strictly typed shared state." } },
            { title: { fr: "Agents spécialisés", en: "Specialist agents" }, branches: [
                { title: { fr: "Agent SQL", en: "SQL agent" }, items: ["PostgreSQL"], detail: { fr: "Schéma réel, génération SQL, contrôle lecture seule, exécution.", en: "Real schema, SQL generation, read-only check, execution." } },
                { title: { fr: "Agent ETL", en: "ETL agent" }, items: ["pandas"], detail: { fr: "Extraction API ou fichier, transformation, exécution contrôlée.", en: "API or file extraction, transformation, controlled execution." } }
            ] },
            { title: { fr: "Résultat", en: "Result" }, items: [], detail: { fr: "Réponse expliquée en langage simple, ou fichier CSV, JSON ou Parquet.", en: "Answer explained in plain language, or a CSV, JSON or Parquet file." } }
        ],
        bands: [
            { title: { fr: "Modèles", en: "Models" }, items: ["OpenAI", "Claude"], detail: { fr: "Modèle rapide pour les tâches simples, plus puissant pour le raisonnement complexe.", en: "A fast model for simple tasks, a stronger one for complex reasoning." } },
            { title: { fr: "Garde-fous", en: "Guardrails" }, items: [], detail: { fr: "SQL en lecture seule, code ETL en environnement contrôlé, secrets hors du code.", en: "Read-only SQL, ETL code in a controlled environment, secrets kept out of the code." } }
        ]
    },
    "mcp-rag-server": {
        stages: [
            { title: { fr: "Assistant", en: "Assistant" }, items: ["Claude"], detail: { fr: "Claude Desktop appelle le serveur en local via stdio.", en: "Claude Desktop calls the server locally over stdio." } },
            { title: { fr: "Serveur MCP", en: "MCP server" }, items: ["MCP", "Python"], detail: { fr: "Expose 3 outils : db_query, rag_search, rag_get.", en: "Exposes 3 tools: db_query, rag_search, rag_get." } },
            { title: { fr: "Outils", en: "Tools" }, branches: [
                { title: { fr: "SQL lecture seule", en: "Read-only SQL" }, items: ["SQLite"], detail: { fr: "INSERT, UPDATE, DELETE et DROP bloqués.", en: "INSERT, UPDATE, DELETE and DROP blocked." } },
                { title: { fr: "Recherche sémantique", en: "Semantic search" }, items: ["Hugging Face", "FAISS"], detail: { fr: "all-MiniLM-L6-v2 en local, index FAISS persistant.", en: "Local all-MiniLM-L6-v2, persistent FAISS index." } }
            ] },
            { title: { fr: "Réponse citée", en: "Cited answer" }, items: [], detail: { fr: "Passage exact retourné avec doc_id et chunk_id.", en: "Exact passage returned with doc_id and chunk_id." } }
        ],
        bands: [
            { title: { fr: "100 % local", en: "100% local" }, items: ["Pydantic"], detail: { fr: "Ni cloud, ni Docker, ni clé API ; configuration validée par Pydantic.", en: "No cloud, no Docker, no API key; configuration validated by Pydantic." } }
        ]
    },
    "rag-agentic": {
        stages: [
            { title: { fr: "Import", en: "Upload" }, items: ["React", "Supabase"], detail: { fr: "Documents .txt et .md déposés dans Supabase Storage.", en: ".txt and .md documents stored in Supabase Storage." } },
            { title: { fr: "Ingestion", en: "Ingestion" }, items: ["FastAPI"], detail: { fr: "Découpage en blocs de 1 000 caractères (200 de recouvrement) et embeddings.", en: "Split into 1,000-character chunks (200 overlap) and embedded." } },
            { title: { fr: "Recherche vectorielle", en: "Vector search" }, items: ["PostgreSQL"], detail: { fr: "pgvector et similarité cosinus, avec RLS par utilisateur.", en: "pgvector with cosine similarity and per-user RLS." } },
            { title: { fr: "Agent", en: "Agent" }, items: ["OpenAI"], detail: { fr: "Le modèle décide s'il cherche, puis cite le fichier et le score.", en: "The model decides whether to search, then cites file and score." } },
            { title: { fr: "Interface", en: "Interface" }, items: ["React", "Vite", "Tailwind CSS"], detail: { fr: "Réponse en streaming SSE, statut d'ingestion en Realtime.", en: "Streamed SSE answer, ingestion status via Realtime." } }
        ],
        bands: []
    },
    "streaming-subtitle": {
        stages: [
            { title: { fr: "Micro", en: "Microphone" }, items: ["JavaScript"], detail: { fr: "MediaStream du navigateur, qui alimente aussi le visualiseur.", en: "Browser MediaStream, which also feeds the visualiser." } },
            { title: { fr: "Reconnaissance", en: "Recognition" }, items: ["Web Speech API"], detail: { fr: "Seuls les résultats finaux, nettoyés, deviennent un transcript.", en: "Only final, trimmed results become a transcript." } },
            { title: { fr: "Backend for Frontend", en: "Backend for Frontend" }, items: ["Next.js"], detail: { fr: "Valide les champs, construit le prompt, garde le secret côté serveur.", en: "Validates fields, builds the prompt, keeps the secret server-side." } },
            { title: { fr: "Modèle", en: "Model" }, items: ["DiffusionGemma"], detail: { fr: "Reformule ou traduit le texte, en streaming.", en: "Rewrites or translates the text, streamed." } },
            { title: { fr: "Affichage", en: "Display" }, items: ["React", "TypeScript", "Tailwind CSS"], detail: { fr: "Événements SSE reconstruits, blocs complets, historique de 3 blocs.", en: "Reassembled SSE events, complete blocks, 3-block history." } }
        ],
        bands: []
    },
    "customer-support": {
        stages: [
            { title: { fr: "FAQ", en: "FAQ" }, items: ["Hugging Face"], detail: { fr: "Jeu de questions-réponses chargé depuis Hugging Face Datasets.", en: "Q&A dataset loaded from Hugging Face Datasets." } },
            { title: { fr: "Documents", en: "Documents" }, items: ["LangChain"], detail: { fr: "Chaque entrée devient un Document LangChain.", en: "Each entry becomes a LangChain Document." } },
            { title: { fr: "Index", en: "Index" }, items: ["OpenAI", "FAISS"], detail: { fr: "Embeddings OpenAI stockés dans FAISS.", en: "OpenAI embeddings stored in FAISS." } },
            { title: { fr: "Recherche", en: "Retrieval" }, items: ["FAISS"], detail: { fr: "Top-K des réponses les plus proches.", en: "Top-K closest answers." } },
            { title: { fr: "Réponse", en: "Answer" }, items: ["OpenAI"], detail: { fr: "GPT-3.5 répond avec le contexte et l'historique.", en: "GPT-3.5 answers with context and history." } }
        ],
        bands: []
    },
    "health-analysis": {
        stages: [
            { title: { fr: "Bilan", en: "Blood test" }, items: ["Streamlit"], detail: { fr: "Texte collé ou fichier .txt importé.", en: "Pasted text or imported .txt file." } },
            { title: { fr: "Extraction", en: "Extraction" }, items: ["LangChain", "Llama 3.3"], detail: { fr: "JSON strict : analyse, valeur, statut HIGH / LOW / NORMAL, référence.", en: "Strict JSON: test, value, HIGH / LOW / NORMAL status, reference." } },
            { title: { fr: "Synthèse", en: "Summary" }, items: ["Groq"], detail: { fr: "Résumé simple et plan alimentaire marocain, balisés ###RESUME### / ###PLAN###.", en: "Plain summary and Moroccan meal plan, tagged ###RESUME### / ###PLAN###." } },
            { title: { fr: "Restitution", en: "Output" }, items: ["pandas", "Streamlit"], detail: { fr: "Tableau coloré par statut et rapport téléchargeable.", en: "Status-coloured table and downloadable report." } }
        ],
        bands: []
    },
    "insightlens": {
        stages: [
            { title: { fr: "Import", en: "Import" }, items: ["JavaScript"], detail: { fr: "CSV, Excel, JSON ou TXT jusqu'à 50 Mo, séparateur détecté.", en: "CSV, Excel, JSON or TXT up to 50 MB, delimiter detected." } },
            { title: { fr: "Moteur de données", en: "Data engine" }, items: ["JavaScript"], detail: { fr: "Statistiques, anomalies (Z-score, IQR), régression et corrélation.", en: "Statistics, anomalies (Z-score, IQR), regression and correlation." } },
            { title: { fr: "IA locale", en: "Local AI" }, items: ["Ollama", "Llama 3.2"], detail: { fr: "Réponses en streaming et mémoire métier, sans quitter le poste.", en: "Streamed answers and business memory, without leaving the machine." } },
            { title: { fr: "Visualisation", en: "Visualisation" }, items: ["Chart.js"], detail: { fr: "8 types de graphiques et cross-filtering.", en: "8 chart types and cross-filtering." } },
            { title: { fr: "Export", en: "Export" }, items: [], detail: { fr: "Rapport PDF et présentation PowerPoint.", en: "PDF report and PowerPoint deck." } }
        ],
        bands: []
    },
    "ai-trader": {
        stages: [
            { title: { fr: "Agents", en: "Agents" }, items: [], detail: { fr: "Des agents compatibles OpenClaw se connectent et publient des signaux.", en: "OpenClaw-compatible agents connect and publish signals." } },
            { title: { fr: "Backend", en: "Backend" }, items: ["FastAPI"], detail: { fr: "Stratégies, opérations et discussions ; système de points.", en: "Strategies, trades and discussions; points system." } },
            { title: { fr: "Interface", en: "Interface" }, items: ["React"], detail: { fr: "Suivi des signaux et copy trading en un clic.", en: "Signal tracking and one-click copy trading." } },
            { title: { fr: "Marchés", en: "Markets" }, items: [], detail: { fr: "Actions, crypto, forex, Polymarket en paper trading.", en: "Stocks, crypto, forex, Polymarket paper trading." } }
        ],
        bands: []
    },
    "perfume-vmax": {
        stages: [
            { title: { fr: "Frontend", en: "Front end" }, items: ["HTML", "CSS", "JavaScript"], detail: { fr: "Zéro dépendance : vidéo, pyramide olfactive, quiz de recommandation.", en: "Zero dependencies: video hero, scent pyramid, recommendation quiz." } },
            { title: { fr: "API", en: "API" }, items: ["Node.js", "Express"], detail: { fr: "28 routes REST.", en: "28 REST routes." } },
            { title: { fr: "Authentification", en: "Authentication" }, items: ["JWT", "Google"], detail: { fr: "Email + OTP, ou Google OAuth + OTP : double facteur par défaut.", en: "Email + OTP, or Google OAuth + OTP: two factors by default." } },
            { title: { fr: "Données", en: "Data" }, items: ["SQLite"], detail: { fr: "6 tables : utilisateurs, commandes, analytics…", en: "6 tables: users, orders, analytics…" } },
            { title: { fr: "Paiement", en: "Payment" }, items: ["Stripe"], detail: { fr: "Stripe ou paiement à la livraison, codes promo.", en: "Stripe or cash on delivery, promo codes." } }
        ],
        bands: []
    },
    "data-preprocessing-lab": {
        stages: [
            { title: { fr: "Données", en: "Data" }, items: ["HTML"], detail: { fr: "Valeurs saisies ou collées, sans serveur.", en: "Typed or pasted values, no server." } },
            { title: { fr: "Diagnostic", en: "Diagnosis" }, items: ["JavaScript"], detail: { fr: "Analyse la distribution et recommande une méthode.", en: "Analyses the distribution and recommends a method." } },
            { title: { fr: "Transformation", en: "Transformation" }, items: ["JavaScript"], detail: { fr: "9 méthodes : Z-score, Robust Scaler, Min-Max, nettoyage…", en: "9 methods: Z-score, Robust Scaler, Min-Max, cleaning…" } },
            { title: { fr: "Avant / après", en: "Before / after" }, items: ["Chart.js"], detail: { fr: "Statistiques et histogrammes comparés.", en: "Compared statistics and histograms." } }
        ],
        bands: []
    },
    "burger-queen": {
        stages: [
            { title: { fr: "Code unique", en: "Single code base" }, items: ["Flutter", "Dart"], detail: { fr: "Un seul code source pour Android et iOS.", en: "One code base for Android and iOS." } },
            { title: { fr: "Interface", en: "Interface" }, items: ["Flutter"], detail: { fr: "7 sections Material Design 3 : restaurant proche, offres, menus.", en: "7 Material Design 3 sections: nearest restaurant, offers, menus." } },
            { title: { fr: "Contenus", en: "Content" }, items: [], detail: { fr: "Burgers, accompagnements, boissons et desserts avec leurs visuels.", en: "Burgers, sides, drinks and desserts with their visuals." } }
        ],
        bands: []
    },
    "medischool": {
        stages: [
            { title: { fr: "Interface", en: "Interface" }, items: ["Jinja", "HTML"], detail: { fr: "Tableau de bord et formulaires de l'infirmerie.", en: "Infirmary dashboard and forms." } },
            { title: { fr: "Application", en: "Application" }, items: ["Flask", "Python"], detail: { fr: "Blueprints par domaine : élèves, consultations, vaccins, ordonnances.", en: "Blueprints per domain: pupils, consultations, vaccines, prescriptions." } },
            { title: { fr: "Base de données", en: "Database" }, items: ["MySQL"], detail: { fr: "7 tables principales et journal LOG_ACTIONS.", en: "7 main tables and a LOG_ACTIONS journal." } }
        ],
        bands: []
    },
    "medischool-desktop": {
        stages: [
            { title: { fr: "Interface", en: "Interface" }, items: ["Qt"], detail: { fr: "Application de bureau PyQt.", en: "PyQt desktop application." } },
            { title: { fr: "Logique", en: "Logic" }, items: ["Python"], detail: { fr: "Cours, quiz et ressources.", en: "Courses, quizzes and resources." } },
            { title: { fr: "Stockage", en: "Storage" }, items: ["SQLite"], detail: { fr: "Base locale optionnelle, utilisable hors ligne.", en: "Optional local database, works offline." } }
        ],
        bands: []
    },
    "botola-pro": {
        stages: [
            { title: { fr: "Interface", en: "Interface" }, items: ["HTML", "JavaScript"], detail: { fr: "Équipes, joueurs, matchs et classement en direct.", en: "Teams, players, matches and live standings." } },
            { title: { fr: "API REST", en: "REST API" }, items: ["Flask"], detail: { fr: "Transferts, simulation de matchs, staff et arbitres.", en: "Transfers, match simulation, staff and referees." } },
            { title: { fr: "Données", en: "Data" }, items: ["SQLite"], detail: { fr: "Classement recalculé automatiquement à chaque match.", en: "Standings recomputed automatically after each match." } }
        ],
        bands: []
    }
};
