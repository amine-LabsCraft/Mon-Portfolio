<p align="center">
  <img src="docs/assets/banner.png" alt="InsightLens Enterprise" width="100%"/>
</p>

<h1 align="center">InsightLens Enterprise v3.0</h1>

<p align="center">
  <strong>Plateforme d'analyse de données propulsée par l'IA — 100% locale, 0% cloud.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.1-22c55e?style=flat-square" alt="Version"/>
  <img src="https://img.shields.io/badge/tests-106%20passed-22c55e?style=flat-square" alt="Tests"/>
  <img src="https://img.shields.io/badge/cloud-0%25-22c55e?style=flat-square" alt="Cloud"/>
  <img src="https://img.shields.io/badge/license-Enterprise-333?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/IA-Ollama-blue?style=flat-square" alt="Ollama"/>
  <img src="https://img.shields.io/badge/architecture-ES6%20natif-yellow?style=flat-square" alt="ES6"/>
</p>

<br/>

<p align="center">
  <em>Le vrai sujet n'est pas de choisir entre IA et confidentialité. On peut avoir les deux.</em>
</p>

---

<br/>

## 🔍 Le problème

La plupart des outils d'analyse de données envoient vos fichiers vers des serveurs distants. Fichiers clients, données financières, données RH — tout transite par le cloud. Pour les entreprises soucieuses de la souveraineté de leurs données, **c'est un risque inacceptable.**

**InsightLens Enterprise** résout ce problème. L'IA tourne directement sur votre poste via [Ollama](https://ollama.com). Vos données ne quittent jamais votre machine. Jamais.

<br/>

## ✨ Fonctionnalités

<table>
  <tr>
    <td width="50%">

### 📊 Analyse & Visualisation
- **Auto-profiling** — Analyse automatique dès le chargement du fichier : types de colonnes, stats clés, 3 graphiques générés instantanément
- **8 types de graphiques** — Bar, Line, Scatter, Pie, Histogram, Waterfall, BoxPlot, Bullet
- **Dashboard synthétique** — 4 à 6 graphiques en grille générés en un clic
- **Cross-filtering réactif** — Cliquez sur une barre, tous les graphiques se filtrent
- **Détection d'anomalies** — Z-Score, IQR (Tukey), spikes >50% entre valeurs consécutives

</td>
    <td width="50%">

### 🤖 Intelligence Artificielle
- **IA 100% locale** — Ollama + llama3.2:3b par défaut, compatible tous modèles
- **Streaming token/token** — Réponses en temps réel avec curseur clignotant
- **Mémoire contextuelle** — Définitions métier, insights, contexte projet persistants
- **Forecasting** — Régression linéaire, projection N périodes, r², IC à 95%
- **Statistiques avancées** — Médiane, Q1/Q3, skewness, écart-type, corrélation Pearson

</td>
  </tr>
  <tr>
    <td width="50%">

### 📁 Import Multi-Format
- **CSV** — Détection automatique du séparateur, gestion BOM UTF-8/16/32
- **Excel** — XLSX/XLS via SheetJS, exclusion automatique des lignes TOTAL/SOMME
- **JSON** — Normalisation des structures imbriquées, collecte exhaustive des headers
- **TXT** — Détection automatique (`|`, `\t`, `;`, `,`), nettoyage des décorations
- **Jusqu'à 50 MB** par fichier

</td>
    <td width="50%">

### 📤 Export & Persistance
- **Export PDF** — Rapport complet (données + conversation + graphiques) via jsPDF
- **Export PowerPoint** — Slides couverture, graphiques capturés, insights extraits
- **Export session** — Sauvegarde `.insight` (JSON structuré) rechargeable
- **Historique persistant** — Conversations sauvegardées en LocalStorage
- **Téléchargement PNG** — Chaque graphique exportable individuellement

</td>
  </tr>
</table>

<br/>

## 🚀 Démarrage rapide

### Prérequis

