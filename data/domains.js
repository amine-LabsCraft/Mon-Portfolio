/*
 * Domaines de « Ce que je sais faire » : une page par domaine (domain.html?id=…).
 * strengths   points forts, chacun appuyé par des projets (proof : identifiants de projets)
 * skills      compétences rattachées au domaine. La page retrouve d'elle-même où chacune a été appliquée :
 *             stack des projets, compétences des certifications et expériences ci-dessous.
 * Un nom de compétence peut appartenir à plusieurs domaines ; la comparaison ignore la casse.
 */
window.PORTFOLIO_EXPERIENCES = [
    {
        id: "n-one", org: "N+ONE Data Center · One Cloud", logo: "images/logos/n-one.webp", date: "2026-07",
        title: { fr: "Plateforme LLMaaS (PFA en entreprise)", en: "LLMaaS platform (end-of-year project)" },
        skills: ["Kubernetes", "vLLM", "GPU", "GitLab CI/CD", "Autoscaling", "FinOps", "LLM"]
    },
    {
        id: "ocp", org: "Groupe OCP · Khouribga", logo: "images/logos/ocp.webp", date: "2025-06",
        title: { fr: "Pipelines data cloud (stage)", en: "Cloud data pipelines (internship)" },
        skills: ["Azure Data Factory", "Databricks", "Spark", "Airflow", "dbt", "ETL / ELT", "Lakehouse"]
    }
];

