/*
 * Stages et expériences en entreprise : une page chacun (experience.html?id=…), rendue par project.js.
 * Mêmes champs qu'un projet (tagline, metrics, stack, images…), plus org, logo et period.
 * La documentation (DOC) et le schéma (architecture) s'ajoutent à ceux des projets.
 * Les images vivent dans images/experiences/<id>/.
 */
window.PORTFOLIO_INTERNSHIPS = [
    {
        id: "n-one",
        org: "N+ONE Datacenters · ONE Cloud",
        logo: "images/logos/n-one.webp",
        title: "Plateforme LLM as a Service",
        titleEn: "LLM as a Service platform",
        kind: { fr: "Projet de fin d'année en entreprise", en: "End-of-year project in a company" },
        period: { fr: "Juil. – sept. 2026", en: "Jul. – Sep. 2026" },
        post: "https://www.linkedin.com/feed/update/urn:li:activity:7501607634458873856/",
        tagline: {
            fr: "Concevoir la plateforme qui transforme 24 GPU partagés en un service de modèles de langage fiable, mesurable et facturable au token.",
            en: "Designing the platform that turns 24 shared GPUs into a reliable, measurable language model service billed per token."
        },
        problem: {
            fr: "Faire tourner un LLM est simple ; en faire un service que plusieurs clients utilisent en même temps, avec des garanties de vitesse, des retours arrière possibles et un prix explicable, l'est beaucoup moins.",
            en: "Running an LLM is easy; turning it into a service that several clients use at once, with speed guarantees, possible rollbacks and an explainable price, is much harder."
        },
        built: { fr: [], en: [] },
        metrics: [
            { value: "24", label: { fr: "GPU mutualisés", en: "shared GPUs" } },
            { value: "5", label: { fr: "classes de modèles comparées", en: "model classes compared" } },
            { value: "6", label: { fr: "couches d'architecture", en: "architecture layers" } },
            { value: "< 10 min", label: { fr: "pour revenir en arrière (objectif)", en: "to roll back (target)" } }
        ],
        stack: ["Kubernetes", "vLLM", "GitLab CI/CD", "Hugging Face", "OCI", "Prometheus", "Grafana", "OpenTelemetry", "KEDA", "Bifrost"],
        images: [
            { file: "01-architecture.webp", caption: { fr: "La plateforme en six couches et la répartition des 24 GPU", en: "The six-layer platform and how the 24 GPUs are split" } },
            { file: "02-cycle-de-vie.webp", caption: { fr: "D'un modèle Hugging Face à la production, avec retour arrière", en: "From a Hugging Face model to production, with rollback" } },
            { file: "03-choix-modele.webp", caption: { fr: "Quel modèle pour quel usage : qualité, coût et énergie", en: "Which model for which use: quality, cost and energy" } }
        ]
    },
    {
        id: "ocp",
        org: "Groupe OCP · Khouribga",
        logo: "images/logos/ocp.webp",
        title: "Pipelines de données cloud",
        titleEn: "Cloud data pipelines",
        kind: { fr: "Stage", en: "Internship" },
        period: { fr: "Juin – août 2025", en: "Jun. – Aug. 2025" },
        tagline: {
            fr: "Des pipelines ETL/ELT sur Azure qui ingèrent, transforment et structurent les données dans une architecture Lakehouse, orchestrés de bout en bout.",
            en: "ETL/ELT pipelines on Azure that ingest, transform and structure data in a Lakehouse architecture, orchestrated end to end."
        },
        problem: {
            fr: "Rendre les données exploitables pour l'analyse : les réunir depuis leurs sources, les nettoyer et les organiser par étapes, avec des traitements automatisés et reproductibles.",
            en: "Make data usable for analysis: gather it from its sources, clean it and organise it in stages, with automated and reproducible processing."
        },
        built: { fr: [], en: [] },
        metrics: [],
        stack: ["Azure Data Factory", "ADLS Gen2", "Databricks", "Spark", "Delta Lake", "dbt", "Airflow"],
        images: []
    }
];

window.PORTFOLIO_DOCS = window.PORTFOLIO_DOCS || {};
window.PORTFOLIO_ARCHITECTURES = window.PORTFOLIO_ARCHITECTURES || {};

