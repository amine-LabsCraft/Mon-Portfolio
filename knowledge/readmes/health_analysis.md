# 🩺 Analyseur de Bilan Sanguin — Édition Maroc

<p align="center">

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-Orchestration-1C3C3C?logo=langchain&logoColor=white)
![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.3%2070B-F55036)
![Streamlit](https://img.shields.io/badge/Streamlit-App-FF4B4B?logo=streamlit&logoColor=white)
![Type](https://img.shields.io/badge/Usage-Portfolio%20%2F%20Pédagogique-lightgrey)

</p>

> Pipeline LLM en deux étapes qui extrait automatiquement les valeurs anormales d'un bilan sanguin et génère un résumé de santé accompagné d'un plan alimentaire personnalisé, adapté aux habitudes alimentaires marocaines (tajine, couscous, harira, huile d'olive, thé à la menthe...).

> ⚠️ **Outil pédagogique / portfolio** — ne réalise aucun diagnostic médical et ne remplace en aucun cas l'avis d'un professionnel de santé. Voir [Limites & avertissement](#️-limites--avertissement).

---

## 📋 Sommaire

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture du pipeline](#️-architecture-du-pipeline)
- [Exemple de sortie](#-exemple-de-sortie)
- [Stack technique](#️-stack-technique)
- [Installation](#-installation)
- [Utilisation](#️-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Limites & avertissement](#️-limites--avertissement)
- [Pistes d'amélioration](#-pistes-damélioration)

---

## 🎯 Aperçu

Deux façons d'utiliser le projet :

| Point d'entrée | Description |
|---|---|
| **`app.py`** | Application interactive Streamlit — coller ou importer un bilan, obtenir résultats et plan alimentaire en quelques secondes |
| **`blood_work_analysis.ipynb`** | Notebook d'exploration montrant le pipeline étape par étape (prompts, parsing, structure de sortie) |

---

## ✨ Fonctionnalités

- **Extraction structurée (JSON)** de chaque valeur du bilan, avec statut `HIGH` / `LOW` / `NORMAL` déterminé à partir des normes indiquées dans le rapport lui-même
- **Résumé de santé** en langage simple et non technique
- **Plan alimentaire marocain** en deux sections claires : aliments à éviter / aliments à privilégier
- **Interface Streamlit** : copier-coller ou import de fichier `.txt`, tableau coloré par statut, export du rapport final en `.txt`
- **Gestion des erreurs** : vérification de la clé API au démarrage, messages d'erreur explicites en cas d'échec d'appel au modèle

---

## 🏗️ Architecture du pipeline

```
Bilan sanguin (texte brut)
        │
        ▼
┌───────────────────────────┐
│  Étape 1 — Extraction     │   → JSON strict :
│  (LLM, prompt structuré)  │     {"analyse", "valeur", "statut", "reference"}
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│  Étape 2 — Résumé & plan  │   → marqueurs ###RESUME### / ###PLAN###
│  alimentaire marocain     │
└───────────────────────────┘
        │
        ▼
Tableau coloré + résumé + plan alimentaire + rapport téléchargeable
```

**Point clé** par rapport à une première version du projet : les deux étapes s'appuient sur des **formats de sortie explicites et peu ambigus** — JSON strict pour l'étape 1, marqueurs `###RESUME###` / `###PLAN###` pour l'étape 2 — plutôt que sur un découpage de texte libre. Cela rend le parsing beaucoup plus fiable et évite de dépendre d'heuristiques fragiles sur la réponse brute du modèle.

---

## 💡 Exemple de sortie

Format JSON produit par l'étape 1 pour chaque valeur du bilan (schéma illustratif — données fictives) :

```json
{
  "analyse": "Cholestérol LDL",
  "valeur": "1.65 g/L",
  "statut": "HIGH",
  "reference": "0.00 - 1.60 g/L"
}
```

L'étape 2 consomme l'ensemble de ces objets pour produire un résumé et un plan alimentaire structurés autour des marqueurs `###RESUME###` / `###PLAN###`, que l'application Streamlit sépare ensuite pour l'affichage en tableau et en sections dédiées.

---

## ⚙️ Stack technique

| Composant | Rôle |
|---|---|
| Python 3.12 | Langage principal |
| LangChain + langchain-groq | Orchestration du pipeline LLM |
| Groq (Llama 3.3 70B) | Modèle de langage utilisé pour les deux étapes |
| Streamlit | Interface web interactive |
| pandas | Traitement et affichage tabulaire des résultats |
| python-dotenv | Gestion de la clé API via un fichier `.env` |

---

## 🚀 Installation

```bash
git clone <url-du-repo>
cd <nom-du-repo>

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

pip install -r requirements.txt
```

Crée un fichier `.env` à la racine du projet :

```
GROQ_API_KEY=ta_cle_api_groq
```

> Une clé API Groq gratuite peut être obtenue sur [console.groq.com](https://console.groq.com).

---

## ▶️ Utilisation

### Interface Streamlit

```bash
streamlit run app.py
```

Colle un bilan sanguin (ou importe le fichier `blood_work.txt` fourni en exemple), clique sur **Analyser**, et récupère le tableau des valeurs, le résumé de santé, le plan alimentaire, ainsi qu'un rapport téléchargeable.

### Notebook

```bash
jupyter notebook blood_work_analysis.ipynb
```

Utile pour comprendre ou modifier le pipeline étape par étape (prompts, parsing, structure de sortie) sans passer par l'interface.

---

## 📂 Structure du projet

```
├── app.py                       # Application Streamlit
├── blood_work_analysis.ipynb    # Notebook pipeline (exploration)
├── blood_work.txt               # Exemple de bilan sanguin (données fictives)
├── requirements.txt
└── README.md
```

---

## ⚠️ Limites & avertissement

Ce projet est un **outil pédagogique / portfolio**. Il ne réalise aucun diagnostic médical et ne remplace en aucun cas l'avis d'un professionnel de santé. Les données du fichier `blood_work.txt` sont fictives.

Autres limites connues :

- Le parsing JSON de l'étape 1 dépend de la qualité de la réponse du modèle ; en cas de réponse malformée, l'application affiche la réponse brute en secours plutôt que de planter.
- Le modèle (`llama-3.3-70b-versatile` via Groq) peut évoluer ou être déprécié ; vérifier la disponibilité du modèle sur la [documentation Groq](https://console.groq.com/docs/models).

---

## 🚧 Pistes d'amélioration

- [ ] Support de bilans sanguins au format PDF ou image (OCR)
- [ ] Historique des analyses (base de données locale)
- [ ] Interface multilingue (arabe / anglais / français)
- [ ] Tests unitaires sur les fonctions de parsing (`parse_extraction`, `split_diet_response`)
- [ ] Validation des sorties JSON avec un schéma (ex. Pydantic) plutôt qu'un simple `json.loads`

---

<div align="center">

**Analyseur de Bilan Sanguin — Édition Maroc**
*by* **Amine Ait Ali** · Data & AI Engineer

[![GitHub](https://img.shields.io/badge/GitHub-amine--LabsCraft-181717?style=flat&logo=github)](https://github.com/amine-LabsCraft)
[![Portfolio](https://img.shields.io/badge/Portfolio-amine--aitali--5752.netlify.app-00C7B7?style=flat&logo=netlify&logoColor=white)](https://amine-aitali-5752.netlify.app/)

If you found this repository useful, please consider giving it a ⭐ on GitHub.

</div>
