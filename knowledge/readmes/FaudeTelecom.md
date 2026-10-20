<div align="center">

<img src="https://img.shields.io/badge/-TelecomGuard-0A0E1A?style=for-the-badge&logo=shield&logoColor=6366F1" alt="TelecomGuard"/>

# Mobile Fraud Detection AI

### Système de détection de fraude télécom en temps réel pour les opérateurs mobiles marocains

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Apache Kafka](https://img.shields.io/badge/Kafka-3.x-231F20?style=flat-square&logo=apache-kafka&logoColor=white)](https://kafka.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Tests](https://img.shields.io/badge/Tests-187%20passed-10B981?style=flat-square&logo=pytest&logoColor=white)](./tests/)
[![License](https://img.shields.io/badge/License-MIT-6366F1?style=flat-square)](./LICENSE)

<br/>

> Détection en temps réel de 6 typologies de fraude (IRSF, SIM Swap, SMS Spam, Fraud Ring, Mobile Money, Stolen SIM)
> via un ensemble de modèles ML/DL : **IsolationForest · Autoencoder PyTorch · GraphSAGE** — latence p95 < 56 ms

</div>

---

## Table des matières

- [Aperçu](#-aperçu)
- [Dashboard Web](#-dashboard-web)
- [Architecture](#-architecture)
- [Typologies de fraude détectées](#-typologies-de-fraude-détectées)
- [Performance des modèles](#-performance-des-modèles)
- [Installation rapide](#-installation-rapide)
- [Utilisation du pipeline complet](#-utilisation-du-pipeline-complet)
- [API REST](#-api-rest)
- [Déploiement Docker](#-déploiement-docker)
- [Structure du projet](#-structure-du-projet)
- [Ingénierie des features](#-ingénierie-des-features)
- [MLOps & Monitoring](#-mlops--monitoring)
- [Tests](#-tests)
- [Contexte télécom marocain](#-contexte-télécom-marocain)
- [Stack technique](#-stack-technique)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## 🎯 Aperçu

**Mobile Fraud Detection AI** est un système complet de détection de fraude télécom en temps réel. Il couvre l'ensemble du cycle de vie ML :

| Étape | Description |
|-------|-------------|
| **Données synthétiques** | 100 000 CDRs + 50 000 transactions générés avec 6 typologies de fraude réalistes |
| **ETL** | Normalisation E.164, validation de schéma, enrichissement temporel |
| **Feature Engineering** | 58 features : vélocité, géographique, comportemental, proxy graphe |
| **Modèles** | IsolationForest + LOF + OCSVM + Autoencoder PyTorch + GraphSAGE custom |
| **Scoring d'ensemble** | 35 % classique + 40 % autoencoder + 25 % GNN, seuil configurable |
| **API temps réel** | FastAPI avec <6 ms de latence de scoring |
| **Streaming Kafka** | CDR producer → feature processor → fraud scorer, p95 < 56 ms |
| **Dashboard SOC** | Interface web sombre pour les équipes de sécurité (Security Operations Center) |
| **Monitoring MLOps** | Détection de dérive PSI/KL, alertes Prometheus, logs JSONL |

---

## 🖥️ Dashboard Web

Un dashboard professionnel style **SOC (Security Operations Center)** est intégré directement dans l'API.

**Accès :** `http://localhost:8000/dashboard`

### Fonctionnalités

- **Jauge SVG animée** — score de fraude de 0 à 1 avec gradient vert → orange → rouge
- **Bannière de décision** — `✅ SAFE` / `⚠️ WARNING` / `🚨 ALERT` avec animation pulsante sur détection
- **Barres de score par modèle** — IsolationForest (violet), Autoencoder (bleu), GraphSAGE (teal)
- **Badges de règles déclenchées** — pills colorées (rouge = fraude, orange = géo, violet = info)
- **Formulaire CDR complet** — saisie manuelle de tous les champs avec validation
- **Presets rapides** — 3 scénarios préconfigurés : Normal / IRSF Attack / SIM Swap
- **Tableau d'historique** — 10 derniers événements avec mini-barres de score et animation slide-in
- **Horloge en direct** — mise à jour toutes les secondes
- **Statut API** — indicateur pulsant vert/rouge, vérification toutes les 15 secondes
- **Auto-refresh** — re-score automatique de l'événement courant toutes les 30 secondes
- **Responsive** — s'adapte aux écrans mobiles (< 768 px)

```
┌─────────────────────────────────────────────────────┐
│  🛡️ TelecomGuard   [19:30:00 Mon 16 Mar]  ● API OK  │
├──────────────┬──────────────────────────────────────┤
│              │    FRAUD SCORE GAUGE (SVG arc)        │
│  FORMULAIRE  │    Decision Banner (couleur décision) │
│  CDR         ├──────────────────────────────────────┤
│              │  IsolationForest | Autoencoder | GNN  │
│  Presets:    ├──────────────────────────────────────┤
│  ✅ Normal   │  Triggered Rules (badge chips)        │
│  🚨 IRSF    ├──────────────────────────────────────┤
│  ⚠️ SIM Swap │  request_id · latency · analyzed_at  │
├──────────────┴──────────────────────────────────────┤
│  HISTORY TABLE — 10 derniers événements (live)      │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
                     ┌─────────────────────────┐
                     │      Data Layer          │
                     │   generate_dataset.py    │
                     │  100k CDRs · 50k TXNs   │
                     └────────────┬────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │      ETL Pipeline        │
                     │    etl_pipeline.py       │
                     │  Normalise · Valide      │
                     └────────────┬────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │   Feature Engineering    │
                     │ feature_engineering.py  │
                     │ Velocity·Geo·Behavioral  │
                     └──────┬───────┬──────────┘
                            │       │        │
            ┌───────────────┘       │        └──────────────────┐
            ▼                       ▼                           ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Classical ML   │    │  Autoencoder DL  │    │  Graph Neural Net   │
│ IsolationForest │    │  PyTorch AE      │    │  GraphSAGE custom   │
│ LOF + OCSVM     │    │  MSE threshold   │    │  3 types d'arêtes   │
│  AUC: 0.9933   │    │  AUC: 0.9984    │    │  AUC: 1.0000       │
└────────┬────────┘    └────────┬─────────┘    └──────────┬──────────┘
         │                      │                          │
         └──────────────────────┴──────────────────────────┘
                                │
                                ▼
                  ┌─────────────────────────┐
                  │     Ensemble Scorer      │
                  │  35% Classique           │
                  │  40% Autoencoder         │
                  │  25% GNN                 │
                  │  Seuil: 0.75            │
                  └───────────┬─────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────┐        ┌────────────────────────┐
│  Kafka Streaming    │        │     REST API           │
│  CDR Producer       │        │  FastAPI + Prometheus  │
│  Feature Processor  │        │  POST /score/event     │
│  p95 < 56 ms        │        │  GET  /dashboard       │
└──────────┬──────────┘        └───────────┬────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────┐        ┌────────────────────────┐
│  MLOps Monitoring   │        │   Dashboard SOC        │
│  PSI drift / KL div │        │  Dark UI · Chart.js    │
│  APScheduler 5min   │        │  Gauge · History       │
└─────────────────────┘        └────────────────────────┘
```

---

## 🔍 Typologies de fraude détectées

| Typologie | Description | Signal clé | AUC |
|-----------|-------------|------------|-----|
| **IRSF** | International Revenue Share Fraud — appels massifs vers des numéros premium internationaux | Ratio international élevé + activité nocturne | 0.99+ |
| **SMS Spam** | Campagnes de phishing SMS en masse (100+ SMS/heure) | Pic de vélocité SMS | 0.99+ |
| **SIM Swap** | Prise de contrôle de compte via remplacement de SIM | Voyage impossible + changement de contacts | 0.99+ |
| **Fraud Ring** | Réseau de collusion avec cycle d'appels | Co-localisation + centralité de graphe | **1.00** |
| **Mobile Money** | Fraude Orange Money / CashPlus | Vélocité de transactions | 0.97+ |
| **Stolen SIM** | Utilisation anormale après vol de SIM | Activité nocturne + sauts géographiques | 0.97+ |

---

## 📊 Performance des modèles

| Modèle | Type | AUC-ROC | AP | Notes |
|--------|------|---------|-----|-------|
| IsolationForest | Anomalie | 0.9706 | 0.6822 | `n_estimators=200` |
| LOF | Anomalie | 0.9764 | 0.8251 | `n_neighbors=20`, novelty=True |
| OneClassSVM | Anomalie | **0.9993** | **0.9851** | kernel RBF, sous-échantillon 10k |
| Ensemble classique | Combiné | 0.9933 | 0.9702 | IF=50% · LOF=30% · OCSVM=20% |
| Autoencoder | DL | 0.9984 | 0.9941 | 18→64→32→16→32→64→18 |
| GraphSAGE | GNN | **1.0000** | **1.0000** | Fraud rings : 136/136 (100%) |

### Latence Kafka Streaming

| Percentile | Latence |
|------------|---------|
| p50 | 35.3 ms |
| p95 | 55.9 ms |
| p99 | 69.2 ms |

---

## ⚡ Installation rapide

### Prérequis

- Python 3.11+
- pip 23+
- Docker & Docker Compose *(pour le streaming Kafka)*

### 1 — Cloner le dépôt

```bash
git clone https://github.com/<votre-pseudo>/mobile-fraud-detection-ai.git
cd mobile-fraud-detection-ai
```

### 2 — Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3 — Lancer le pipeline complet en une commande

```bash
python main.py
```

> **`main.py`** exécute automatiquement les 14 étapes dans l'ordre : génération des données → ETL → features → entraînement → API.

### 4 — Ouvrir le dashboard

```
http://localhost:8000/dashboard
```

---

## 🔧 Utilisation du pipeline complet

### Lancement étape par étape

```bash
# Lister toutes les étapes disponibles
python main.py --list

# Exécuter une étape spécifique
python main.py --step 3

# Exécuter de l'étape N à l'étape M
python main.py --step 1 --end 6

# Lancer uniquement l'API
python main.py --api
```

### Étapes du pipeline

| # | Nom | Script |
|---|-----|--------|
| 1 | Génération de données | `src/data_generation/generate_dataset.py` |
| 2 | ETL Pipeline | `src/etl/etl_pipeline.py` |
| 3 | Feature Engineering | `src/features/feature_engineering.py` |
| 4 | Entraînement ML classique | `src/models/classical/train_classical.py` |
| 5 | Entraînement Autoencoder | `src/models/autoencoder/autoencoder.py` |
| 6 | Construction du graphe | `src/models/gnn/build_graph.py` |
| 7 | Entraînement GraphSAGE | `src/models/gnn/train_gnn.py` |
| 8 | Génération des plots | `src/dashboards/generate_plots.py` |
| 9–14 | Streaming, API, Monitoring | scripts respectifs |

---

## 🌐 API REST

### Lancer l'API

```bash
uvicorn src.api.fraud_api:app --host 0.0.0.0 --port 8000 --workers 2
# ou via main.py :
python main.py --api
```

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/score/event` | Scorer un événement CDR unique |
| `POST` | `/score/batch` | Scorer un lot d'événements CDR |
| `GET` | `/health` | Statut du service et des modèles |
| `GET` | `/metrics` | Métriques Prometheus |
| `GET` | `/fraud/network/{user_id}` | Graphe de réseau de fraude pour un utilisateur |
| `GET` | `/dashboard` | Dashboard web SOC |
| `GET` | `/docs` | Documentation Swagger interactive |

### Exemple — Scorer un événement

```bash
curl -X POST http://localhost:8000/score/event \
  -H "Content-Type: application/json" \
  -d '{
    "caller_id":         "+212612345678",
    "receiver_id":       "+212712345679",
    "timestamp":         "2024-01-15T10:30:00",
    "call_duration_sec": 120,
    "call_type":         "VOICE",
    "cell_tower_id":     "TOWER_001",
    "country_code":      "MA",
    "latitude":          33.5731,
    "longitude":         -7.5898,
    "roaming_flag":      false
  }'
```

**Réponse :**

```json
{
  "fraud_score": 0.1234,
  "decision": "NORMAL",
  "triggered_rules": [],
  "model_scores": {
    "isolation_forest": 0.11,
    "lof":              0.09,
    "ocsvm":            0.14,
    "autoencoder":      0.08,
    "gnn":              0.12
  },
  "processing_time_ms": 4.2,
  "request_id": "req_abc123"
}
```

### Seuils de décision

| Score | Décision | Couleur |
|-------|----------|---------|
| < 0.50 | `NORMAL` | 🟢 Vert |
| 0.50 – 0.75 | `SUSPICIOUS` | 🟡 Ambre |
| > 0.75 | `FRAUD` | 🔴 Rouge |

---

## 🐳 Déploiement Docker

### Infrastructure Kafka

```bash
docker-compose -f docker/docker-compose-kafka.yml up -d
# Services : Zookeeper, Kafka, Schema Registry, Kafka UI (port 8090)
```

### Stack complète (7 services)

```bash
docker-compose -f docker/docker-compose.yml up -d
# Services : fraud-api, cdr-producer, feature-processor,
#            fraud-scorer, prometheus, grafana, alertmanager
```

### Configuration de l'environnement

```bash
cp docker/.env.example docker/.env
# Éditer les variables : KAFKA_BOOTSTRAP, FRAUD_THRESHOLD, MODEL_DIR, etc.
```

**Variables clés :**

```bash
KAFKA_BOOTSTRAP=localhost:9092
FRAUD_THRESHOLD=0.75          # Seuil de décision FRAUD
FRAUD_THRESHOLD_HIGH=0.85     # Seuil haute confiance
LOG_LEVEL=INFO
API_WORKERS=2
MODEL_DIR=models/
```

---

## 📁 Structure du projet

```
mobile_fraud_detection_ai/
│
├── 📂 data/
│   ├── raw/                    # CDRs + transactions CSV générés
│   └── processed/              # Features Parquet + graphe fraud .pt
│
├── 📂 docs/
│   └── fraud_patterns.md       # Documentation des 6 typologies de fraude
│
├── 📂 docker/
│   ├── Dockerfile              # Build multi-stage, utilisateur non-root
│   ├── docker-compose.yml      # Stack complète (7 services)
│   ├── docker-compose-kafka.yml
│   └── .env.example
│
├── 📂 logs/
│   ├── fraud_alerts.jsonl      # Alertes fraude en temps réel
│   └── monitoring.jsonl        # Métriques MLOps
│
├── 📂 models/
│   ├── classical/              # IsolationForest, LOF, OCSVM, scaler
│   ├── autoencoder/            # autoencoder.pt (seuil intégré)
│   └── gnn/                    # graphsage_fraud.pt, embeddings.npy
│
├── 📂 plots/                   # ROC, PR, t-SNE, graphes réseau
│
├── 📂 src/
│   ├── api/
│   │   ├── fraud_api.py        # Application FastAPI (lifespan, Prometheus)
│   │   └── dashboard.py        # Dashboard SOC HTML/CSS/JS
│   ├── dashboards/
│   │   └── generate_plots.py   # 8 visualisations matplotlib/seaborn
│   ├── data_generation/
│   │   └── generate_dataset.py # 100k CDR + 50k TXN avec injections de fraude
│   ├── etl/
│   │   └── etl_pipeline.py     # Normalisation, validation, enrichissement
│   ├── features/
│   │   └── feature_engineering.py  # Vélocité, géo, comportemental, proxy graphe
│   ├── models/
│   │   ├── autoencoder/
│   │   │   └── autoencoder.py  # PyTorch AE + CosineAnnealingLR
│   │   ├── classical/
│   │   │   └── train_classical.py  # Modèles anomalie non supervisés
│   │   └── gnn/
│   │       ├── build_graph.py  # Arêtes CALLED + TRANSFERRED + SAME_TOWER
│   │       └── train_gnn.py    # GraphSAGE custom (sans PyTorch Geometric)
│   ├── monitoring/
│   │   └── monitor.py          # Dérive PSI, KL divergence, APScheduler
│   └── streaming/
│       ├── cdr_producer.py     # Kafka producer + mode simulation
│       ├── feature_processor.py # SlidingWindowState + features temps réel
│       └── fraud_scorer.py     # ModelEnsemble + FraudAlertLogger
│
├── 📂 tests/
│   ├── test_data_generation.py # 20 tests : MSISDN, CDR, injection fraude
│   ├── test_etl.py             # 20 tests : normalisation, schéma, temporel
│   ├── test_features.py        # 28 tests : haversine, vélocité, géo, comportemental
│   ├── test_models.py          # 22 tests : classique + autoencoder + GNN
│   ├── test_gnn.py             # 20 tests : SAGEConv, graphe, embeddings
│   ├── test_streaming.py       # 19 tests : producer, fenêtre, scorer, logger
│   ├── test_api.py             # 23 tests : health, score, batch, métriques
│   └── conftest.py             # Fixtures partagées et marqueurs pytest
│
├── main.py                     # Point d'entrée — toutes les étapes
├── requirements.txt
├── pytest.ini
└── README.md
```

---

## 🧠 Ingénierie des features

Le module `feature_engineering.py` produit **58 features** en 5 groupes :

| Groupe | Features | Nb |
|--------|----------|----|
| **A — Vélocité** | appels/SMS 5min/1h/24h, contacts uniques, SMS ratio | 7 |
| **B — Géographique** | vitesse km/h, changement de pays, entropie tours, distance haversine | 4 |
| **C — Comportemental** | ratio international, ratio nocturne, durée moyenne, ratio SMS/voix, nouveaux contacts | 5 |
| **D — Mobile Money** | vélocité transactions, montant élevé, pression pairs | 3+ |
| **E — Proxy Graphe** | centralité de degré, coefficient de clustering, proxy intermédiaire | 3 |

```python
# Exemple d'utilisation
from src.features.feature_engineering import (
    compute_velocity_features,
    compute_geo_features,
    compute_behavioral_features,
    normalize_features,
    FEATURE_COLS_CDR,
)

df_features, scaler = normalize_features(df, FEATURE_COLS_CDR, fit=True)
```

---

## 📡 MLOps & Monitoring

Le démon de monitoring (`src/monitoring/monitor.py`) s'exécute toutes les **5 minutes** et surveille :

| Métrique | Seuil warning | Seuil critique |
|----------|--------------|----------------|
| **PSI** (dérive des features) | > 0.10 | > 0.20 |
| **KL Divergence** (scores modèles) | > 0.05 | — |
| **Taux d'alertes fraude** (1h / 24h) | > 10% | > 20% |
| **Lag Kafka** (par topic) | > 1000 msgs | > 5000 msgs |
| **Latence API** p95 | > 100 ms | > 200 ms |

```bash
# Exécuter un cycle de monitoring unique
python src/monitoring/monitor.py --once

# Lancer le démon continu (intervalle 5 min)
python src/monitoring/monitor.py
```

**Exemple de sortie monitoring :**
```
[MONITOR] PSI avg=0.0002 | KL max=0.0027 | Alerts 1h=3.63% 24h=2.10%
[MONITOR] Kafka lag=36   | p50=11.9ms p95=26.6ms p99=38.3ms
```

---

## 🧪 Tests

La suite de tests couvre l'ensemble du pipeline avec **187 tests** répartis en 7 fichiers.

```bash
# Lancer tous les tests
pytest tests/ -v

# Avec rapport de couverture HTML
pytest tests/ --cov=src --cov-report=html
# Rapport : htmlcov/index.html

# Fichier spécifique
pytest tests/test_gnn.py -v

# Ignorer les tests lents
pytest tests/ -m "not slow"

# Ignorer les tests nécessitant des modèles entraînés
pytest tests/ -m "not requires_models"
```

**Résultats :**

```
========================= test session results =========================
tests/test_data_generation.py  ✅  20 passed
tests/test_etl.py              ✅  20 passed
tests/test_features.py         ✅  28 passed
tests/test_models.py           ✅  22 passed
tests/test_gnn.py              ✅  20 passed
tests/test_streaming.py        ✅  19 passed
tests/test_api.py              ✅  23 passed
========================================================================
187 passed, 1 skipped, 0 failed in ~12s
```

---

## 🇲🇦 Contexte télécom marocain

Ce système est conçu pour les spécificités du marché marocain :

| Aspect | Détail |
|--------|--------|
| **Format téléphone** | E.164 `+212XXXXXXXXX` (préfixe 06/07) |
| **Opérateurs** | Maroc Telecom, Orange Maroc, Inwi |
| **Mobile money** | Orange Money, CashPlus |
| **Tours cellulaires** | 20 coordonnées réelles de villes marocaines (Casablanca, Rabat, Marrakech, Fès, Tanger…) |
| **Destinations IRSF** | Îles Pacifiques (+882), Somalie (+252), Guinée (+224), Comores (+269)… |
| **Fuseau horaire** | UTC+1 (sans heure d'été) |

---

## 🛠️ Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Langage | Python | 3.11+ |
| ML Framework | Scikit-learn | 1.3+ |
| Deep Learning | PyTorch | 2.0+ |
| Graph ML | GraphSAGE custom | — |
| API | FastAPI + Pydantic v2 | 0.104+ |
| Streaming | Apache Kafka (confluent-kafka) | 2.x |
| Monitoring | Prometheus + APScheduler | — |
| Sérialisation | PyArrow / Parquet | — |
| Conteneurisation | Docker + Docker Compose | — |
| Tests | pytest + pytest-asyncio | — |
| Visualisation | matplotlib, seaborn, Chart.js | — |

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. **Forkez** le dépôt
2. **Créez** une branche pour votre feature : `git checkout -b feature/ma-feature`
3. **Committez** vos changements : `git commit -m "feat: ajouter ma feature"`
4. **Pushez** : `git push origin feature/ma-feature`
5. **Ouvrez** une Pull Request

### Idées d'améliorations

- [ ] Intégration d'un modèle de langage (LLM) pour la génération automatique de rapports d'alerte
- [ ] Support de données CDR en format ASN.1 (format standard opérateur)
- [ ] Connexion à une vraie base de données (PostgreSQL / TimescaleDB)
- [ ] Interface d'annotation manuelle pour le feedback des analystes
- [ ] Export des alertes vers SIEM (Splunk, Elastic)
- [ ] Support multi-tenant (plusieurs opérateurs)

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

<div align="center">

Construit avec ❤️ pour la détection de fraude télécom en Afrique du Nord

**Mobile Fraud Detection AI**
*by* **Amine Ait Ali** · Data & AI Engineer

[![GitHub](https://img.shields.io/badge/GitHub-amine--LabsCraft-181717?style=flat&logo=github)](https://github.com/amine-LabsCraft)
[![Portfolio](https://img.shields.io/badge/Portfolio-amine--aitali--5752.netlify.app-00C7B7?style=flat&logo=netlify&logoColor=white)](https://amine-aitali-5752.netlify.app/)

**[⬆ Retour en haut](#mobile-fraud-detection-ai)**

</div>
