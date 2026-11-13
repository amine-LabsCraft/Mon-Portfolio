<p align="center">
  <img src="docs/images/00_banner.svg" alt="Microsoft SSIS Pipelines : 5 packages ETL avec SQL Server Integration Services" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SQL%20Server-2022%20Express-CC2927?logo=microsoftsqlserver&logoColor=white" alt="SQL Server 2022">
  <img src="https://img.shields.io/badge/SSIS-Integration%20Services-5C2D91?logo=visualstudio&logoColor=white" alt="SSIS">
  <img src="https://img.shields.io/badge/Visual%20Studio-2022-5C2D91?logo=visualstudio&logoColor=white" alt="Visual Studio">
  <img src="https://img.shields.io/badge/T--SQL-scripts-336791" alt="T-SQL">
  <img src="https://img.shields.io/badge/Excel-destination-217346?logo=microsoftexcel&logoColor=white" alt="Excel">
</p>

# Microsoft SSIS Pipelines

Cinq packages **SQL Server Integration Services (SSIS)** qui lisent une même base opérationnelle, **GestionDB**, et produisent des fichiers plats et un classeur Excel. Chaque package introduit un composant ETL de plus : extraction, tri, routage conditionnel, agrégation, puis jointures par fusion.

Le projet a été réalisé dans le cadre du TP2 du module *Systèmes d'aide à la décision* (ENSA Khouribga, cycle ingénieur IID, 2e année). Tout est reproductible : le dépôt contient le projet Visual Studio, un script qui recrée la base source avec ses données exactes, les fichiers produits par chaque package et un script SQL qui calcule les résultats attendus.

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Outils utilisés](#2-outils-utilisés)
3. [Structure du dépôt](#3-structure-du-dépôt)
4. [La base source GestionDB](#4-la-base-source-gestiondb)
5. [Démarrage rapide](#5-démarrage-rapide)
6. [Package 01 : extraction vers un fichier plat](#6-package-01--extraction-vers-un-fichier-plat)
7. [Package 02 : tri sur deux clés](#7-package-02--tri-sur-deux-clés)
8. [Package 03 : Conditional Split par catégorie](#8-package-03--conditional-split-par-catégorie)
9. [Package 04 : Aggregate, nombre de produits par catégorie](#9-package-04--aggregate-nombre-de-produits-par-catégorie)
10. [Package 05 : deux Merge Join en chaîne vers Excel](#10-package-05--deux-merge-join-en-chaîne-vers-excel)
11. [Le piège NCHAR et la fonction TRIM](#11-le-piège-nchar-et-la-fonction-trim)
12. [Vérifier les résultats](#12-vérifier-les-résultats)
13. [Ce que ce TP m'a appris](#13-ce-que-ce-tp-ma-appris)
14. [Pistes d'amélioration](#14-pistes-damélioration)

---

## 1. Vue d'ensemble

<p align="center">
  <img src="docs/images/01_overview.svg" alt="Vue d'ensemble : GestionDB alimente 5 packages SSIS qui produisent 7 fichiers" width="100%">
</p>

| # | Package | Composants du Data Flow | Lit | Produit |
|---|---------|-------------------------|-----|---------|
| 01 | `01_Extract_Produits_to_FlatFile.dtsx` | ADO.NET Source → Flat File Destination | `dbo.Produit` | `output/01_Produits.txt` |
| 02 | `02_Sort_Produits.dtsx` | ADO.NET Source → **Sort** → Flat File Destination | `dbo.Produit` | `output/02_Produits_tries.txt` |
| 03 | `03_ConditionalSplit_Categories.dtsx` | ADO.NET Source → **Conditional Split** → 3 × Flat File Destination | `dbo.Produit` | `output/03_Categorie_*.txt` (3 fichiers) |
| 04 | `04_Aggregate_Count_by_Category.dtsx` | ADO.NET Source → **Aggregate** → Flat File Destination | `dbo.Produit` | `output/04_Nb_produits_par_categorie.txt` |
| 05 | `05_MergeJoin_Regions_Employees.dtsx` | 3 × ADO.NET Source → 4 × **Sort** → 2 × **Merge Join** → **Excel Destination** | `dbo.Commande`, `dbo.Vendeur`, `dbo.Region` | `output/05_Regions_Employes.xlsx` |

Les cinq packages partagent un seul **gestionnaire de connexions de projet**, `GestionDB.conmgr` (ADO.NET, authentification Windows). Chaque package contient une seule *Tâche de flux de données* (Data Flow Task), et c'est dans ce flux que se trouve toute la logique.

---

## 2. Outils utilisés

| Outil | Rôle dans le projet |
|-------|---------------------|
| <img src="docs/images/logos/sql-server.svg" width="18"> **SQL Server 2022 Express** | Héberge la base source `GestionDB` (instance `.\SQLEXPRESS`) |
| <img src="docs/images/logos/visual-studio.svg" width="18"> **Visual Studio 2022 + extension SSIS** | Conception et exécution des packages `.dtsx` (projet `.dtproj`, cible SQL Server 2022) |
| **SSIS** (Integration Services) | Moteur ETL : sources ADO.NET, transformations Sort / Conditional Split / Aggregate / Merge Join, destinations Flat File et Excel |
| <img src="docs/images/logos/t-sql.svg" width="18"> **T-SQL** | Création de la base, contrôle de la source, calcul des résultats attendus |
| <img src="docs/images/logos/excel.svg" width="18"> **Excel** (pilote ACE OLEDB 12.0) | Destination du package 05 (feuille `Destination_Excel`) |

---

## 3. Structure du dépôt

```text
Microsoft_SSIS_Peplines/
├── SSIS_Pipelines.slnx                         # solution Visual Studio
├── SSIS_Pipelines/                             # projet SSIS
│   ├── SSIS_Pipelines.dtproj                   # projet (modèle de déploiement : Project)
│   ├── 01_Extract_Produits_to_FlatFile.dtsx
│   ├── 02_Sort_Produits.dtsx
│   ├── 03_ConditionalSplit_Categories.dtsx
│   ├── 04_Aggregate_Count_by_Category.dtsx
│   ├── 05_MergeJoin_Regions_Employees.dtsx
│   ├── GestionDB.conmgr                        # connexion ADO.NET vers GestionDB (utilisée)
│   ├── DataWH.conmgr                           # connexion vers DataDW, préparée pour la suite (non utilisée ici)
│   ├── Project.params                          # paramètres de projet (vide)
│   └── SSIS_Pipelines.database
├── sql/
│   ├── 00_create_GestionDB.sql                 # recrée la base source et ses données
│   ├── 01_check_source_GestionDB.sql           # contrôle la source avant de lancer les packages
│   ├── 99_expected_results.sql                 # ce que chaque fichier doit contenir, calculé en SQL
│   └── conditional_split_expressions.txt       # expressions prêtes à copier dans SSIS
├── output/                                     # fichiers réellement produits par les packages
│   ├── 01_Produits.txt
│   ├── 02_Produits_tries.txt
│   ├── 03_Categorie_Informatique.txt
│   ├── 03_Categorie_Mobilier.txt
│   ├── 03_Categorie_Fournitures.txt
│   ├── 04_Nb_produits_par_categorie.txt
│   └── 05_Regions_Employes.xlsx
└── docs/images/                                # schémas explicatifs de ce README
```

Les numéros servent de fil conducteur : le package `03_…` écrit les fichiers `output/03_…`, etc.

---

## 4. La base source GestionDB

<p align="center">
  <img src="docs/images/02_gestiondb_schema.svg" alt="Schéma de GestionDB : Produit, Vendeur, Region, Commande, LigneCommande" width="100%">
</p>

| Table | Lignes | Rôle | Utilisée par |
|-------|-------:|------|--------------|
| `Produit` | 10 | Catalogue : 4 produits *Informatique*, 3 *Mobilier*, 3 *Fournitures* | Packages 01 à 04 |
| `Vendeur` | 10 | Employés commerciaux (`E01` à `E10`) | Package 05 |
| `Region` | 10 | Régions du Maroc (`R01` Casablanca-Settat … `R10` Guelmim) | Package 05 |
| `Commande` | 10 | Une commande = un vendeur + une région + une date | Package 05 |
| `LigneCommande` | 20 | Détail des commandes (quantité, prix unitaire) | Aucun package de ce TP |

Toutes les colonnes texte sont en `NCHAR(n)`, c'est-à-dire **à longueur fixe**. Ce détail a des conséquences directes sur le package 03 (voir la [section 11](#11-le-piège-nchar-et-la-fonction-trim)).

Le script [`sql/00_create_GestionDB.sql`](sql/00_create_GestionDB.sql) recrée exactement ce schéma (clés primaires, 4 clés étrangères) et ces données. Il a été vérifié contre la base d'origine : 0 différence sur les colonnes, les types et les 60 lignes.

---

## 5. Démarrage rapide

### Prérequis

- **SQL Server 2022 Express** (ou toute édition 2022), instance nommée `SQLEXPRESS`.
- **Visual Studio 2022** avec l'extension **SQL Server Integration Services Projects**.
- Pour le package 05 : le pilote **Microsoft Access Database Engine** (fournisseur `Microsoft.ACE.OLEDB.12.0`) pour écrire dans Excel.

### Étapes

1. **Cloner le dépôt dans `C:\SSIS_Pipelines`.** Les destinations fichier pointent vers `C:\SSIS_Pipelines\output\`, ce chemin évite donc toute modification.

   ```powershell
   git clone https://github.com/amine-LabsCraft/Microsoft_SSIS_Peplines.git C:\SSIS_Pipelines
   ```

2. **Créer la base source.** Ouvrez `sql/00_create_GestionDB.sql` dans SSMS ou VS Code (extension MSSQL) et exécutez-le sur `.\SQLEXPRESS`. Le script se termine par un contrôle : 10 / 10 / 10 / 10 / 20 lignes.

3. **Contrôler la source** (facultatif) avec `sql/01_check_source_GestionDB.sql`. Il ne modifie rien et montre aussi la preuve du piège NCHAR (`DATALENGTH = 60`).

4. **Ouvrir la solution** `SSIS_Pipelines.slnx`. Avec une version de Visual Studio qui ne lit pas encore le format `.slnx`, ouvrez directement `SSIS_Pipelines/SSIS_Pipelines.dtproj`.

5. **Vérifier la connexion.** Dans *Gestionnaires de connexions*, la connexion de projet pointe vers `.\SQLEXPRESS`, base `GestionDB`, authentification Windows. Aucun mot de passe n'est stocké.

6. **Exécuter les packages** un par un : clic droit sur le package, puis *Exécuter le package* (ou `F5` avec le package ouvert). Chaque composant passe au vert et affiche le nombre de lignes sur chaque flèche.

7. **Comparer** les fichiers de `output/` avec `sql/99_expected_results.sql` (voir la [section 12](#12-vérifier-les-résultats)).

> **Le dépôt est cloné ailleurs ?** Ouvrez chaque gestionnaire de connexions *Flat File* (et la connexion Excel du package 05) et remplacez `C:\SSIS_Pipelines\output\` par votre dossier.
> **Le serveur porte un autre nom ?** Modifiez `Data Source` dans `GestionDB.conmgr` (par exemple `localhost` pour une instance par défaut).

---

## 6. Package 01 : extraction vers un fichier plat

<p align="center">
  <img src="docs/images/03_package01_extract.svg" alt="Package 01 : source ADO.NET vers destination Flat File" width="100%">
</p>

Le « Hello World » de SSIS : lire une table et l'écrire telle quelle dans un fichier texte.

| Composant | Type | Configuration |
|-----------|------|---------------|
| `GestionDB_PRD_Tab` | ADO.NET Source | Connexion `GestionDB.conmgr`, mode *table ou vue*, table `"dbo"."Produit"` |
| `Destination de fichier plat` | Flat File Destination | Connexion `CN_FILE_TXT` : délimité par `,`, ligne d'en-tête, page de codes 1252 |

**Résultat** : [`output/01_Produits.txt`](output/01_Produits.txt), 1 ligne d'en-tête + 10 produits.

```text
prod_id,prod_name,category
P01       ,Ordinateur portable                    …,Informatique
P02       ,Souris sans fil                        …,Informatique
```

Les espaces après chaque valeur ne sont pas une erreur d'export : ils viennent des colonnes `NCHAR`, qui sont complétées jusqu'à leur longueur fixe.

---

## 7. Package 02 : tri sur deux clés

<p align="center">
  <img src="docs/images/04_package02_sort.svg" alt="Package 02 : tri par catégorie croissante puis libellé décroissant" width="100%">
</p>

| Composant | Type | Configuration |
|-----------|------|---------------|
| `GestionDB_PRD_Tab` | ADO.NET Source | `dbo.Produit` |
| `Trier` | Sort | Clé 1 : `category` **croissant**. Clé 2 : `prod_name` **décroissant** |
| `Destination de fichier plat` | Flat File Destination | `output/02_Produits_tries.txt`, sans ligne d'en-tête |

La position de la clé (1, 2) donne la priorité du tri ; le signe donne le sens (dans le XML du package, `-2` signifie « 2e clé, ordre décroissant »).

**Résultat** : les catégories apparaissent dans l'ordre alphabétique (Fournitures, Informatique, Mobilier) et, dans chaque catégorie, les libellés vont de Z à A.

| Équivalent SQL |
|----------------|
| `SELECT prod_id, prod_name, category FROM dbo.Produit ORDER BY category ASC, prod_name DESC;` |

> **À savoir** : *Sort* est un composant **bloquant**. Il doit recevoir toutes les lignes avant d'émettre la première. Sur de gros volumes, un `ORDER BY` dans la requête source est souvent préférable.

---

## 8. Package 03 : Conditional Split par catégorie

<p align="center">
  <img src="docs/images/05_package03_conditional_split.svg" alt="Package 03 : Conditional Split vers trois fichiers" width="100%">
</p>

Le **Conditional Split** joue le rôle d'un `CASE WHEN` appliqué ligne par ligne : chaque condition crée une sortie, et chaque ligne part dans la **première** sortie dont la condition est vraie.

| Ordre | Sortie | Condition (expression SSIS) | Fichier | Lignes |
|------:|--------|-----------------------------|---------|-------:|
| 1 | Informatique | `TRIM(category) == "Informatique"` | `output/03_Categorie_Informatique.txt` | 4 |
| 2 | Mobilier | `TRIM(category) == "Mobilier"` | `output/03_Categorie_Mobilier.txt` | 3 |
| 3 | Fournitures | `TRIM(category) == "Fournitures"` | `output/03_Categorie_Fournitures.txt` | 3 |
| – | Sortie par défaut | toutes les autres lignes | non connectée | 0 |

Règles de syntaxe du langage d'expressions SSIS : `==` pour l'égalité, guillemets **doubles**, comparaison **sensible à la casse** (`"informatique"` ne correspond à rien). Les expressions sont prêtes à copier dans [`sql/conditional_split_expressions.txt`](sql/conditional_split_expressions.txt).

---

## 9. Package 04 : Aggregate, nombre de produits par catégorie

<p align="center">
  <img src="docs/images/06_package04_aggregate.svg" alt="Package 04 : Aggregate GROUP BY category COUNT prod_id" width="100%">
</p>

| Composant | Type | Configuration |
|-----------|------|---------------|
| `P4_Agregat` | ADO.NET Source | `dbo.Produit` |
| `Agrégation` | Aggregate | `category` : **Regrouper par**. `prod_id` : **Nombre**, colonne de sortie `nb_produits` |
| `Destination de fichier plat` | Flat File Destination | `output/04_Nb_produits_par_categorie.txt` |

**Résultat** (contenu réel du fichier) :

```text
3,Mobilier
3,Fournitures
4,Informatique
```

Équivalent SQL : `SELECT category, COUNT(prod_id) AS nb_produits FROM dbo.Produit GROUP BY category;`

> L'ordre des lignes en sortie d'un *Aggregate* **n'est pas garanti** (ici Mobilier sort en premier). Si l'ordre compte, il faut ajouter un *Sort* après l'agrégat.

---

## 10. Package 05 : deux Merge Join en chaîne vers Excel

<p align="center">
  <img src="docs/images/07_package05_merge_join.svg" alt="Package 05 : 3 sources, 4 Sort, 2 Merge Join, destination Excel" width="100%">
</p>

**Question métier** : dans quelle région travaille chaque employé ? La réponse passe par `Commande`, qui relie un vendeur (`emp_id`) à une région (`reg_id`).

| Étape | Composant | Configuration |
|------:|-----------|---------------|
| 1 | `SRC_GestionDB_commande`, `SRC_GestionDB_Vendeur`, `SRC_GestionDB_region` | 3 sources ADO.NET sur la même connexion |
| 2 | `Sort Commande emp_id`, `Sort Vendeur emp_id` | Tri des deux flux sur la clé de la 1re jointure (`emp_name` est une 2e clé de tri côté Vendeur) |
| 3 | `Jointure de fusion` | **Merge Join**, `INNER JOIN` sur `emp_id` (gauche : Commande, droite : Vendeur) |
| 4 | `Sort par reg_id`, `Sort Region reg_id` | Le résultat de la 1re jointure et la table Region sont triés sur `reg_id` |
| 5 | `Jointure de fusion 1` | **Merge Join**, `INNER JOIN` sur `reg_id` |
| 6 | `Destination Excel` | Feuille `Destination_Excel` de `output/05_Regions_Employes.xlsx`, colonnes `emp_name`, `reg_id`, `reg_name` |

**Résultat** : 10 lignes dans Excel.

| emp_name | reg_id | reg_name |
|----------|--------|----------|
| Youssef Alami | R01 | Casablanca-Settat |
| Salma Bennani | R02 | Rabat-Sale |
| Omar Idrissi | R03 | Marrakech-Safi |
| … | … | … |
| Nour Fassi | R10 | Guelmim |

Équivalent SQL : deux `JOIN` successifs, voir le dernier bloc de [`sql/99_expected_results.sql`](sql/99_expected_results.sql).

### Pourquoi autant de tris ?

<p align="center">
  <img src="docs/images/09_merge_join_sorted_inputs.svg" alt="Merge Join : les deux entrées triées sont lues en parallèle" width="100%">
</p>

Un **Merge Join** fonctionne comme une fermeture éclair : il avance dans deux flux **déjà triés** sur la même clé et apparie les lignes en une seule passe. Si une entrée n'est pas marquée comme triée (`IsSorted`), SSIS refuse de valider le package. D'où les quatre composants *Sort* : deux avant chaque jointure.

Alternative courante : la transformation **Lookup**, qui charge la table de référence (Vendeur ou Region) en cache et n'exige aucun tri.

---

## 11. Le piège NCHAR et la fonction TRIM

<p align="center">
  <img src="docs/images/08_nchar_trim_trap.svg" alt="Le piège NCHAR : Informatique est stocké avec 18 espaces de remplissage" width="100%">
</p>

C'est l'erreur la plus instructive du TP. La colonne `category` est déclarée en `NCHAR(30)`. SQL Server stocke donc `"Informatique"` (12 caractères) suivi de **18 espaces**, soit 60 octets (`DATALENGTH(category) = 60`).

Le moteur d'expressions SSIS compare les chaînes **exactement**, espaces compris :

| Expression | Valeur comparée | Résultat |
|-----------|-----------------|----------|
| `category == "Informatique"` | `"Informatique                  "` | **faux** : 0 ligne routée, tout part dans la sortie par défaut |
| `TRIM(category) == "Informatique"` | `"Informatique"` | **vrai** : 4 lignes routées |

Trois façons de régler le problème :

1. `TRIM()` dans l'expression du Conditional Split (solution retenue) ;
2. `RTRIM()` dans la requête source :
   ```sql
   SELECT RTRIM(prod_id) AS prod_id, RTRIM(prod_name) AS prod_name, RTRIM(category) AS category
   FROM dbo.Produit;
   ```
3. une colonne `NVARCHAR` côté base, qui ne stocke pas d'espaces de remplissage.

---

## 12. Vérifier les résultats

Le script [`sql/99_expected_results.sql`](sql/99_expected_results.sql) calcule en SQL ce que chaque fichier doit contenir. Comparaison avec les fichiers produits par SSIS :

| Package | Attendu (SQL) | Obtenu (SSIS) | |
|---------|---------------|---------------|---|
| 01 | 10 produits | `01_Produits.txt` : en-tête + 10 lignes | ✅ |
| 02 | Fournitures → Informatique → Mobilier, libellés Z → A | `02_Produits_tries.txt` : même ordre | ✅ |
| 03 | Informatique 4, Mobilier 3, Fournitures 3 | 4 + 3 + 3 lignes dans les 3 fichiers | ✅ |
| 04 | Informatique 4, Mobilier 3, Fournitures 3 | `4,Informatique` · `3,Mobilier` · `3,Fournitures` | ✅ |
| 05 | 10 couples employé / région | 10 lignes dans la feuille `Destination_Excel` | ✅ |

---

## 13. Ce que ce TP m'a appris

- **Projet SSIS** : modèle de déploiement *Project*, gestionnaire de connexions partagé entre packages, différence entre *flux de contrôle* (Control Flow) et *flux de données* (Data Flow).
- **Les types comptent jusque dans l'ETL** : un `NCHAR` en source change le comportement d'une expression trois composants plus loin.
- **Composants bloquants ou non** : *Sort* et *Aggregate* attendent toutes les lignes, une source ou un *Conditional Split* les traitent au fil de l'eau.
- **Jointures dans SSIS** : *Merge Join* impose des entrées triées ; il faut penser l'ordre des données, pas seulement la condition de jointure.
- **Valider un pipeline** : recalculer en SQL le résultat attendu et le comparer aux fichiers produits plutôt que de se fier aux coches vertes.

---

## 14. Pistes d'amélioration

- **Paramètres de projet** pour le dossier de sortie et le nom du serveur, au lieu de chemins écrits dans chaque gestionnaire de connexions.
- **Requêtes source avec `RTRIM`** (ou des colonnes `NVARCHAR`) pour livrer des fichiers sans espaces de remplissage.
- **Lookup** à la place des deux Merge Join, ce qui supprime les quatre *Sort*.
- **Déploiement dans le catalogue SSISDB** et planification avec SQL Server Agent.
- **Chargement de l'entrepôt `DataDW`** : le gestionnaire `DataWH.conmgr` est déjà prêt pour cette étape.

---

<p align="center">
  Réalisé par <a href="https://github.com/amine-LabsCraft"><b>Amine AIT ALI</b></a> · Élève-ingénieur Data &amp; IA · ENSA Khouribga
</p>
