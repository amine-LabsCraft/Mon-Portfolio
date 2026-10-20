<div align="center">

# Pipeline Data Engineering temps réel avec Kafka et Hadoop HDFS

### De 100 000 événements ProductView Hepsiburada vers un stockage distribué HDFS

![AWS](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.7-3776AB?style=for-the-badge&logo=python&logoColor=FFD43B)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)
![Apache Hadoop](https://img.shields.io/badge/Apache_Hadoop-66CCFF?style=for-the-badge&logo=apachehadoop&logoColor=black)
![Licence MIT](https://img.shields.io/badge/Licence-MIT-2EA44F?style=for-the-badge)

**Pipeline conteneurisé de bout en bout pour publier, transporter, superviser et stocker des événements e-commerce en temps réel.**

</div>

---

## Sommaire

- [Présentation](#présentation)
- [Objectifs du projet](#objectifs-du-projet)
- [Architecture générale](#architecture-générale)
- [Flux de données de bout en bout](#flux-de-données-de-bout-en-bout)
- [Composants techniques](#composants-techniques)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Déploiement sur AWS EC2](#déploiement-sur-aws-ec2)
- [Démarrage de la stack](#démarrage-de-la-stack)
- [Vérification et supervision](#vérification-et-supervision)
- [Configuration Hadoop et YARN](#configuration-hadoop-et-yarn)
- [Ports et interfaces](#ports-et-interfaces)
- [Dépannage](#dépannage)
- [Limites et améliorations possibles](#limites-et-améliorations-possibles)
- [Licence](#licence)

---

## Présentation

Ce projet met en œuvre une architecture de **Data Engineering temps réel** capable d'ingérer un jeu de données e-commerce, de publier les événements dans **Apache Kafka**, puis de les enregistrer dans **Hadoop HDFS**.

Le jeu de données source, `hb-data.json`, contient **100 000 événements `ProductView`** au format JSON. Un producteur Python lit les événements ligne par ligne et les publie dans le topic Kafka `hb`. Un consommateur Python s'abonne ensuite à ce topic et écrit chaque événement dans HDFS à travers WebHDFS.

L'ensemble de la plateforme s'exécute dans des conteneurs Docker, orchestrés par **Docker Compose**, sur une seule instance **AWS EC2 Ubuntu**. Des interfaces Web permettent de superviser Kafka, HDFS et YARN.

### Résumé du pipeline

```text
hb-data.json
     │
     ▼
Producteur Python
     │
     ▼
Apache Kafka ─────────► Kafka UI
Topic : hb               Supervision
     │
     ▼
Consommateur Python
     │
     ▼
Hadoop HDFS ──────────► Interface NameNode / WebHDFS
     │
     └────────────────► YARN ResourceManager
```

### Chiffres clés

- **100 000** événements JSON de type `ProductView`
- **1** topic Kafka : `hb`
- **1** broker Kafka dans l'implémentation de référence
- **1** NameNode et **1** DataNode HDFS
- **1** ResourceManager et **1** NodeManager YARN
- **9 services conteneurisés** : NameNode, DataNode, ResourceManager, NodeManager, ZooKeeper, Kafka, Kafka UI, producteur et consommateur
- **1 instance AWS EC2** exécutant l'ensemble de la stack
- Réplication HDFS configurée à **1**, adaptée à une démonstration mono-nœud

---

## Objectifs du projet

Ce projet a pour objectifs de :

- construire un pipeline d'ingestion événementielle reproductible ;
- comprendre le rôle d'un producteur et d'un consommateur Kafka ;
- utiliser Kafka comme couche de transport et de mise en tampon ;
- persister des événements JSON dans un système de fichiers distribué ;
- orchestrer plusieurs services interdépendants avec Docker Compose ;
- déployer une stack Data Engineering sur une machine virtuelle cloud ;
- superviser les messages Kafka, le stockage HDFS et les ressources YARN ;
- servir de projet démonstratif pour un portfolio Data Engineering.

---

## Architecture générale

![Architecture du pipeline Kafka vers Hadoop HDFS](images/map.png)

*Figure 1 — Architecture conceptuelle du pipeline : source JSON, producteur Python, Kafka, consommateur Python, HDFS, Kafka UI, YARN et infrastructure AWS EC2 avec Docker Compose.*

> [!NOTE]
> Le schéma présente les responsabilités fonctionnelles de l'architecture. L'implémentation actuelle est une plateforme **mono-instance et mono-nœud** : elle utilise un seul broker Kafka, un seul NameNode, un seul DataNode, un seul ResourceManager et un seul NodeManager. Elle constitue une architecture d'apprentissage et de démonstration, pas un cluster hautement disponible.

### Couches logiques

#### 1. Source de données

Le fichier `docker/producer/hb-data.json` contient 100 000 enregistrements JSON séparés par des retours à la ligne. Chaque enregistrement représente une consultation de produit et comprend notamment :

- le type d'événement `ProductView` ;
- un identifiant de message UUID ;
- un identifiant utilisateur ;
- un identifiant produit dans `properties.productid` ;
- une source cliente dans `context.source`, par exemple `desktop` ou `mobile-app`.

#### 2. Streaming et traitement

Le producteur Python transforme le fichier statique en flux d'événements. Kafka reçoit les messages, les conserve temporairement dans le topic `hb` et découple la production de la consommation. Le consommateur lit les messages depuis le premier offset disponible et active l'auto-commit.

#### 3. Stockage

Pour chaque message Kafka consommé, le client PyHDFS appelle WebHDFS et crée un fichier JSON distinct sous `/data`. Le nom de fichier est généré avec un UUID afin d'éviter les collisions.

#### 4. Observabilité

Kafka UI permet d'inspecter les topics, partitions, offsets et messages. Les interfaces Web Hadoop exposent l'état du système de fichiers HDFS, la capacité du DataNode et les métriques YARN.

#### 5. Infrastructure

Tous les composants s'exécutent dans des conteneurs Docker sur une instance EC2 Ubuntu. Docker Compose gère les services, les volumes, les variables d'environnement, les dépendances et le réseau interconteneurs.

---

## Flux de données de bout en bout

### Étape 1 : lecture des événements

Le script `kafka_producer.py` ouvre `hb-data.json`, lit le fichier ligne par ligne, désérialise chaque document JSON et prépare le message pour Kafka.

### Étape 2 : publication dans Kafka

Le producteur utilise `kafka-python` et se connecte à l'adresse interne suivante :

```text
kafka:29092
```

Les événements sont publiés dans le topic :

```text
hb
```

### Étape 3 : mise en tampon

Kafka agit comme un journal distribué. Dans cette implémentation :

- la création automatique des topics est activée ;
- le topic `hb` peut être créé automatiquement au premier envoi ;
- le facteur de réplication est de `1` ;
- ZooKeeper coordonne le broker Kafka utilisé par les images Confluent de cette stack.

### Étape 4 : consommation

Le script `kafka_consumer.py` :

- s'abonne au topic `hb` ;
- appartient au groupe `my-group` ;
- démarre à l'offset le plus ancien si aucun offset validé n'existe ;
- utilise l'auto-commit ;
- transmet chaque message reçu au module `hdfs.py`.

### Étape 5 : écriture dans HDFS

Le module `hdfs.py` se connecte au NameNode via WebHDFS :

```text
http://namenode:9870
```

Chaque événement est enregistré individuellement sous une forme similaire à :

```text
/data/000179d6-7af3-11ee-b55d-0242c0a8b009.json
```

Cette approche simplifie la démonstration du flux complet. Pour de très gros volumes, il serait préférable de regrouper plusieurs événements dans des fichiers plus grands afin d'éviter le problème des nombreux petits fichiers dans HDFS.

---

## Composants techniques

| Composant | Rôle | Détails |
|---|---|---|
| `hb-data.json` | Source | 100 000 événements `ProductView` au format JSON Lines |
| Producteur Python | Ingestion | Lit les lignes JSON et les publie vers Kafka |
| Apache Kafka | Streaming | Met en tampon les événements dans le topic `hb` |
| ZooKeeper | Coordination | Coordonne le broker Kafka de cette version de la stack |
| Kafka UI | Observabilité | Affiche clusters, topics, partitions, offsets et messages |
| Consommateur Python | Livraison | Consomme `hb` et transmet les messages à HDFS |
| NameNode | Métadonnées HDFS | Gère l'espace de noms et la localisation des blocs |
| DataNode | Stockage HDFS | Stocke physiquement les données du cluster mono-nœud |
| ResourceManager | Gestion YARN | Gère les ressources et la planification globale |
| NodeManager | Exécution YARN | Gère les ressources et conteneurs du nœud |
| Docker Compose | Orchestration | Construit et démarre tous les services |
| AWS EC2 | Infrastructure | Héberge la stack complète sur une instance Ubuntu |

### Technologies utilisées

<p align="center">
  <img src="images/Overall.png" alt="Architecture du pipeline" width="800"/>
</p>

- **Cloud :** AWS EC2
- **Système :** Ubuntu
- **Conteneurisation :** Docker et Docker Compose
- **Langage :** Python 3.7
- **Streaming :** Apache Kafka 5.0.0 via images Confluent
- **Coordination :** ZooKeeper
- **Client Kafka :** `kafka-python`
- **Stockage :** Apache Hadoop 3, HDFS et WebHDFS
- **Client HDFS :** PyHDFS
- **Gestion des ressources :** Hadoop YARN
- **Supervision :** Kafka UI, NameNode UI et ResourceManager UI

---

## Structure du projet




```text
Data-Eng-Kafka-Hadoop/
├── README.md
├── LICENSE
├── docker-compose.yml
├── config-hadoop
├── test.sh
├── images/
│   ├── map.png
│   ├── instance.png
│   ├── ingress.png
│   ├── kafka_ui.png
│   ├── hdfs_datanode.png
│   ├── hdfs_data.png
│   └── hadoop.png
└── docker/
    ├── producer/
    │   ├── Dockerfile
    │   ├── requirements.txt
    │   ├── kafka_producer.py
    │   └── hb-data.json
    └── consumer/
        ├── Dockerfile
        ├── requirements.txt
        ├── kafka_consumer.py
        └── hdfs.py
```

### Fichiers principaux

- `docker-compose.yml` décrit les services, réseaux, volumes et variables d'environnement.
- `config-hadoop` centralise la configuration de HDFS, YARN et MapReduce.
- `kafka_producer.py` publie les événements source dans Kafka.
- `kafka_consumer.py` lit les événements Kafka.
- `hdfs.py` écrit les messages dans HDFS via PyHDFS.
- `hb-data.json` contient les 100 000 événements source.
- `images/` contient le schéma d'architecture et les preuves visuelles du déploiement.

---

## Prérequis

### Infrastructure recommandée

La démonstration de référence utilise :

- un compte AWS ;
- une instance EC2 `t2.large` ;
- Ubuntu ;
- un accès SSH ;
- Docker ;
- Docker Compose ;
- suffisamment de mémoire pour exécuter Kafka et Hadoop simultanément.

> [!WARNING]
> Une instance de petite taille peut manquer de mémoire pendant le démarrage simultané de Kafka, Hadoop, YARN et des applications Python.

### Installation de Docker

Vérifier l'installation des outils :

```bash
docker --version
docker compose version
```

Selon l'environnement, l'ancienne commande peut également être disponible :

```bash
docker-compose --version
```

---

## Déploiement sur AWS EC2

### 1. Créer l'instance EC2

Créer une instance Ubuntu disposant des ressources suffisantes, puis vérifier que l'état de l'instance est `Running` et que les contrôles de statut sont validés.

![Instance AWS EC2 t2.large kafka-hadoop](images/instance.png)

*Figure 2 — Console AWS EC2 montrant l'instance `t2.large` nommée `kafka-hadoop` en cours d'exécution.*

### 2. Configurer le groupe de sécurité

Les règles entrantes doivent autoriser uniquement les accès réellement nécessaires. La capture suivante montre la configuration utilisée pour SSH et les interfaces Web du projet.

![Règles entrantes du groupe de sécurité AWS](images/ingress.png)

*Figure 3 — Règles de trafic entrant ouvrant SSH, HDFS NameNode, YARN ResourceManager et Kafka UI.*

Ports à prévoir :

| Port | Service | Usage |
|---:|---|---|
| `22` | SSH | Administration de l'instance |
| `9870` | HDFS NameNode UI | État HDFS et explorateur WebHDFS |
| `8088` | YARN ResourceManager UI | État des ressources et des nœuds |
| `8080` | Kafka UI | Consultation des topics et messages |
| `9092` | Kafka | Accès externe au broker, seulement si nécessaire |

> [!CAUTION]
> Éviter d'exposer ces ports à `0.0.0.0/0` dans un environnement réel. Restreindre la source à une adresse IP de confiance ou utiliser un VPN, un tunnel SSH ou un reverse proxy authentifié.

### 3. Configurer le pare-feu Ubuntu

Si UFW est actif :

```bash
sudo ufw allow 22/tcp
sudo ufw allow 9870/tcp
sudo ufw allow 8088/tcp
sudo ufw allow 8080/tcp
sudo ufw status
```

N'ouvrir `9092` que si un client Kafka extérieur à l'instance doit accéder au broker.

### 4. Récupérer le projet

```bash
git clone <URL_DU_DEPOT>
cd Data-Eng-Kafka-Hadoop
```

### 5. Préparer les éléments requis

Le fichier Compose attend un réseau externe nommé `kafka-network` :

```bash
docker network create kafka-network
```

Vérifier sa création :

```bash
docker network ls | grep kafka-network
```

Le fichier Compose référence également `test.sh`. Si ce fichier n'existe pas dans le dépôt, créer un fichier vide :

```bash
touch test.sh
```

Une autre solution consiste à supprimer proprement le montage correspondant dans `docker-compose.yml` s'il n'est pas utilisé.

---

## Démarrage de la stack

### Construction et lancement

Avec Docker Compose v2 :

```bash
docker compose up --build -d
```

Avec l'ancienne commande :

```bash
docker-compose up --build -d
```

### Vérifier les conteneurs

```bash
docker compose ps
```

La stack comprend les neuf services fonctionnels suivants :

1. `namenode`
2. `datanode`
3. `resourcemanager`
4. `nodemanager`
5. `zookeeper`
6. `kafka`
7. `kafka-ui`
8. `producer`
9. `consumer`

### Suivre les journaux

```bash
docker compose logs -f
```

Journaux ciblés :

```bash
docker compose logs -f producer
docker compose logs -f consumer
docker compose logs -f kafka
docker compose logs -f namenode
```

Le producteur attend environ **40 secondes** et le consommateur environ **50 secondes** avant de se connecter. Ces délais donnent à Kafka et HDFS le temps de démarrer. Les événements commencent donc à circuler automatiquement environ une minute après le lancement.

### Arrêter la stack

```bash
docker compose down
```

Pour supprimer également les volumes associés, avec perte des données persistées :

```bash
docker compose down -v
```

---

## Vérification et supervision

Remplacer `<IP_EC2>` par l'adresse IP publique ou le nom DNS de l'instance.

### 1. Vérifier Kafka avec Kafka UI

Accès :

```text
http://<IP_EC2>:8080
```

![Kafka UI affichant les événements du topic hb](images/kafka_ui.png)

*Figure 4 — Kafka UI affichant les événements JSON publiés dans le topic `hb`, ainsi que les informations relatives aux partitions et aux messages.*

Points à contrôler :

- le cluster Kafka est accessible ;
- le topic `hb` existe ;
- le nombre de messages augmente pendant l'exécution du producteur ;
- les valeurs des messages contiennent des événements JSON valides ;
- le consommateur progresse dans les offsets.

### 2. Vérifier l'état du DataNode HDFS

Accès :

```text
http://<IP_EC2>:9870
```

![Tableau de bord du DataNode Hadoop HDFS](images/hdfs_datanode.png)

*Figure 5 — Tableau de bord HDFS montrant l'état de fonctionnement du DataNode, la capacité configurée, l'espace utilisé et l'espace restant.*

Points à contrôler :

- un DataNode actif est visible ;
- la capacité de stockage est détectée ;
- l'espace utilisé augmente au fur et à mesure des écritures ;
- aucun DataNode mort n'est signalé.

### 3. Vérifier les fichiers dans WebHDFS

Accès direct à l'explorateur :

```text
http://<IP_EC2>:9870/explorer.html#/data
```

![Explorateur WebHDFS du répertoire data](images/hdfs_data.png)

*Figure 6 — Explorateur de fichiers WebHDFS affichant le répertoire `/data` rempli de fichiers JSON créés par le consommateur.*

Chaque fichier correspond à un message consommé depuis Kafka. Le répertoire doit progressivement se remplir pendant l'exécution du pipeline.

Une vérification depuis un conteneur Hadoop peut également être effectuée :

```bash
docker compose exec namenode hdfs dfs -ls /data
```

Pour compter les fichiers :

```bash
docker compose exec namenode sh -c "hdfs dfs -ls /data | grep -v '^Found' | wc -l"
```

### 4. Vérifier YARN ResourceManager

Accès :

```text
http://<IP_EC2>:8088
```

![Interface Hadoop YARN ResourceManager](images/hadoop.png)

*Figure 7 — Interface d'administration Hadoop YARN montrant les métriques globales, le ResourceManager et l'état des nœuds enregistrés dans le cluster.*

Points à contrôler :

- le ResourceManager est accessible ;
- le NodeManager est actif ;
- les ressources mémoire et CPU sont détectées ;
- aucun nœud perdu ou non sain n'est signalé.

---

## Configuration Hadoop et YARN

Le fichier `config-hadoop` injecte les propriétés Hadoop dans les conteneurs. Les paramètres essentiels sont les suivants :

| Fichier Hadoop | Propriété | Valeur | Fonction |
|---|---|---|---|
| `core-site.xml` | `fs.defaultFS` | `hdfs://namenode` | Définit le système de fichiers HDFS par défaut |
| `hdfs-site.xml` | `dfs.namenode.rpc-address` | `namenode:8020` | Définit l'adresse RPC du NameNode |
| `hdfs-site.xml` | `dfs.webhdfs.enabled` | `true` | Active l'API REST WebHDFS utilisée par PyHDFS |
| `hdfs-site.xml` | `dfs.permissions` | `false` | Désactive les contrôles de permissions pour la démonstration |
| `hdfs-site.xml` | `dfs.replication` | `1` | Utilise une seule copie, cohérente avec le DataNode unique |
| `mapred-site.xml` | `mapreduce.framework.name` | `yarn` | Configure YARN comme framework MapReduce |
| `yarn-site.xml` | `yarn.resourcemanager.hostname` | `resourcemanager` | Indique au NodeManager où s'enregistrer |
| `yarn-site.xml` | contrôles mémoire NodeManager | `false` | Évite certaines interruptions sur une petite instance |
| `capacity-scheduler.xml` | capacité de la file `default` | `100` | Attribue la capacité du cluster à la file par défaut |

> [!IMPORTANT]
> `dfs.permissions=false` et les interfaces Web sans authentification simplifient l'apprentissage, mais ne conviennent pas à un environnement de production.

---

## Ports et interfaces

| Service | Port | Adresse | Exposition recommandée |
|---|---:|---|---|
| SSH | `22` | `ssh ubuntu@<IP_EC2>` | IP d'administration uniquement |
| Kafka UI | `8080` | `http://<IP_EC2>:8080` | Restreinte |
| YARN ResourceManager | `8088` | `http://<IP_EC2>:8088` | Restreinte |
| HDFS NameNode UI | `9870` | `http://<IP_EC2>:9870` | Restreinte |
| Kafka externe | `9092` | `<IP_EC2>:9092` | Seulement si nécessaire |
| Kafka interne | `29092` | `kafka:29092` | Réseau Docker uniquement |
| ZooKeeper | `2181` | `zookeeper:2181` | Réseau Docker uniquement |
| NameNode RPC | `8020` | `namenode:8020` | Réseau Docker uniquement |

---

## Dépannage

### Le réseau Docker externe est introuvable

Erreur possible :

```text
network kafka-network declared as external, but could not be found
```

Correction :

```bash
docker network create kafka-network
docker compose up --build -d
```

### `test.sh` est créé comme un répertoire

Lorsque le fichier monté n'existe pas, Docker peut créer un répertoire à sa place. Corriger avec :

```bash
rm -rf test.sh
touch test.sh
```

Puis relancer :

```bash
docker compose down
docker compose up --build -d
```

### Kafka UI ne montre pas le topic `hb`

Vérifier les journaux :

```bash
docker compose logs kafka
docker compose logs producer
docker compose logs kafka-ui
```

Attendre la fin du délai initial du producteur, puis actualiser Kafka UI.

### Aucun fichier n'apparaît dans `/data`

Vérifier successivement :

```bash
docker compose logs consumer
docker compose logs namenode
docker compose ps
```

Contrôler que :

- le topic `hb` contient des messages ;
- le consommateur peut résoudre `kafka` ;
- WebHDFS est activé ;
- le NameNode répond sur `namenode:9870` ;
- le répertoire `/data` est accessible.

### Un service manque de mémoire

Inspecter l'utilisation :

```bash
docker stats
free -h
```

Utiliser une instance plus grande, limiter les ressources des conteneurs ou démarrer les services progressivement pour diagnostiquer le composant en cause.

---

## Limites et améliorations possibles

### Limites actuelles

- **Absence de haute disponibilité :** un seul broker Kafka et un seul DataNode.
- **Réplication HDFS à 1 :** aucune redondance en cas de perte du DataNode.
- **Jeu de données fini :** les 100 000 événements sont publiés une seule fois.
- **Nombreux petits fichiers :** un fichier HDFS est créé pour chaque message.
- **Sécurité limitée :** pas d'authentification sur les interfaces Web et permissions HDFS désactivées.
- **Python 3.7 en fin de vie :** l'image de base doit être modernisée.
- **ZooKeeper :** la stack correspond à une génération de Kafka qui dépend encore de ZooKeeper.
- **Délais fixes :** les attentes de 40 et 50 secondes sont moins robustes que des contrôles de santé.
- **Instance unique :** tous les services partagent les mêmes ressources et le même domaine de panne.

### Améliorations recommandées

- migrer vers une version récente de Python ;
- mettre à niveau Kafka et envisager le mode KRaft ;
- ajouter des `healthcheck` Docker au lieu de délais fixes ;
- augmenter le nombre de brokers Kafka et le facteur de réplication ;
- déployer plusieurs DataNodes HDFS ;
- agréger les événements en lots avant l'écriture dans HDFS ;
- écrire dans des formats analytiques comme Parquet ou Avro ;
- partitionner les données par date, heure ou type d'événement ;
- intégrer Schema Registry pour contrôler les schémas ;
- ajouter Prometheus et Grafana pour les métriques ;
- sécuriser les communications avec TLS et authentification ;
- restreindre les Security Groups et ne pas exposer directement les interfaces Web ;
- automatiser l'infrastructure avec Terraform ;
- ajouter une chaîne CI/CD pour les tests, la construction et le déploiement ;
- ajouter des tests unitaires pour le producteur, le consommateur et la couche HDFS ;
- mettre en place une stratégie de reprise et de gestion des messages en erreur.

---

## Scénario de démonstration

Pour présenter rapidement le projet :

1. ouvrir Kafka UI sur le port `8080` ;
2. montrer le topic `hb` et les événements `ProductView` ;
3. ouvrir l'explorateur HDFS sur `/data` ;
4. confirmer la création progressive des fichiers JSON ;
5. afficher l'état du DataNode sur le port `9870` ;
6. afficher les ressources YARN sur le port `8088` ;
7. montrer `docker compose ps` pour confirmer la conteneurisation de la stack.

Le récit de bout en bout est le suivant :

> Un jeu de données e-commerce produit 100 000 événements JSON. Un producteur Python publie ces événements dans le topic Kafka `hb`. Kafka assure leur transport et leur mise en tampon. Un consommateur Python les récupère et les persiste dans Hadoop HDFS. Kafka UI, HDFS UI et YARN permettent de superviser le pipeline, tandis que Docker Compose orchestre l'ensemble sur une instance AWS EC2 Ubuntu.

---

## Licence

Ce projet est distribué sous licence **MIT**. Consulter le fichier [LICENSE](LICENSE) pour plus d'informations.

---
## 👤 Auteur

**Amine Ait Ali**  
Data Engineering · Lakehouse Architecture · Analytics Engineering

[![GitHub](https://img.shields.io/badge/GitHub-amine--LabsCraft-181717?style=flat&logo=github)](https://github.com/amine-LabsCraft)
[![Portfolio](https://img.shields.io/badge/Portfolio-amine--aitali--5752.netlify.app-00C7B7?style=flat&logo=netlify&logoColor=white)](https://amine-aitali-5752.netlify.app/)



<div align="center">

**Projet Data Engineering : Python • Kafka • Hadoop HDFS • YARN • Docker • AWS EC2**

</div>
