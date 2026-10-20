# 🛒 Audit Data Complet d'une Marketplace E-Commerce

## 📌 Présentation

Projet d'analyse avancée du dataset public **Olist Brazilian E-Commerce**, réalisé dans le cadre du module **Traitement de Données**.

L'objectif est de conduire un audit data complet d'une marketplace e-commerce réelle à partir de données transactionnelles multi-tables afin d'identifier les principaux leviers d'amélioration de la satisfaction client et de la performance globale de la plateforme.

---

## 🎯 Objectifs du projet

Cette étude répond à la question métier suivante :

> Si nous étions responsables de cette marketplace, quelles décisions prendrions-nous pour augmenter la satisfaction client et améliorer la performance globale ?

Pour répondre à cette problématique, le projet couvre :

- Exploration des données
- Nettoyage et validation qualité
- Construction d'une table analytique centralisée
- Création de KPI stratégiques
- Analyses métier avancées
- Visualisations professionnelles
- Recommandations business argumentées
- Analyses bonus (RFM, Machine Learning)

---

## 📊 Dataset

### Source

Olist Brazilian E-Commerce Public Dataset

https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce

### Période couverte

Septembre 2016 → Octobre 2018

### Volumétrie

| Indicateur | Valeur |
|------------|---------|
| Commandes | 99 441 |
| Clients uniques | 96 096 |
| Vendeurs | 3 095 |
| Catégories produits | 73 |
| Lignes après jointure | 113 425 |

---

## 🗂️ Tables utilisées

Le projet exploite les 9 tables du dataset Olist :

| Table | Description |
|---------|-------------|
| orders | Commandes |
| order_items | Produits commandés |
| customers | Informations clients |
| sellers | Informations vendeurs |
| products | Catalogue produits |
| payments | Paiements |
| reviews | Avis clients |
| geolocation | Coordonnées GPS |
| translations | Traduction catégories |

---

## 🏗️ Architecture du projet

```text
Projet_traitment_data/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── notebooks/
│   ├── 00_MASTER.ipynb
│   ├── 01_exploration.ipynb
│   ├── 02_cleaning.ipynb
│   ├── 03_indicators.ipynb
│   ├── 04_business_analysis.ipynb
│   └── 05_synthesis.ipynb
│
├── reports/
│   ├── figures/
│   └── rapport_final.md
│
├── src/
│   ├── data_loader.py
│   ├── cleaning.py
│   ├── indicators.py
│   ├── visualizations.py
│   └── utils.py
│
├── tests/
│
├── requirements.txt
├── config.py
└── README.md
```

---

## ⚙️ Installation

### Création de l'environnement virtuel

```bash
python -m venv C:/Users/amine/.venvs/projet_traitment_data
```

### Installation des dépendances

```bash
pip install -r requirements.txt
```

### Activation

Windows CMD :

```cmd
activate.bat
```

PowerShell :

```powershell
.\activate.ps1
```

---

## ▶️ Exécution

Ordre recommandé :

```text
01_exploration.ipynb
        ↓
02_cleaning.ipynb
        ↓
03_indicators.ipynb
        ↓
04_business_analysis.ipynb
        ↓
05_synthesis.ipynb
```

Ou exécution complète :

```text
00_MASTER.ipynb
```

---

# 🔧 Préparation des données

## Contrôles réalisés

### Valeurs manquantes

- Analyse complète des colonnes
- Traitement des catégories inconnues
- Conservation des manquants métier pertinents

### Doublons

La table géographique a été agrégée :

```text
1 000 163 lignes
      ↓
19 015 lignes uniques
```

### Validation temporelle

Contrôles :

- Livraison avant achat
- Approbation avant achat
- Dates estimées manquantes

Résultat :

✅ Aucune incohérence détectée

---

## Construction de la Master Table

La table analytique finale est obtenue par :

```text
orders
   +
order_items
   +
customers
   +
products
   +
sellers
   +
payments
   +
reviews
   +
translations
```

Résultat :

```text
113 425 lignes
```

Couverture :

| Donnée | Couverture |
|----------|------------|
| customer_id | 100 % |
| product_id | 99.3 % |
| seller_id | 99.3 % |
| reviews | 99.2 % |

---

# 📈 KPI Principaux