window.PORTFOLIO_DOMAINS = [
    {
        id: "data",
        label: "Data",
        intro: {
            fr: "Je construis des pipelines qui amènent la donnée de sa source jusqu'à un modèle prêt pour l'analyse : en batch ou en temps réel, en incrémental, avec des tests et un historique fiable.",
            en: "I build pipelines that take data from its source to an analysis-ready model: batch or real time, incremental, with tests and reliable history."
        },
        strengths: [
            {
                title: { fr: "Chargement incrémental et CDC", en: "Incremental loading and CDC" },
                text: { fr: "Je ne recopie que ce qui a changé : filigrane par table, colonnes de mise à jour, flux Auto CDC et dimensions historisées en SCD 2.", en: "I only copy what changed: a watermark per table, update columns, Auto CDC flows and dimensions historised as SCD 2." },
                proof: ["spotify-pipeline", "walmart-lakehouse", "walmart-streaming-flow"]
            },
            {
                title: { fr: "Streaming temps réel", en: "Real-time streaming" },
                text: { fr: "Ingestion d'événements avec Kafka, Event Hubs ou WebSocket, agrégation à la minute et écriture vers des bases SQL et NoSQL.", en: "Event ingestion with Kafka, Event Hubs or WebSocket, per-minute aggregation and writes to SQL and NoSQL databases." },
                proof: ["cryptopulse", "kafka-hdfs", "uber-streaming"]
            },
            {
                title: { fr: "Modélisation et qualité", en: "Modelling and quality" },
                text: { fr: "Architecture Medallion, schémas en étoile et tests dbt : 131 tests sur le projet Walmart Streaming Flow, des règles de qualité qui écartent les lignes invalides.", en: "Medallion architecture, star schemas and dbt tests: 131 tests on Walmart Streaming Flow, quality rules that drop invalid rows." },
                proof: ["walmart-streaming-flow", "spotify-pipeline", "olist-audit"]
            },
            {
                title: { fr: "Orchestration", en: "Orchestration" },
                text: { fr: "Airflow, Celery et Azure Data Factory pour planifier, relancer et superviser les traitements, y compris en stage chez OCP.", en: "Airflow, Celery and Azure Data Factory to schedule, retry and monitor jobs, including during my internship at OCP." },
                proof: ["walmart-streaming-flow", "adf-pipeline", "spotify-pipeline"]
            }
        ],
        skills: [
            "Python", "SQL", "T-SQL", "Spark", "PySpark", "Spark SQL", "Kafka", "Kafka protocol", "ZooKeeper", "Hadoop HDFS", "YARN",
            "Airflow", "Airflow 3", "Celery", "Redis", "dbt", "Delta Lake", "Parquet", "Databricks", "Auto Loader", "Delta Live Tables",
            "Azure Data Factory", "Data Flow", "Metadata-driven", "Azure Event Hubs", "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Azure SQL",
            "NoSQL", "asyncio", "aiosqlite", "WebSocket", "REST", "requests", "Jinja2", "Pydantic", "Star schema", "Data warehouse", "Database design",
            "Normalization", "ETL / ELT", "Dimensional modeling", "Data modeling", "Data architecture", "Lakehouse", "PolyBase",
            "Window functions", "Joins", "Aggregations", "Data lifecycle"
        ]
    },
    {
        id: "cloud",
        label: "Cloud",
        intro: {
            fr: "Je conçois des plateformes data sur Azure, AWS et Databricks : stockage en couches, services managés, gouvernance et infrastructure décrite en code.",
            en: "I design data platforms on Azure, AWS and Databricks: layered storage, managed services, governance and infrastructure described as code."
        },
        strengths: [
            {
                title: { fr: "Lakehouse sur Azure et Databricks", en: "Lakehouse on Azure and Databricks" },
                text: { fr: "ADLS Gen2, Synapse, Data Factory et Databricks assemblés en architecture Bronze, Silver, Gold, avec Unity Catalog pour les droits.", en: "ADLS Gen2, Synapse, Data Factory and Databricks assembled into a Bronze, Silver, Gold architecture, with Unity Catalog for access control." },
                proof: ["spotify-pipeline", "synapse-lakehouse", "walmart-lakehouse"]
            },
            {
                title: { fr: "Infrastructure as Code", en: "Infrastructure as Code" },
                text: { fr: "Réseau, stockage et identités Azure déployés avec Terraform : VNet, NAT Gateway, Entra ID, un environnement reproductible.", en: "Azure networking, storage and identities deployed with Terraform: VNet, NAT Gateway, Entra ID, a reproducible environment." },
                proof: ["terraform-azure"]
            },
            {
                title: { fr: "Bases nouvelle génération", en: "Next-generation databases" },
                text: { fr: "Lakebase Databricks : PostgreSQL serverless avec branches copy-on-write, compute séparé du stockage et données lisibles par le Lakehouse.", en: "Databricks Lakebase: serverless PostgreSQL with copy-on-write branches, compute separated from storage and data readable by the Lakehouse." },
                proof: ["lakebase"]
            },
            {
                title: { fr: "Conteneurs et passage à l'échelle", en: "Containers and scaling" },
                text: { fr: "Services conteneurisés avec Docker sur AWS EC2, et en entreprise, des LLM déployés sur GPU avec Kubernetes et un autoscaling multi-signal.", en: "Containerised services with Docker on AWS EC2 and, at work, LLMs deployed on GPUs with Kubernetes and multi-signal autoscaling." },
                proof: ["kafka-hdfs", "walmart-streaming-flow"]
            }
        ],
        skills: [
            "Azure", "AWS", "AWS EC2", "ADLS Gen2", "Blob Storage", "Azure Storage", "Azure SQL", "Azure Synapse", "Serverless SQL",
            "Dedicated SQL pool", "PolyBase", "Azure Data Factory", "Azure Event Hubs", "Logic Apps", "Databricks", "Unity Catalog", "Delta Lake",
            "Delta Live Tables", "Auto Loader", "Lakehouse", "Cloud", "Terraform", "azurerm", "VNet", "NAT Gateway", "Entra ID", "Docker",
            "Docker Compose", "Kubernetes", "Autoscaling", "FinOps", "Supabase", "Azure AI"
        ]
    },
    {
        id: "ai",
        label: "AI",
        intro: {
            fr: "Je construis des applications à base de LLM pensées pour un usage réel : recherche augmentée (RAG), agents outillés, serveurs MCP et APIs d'inférence.",
            en: "I build LLM applications designed for real use: retrieval-augmented generation (RAG), tool-using agents, MCP servers and inference APIs."
        },
        strengths: [
            {
                title: { fr: "RAG de bout en bout", en: "End-to-end RAG" },
                text: { fr: "Découpage, embeddings, index FAISS ou pgvector et réponses sourcées. L'assistant de ce portfolio en est un exemple : BM25, Groq et réponses en streaming.", en: "Chunking, embeddings, FAISS or pgvector indexes and sourced answers. This portfolio's assistant is one example: BM25, Groq and streamed answers." },
                proof: ["rag-agentic", "customer-support", "mcp-rag-server"]
            },
            {
                title: { fr: "Agents et outils", en: "Agents and tools" },
                text: { fr: "Systèmes multi-agents avec LangGraph, garde-fous explicites (aucune écriture SQL autorisée) et outils exposés par le protocole MCP.", en: "Multi-agent systems with LangGraph, explicit guardrails (no SQL writes allowed) and tools exposed through the MCP protocol." },
                proof: ["ai-data-agent", "mcp-rag-server", "ai-trader"]
            },
            {
                title: { fr: "Modèles locaux et confidentialité", en: "Local models and privacy" },
                text: { fr: "Inférence 100 % locale avec Ollama et Llama quand les données ne doivent pas quitter la machine.", en: "100% local inference with Ollama and Llama when data must not leave the machine." },
                proof: ["insightlens", "mcp-rag-server"]
            },
            {
                title: { fr: "Servir des LLM en production", en: "Serving LLMs in production" },
                text: { fr: "APIs FastAPI typées avec Pydantic et, en entreprise, une plateforme LLMaaS : vLLM sur GPU, promotion et rollback des modèles, tarification par million de tokens.", en: "Typed FastAPI APIs with Pydantic and, at work, an LLMaaS platform: vLLM on GPUs, model promotion and rollback, pricing per million tokens." },
                proof: ["rag-agentic", "ai-data-agent", "health-analysis"]
            }
        ],
        skills: [
            "LangChain", "LangGraph", "LangSmith", "MCP", "FAISS", "pgvector", "sentence-transformers", "OpenAI", "Claude", "Groq", "Ollama",
            "Llama 3.2", "Llama 3.3 70B", "DiffusionGemma", "Hugging Face", "Transformers", "GenAI", "AI agents", "Agentic AI", "RAG", "LLM",
            "NLP", "vLLM", "GPU", "FastAPI", "Pydantic", "Streamlit", "Azure AI", "AI", "Ethics", "Supabase", "Python"
        ]
    },
    {
        id: "ml",
        label: "ML",
        intro: {
            fr: "J'entraîne et j'évalue des modèles de vision, de détection d'anomalies et de graphe, en mettant l'accent sur la mesure et l'explicabilité.",
            en: "I train and evaluate vision, anomaly detection and graph models, with an emphasis on measurement and explainability."
        },
        strengths: [
            {
                title: { fr: "Vision par ordinateur", en: "Computer vision" },
                text: { fr: "ResNet50 en transfer learning sur des IRM cérébrales : 98,96 % d'accuracy sur 1 054 images de test.", en: "ResNet50 transfer learning on brain MRIs: 98.96% accuracy on 1,054 test images." },
                proof: ["brainscan"]
            },
            {
                title: { fr: "Détection d'anomalies en temps réel", en: "Real-time anomaly detection" },
                text: { fr: "Autoencoder et GraphSAGE pour la fraude télécom : AUC de 0,998 et 56 ms de latence au 95e percentile, servis derrière Kafka et FastAPI.", en: "Autoencoder and GraphSAGE for telecom fraud: 0.998 AUC and 56 ms p95 latency, served behind Kafka and FastAPI." },
                proof: ["fraud-telecom"]
            },
            {
                title: { fr: "Explicabilité et rigueur", en: "Explainability and rigour" },
                text: { fr: "Grad-CAM pour montrer ce que le modèle regarde, des tests automatisés et des métriques suivies plutôt qu'un simple score.", en: "Grad-CAM to show what the model looks at, automated tests and tracked metrics rather than a single score." },
                proof: ["brainscan", "fraud-telecom"]
            }
        ],
        skills: [
            "PyTorch", "scikit-learn", "GraphSAGE", "ResNet50", "Grad-CAM", "Feature engineering", "Clustering", "PCA", "Classification",
            "Regression", "ML", "Data Science", "Jupyter", "pandas", "Transformers", "Hugging Face", "Python"
        ]
    },
    {
        id: "bi",
        label: "Analytics",
        intro: {
            fr: "J'explore les données, je calcule les bons indicateurs et je les rends lisibles dans des tableaux de bord utiles à la décision.",
            en: "I explore data, compute the right indicators and make them readable in dashboards that support decisions."
        },
        strengths: [
            {
                title: { fr: "SQL analytique", en: "Analytical SQL" },
                text: { fr: "Jointures, agrégations et fonctions de fenêtre sur des modèles en étoile, de Synapse à PostgreSQL ; 113 425 lignes réunies en une table analytique pour l'audit Olist.", en: "Joins, aggregations and window functions on star schemas, from Synapse to PostgreSQL; 113,425 rows joined into one analytical table for the Olist audit." },
                proof: ["olist-audit", "synapse-lakehouse", "walmart-lakehouse"]
            },
            {
                title: { fr: "Audit et exploration", en: "Audit and exploration" },
                text: { fr: "Audit complet d'un e-commerce : 99 441 commandes réparties sur 9 tables, contrôles de qualité et visualisations avec pandas et Seaborn.", en: "Full audit of an e-commerce dataset: 99,441 orders across 9 tables, quality checks and visualisations with pandas and Seaborn." },
                proof: ["olist-audit"]
            },
            {
                title: { fr: "Tableaux de bord", en: "Dashboards" },
                text: { fr: "Power BI branché sur des tables Gold et des bases temps réel, avec une modélisation pensée pour le rapport.", en: "Power BI connected to Gold tables and real-time databases, with modelling designed for reporting." },
                proof: ["walmart-streaming-flow", "cryptopulse"]
            }
        ],
        skills: [
            "SQL", "T-SQL", "Serverless SQL", "Power BI", "pandas", "Matplotlib", "Seaborn", "Data viz", "Folium", "Chart.js", "SheetJS",
            "Data analytics", "Jupyter", "Star schema", "Data modeling", "Dimensional modeling", "Window functions", "Joins", "Aggregations",
            "Streamlit", "MATLAB", "Python"
        ]
    },
    {
        id: "ops",
        label: "Ops",
        intro: {
            fr: "Je rends les systèmes observables, testés et faciles à déployer : métriques, logs, tests automatisés, conteneurs et intégration continue.",
            en: "I make systems observable, tested and easy to deploy: metrics, logs, automated tests, containers and continuous integration."
        },
        strengths: [
            {
                title: { fr: "Observabilité", en: "Observability" },
                text: { fr: "Prometheus, Grafana et Loki : quatre tableaux de bord pour suivre une plateforme data, des métriques de latence pour un modèle en production.", en: "Prometheus, Grafana and Loki: four dashboards to follow a data platform, latency metrics for a model in production." },
                proof: ["walmart-streaming-flow", "fraud-telecom"]
            },
            {
                title: { fr: "Tests et CI/CD", en: "Testing and CI/CD" },
                text: { fr: "pytest, GitHub Actions et, en entreprise, GitLab CI/CD pour promouvoir ou annuler une version de modèle.", en: "pytest, GitHub Actions and, at work, GitLab CI/CD to promote or roll back a model version." },
                proof: ["brainscan", "fraud-telecom"]
            },
            {
                title: { fr: "Conteneurs et déploiement", en: "Containers and deployment" },
                text: { fr: "Docker, Docker Compose et Nginx pour livrer des services reproductibles, Kubernetes pour les charges GPU.", en: "Docker, Docker Compose and Nginx to ship reproducible services, Kubernetes for GPU workloads." },
                proof: ["kafka-hdfs", "brainscan", "walmart-streaming-flow"]
            }
        ],
        skills: [
            "Docker", "Docker Compose", "Kubernetes", "Prometheus", "Grafana", "Loki", "Nginx", "GitHub Actions", "GitLab CI/CD", "Git",
            "Versioning", "pytest", "uv", "Terraform", "Autoscaling", "Logic Apps"
        ]
    }
];