| Composant | Version minimale | Installation |
|:----------|:----------------|:-------------|
| Ollama | ≥ 0.3 | [ollama.com/download](https://ollama.com/download) |
| Navigateur | Chrome 90+ / Firefox 90+ | — |

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-org/insightlens-enterprise.git
cd insightlens-enterprise

# 2. Installer le modèle IA
ollama pull llama3.2:3b

# 3. Démarrer le serveur Ollama
ollama serve

# 4. Ouvrir l'application
# Ouvrir index.html dans votre navigateur
# Ou utiliser un serveur local :
python3 -m http.server 8080
```

```
→ Accéder à http://localhost:8080
→ Charger un fichier depuis demo/
→ Poser vos questions
```

> **Note** : Aucun `npm install`, aucun bundler, aucun build. L'application utilise des modules ES6 natifs.

<br/>

## 🏗️ Architecture

```
insightlens-enterprise/
│
├── index.html                          # Point d'entrée
│
├── assets/
│   ├── css/
│   │   ├── main.css                    # Variables CSS, layout, typographie
│   │   ├── components.css              # Boutons, toasts, panneau settings
│   │   ├── chat.css                    # Messages, streaming, suggestions
│   │   └── charts.css                  # Graphiques, dashboard, cross-filtering
│   │
│   └── js/
│       ├── app.js                      # Bootstrap, event listeners, upload queue
│       │
│       ├── config/
│       │   ├── constants.js            # Constantes globales
│       │   ├── ollamaConfig.js         # URL, modèle, température, contexte
│       │   └── chartDefaults.js        # Thème Chart.js dark enterprise
│       │
│       └── modules/
│           ├── storageManager.js       # LocalStorage — historique & sessions
│           ├── memoryManager.js        # Mémoire persistante — contexte métier
│           ├── fileManager.js          # Parsing CSV / Excel / JSON / TXT
│           ├── dataEngine.js           # Stats, anomalies, régression, corrélation
│           ├── ollamaEngine.js         # API Ollama, prompts, streaming
│           ├── chartEngine.js          # 8 types de graphiques, cross-filtering
│           ├── pdfExporter.js          # Export PDF (jsPDF)
│           ├── pptxExporter.js         # Export PowerPoint (PptxGenJS)
│           ├── uiController.js         # Interface, toasts, panneau settings
│           └── chatEngine.js           # Orchestrateur — parsing réponses IA
│
├── demo/
│   ├── sales_data.csv                  # 150 lignes — données de ventes
│   ├── hr_data.csv                     # 150 lignes — données RH
│   └── financial_data.json             # 12 mois — données financières
│
├── templates/
│   └── system-prompt.md                # Documentation des prompts système
│
├── docs/
│   └── assets/                         # Images documentation
│
├── OLLAMA_SETUP.md                     # Guide d'installation Ollama
├── DEPLOY.md                           # Guide de déploiement
├── CHANGELOG.md                        # Historique complet des versions
└── README.md                           # ← Vous êtes ici
```

<br/>

## ⚙️ Configuration

Toute la configuration Ollama est centralisée dans `assets/js/config/ollamaConfig.js` :

```javascript
export const OLLAMA_CONFIG = {
  baseUrl: 'http://localhost:11434',    // URL du serveur Ollama
  model: 'llama3.2:3b',                // Modèle par défaut
  options: {
    temperature: 0.3,                   // 0.1 = précis  →  1.0 = créatif
    num_ctx: 4096,                      // Fenêtre de contexte (tokens)
    num_predict: 1024                   // Longueur max de réponse
  }
};
```

### Modèles recommandés

| Modèle | Taille | RAM requise | Usage |
|:-------|:-------|:------------|:------|
| `llama3.2:3b` | 2 GB | 4 GB | **Défaut** — Rapide, bon équilibre |
| `llama3.1:8b` | 4.7 GB | 8 GB | Analyse approfondie |
| `mistral:7b` | 4.1 GB | 8 GB | Excellentes capacités analytiques |
| `codellama:7b` | 3.8 GB | 8 GB | Requêtes orientées data/code |
| `llama3.1:70b` | 40 GB | 48 GB | Performances maximales |

### Serveur distant (intranet)

Pour un déploiement multi-poste, pointez vers un serveur Ollama partagé :

```javascript
baseUrl: 'http://192.168.1.100:11434'   // Serveur Ollama intranet
```

<br/>

## 🛡️ Sécurité & Confidentialité

InsightLens a été conçu avec la confidentialité comme **principe fondamental**, pas comme une fonctionnalité ajoutée.

| Aspect | Garantie |
|:-------|:---------|
| Transfert de données | **Aucun** — Tout reste sur le poste local |
| API cloud | **Aucune** — Pas d'OpenAI, pas d'Anthropic, pas de Google |
| Clé API | **Aucune requise** |
| Télémétrie | **Aucune** — Zéro tracking, zéro analytics |
| Dépendance réseau | **Aucune** — Fonctionne hors-ligne (après installation Ollama) |
| Stockage | **LocalStorage navigateur** — Effaçable à tout moment |

<br/>

## 🧪 Tests

La v3.0.1 est couverte par **106 tests** répartis sur 11 groupes :

```
 ✅  T-CSV    15/15    Parsing CSV, BOM, séparateurs, encodages
 ✅  T-XLS    12/12    Parsing Excel, types de colonnes, lignes TOTAL
 ✅  T-JSON   10/10    Normalisation JSON, structures imbriquées
 ✅  T-TXT     8/8     Parsing TXT, détection séparateurs
 ✅  T-CHART  15/15    8 types de graphiques, cross-filtering
 ✅  T-AI     10/10    Prompts Ollama, streaming, parsing balises
 ✅  T-DASH    6/6     Dashboard, sélection colonnes, layout
 ✅  T-EXP     6/6     Export PDF, PPTX, session .insight
 ✅  T-PERS    4/4     Mémoire persistante, contexte métier
 ✅  T-UX     14/14    Interface, toasts, palette commandes, scroll
 ✅  T-PERF    6/6     Performance, fichiers volumineux, mémoire
 ─────────────────────────────────────────────────────────
 TOTAL       106/106   ✅ ALL PASSED
```

<br/>

## 📋 Pile technologique

| Composant | Technologie | Version | Rôle |
|:----------|:-----------|:--------|:-----|
| IA locale | Ollama | ≥ 0.3 | Serveur de modèles LLM |
| Modèle par défaut | llama3.2 | 3b | Génération de texte et analyse |
| Graphiques | Chart.js | 4.4 | Visualisation de données |
| CSV parsing | PapaParse | 5.4 | Import fichiers CSV |
| Excel parsing | SheetJS | 0.18 | Import fichiers XLSX/XLS |
| PDF export | jsPDF | 2.5 | Génération de rapports PDF |
| PPTX export | PptxGenJS | 3.12 | Génération de présentations |
| Typographie | IBM Plex | Google CDN | Police d'interface |
| Icônes | FontAwesome | 6.5 | Iconographie UI |
| Architecture | ES6 Modules | Natif | Aucun bundler requis |

<br/>

## 📦 Versioning

Ce projet suit le [Semantic Versioning](https://semver.org/lang/fr/). Consultez le [CHANGELOG.md](CHANGELOG.md) pour l'historique complet.

| Version | Date | Changements clés |
|:--------|:-----|:-----------------|
| **3.0.1** | 2026-03-29 | 12 corrections critiques, 106 tests validés |
| **3.0.0** | 2026-03-29 | Auto-profiling, cross-filtering, mémoire, anomalies, dashboard, forecasting, 5 nouveaux graphiques, export PPTX, palette de commandes |
| **2.0.0** | 2025-03-28 | Migration vers Ollama, architecture 100% front-end |
| **1.5.0** | 2024-11-15 | Support Excel, export session |
| **1.0.0** | 2024-01-20 | Version initiale — CSV, chat IA, graphiques basiques |

<br/>

## 🤝 Contribuer

1. Forkez le dépôt
2. Créez votre branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m 'feat: description'`)
4. Poussez vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

Merci de respecter la convention de commits [Conventional Commits](https://www.conventionalcommits.org/).

<br/>

## 📄 Licence

Usage interne entreprise. Données confidentielles traitées exclusivement en local.

---

<p align="center">
  <strong>InsightLens Enterprise</strong> — L'analyse de données, sans compromis sur la confidentialité.
</p>

<p align="center">
  <sub>Conçu avec rigueur. Propulsé par Ollama. Aucune donnée ne quitte votre poste.</sub>
</p>
