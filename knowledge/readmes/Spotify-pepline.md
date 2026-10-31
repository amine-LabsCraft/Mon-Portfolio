# Spotify : pipeline de données de bout en bout sur Azure et Databricks

Pipeline d'ingestion et de transformation de données d'écoute « façon Spotify » : les tables d'une base **Azure SQL** sont chargées de façon **incrémentale** par **Azure Data Factory** dans **ADLS Gen2** (Bronze), nettoyées en streaming par **Databricks Auto Loader** (Silver), puis historisées avec **Lakeflow Declarative Pipelines / Delta Live Tables** (Gold), le tout gouverné par **Unity Catalog**.

![Architecture globale du projet](Architecture_Spotify.png)

## Sommaire

1. [Le problème](#1-le-problème)
2. [Architecture](#2-architecture)
3. [Le modèle de données](#3-le-modèle-de-données)
4. [Ingestion incrémentale avec Azure Data Factory](#4-ingestion-incrémentale-avec-azure-data-factory)
5. [Transformations Databricks : Bronze, Silver, Gold](#5-transformations-databricks--bronze-silver-gold)
6. [Requêtes d'analyse générées avec Jinja2](#6-requêtes-danalyse-générées-avec-jinja2)
7. [Supervision et alertes](#7-supervision-et-alertes)
8. [Sécurité et gouvernance](#8-sécurité-et-gouvernance)
9. [Structure du dépôt](#9-structure-du-dépôt)
10. [Mise en place](#10-mise-en-place)
11. [Ajouter une nouvelle table](#11-ajouter-une-nouvelle-table)
12. [Dépannage](#12-dépannage)
13. [Limites et pistes d'amélioration](#13-limites-et-pistes-damélioration)

---

## 1. Le problème

Une application de streaming musical enregistre ses abonnés, ses artistes, ses titres et chaque écoute dans une base transactionnelle. Pour analyser ces données sans surcharger la base de production, il faut les copier dans un lakehouse. Trois difficultés se posent :

- **Recopier toutes les tables à chaque exécution coûte cher** et devient vite impossible quand les volumes grandissent : il ne faut transférer que les lignes nouvelles ou modifiées.
- **Un pipeline par table ne passe pas à l'échelle** : 5 tables aujourd'hui, 50 demain, autant de copies du même pipeline à maintenir.
- **Les dimensions changent dans le temps** (un abonné passe de *Free* à *Premium*, un titre est renommé) : il faut pouvoir garder l'historique de ces changements pour des analyses justes.

Ce projet répond à ces trois points avec un pipeline ADF **piloté par des métadonnées**, un **filigrane (watermark) par table** et des tables Gold en **SCD de type 2**.

## 2. Architecture

| Étape | Service | Rôle |
| :--- | :--- | :--- |
| Source | Azure SQL Database | 5 tables transactionnelles (schéma `dbo`) avec une colonne de date de mise à jour |
| Configuration | GitHub (`loop_input.json`) | Liste des tables à charger, lue par ADF via un service lié HTTP |
| Orchestration | Azure Data Factory | Une seule boucle `ForEach` qui charge toutes les tables en incrémental |
| Bronze | ADLS Gen2 (conteneur `bronze`) | Fichiers Parquet bruts + un fichier d'état `cdc.json` par table |
| Silver | Databricks, Auto Loader | Lecture en streaming, nettoyage, dédoublonnage, écriture Delta |
| Gold | Databricks, Delta Live Tables | Historisation avec `create_auto_cdc_flow` (SCD 1 et SCD 2) et contrôles qualité |
| Gouvernance | Unity Catalog | Catalogue `spotify_cata`, schémas `silver` et `gold`, External Locations |
| Supervision | Azure Logic Apps | E-mail envoyé avec le nom du pipeline et l'identifiant du run |
| DevOps | Git, Azure DevOps, Databricks Asset Bundles | Versionnage du code ADF et Databricks, déploiement de l'environnement `dev` |

Le flux en une ligne :

```text
Azure SQL ──(ADF, incrémental)──▶ Bronze (Parquet) ──(Auto Loader)──▶ Silver (Delta) ──(DLT, Auto CDC)──▶ Gold (Delta, SCD)
```

## 3. Le modèle de données

![Modèle en étoile : FactStream et ses dimensions](images/modele_etoile.png)

Les données suivent un **schéma en étoile** : la table de faits `FactStream` (une ligne par écoute) référence l'abonné, le titre et la date. `DimTrack` référence à son tour l'artiste.

| Table | Clé | Colonne CDC | Lignes (initial + incrémental) |
| :--- | :--- | :--- | ---: |
| `DimUser` | `user_id` | `updated_at` | 500 + 70 |
| `DimArtist` | `artist_id` | `updated_at` | 500 + 50 |
| `DimTrack` | `track_id` | `updated_at` | 500 + 50 |
| `DimDate` | `date_key` | `date` | 365 |
| `FactStream` | `stream_id` | `stream_timestamp` | 1 000 + 300 |

Deux scripts permettent de rejouer le scénario complet :

- `spotify_initial_load.sql` crée les 5 tables et insère **2 865 lignes** (premier chargement) ;
- `spotify_incremental_load.sql` ajoute ou modifie **470 lignes** : en relançant le pipeline, seules ces lignes doivent arriver dans Bronze.

## 4. Ingestion incrémentale avec Azure Data Factory

![Pipeline ADF incremental_loop](images/pipeline_adf_incremental.png)

### Un seul pipeline pour toutes les tables

Le pipeline `incremental_loop` commence par une activité **Lookup** (`look_for_each`) qui lit `loop_input.json` depuis GitHub. Chaque entrée décrit une table :

```json
{
    "schema": "dbo",
    "table": "DimUser",
    "cdc_col": "updated_at",
    "from_date": ""
}
```

Une boucle **ForEach** exécute ensuite les mêmes étapes pour chaque table. Ajouter une table revient à ajouter une entrée dans ce fichier : aucun nouveau pipeline n'est nécessaire.

### Les étapes, table par table

1. **`last_cdc` (Lookup)** lit le dernier filigrane de la table dans `bronze/{table}_cdc/cdc.json`.
2. **`current` (Set Variable)** mémorise l'heure du run avec `@utcNow()` ; elle sert à nommer le fichier produit.
3. **`AzureSQLTolake` (Copy)** extrait uniquement les lignes plus récentes que le filigrane :

   ```sql
   SELECT * FROM {schema}.{table}
   WHERE {cdc_col} > '{dernier filigrane}'
   ```

   Le résultat est écrit en Parquet dans `bronze/{table}/{table}_{current}`. Si `from_date` est renseigné dans `loop_input.json`, il remplace le filigrane : pratique pour recharger une période.
4. **`ifIncremental` (If Condition)** teste `@greater(activity('AzureSQLTolake').output.dataRead, 0)` :
   - **des lignes ont été lues** : `max_cdc` (Script) calcule `SELECT MAX({cdc_col}) AS cdc`, puis `update_last_cdc` (Copy) écrase `cdc.json` avec cette nouvelle valeur. Le prochain run repartira de là ;
   - **aucune ligne** : `deleteEmptyFile` (Delete) supprime le Parquet vide qui vient d'être créé, pour ne pas polluer Bronze.

Le pipeline `incremental_injestion` contient la même logique pour **une seule** table, passée en paramètres (`schema`, `table`, `cdc_col`, `from_date`) : il sert à tester ou rejouer une table isolément.

### Pourquoi un fichier `cdc.json` par table

Chaque table avance à son propre rythme : si `FactStream` échoue, `DimUser` garde un filigrane à jour. L'état est stocké à côté des données, dans le lac, et reste lisible par un humain.

## 5. Transformations Databricks : Bronze, Silver, Gold

![Transformations Bronze, Silver et Gold](images/bronze_silver_gold.png)

### Silver : nettoyage en streaming (`files/silver_dimentions.ipynb`)

Chaque table Bronze est lue avec **Auto Loader** (`cloudFiles`, format Parquet). Auto Loader ne traite que les fichiers qu'il n'a pas encore vus, grâce à un checkpoint par table. L'écriture utilise `trigger(once=True)` : le notebook traite tout ce qui est nouveau puis s'arrête, comme un batch, mais sans relire l'historique.

| Table Silver | Transformations |
| :--- | :--- |
| `dimuser` | `user_name` en majuscules, dédoublonnage sur `user_id` |
| `dimartist` | dédoublonnage sur `artist_id` |
| `dimtrack` | colonne `durationFlag` (`low` < 150 s, `medium` < 300 s, sinon `high`), « - » remplacé par un espace dans `track_name`, dédoublonnage sur `track_id` |
| `dimdate` | aucune transformation métier |
| `factstream` | aucune transformation métier |

Pour toutes les tables, la colonne technique `_rescued_data` ajoutée par Auto Loader est supprimée avec la classe utilitaire `reusable.dropColumns()` (`files/transformations.py`). Les tables sont écrites en Delta dans `abfss://silver@…/{Table}/data` et enregistrées dans Unity Catalog sous `spotify_cata.silver.*`.

### Gold : historisation avec Delta Live Tables (`files/dim*.py`, `files/factstream.py`)

Chaque fichier déclare :

1. une table de staging `*_stg` qui lit la table Silver en streaming ;
2. une table cible créée par `dlt.create_streaming_table()` ;
3. un flux `dlt.create_auto_cdc_flow()` qui applique les changements à la cible.

| Table Gold | Clé | Ordre des changements | Type |
| :--- | :--- | :--- | :--- |
| `dimuser` | `user_id` | `updated_at` | SCD 2 + contrôle qualité |
| `dimtrack` | `track_id` | `updated_at` | SCD 2 |
| `dimdate` | `date_key` | `date` | SCD 2 |
| `factstream` | `stream_id` | `stream_timestamp` | SCD 1 |

- **SCD 2** : quand une ligne change, l'ancienne version est fermée et la nouvelle ajoutée ; on peut savoir quel était l'abonnement d'un utilisateur à n'importe quelle date.
- **SCD 1** : pour les écoutes, seule la dernière version compte ; elle écrase la précédente.
- **Qualité** : `dimuser` applique `expect_all_or_drop({"rule_1": "user_id IS NOT NULL"})` ; les lignes sans identifiant sont écartées et comptées dans les métriques du pipeline DLT.

## 6. Requêtes d'analyse générées avec Jinja2

Le notebook `files/jinja_nb.ipynb` montre comment générer une requête SQL à partir d'une simple liste de paramètres plutôt que de l'écrire à la main :

```python
parameters = [
    {"table": "spotify_cata.silver.factstream", "alias": "factstream",
     "cols": "factstream.stream_id, factstream.listen_duration"},
    {"table": "spotify_cata.silver.dimuser", "alias": "dimuser",
     "cols": "dimuser.user_id, dimuser.user_name",
     "condition": "dimuser.user_id = factstream.user_id"},
    {"table": "spotify_cata.silver.dimtrack", "alias": "dimtrack",
     "cols": "dimtrack.track_id, dimtrack.track_name",
     "condition": "dimtrack.track_id = factstream.track_id"},
]
```

Le gabarit produit un `SELECT` sur la table de faits suivi d'un `LEFT JOIN` par dimension. Ajouter une dimension à l'analyse revient à ajouter un élément à la liste.

## 7. Supervision et alertes

À la fin de la boucle, l'activité Web `failed_trigger` appelle un **Logic App** par HTTP avec ce corps :

```json
{
    "pipeline_name": "@{pipeline().Pipeline}",
    "pipeline_id": "@{pipeline().RunId}"
}
```

Le Logic App envoie un e-mail contenant le nom du pipeline et l'identifiant du run, ce qui permet d'ouvrir directement le bon run dans le moniteur ADF. L'activité dépend de la boucle avec les conditions *Succeeded* et *Failed* : elle est donc appelée dans les deux cas.

> L'URL d'appel du Logic App contient une signature d'accès. Dans ce dépôt, elle est remplacée par `<LOGIC_APP_SIGNATURE>` : renseignez la vôtre dans ADF, jamais dans Git.

## 8. Sécurité et gouvernance

- **Unity Catalog** remplace les anciens montages (`dbutils.fs.mount`) : l'accès au stockage passe par des **External Locations** et un **Access Connector** utilisant une identité managée, sans clé de compte dans le code.
- **Data Factory** utilise une identité managée (`SystemAssigned`) ; les identifiants SQL des services liés sont chiffrés par ADF (`encryptedCredential`) et ne figurent pas en clair.
- **Microsoft Entra ID** et **Azure Key Vault** (encadré *Security* du schéma d'architecture) centralisent les identités et les secrets.

## 9. Structure du dépôt

```text
├── Architecture_Spotify.png          # Schéma d'architecture global
├── images/                           # Schémas détaillés utilisés dans ce README
├── loop_input.json                   # Liste des tables à charger (lue par ADF)
├── spotify_initial_load.sql          # Création des tables + 2 865 lignes
├── spotify_incremental_load.sql      # 470 lignes ajoutées ou modifiées
├── pipeline/
│   ├── incremental_loop.json         # Pipeline principal : ForEach sur toutes les tables
│   └── incremental_injestion.json    # Même logique pour une seule table paramétrée
├── dataset/                          # Jeux de données ADF paramétrés
│   ├── source_adf.json               # Source Azure SQL
│   ├── parquet_dynamic.json          # Parquet dans ADLS (conteneur, dossier, fichier)
│   ├── json_dynamic.json             # cdc.json dans ADLS
│   └── json_for_github_rep*.json     # loop_input.json sur GitHub
├── linkedService/                    # Connexions ADF
│   ├── source_adf_linked_service.json  # Azure SQL Database
│   ├── datalake.json                 # ADLS Gen2
│   └── gitrepo_input_for_loop.json   # HTTP vers GitHub (raw)
├── factory/                          # Définition de la Data Factory
├── publish_config.json               # Branche de publication ADF (adf_publish)
└── files/                            # Code Databricks
    ├── silver_dimentions.ipynb       # Bronze → Silver avec Auto Loader
    ├── transformations.py            # Classe utilitaire reusable
    ├── dimuser.py                    # Gold DLT, SCD 2 + contrôle qualité
    ├── dimtrack.py                   # Gold DLT, SCD 2
    ├── dimdate.py                    # Gold DLT, SCD 2
    ├── factstream.py                 # Gold DLT, SCD 1
    └── jinja_nb.ipynb                # Génération de requêtes SQL avec Jinja2
```

## 10. Mise en place

**Prérequis** : un abonnement Azure, un espace de travail Azure Databricks avec Unity Catalog, la CLI Databricks pour les Asset Bundles.

1. **Base source** : créez une base Azure SQL et exécutez `spotify_initial_load.sql`.
2. **Stockage** : créez un compte ADLS Gen2 avec les conteneurs `bronze` et `silver`. Pour chaque table, déposez un fichier initial `bronze/{Table}_cdc/cdc.json` contenant une date ancienne, par exemple `[{"cdc": "1900-01-01"}]`.
3. **Data Factory** : reliez la factory à ce dépôt Git, puis adaptez les services liés :
   - `source_adf_linked_service.json` : serveur, base et utilisateur SQL ;
   - `datalake.json` : URL de votre compte de stockage ;
   - `gitrepo_input_for_loop.json` : URL *raw* de votre `loop_input.json`.
4. **Alerte** : créez un Logic App déclenché par une requête HTTP qui envoie un e-mail, et collez son URL dans l'activité `failed_trigger`.
5. **Databricks** : créez le catalogue `spotify_cata` avec les schémas `silver` et `gold`, une External Location vers le compte de stockage, puis :
   - exécutez `files/silver_dimentions.ipynb` pour remplir Silver ;
   - créez un pipeline Delta Live Tables ciblant `spotify_cata.gold` avec les fichiers `dim*.py` et `factstream.py`.
6. **Premier run** : déclenchez `incremental_loop`, puis le notebook Silver et le pipeline DLT.
7. **Test de l'incrémental** : exécutez `spotify_incremental_load.sql` et relancez la chaîne. Seuls les nouveaux fichiers doivent apparaître dans Bronze, et les dimensions Gold doivent montrer les anciennes et nouvelles versions des lignes modifiées.

## 11. Ajouter une nouvelle table

1. Vérifiez que la table possède une colonne qui augmente à chaque modification (par exemple `updated_at`).
2. Ajoutez son entrée dans `loop_input.json` et déposez son `cdc.json` initial dans Bronze.
3. Ajoutez sa section dans le notebook Silver et, si besoin, son fichier DLT pour Gold.

Le pipeline ADF, lui, ne change pas.

## 12. Dépannage

| Symptôme | Cause probable | Solution |
| :--- | :--- | :--- |
| `last_cdc` échoue | `cdc.json` absent pour cette table | Créer `bronze/{Table}_cdc/cdc.json` avec une date ancienne |
| Aucune donnée chargée | Filigrane déjà au maximum | Vérifier `cdc.json`, ou renseigner `from_date` dans `loop_input.json` |
| Fichier Parquet vide dans Bronze | Run sans nouvelles lignes interrompu avant `deleteEmptyFile` | Relancer le pipeline ; l'expression `dataRead > 0` gère ce cas |
| Erreur d'accès dans le notebook | External Location ou droits manquants | Vérifier l'Access Connector et ses rôles sur le stockage |
| Pas d'e-mail | URL ou signature du Logic App invalide | Régénérer l'URL du déclencheur HTTP et la remplacer dans ADF |

## 13. Limites et pistes d'amélioration

- **Le filigrane repose sur une colonne de date** et non sur le Change Data Capture natif de SQL Server : les suppressions dans la source ne sont pas détectées.
- **Silver et Gold sont lancés à la main** : un Databricks Job ou une activité Databricks dans ADF pourrait enchaîner les trois étapes.
- **`dimartist` n'a pas encore de table Gold** : il suffit d'ajouter un fichier DLT sur le même modèle que `dimtrack.py`.
- L'alerte est envoyée à chaque fin de boucle ; la limiter à la condition *Failed* réduirait le bruit.

---

## Auteur

**Amine AIT ALI**, élève-ingénieur Data & IA
GitHub : [@amine-LabsCraft](https://github.com/amine-LabsCraft) · Portfolio : [amine-aitali-5752.netlify.app](https://amine-aitali-5752.netlify.app/)
