# 🧪 Data Preprocessing Lab

> **Suite pédagogique interactive pour la préparation des données en Machine Learning**
> Standardisation · Normalisation · Data Cleaning — 100% HTML/CSS/JS, zéro backend.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](.)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](.)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)](.)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4.1-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![No Backend](https://img.shields.io/badge/Backend-None-lightgrey)](.)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9C%93-brightgreen)](.)

---

## 📋 Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Les 3 outils](#-les-3-outils)
  - [Standardisation v3.0](#1-standardisation-v30)
  - [Normalisation v4.0](#2-normalisation-v40)
  - [Data Cleaning v2.0](#3-data-cleaning-v20)
- [Fonctionnalités communes](#-fonctionnalités-communes)
- [Diagnostic automatique](#-diagnostic-automatique)
- [Les 9 méthodes couvertes](#-les-9-méthodes-couvertes)
- [Structure du projet](#-structure-du-projet)
- [Installation et utilisation](#-installation-et-utilisation)
- [Aperçu technique](#-aperçu-technique)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## 🎯 Aperçu du projet

**Data Preprocessing Lab** est une suite de 3 outils éducatifs entièrement autonomes — chaque fichier HTML s'ouvre directement dans un navigateur sans aucune installation, serveur ou dépendance backend.

L'objectif est de rendre **visuellement compréhensible** l'impact de chaque transformation sur les données : chaque outil affiche un aperçu avant/après avec statistiques, histogrammes et explications pédagogiques détaillées.

```
┌─────────────────────────────────────────────────────────────┐
│                   DATA PREPROCESSING LAB                    │
├──────────────────┬──────────────────┬───────────────────────┤
│  Standardisation │   Normalisation  │     Data Cleaning     │
│     v3.0         │      v4.0        │        v2.0           │
│                  │                  │                       │
│  4 méthodes      │  6 méthodes      │  11 catégories        │
│  Diagnostic IA   │  Diagnostic IA   │  Datasets intégrés    │
│  Import CSV      │  Import CSV      │  Avant / Après        │
└──────────────────┴──────────────────┴───────────────────────┘
```

---

## 🛠 Les 3 outils

### 1. Standardisation v3.0

**Fichier :** `standardisation_v3.html`

Transforme des données numériques pour les centrer autour de 0 avec un écart-type de 1 (ou selon la méthode choisie). Inclut un **moteur de diagnostic automatique** qui analyse les propriétés statistiques de vos données et recommande la méthode optimale avec une explication détaillée.

#### Méthodes disponibles

| # | Méthode | Formule | Usage recommandé |
|---|---------|---------|-----------------|
| 01 | **Z-Score** | `(X - μ) / σ` | ML classique, SVM, PCA, données symétriques |
| 02 | **Robust Scaler** | `(X - médiane) / IQR` | Données avec outliers, finance, capteurs |
| 03 | **Mean Normalization** | `(X - μ) / (max - min)` | Recherche académique, comparaisons |
| 04 | **Unit Vector** | `X / ‖X‖` (L1 ou L2) | NLP, similarité cosinus, embeddings |

#### Modes d'entrée

- **Liste simple** — saisie directe de valeurs séparées par des virgules
- **Colonnes manuelles** — plusieurs colonnes avec noms personnalisables
- **Import CSV** — drag & drop ou clic, séparateur auto-détecté (`,` `;` `\t`)
- **Coller depuis Excel/Sheets** — débouncé, parsing tabulations

---

### 2. Normalisation v4.0

**Fichier :** `normalisation_v4.html`

Met les features à la même échelle dans un intervalle défini. Version la plus avancée de la suite, avec notamment l'implémentation **Hyndman-Fan type 7** pour le calcul des quantiles avec gestion des égalités (tie-aware average-rank).

#### Méthodes disponibles

| # | Méthode | Formule | Plage résultat |
|---|---------|---------|----------------|
| 01 | **Min-Max** | `(X - min) / (max - min)` | `[0, 1]` ou `[-1, 1]` |
| 02 | **MaxAbs** | `X / max|X|` | `[-1, 1]` — préserve le signe |
| 03 | **Robust Scaler** | `(X - médiane) / IQR` | Non borné |
| 04 | **Quantile uniforme** | rang percentile (Hyndman-Fan 7) | `[0, 1]` |
| 05 | **Quantile normal** | `Φ⁻¹(F(X))` (approx. Beasley-Springer-Moro) | Gaussien |
| 06 | **Decimal Scaling** | `X / 10^k` avec `k = ceil(log10(max|X|))` | `[-1, 1]` |

#### Améliorations v4.0

- Calcul des quantiles par **interpolation linéaire** (Hyndman-Fan type 7) — plus précis que l'indexage direct
- **Sélection de colonne par onglet** — chaque onglet (liste, CSV, paste) maintient son propre état `selCol`, sans variable globale partagée
- **Fallback IQR = 0** dans Robust Scaler — utilise `σ` comme diviseur de secours + warning visible
- **7 méthodes** dans la comparaison (dont Min-Max [-1,1] et Quantile Normal)
- Export CSV via `Blob + URL.createObjectURL` (compatible Firefox)

---

### 3. Data Cleaning v2.0

**Fichier :** `data_cleaning_v2.html`

Outil pédagogique dédié au nettoyage de données. Présente **11 catégories** de problèmes courants avec des datasets réels intégrés, une sélection de méthode par catégorie, et un affichage **avant/après** avec cellules colorées selon le type de correction appliquée.

#### Les 11 catégories

| # | Catégorie | Méthodes disponibles |
|---|-----------|----------------------|
| 01 | **Valeurs manquantes** | Suppression, moyenne, médiane, mode, constante |
| 02 | **Doublons** | Détection & suppression (clé null-safe, déduplication canonique) |
| 03 | **Outliers** | Suppression IQR, capping (winsorisation), remplacement médiane |
| 04 | **Erreurs de type** | Conversion `string → number` automatique |
| 05 | **Texte inconsistant** | Minuscules, majuscules, capitalisation |
| 06 | **Espaces parasites** | Trim sur toutes les colonnes textuelles |
| 07 | **Log transform** | `log(1 + X)` pour distributions étalées à droite |
| 08 | **Standardisation** | Z-Score pour variables multi-échelles |
| 09 | **Données temporelles** | Parsing multi-formats ISO, extraction (année/mois/jour), calcul d'écarts, forward/backward fill |
| 10 | **Encodage catégoriel** | One-Hot Encoding, Label Encoding, encodage par fréquence relative |
| 11 | **Cohérence sémantique** | Âges hors bornes [0-120], salaires négatifs, dates d'embauche < naissance |

#### Datasets pédagogiques intégrés

| Dataset | Catégorie | Description |
|---------|-----------|-------------|
| `students_missing` | Valeurs manquantes | 12 étudiants, colonnes âge/note/salaire_stage avec nulls |
| `medical_missing` | Valeurs manquantes | 10 patients, colonnes tension/poids/glycémie |
| `sales_dup` | Doublons | 12 ventes avec lignes identiques répétées |
| `salary_outlier` | Outliers | Salaires avec valeurs aberrantes (520k€, -8k€) |
| `products_type` | Erreurs de type | Prix/stock stockés en string |
| `employees_text` | Texte inconsistant | Noms/genres/pays en casse mixte |
| `clients_spaces` | Espaces | Noms/emails avec espaces parasites |
| `revenue_log` | Log transform | Revenus entreprises (8 500 → 95 000 000) |
| `sensors_scale` | Standardisation | 4 capteurs : temp_C, pression_Pa, humidité, CO₂ |
| `dates_mixed` | Dates | 4 formats différents dans la même colonne |
| `categories_encoding` | Encodage | Produits avec catégorie/marque/région |
| `semantic_errors` | Cohérence | Âges négatifs, salaires < 0, dates incohérentes |

---

## ⚙️ Fonctionnalités communes

Tous les outils partagent les mêmes fonctionnalités d'entrée/sortie :

### Import de données

```
┌─────────────────────────────────────────────────────────┐
│  LISTE SIMPLE  │  COLONNES  │  CSV  │  COLLER TABLEAU   │
├─────────────────────────────────────────────────────────┤
│  10, 20, 30... │  A: 1,2,3  │  .csv │  Ctrl+V Excel     │
│                │  B: 4,5,6  │  .txt │  Google Sheets    │
│  Presets :     │            │       │  LibreOffice      │
│  Lineaire      │  N colonnes│  Drag │                   │
│  Outlier       │  Noms libres│  Drop │  Tabulations auto │
│  Fibonacci     │            │       │  detectees        │
│  Aleatoire     │            │  ; , TAB auto             │
└─────────────────────────────────────────────────────────┘
```

### Résultats affichés

- **Tableau de statistiques** avant/après (n, μ, σ, médiane, min, max, IQR, Q1/Q3, outliers)
- **Histogrammes** avant/après via Chart.js (bins adaptatifs √n, clampés [4, 12])
- **Vérification automatique** des propriétés (μ=0 ?, σ=1 ?, ‖X‖=1 ?, min=0 ?)
- **Comparaison** toutes méthodes simultanément
- **Export CSV** avec BOM UTF-8 (compatible Excel Windows)

---

## 🤖 Diagnostic automatique

Les outils Standardisation et Normalisation intègrent un **moteur de diagnostic** qui :

1. Calcule les statistiques clés : skewness, kurtosis (excès), comptage outliers IQR×1.5, présence de valeurs négatives, magnitude max
2. Attribue un **score /100** à chaque méthode selon les propriétés des données
3. Génère un **arbre de décision** pas à pas expliquant le raisonnement
4. Explique **pourquoi les autres méthodes sont moins adaptées** (avec leur score)
5. Propose d'**appliquer directement** la méthode recommandée

```
Arbre de décision (exemple — données avec outlier) :
─────────────────────────────────────────────────────
[?] Y a-t-il des outliers ? (IQR × 1.5)
    → OUI — 1 valeur hors bornes : [1000.0]

[Y] Outliers détectés → Z-Score sera biaisé
    La moyenne est tirée vers les extrêmes.
    On passe aux méthodes robustes.

[?] Distribution très asymétrique ? skewness = 2.84
    → OUI — Quantile sera plus puissant

[✓] ROBUST SCALER recommandé (score: 88/100)
    Médiane = 55.0, IQR = 40.0 — insensibles aux extrêmes.
─────────────────────────────────────────────────────
```

---

## 📐 Les 9 méthodes couvertes

| Méthode | Formule | Outil(s) | Score ML typique |
|---------|---------|----------|-----------------|
| Z-Score | `(x−μ)/σ` | Standardisation | ⭐⭐⭐⭐⭐ |
| Robust Scaler | `(x−med)/IQR` | Standardisation + Normalisation | ⭐⭐⭐⭐⭐ |
| Min-Max | `(x−min)/(max−min)` | Normalisation | ⭐⭐⭐⭐⭐ |
| MaxAbs | `x/max|x|` | Normalisation | ⭐⭐⭐⭐ |
| Quantile uniforme | rang percentile | Normalisation | ⭐⭐⭐⭐ |
| Quantile normal | `Φ⁻¹(F(x))` | Normalisation | ⭐⭐⭐⭐ |
| Mean Normalization | `(x−μ)/(max−min)` | Standardisation | ⭐⭐⭐ |
| Unit Vector | `x/‖x‖` (L1/L2) | Standardisation | ⭐⭐⭐ |
| Decimal Scaling | `x/10^k` | Normalisation | ⭐⭐ |

---

## 📁 Structure du projet

```
data-preprocessing-lab/
│
├── standardisation_v3.html      # Outil 1 — Standardisation (4 méthodes)
├── normalisation_v4.html         # Outil 2 — Normalisation (6 méthodes)
├── data_cleaning_v2.html         # Outil 3 — Data Cleaning (11 catégories)
│
└── README.md                     # Ce fichier
```

> Chaque fichier est **100% autonome** — aucune dépendance locale, aucun `npm install`, aucun serveur.
> La seule ressource externe est Chart.js chargée depuis `cdnjs.cloudflare.com`.

---

## 🚀 Installation et utilisation

### Option 1 — Ouvrir directement (recommandé)

```bash
# Cloner le dépôt
git clone https://github.com/amine-LabsCraft/data-preprocessing-lab.git

# Ouvrir un outil dans votre navigateur
open standardisation_v3.html       # macOS
xdg-open standardisation_v3.html   # Linux
start standardisation_v3.html      # Windows
```

Ou simplement **double-cliquer** sur n'importe quel fichier `.html`.

### Option 2 — Via un serveur local (optionnel)

Si vous souhaitez tester avec import de fichiers CSV locaux depuis certains navigateurs :

```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve .

# Ensuite ouvrir :
# http://localhost:8080/standardisation_v3.html
```

### Utilisation rapide

1. **Ouvrir** le fichier HTML dans votre navigateur
2. **Charger des données** — utiliser un preset ou coller vos propres valeurs
3. **Lancer le diagnostic** — cliquer sur "Diagnostic automatique"
4. **Appliquer et Exécuter** — la méthode recommandée est sélectionnée automatiquement
5. **Explorer les résultats** — statistiques, histogrammes, comparaison
6. **Exporter** — télécharger le CSV transformé

---

## 🔬 Aperçu technique

### Algorithmes implémentés

#### Calcul des quantiles (Normalisation v4)
Implémentation de la méthode **Hyndman-Fan type 7** (standard R et NumPy) :
```
h = (n - 1) × p
Q(p) = sorted[floor(h)] + (h - floor(h)) × (sorted[floor(h)+1] - sorted[floor(h)])
```

#### Inverse CDF normale (Quantile Normal)
Approximation **Beasley-Springer-Moro** — erreur < 1.5×10⁻⁸ sur [0, 1] :
```
Φ⁻¹(p) — approximation polynomiale rationnelle (9 coefficients)
Domaine de précision : [2.425×10⁻², 1 - 2.425×10⁻²]
Queues : approximation par série de Taylor
```

#### Détection des outliers
Méthode de **Tukey (IQR × 1.5)** :
```
Q1 = quantile(0.25)
Q3 = quantile(0.75)
IQR = Q3 - Q1
Borne basse = Q1 - 1.5 × IQR
Borne haute = Q3 + 1.5 × IQR
```

#### Skewness et kurtosis
Moments centrés d'ordre 3 et 4 :
```
Skewness = (1/n) × Σ((xᵢ - μ) / σ)³
Kurtosis (excès) = (1/n) × Σ((xᵢ - μ) / σ)⁴ - 3
```

### Architecture frontend

```
État global
├── tabData = { list, manual, csv, paste }
│   └── chaque onglet : { cols: [{name, vals}], selCol: 0 }
│       → isolation complète entre onglets, pas de variable partagée
│
├── SM (selected method), SA (approche), SR (range), SD (distribution)
│
└── _exportArr / _exportTrans
    → mis à jour uniquement par compute(), jamais par compareAll()
    → garantit que l'export correspond au dernier calcul affiché
```

### Sécurité XSS

Tous les noms de colonnes fournis par l'utilisateur (CSV, saisie manuelle) sont échappés avant insertion dans `innerHTML` :

```javascript
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

### Compatibilité navigateurs

| Navigateur | Support |
|------------|---------|
| Chrome 90+ | ✅ Complet |
| Firefox 88+ | ✅ Complet |
| Edge 90+ | ✅ Complet |
| Safari 14+ | ✅ Complet |
| Opera 76+ | ✅ Complet |

> **Note Firefox** : l'export CSV utilise `Blob + URL.createObjectURL` avec `appendChild/removeChild` autour du `click()` — la méthode standard `a.click()` sur élément non attaché au DOM est ignorée par Firefox.

---

## 🐛 Bugs connus et limitations

- Les **accentués** dans les noms de colonnes CSV peuvent s'afficher incorrectement si le fichier n'est pas encodé en UTF-8. Workaround : sauvegarder le CSV en UTF-8 depuis Excel (Fichier → Enregistrer sous → CSV UTF-8).
- Le **Diagnostic automatique** analyse uniquement la **première colonne sélectionnée** en cas de multi-colonnes.
- **Quantile Normal** peut produire des valeurs extrêmes (±4σ) pour les outliers prononcés — comportement attendu, pas un bug.
- Les **formules mathématiques** dans les tableaux utilisent des caractères Unicode (Φ, ‖, μ, σ) qui peuvent ne pas s'afficher sur certains terminaux mais sont corrects dans les navigateurs modernes.

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment participer :

```bash
# 1. Forker le dépôt
# 2. Créer une branche pour votre feature
git checkout -b feature/ma-nouvelle-methode

# 3. Committer vos changements
git commit -m "feat: ajout methode PowerTransformer (Box-Cox)"

# 4. Pousser la branche
git push origin feature/ma-nouvelle-methode

# 5. Ouvrir une Pull Request
```

### Idées de contributions

- [ ] **PowerTransformer** (Box-Cox / Yeo-Johnson) dans Normalisation
- [ ] **L-moments** comme alternative robuste aux moments classiques
- [ ] **Mode de comparaison multi-datasets** — appliquer la même méthode à plusieurs CSV
- [ ] **Export JSON** en plus du CSV
- [ ] **Internationalisation** (EN/FR toggle)
- [ ] **Tests unitaires** pour les algorithmes statistiques (Jest / Vitest)
- [ ] **Thème clair** en plus du thème sombre

### Standards de code

- **Pas de framework** — JS vanilla ES5 compatible (pas de `const`/`let` dans les boucles critiques)
- **Pas de `#` dans les couleurs hex** (héritage de la contrainte pptxgenjs — maintenu par cohérence)
- **Escape systématique** de toutes les données utilisateur avant `innerHTML`
- **`type="button"`** sur tous les `<button>` hors formulaire natif

---

## 📊 Cas d'usage

Ce projet est utile pour :

- 🎓 **Étudiants en data science** — comprendre visuellement l'impact de chaque transformation
- 👨‍🏫 **Enseignants** — illustrer les méthodes en cours avec des exemples interactifs
- 🔍 **Explorateur de données** — tester rapidement quelle méthode convient à un nouveau dataset
- 📝 **Présentations** — démontrer en direct la différence entre Z-Score et Robust sur des données réelles

---

<div align="center">

**Data Preprocessing Lab**  
*by* **Amine Ait Ali** · Data & AI Engineer

[![GitHub](https://img.shields.io/badge/GitHub-amine--LabsCraft-181717?style=flat&logo=github)](https://github.com/amine-LabsCraft)
[![Portfolio](https://img.shields.io/badge/Portfolio-amine--aitali--5752.netlify.app-00C7B7?style=flat&logo=netlify&logoColor=white)](https://amine-aitali-5752.netlify.app/)

[⬆ Retour en haut](#-data-preprocessing-lab)

</div>