| KPI | Valeur |
|------|---------|
| CA Total | 13.59 M BRL |
| Commandes | 99 441 |
| Clients | 96 096 |
| Vendeurs | 3 095 |
| Catégories | 73 |
| Panier moyen | 136.68 BRL |
| Note moyenne | 4.02 / 5 |
| Retards | 6.41 % |
| Délai moyen | 12.01 jours |
| Notes faibles (≤2) | 16.34 % |

---

# 📊 Analyses Métier

## A. Satisfaction Client

### Études réalisées

- Impact du retard sur la note
- Délai de livraison vs satisfaction
- Frais de livraison vs satisfaction
- Catégories problématiques
- Vendeurs problématiques

### Résultat majeur

| Situation | Note moyenne |
|------------|-------------|
| Livraison à l'heure | 4.14 |
| Livraison en retard | 2.26 |

➡️ Une livraison en retard fait perdre en moyenne :

```text
-1.88 point
```

C'est le facteur le plus influent identifié dans l'audit.

---

## B. Logistique

Analyses :

- Taux de retard global
- Taux de retard par état
- Distance vendeur-client
- Poids produit vs délai

### États les plus touchés

- AL
- MA
- SE
- PI
- CE

Certains dépassent :

```text
20 % de retard
```

contre :

```text
6.41 % au niveau national
```

---

## C. Analyse des vendeurs

Création d'un score composite :

```text
score_vendeur =
0.40 × note
+ 0.30 × (1-retard)
+ 0.20 × livraison réussie
+ 0.10 × régularité
```

Utilisé pour :

- Classement
- Détection des vendeurs à risque
- Identification des meilleurs partenaires

---

## D. Produits et catégories

Analyse croisée :

- Chiffre d'affaires
- Satisfaction
- Taux de retard
- Volume de commandes

### Top catégories

| Catégorie | CA |
|------------|------|
| health_beauty | 1.26 M BRL |
| watches_gifts | 1.20 M BRL |
| bed_bath_table | 1.03 M BRL |
| sports_leisure | 0.99 M BRL |
| computers_accessories | 0.91 M BRL |

Ces 5 catégories représentent :

```text
39.7 % du chiffre d'affaires
```

---

## E. Analyse géographique

Études :

- Flux vendeur → client
- États rentables mais mal servis
- Intra-état vs inter-état

Résultat :

Les commandes intra-état obtiennent :

- Meilleures notes
- Moins de retards

Ce qui justifie une stratégie favorisant les vendeurs locaux.

---

# 🤖 Analyses Bonus

## Segmentation RFM

Classification clients :

- Champions
- Loyaux
- Nouveaux
- À risque
- Perdus

---

## Machine Learning

Modèle :

```text
Random Forest Classifier
```

Objectif :

Prédire les notes faibles :

```text
review_score <= 2
```

Variables les plus importantes :

1. délai_livraison
2. est_en_retard
3. freight_value

Validation supplémentaire de l'importance du levier logistique.

---

# 🚨 Principaux Problèmes Identifiés

## 1. Retards de livraison

Impact :

```text
4.14 → 2.26
```

sur la note moyenne.

---

## 2. Hétérogénéité des vendeurs

Une trentaine de vendeurs concentrent une part importante des avis négatifs.

---

## 3. Disparités géographiques

Nord et Nord-Est :

- délais élevés
- retards élevés
- qualité de service inférieure

---

# 💡 Recommandations Business

### Priorité Haute

- Renégocier les SLA transporteurs
- Surveiller les vendeurs problématiques
- Recalibrer les dates estimées de livraison

### Priorité Moyenne

- Coaching nouveaux vendeurs
- Réduction ciblée des frais de livraison
- Développer certaines catégories performantes

### Priorité Basse

- Dashboard temps réel
- Enquêtes qualitatives
- Tests A/B sur les frais de livraison

---

# 🧪 Tests

Exécution :

```bash
pytest tests/ -v --tb=short
```

Les tests couvrent :

- qualité des jointures
- cohérence des données
- calculs d'indicateurs
- pipeline de nettoyage

---

# 📦 Livrables

- ✅ Notebook principal (Run All)
- ✅ Master Table analytique
- ✅ 24 figures haute résolution
- ✅ Rapport final complet
- ✅ Modules Python réutilisables
- ✅ Tests automatisés

---

# 👨‍💻 Auteur

Amine Ait Ali

Projet académique réalisé dans le cadre du module :

**Traitement de Données**

Année universitaire 2025–2026

---

# 📄 Licence

Projet réalisé à des fins pédagogiques et académiques.