window.PORTFOLIO_DOCS["n-one"] = {
    context: {
        fr: "N+ONE Datacenters et ONE Cloud souhaitent proposer des modèles de langage open source « en service » : une application choisit un modèle et un niveau de service, la plateforme s'occupe du reste. J'ai travaillé sur la conception de cette plateforme LLMaaS, encadré par Elmehdi Marzoug et Yahya Ez-Zemmouri (N+ONE) et par Nidal Lamghari (ENSA Khouribga).",
        en: "N+ONE Datacenters and ONE Cloud want to offer open-source language models \"as a service\": an application picks a model and a service level, and the platform handles the rest. I worked on designing this LLMaaS platform, supervised by Elmehdi Marzoug and Yahya Ez-Zemmouri (N+ONE) and Nidal Lamghari (ENSA Khouribga)."
    },
    pains: {
        fr: [
            "Lancer un modèle ne suffit pas : il faut savoir d'où il vient, quelle version tourne et pouvoir revenir en arrière en quelques minutes.",
            "Les GPU sont rares et chers : un modèle mal placé gaspille de la capacité ou tombe en panne mémoire sous la charge.",
            "Un GPU très utilisé ne dit pas si les utilisateurs attendent : il faut d'autres signaux pour savoir quand ajouter des serveurs.",
            "Chaque token servi a un coût réel qu'il faut pouvoir expliquer et facturer."
        ],
        en: [
            "Starting a model is not enough: you need to know where it comes from, which version runs and be able to roll back in minutes.",
            "GPUs are scarce and expensive: a badly placed model wastes capacity or runs out of memory under load.",
            "A busy GPU does not tell you whether users are waiting: other signals are needed to decide when to add servers.",
            "Every token served has a real cost that must be explainable and billable."
        ]
    },
    solution: { fr: "Une plateforme en six couches sur Kubernetes et vLLM, avec une chaîne de livraison réversible, un placement GPU intelligent, un autoscaling multi-signal et un moteur de prix.", en: "A six-layer platform on Kubernetes and vLLM, with a reversible delivery chain, smart GPU placement, multi-signal autoscaling and a pricing engine." },
    result: { fr: "Une architecture cible et une méthode de décision prêtes à être validées sur l'infrastructure physique, avec un modèle recommandé pour chaque usage.", en: "A target architecture and a decision method ready to be validated on the physical infrastructure, with a recommended model for each use." },
    steps: [
        { title: { fr: "Cadrer le besoin", en: "Frame the need" }, text: { fr: "Acteurs, besoins, niveaux de service attendus et risques (fuite de données, panne mémoire, erreur de prix…). Chaque décision est reliée à un indicateur et à un test.", en: "Actors, needs, expected service levels and risks (data leaks, out-of-memory, pricing errors…). Every decision is tied to an indicator and a test." }, tech: [] },
        { title: { fr: "Industrialiser le cycle de vie des modèles", en: "Industrialise the model lifecycle" }, text: { fr: "Import d'une version exacte depuis Hugging Face, contrôle de licence et d'intégrité, stockage durable, puis promotion développement → staging → production par GitLab CI/CD, avec un retour arrière vers la dernière version saine.", en: "Import of an exact version from Hugging Face, licence and integrity checks, durable storage, then promotion development → staging → production through GitLab CI/CD, with rollback to the last healthy version." }, tech: ["Hugging Face", "GitLab CI/CD", "OCI"] },
        { title: { fr: "Placer les modèles sur les GPU", en: "Place models on GPUs" }, text: { fr: "Quatre profils internes (de 1 à 4 GPU). La mémoire nécessaire est estimée en additionnant les poids du modèle, le KV cache et une marge de sécurité, puis le moteur choisit le profil et le serveur adaptés.", en: "Four internal profiles (1 to 4 GPUs). The memory needed is estimated by adding model weights, KV cache and a safety margin, then the engine picks the right profile and server." }, tech: ["Kubernetes", "vLLM"] },
        { title: { fr: "Adapter la capacité à la demande", en: "Scale capacity with demand" }, text: { fr: "Un autoscaling qui regarde la file d'attente, le temps avant le premier token et la mémoire KV, pas seulement l'utilisation du GPU. Les services interactifs gardent toujours un serveur prêt.", en: "Autoscaling that watches the queue, time to first token and KV memory, not just GPU usage. Interactive services always keep one server ready." }, tech: ["KEDA", "Prometheus"] },
        { title: { fr: "Comparer les modèles", en: "Compare models" }, text: { fr: "Une campagne de benchmark contrôlée sur cinq classes de modèles (8B à 72B et MoE) et neuf scénarios : montée en charge, contexte long, pic de trafic, endurance, résilience et isolation entre clients.", en: "A controlled benchmark campaign on five model classes (8B to 72B and MoE) and nine scenarios: ramp-up, long context, traffic burst, endurance, resilience and client isolation." }, tech: ["vLLM", "Grafana"] },
        { title: { fr: "Fixer un prix juste", en: "Set a fair price" }, text: { fr: "Du coût réel d'une heure de GPU (matériel, énergie, refroidissement, sous-utilisation) jusqu'à un prix par million de tokens, traduit en règles tarifaires versionnées dans la passerelle Bifrost.", en: "From the real cost of a GPU hour (hardware, energy, cooling, under-use) to a price per million tokens, turned into versioned pricing rules in the Bifrost gateway." }, tech: ["Bifrost"] }
    ],
    map: {
        zones: [
            { id: "clients", title: { fr: "Clients", en: "Clients" }, nodes: [
                { id: "app", name: "Applications", note: { fr: "API compatible OpenAI", en: "OpenAI-compatible API" } },
                { id: "gw", name: "Bifrost", tech: "Bifrost", note: { fr: "Accès, quotas, comptage", en: "Access, quotas, metering" } }
            ] },
            { id: "control", title: { fr: "Control plane", en: "Control plane" }, nodes: [
                { id: "ci", name: "GitLab CI/CD", tech: "GitLab CI/CD", note: { fr: "Promotion, rollback", en: "Promotion, rollback" } },
                { id: "cat", name: "Catalogue", note: { fr: "Versions et prix", en: "Versions and prices" } }
            ] },
            { id: "serving", title: { fr: "Serving", en: "Serving" }, nodes: [
                { id: "vllm", name: "vLLM", tech: "vLLM", note: { fr: "Inférence", en: "Inference" } },
                { id: "k8s", name: "Kubernetes", tech: "Kubernetes", stack: ["KEDA"], note: { fr: "24 GPU, autoscaling", en: "24 GPUs, autoscaling" } }
            ] },
            { id: "infra", title: { fr: "Stockage et mesures", en: "Storage and metrics" }, nodes: [
                { id: "oci", name: "Object Storage", tech: "OCI", note: { fr: "Poids des modèles", en: "Model weights" } },
                { id: "obs", name: "Prometheus · Grafana", tech: "Grafana", stack: ["Prometheus", "OpenTelemetry"], note: { fr: "Latence et coût", en: "Latency and cost" } },
                { id: "hf", name: "Hugging Face", tech: "Hugging Face", note: { fr: "Versions exactes", en: "Pinned versions" } }
            ] }
        ],
        links: [
            { from: "app", to: "gw", label: { fr: "requête", en: "request" }, kind: "data" },
            { from: "gw", to: "vllm", label: { fr: "route", en: "route" }, kind: "data" },
            { from: "cat", to: "gw", label: { fr: "règles", en: "rules" }, kind: "control" },
            { from: "ci", to: "k8s", label: { fr: "déploie", en: "deploys" }, kind: "control" },
            { from: "oci", to: "vllm", label: { fr: "poids", en: "weights" }, kind: "data" },
            { from: "vllm", to: "obs", label: { fr: "métriques", en: "metrics" }, kind: "monitor" },
            { from: "hf", to: "oci", label: { fr: "import + contrôles", en: "import + checks" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "Surveiller la file d'attente plutôt que le seul GPU", en: "Watch the queue, not just the GPU" }, why: { fr: "Un GPU peut paraître occupé sans que personne n'attende, ou l'inverse : la file et le temps avant le premier token reflètent ce que vit l'utilisateur.", en: "A GPU can look busy with nobody waiting, or the other way round: the queue and time to first token reflect what users experience." } },
        { choice: { fr: "Toujours un serveur prêt pour l'interactif", en: "Always one warm server for interactive use" }, why: { fr: "Charger un grand modèle peut prendre plusieurs minutes ; éteindre complètement un service interactif ferait attendre le premier utilisateur.", en: "Loading a large model can take minutes; shutting an interactive service down completely would make the first user wait." } },
        { choice: { fr: "Un stockage durable et un cache rapide", en: "Durable storage plus a fast cache" }, why: { fr: "Object Storage garde la référence, Block Volume accélère le chargement : environ trois fois plus rapide pour les grands modèles dans l'étude.", en: "Object Storage keeps the reference copy, Block Volume speeds up loading: about three times faster for large models in the study." } },
        { choice: { fr: "Des versions figées et signées", en: "Frozen, signed versions" }, why: { fr: "Un retour arrière ne reconstruit rien : il redéploie une version déjà approuvée, ce qui le rend rapide et sûr.", en: "A rollback rebuilds nothing: it redeploys an already approved version, which makes it fast and safe." } }
    ],
    results: {
        fr: [
            "Le modèle 14B ressort comme le meilleur compromis entre qualité et coût ; un 8B quantifié convient au gros volume ; le 72B est à réserver aux usages premium.",
            "La latence des requêtes les plus lentes se dégrade avant le débit moyen : c'est le signal à surveiller.",
            "Le prix d'un token dépend surtout de l'utilisation réelle des GPU : mutualiser plusieurs modèles améliore la rentabilité s'ils restent isolés.",
            "Une méthode de décision réutilisable : mesurer, relier, arbitrer et tracer."
        ],
        en: [
            "The 14B model comes out as the best quality/cost trade-off; a quantised 8B suits high volume; the 72B should be kept for premium uses.",
            "Latency of the slowest requests degrades before average throughput: that is the signal to watch.",
            "The price of a token mostly depends on real GPU usage: sharing several models improves profitability as long as they stay isolated.",
            "A reusable decision method: measure, connect, arbitrate and trace."
        ]
    },
    next: {
        fr: [
            "Les chiffres viennent d'une étude contrôlée et simulée : ils doivent être validés sur l'infrastructure physique.",
            "Démarrer avec les modèles 8B et 14B, puis ouvrir les grands modèles quand leur valeur le justifie.",
            "Pistes : autoscaling prédictif, routage selon la qualité et le coût, fine-tuning LoRA, plusieurs clusters."
        ],
        en: [
            "The figures come from a controlled, simulated study: they must be validated on the physical infrastructure.",
            "Start with the 8B and 14B models, then open the larger ones when their value justifies it.",
            "Next ideas: predictive autoscaling, quality- and cost-aware routing, LoRA fine-tuning, multiple clusters."
        ]
    }
};

window.PORTFOLIO_ARCHITECTURES["n-one"] = {
    stages: [
        { title: { fr: "Clients", en: "Clients" }, items: [], detail: { fr: "Applications internes ou clientes, via une API compatible OpenAI.", en: "Internal or client applications, through an OpenAI-compatible API." } },
        { title: { fr: "Accès", en: "Access" }, items: ["Bifrost"], detail: { fr: "Authentification, quotas, choix du modèle et comptage des tokens.", en: "Authentication, quotas, model routing and token counting." } },
        { title: { fr: "Décisions", en: "Decisions" }, items: ["GitLab CI/CD"], detail: { fr: "Catalogue des versions, placement, autoscaling, prix et clients.", en: "Version catalogue, placement, autoscaling, prices and tenants." } },
        { title: { fr: "Exécution", en: "Serving" }, items: ["Kubernetes", "vLLM"], detail: { fr: "Les modèles tournent sur 24 GPU répartis en pools : léger, généraliste, grands modèles et réserve.", en: "Models run on 24 GPUs split into pools: light, general, large models and reserve." } },
        { title: { fr: "Stockage", en: "Storage" }, items: ["OCI"], detail: { fr: "Object Storage pour la copie durable, Block Volume comme cache rapide.", en: "Object Storage for the durable copy, Block Volume as a fast cache." } }
    ],
    bands: [
        { title: { fr: "Observabilité", en: "Observability" }, items: ["Prometheus", "Grafana", "OpenTelemetry"], detail: { fr: "Latence, file d'attente, mémoire GPU, erreurs et coût, sur toutes les couches.", en: "Latency, queue, GPU memory, errors and cost, across every layer." } },
        { title: { fr: "FinOps", en: "FinOps" }, items: ["Bifrost"], detail: { fr: "Du coût d'une heure de GPU au prix par million de tokens, avec des règles versionnées.", en: "From the cost of a GPU hour to a price per million tokens, with versioned rules." } }
    ]
};

window.PORTFOLIO_DOCS["ocp"] = {
    context: {
        fr: "Stage de deux mois au Groupe OCP à Khouribga, consacré à la mise en place de pipelines de données cloud avec Azure, Databricks et Spark. Cette page présente la démarche et l'architecture mises en œuvre, sans données internes à l'entreprise.",
        en: "Two-month internship at OCP Group in Khouribga, focused on building cloud data pipelines with Azure, Databricks and Spark. This page presents the approach and architecture, without any internal company data."
    },
    pains: {
        fr: [
            "Des données réparties entre plusieurs sources, difficiles à croiser.",
            "Des traitements qui doivent être automatisés et reproductibles plutôt que lancés à la main.",
            "Des volumes qui demandent des traitements distribués et optimisés."
        ],
        en: [
            "Data spread across several sources, hard to combine.",
            "Processing that must be automated and reproducible rather than run by hand.",
            "Volumes that call for distributed, optimised processing."
        ]
    },
    solution: { fr: "Des pipelines ETL/ELT sur Azure, organisés en couches Data Lake / Lakehouse et orchestrés de bout en bout.", en: "ETL/ELT pipelines on Azure, organised in Data Lake / Lakehouse layers and orchestrated end to end." },
    result: { fr: "Des données ingérées, nettoyées et structurées automatiquement, prêtes pour l'analyse.", en: "Data ingested, cleaned and structured automatically, ready for analysis." },
    steps: [
        { title: { fr: "Ingérer", en: "Ingest" }, text: { fr: "Azure Data Factory copie les données de leurs sources vers le data lake, avec des pipelines paramétrés et planifiés.", en: "Azure Data Factory copies data from its sources into the data lake, with parameterised, scheduled pipelines." }, tech: ["Azure Data Factory", "ADLS Gen2"] },
        { title: { fr: "Organiser en couches", en: "Organise in layers" }, text: { fr: "Une architecture Data Lake / Lakehouse en étapes : données brutes, données nettoyées, puis données prêtes pour l'analyse.", en: "A staged Data Lake / Lakehouse architecture: raw data, cleaned data, then analysis-ready data." }, tech: ["ADLS Gen2", "Delta Lake"] },
        { title: { fr: "Transformer à grande échelle", en: "Transform at scale" }, text: { fr: "Databricks et Apache Spark nettoient, joignent et agrègent les données en traitements distribués.", en: "Databricks and Apache Spark clean, join and aggregate data in distributed jobs." }, tech: ["Databricks", "Spark"] },
        { title: { fr: "Modéliser et tester", en: "Model and test" }, text: { fr: "dbt structure les transformations SQL en modèles documentés et testés.", en: "dbt turns SQL transformations into documented, tested models." }, tech: ["dbt"] },
        { title: { fr: "Orchestrer et optimiser", en: "Orchestrate and optimise" }, text: { fr: "Apache Airflow enchaîne les étapes et automatise les workflows ; les traitements distribués sont ajustés pour gagner en temps et en coût.", en: "Apache Airflow chains the steps and automates workflows; distributed jobs are tuned to save time and cost." }, tech: ["Airflow"] }
    ],
    map: {
        zones: [
            { id: "src", title: { fr: "Sources", en: "Sources" }, nodes: [
                { id: "sources", name: "Sources de données", note: { fr: "Fichiers, bases", en: "Files, databases" } }
            ] },
            { id: "ingest", title: { fr: "Ingestion", en: "Ingestion" }, nodes: [
                { id: "adf", name: "Data Factory", tech: "Azure Data Factory", note: { fr: "Copie planifiée", en: "Scheduled copy" } },
                { id: "airflow", name: "Airflow", tech: "Airflow", note: { fr: "Orchestration", en: "Orchestration" } }
            ] },
            { id: "lake", title: { fr: "Data Lake", en: "Data Lake" }, nodes: [
                { id: "raw", name: "Données brutes", tech: "ADLS Gen2", note: { fr: "Telles qu'extraites", en: "As extracted" } },
                { id: "clean", name: "Données nettoyées", tech: "Delta Lake", note: { fr: "Typées, dédoublonnées", en: "Typed, deduplicated" } }
            ] },
            { id: "proc", title: { fr: "Traitement", en: "Processing" }, nodes: [
                { id: "dbx", name: "Databricks · Spark", tech: "Databricks", note: { fr: "Traitements distribués", en: "Distributed jobs" } },
                { id: "dbt", name: "dbt", tech: "dbt", note: { fr: "Modèles testés", en: "Tested models" } }
            ] }
        ],
        links: [
            { from: "sources", to: "adf", label: { fr: "extraction", en: "extract" }, kind: "data" },
            { from: "adf", to: "raw", label: { fr: "chargement", en: "load" }, kind: "data" },
            { from: "raw", to: "dbx", label: { fr: "lecture", en: "read" }, kind: "data" },
            { from: "dbx", to: "clean", label: { fr: "écriture Delta", en: "Delta write" }, kind: "data" },
            { from: "airflow", to: "adf", label: { fr: "planifie", en: "schedules" }, kind: "control" },
            { from: "airflow", to: "dbt", label: { fr: "lance", en: "runs" }, kind: "control" },
            { from: "clean", to: "dbt", label: { fr: "modèles", en: "models" }, kind: "data" }
        ]
    },
    decisions: [
        { choice: { fr: "ETL et ELT selon le besoin", en: "ETL or ELT as needed" }, why: { fr: "Transformer avant le chargement quand c'est plus simple, ou charger d'abord et transformer dans le Lakehouse quand la puissance de Spark est utile.", en: "Transform before loading when simpler, or load first and transform in the Lakehouse when Spark's power helps." } },
        { choice: { fr: "Des couches séparées", en: "Separate layers" }, why: { fr: "Garder la donnée brute intacte permet de rejouer un traitement sans repartir des sources.", en: "Keeping raw data intact makes it possible to replay a job without going back to the sources." } },
        { choice: { fr: "Une orchestration centralisée", en: "Centralised orchestration" }, why: { fr: "Airflow donne une vue unique des enchaînements, des échecs et des relances.", en: "Airflow gives one view of dependencies, failures and retries." } }
    ],
    results: {
        fr: [
            "Une première expérience complète de la chaîne data en entreprise, de l'ingestion à la donnée prête pour l'analyse.",
            "La pratique d'Azure Data Factory, Databricks, Spark, dbt et Airflow sur un même projet.",
            "Le réflexe d'automatiser et d'optimiser les traitements distribués."
        ],
        en: [
            "A first complete experience of the data chain in a company, from ingestion to analysis-ready data.",
            "Hands-on use of Azure Data Factory, Databricks, Spark, dbt and Airflow on one project.",
            "The habit of automating and optimising distributed jobs."
        ]
    },
    next: { fr: [], en: [] }
};

window.PORTFOLIO_ARCHITECTURES["ocp"] = {
    stages: [
        { title: { fr: "Sources", en: "Sources" }, items: [], detail: { fr: "Fichiers et bases de données de l'entreprise.", en: "Company files and databases." } },
        { title: { fr: "Ingestion", en: "Ingestion" }, items: ["Azure Data Factory"], detail: { fr: "Pipelines paramétrés et planifiés vers le data lake.", en: "Parameterised, scheduled pipelines into the data lake." } },
        { title: { fr: "Data Lake", en: "Data Lake" }, items: ["ADLS Gen2", "Delta Lake"], detail: { fr: "Données brutes, puis nettoyées et structurées.", en: "Raw data, then cleaned and structured." } },
        { title: { fr: "Transformation", en: "Transformation" }, items: ["Databricks", "Spark", "dbt"], detail: { fr: "Traitements distribués et modèles SQL testés.", en: "Distributed jobs and tested SQL models." } },
        { title: { fr: "Analyse", en: "Analysis" }, items: [], detail: { fr: "Données prêtes pour les tableaux de bord et les analyses.", en: "Data ready for dashboards and analysis." } }
    ],
    bands: [
        { title: { fr: "Orchestration", en: "Orchestration" }, items: ["Airflow"], detail: { fr: "Enchaînement, planification et relance des étapes.", en: "Chaining, scheduling and retrying the steps." } }
    ]
};
