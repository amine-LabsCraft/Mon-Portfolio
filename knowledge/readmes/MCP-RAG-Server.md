# 🤖 MCP RAG Server

Un serveur MCP local qui connecte **Claude Desktop** à votre base de données SQLite et vos documents internes — sans cloud, sans Docker, sans clé API.

Posez des questions en langage naturel et Claude interroge automatiquement vos données.

---

## ✨ Fonctionnalités

- **`db_query`** — Interroge une base SQLite en lecture seule via SQL généré automatiquement
- **`rag_search`** — Recherche sémantique dans vos documents `.txt` / `.md` (FAISS + sentence-transformers)
- **`rag_get`** — Récupère un passage exact pour citation avec `doc_id` + `chunk_id`
- **Sécurité SQL** — Bloque automatiquement INSERT / UPDATE / DELETE / DROP et toute écriture
- **100% local** — Embeddings via `all-MiniLM-L6-v2` (sentence-transformers), pas de clé API requise

---

## 🏗️ Architecture

```
Claude Desktop
    │  (stdio)
    ▼
mcp_server/__main__.py
    ├── db_tool.py        → SQL read-only → data/app.db
    └── rag_tools.py      → rag_search / rag_get
            │
            ▼
        rag/retriever.py
            ├── embedder.py   (sentence-transformers, local)
            └── store.py      (FAISS index + SQLite metadata)
                    │
                    └── data/index/   (index vectoriel persistant)
```

---

## ⚙️ Prérequis

- Python **3.11** ou **3.12**
- Claude Desktop installé (version non-Store)

---

## 🚀 Installation

```bash
# 1. Cloner ou extraire le projet
cd mcp-rag-server

# 2. Créer l'environnement virtuel
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
.venv\Scripts\activate.bat       # Windows cmd

# 3. Installer les dépendances
pip install -e ".[dev]"

# 4. Configurer
cp .env.example .env

# 5. Créer la base de données de démo
python scripts/setup_db.py

# 6. Indexer les documents
python scripts/ingest_docs.py

# 7. Vérifier que tout fonctionne
python scripts/test_tools.py
```

---

## 🔌 Connexion à Claude Desktop

Ajouter dans `%APPDATA%\Claude\claude_desktop_config.json` (Windows) ou `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) :

```json
{
  "mcpServers": {
    "mcp-rag-server": {
      "command": "/chemin/absolu/.venv/bin/python",
      "args": ["-m", "mcp_server"],
      "cwd": "/chemin/absolu/mcp-rag-server"
    }
  }
}
```

Redémarrer Claude Desktop. Le connecteur **mcp-rag-server** apparaît dans `+ → Connecteurs`.

---

## 💬 Utilisation

Dans un projet Claude Desktop avec les instructions système adaptées, posez des questions en langage naturel :

```
Quel est le chiffre d'affaires par catégorie ?
Quels sont les 3 meilleurs clients ?
Quelle est la politique de retours ?
Quels délais de livraison pour l'Europe ?
```

Claude traduit automatiquement en SQL ou recherche sémantique selon le contexte.

---

## 📁 Structure du projet

```
mcp-rag-server/
├── mcp_server/
│   ├── __main__.py       # Point d'entrée MCP stdio
│   ├── db_tool.py        # Outil db_query (SQL sécurisé)
│   └── rag_tools.py      # Outils rag_search / rag_get
├── rag/
│   ├── config.py         # Configuration via .env
│   ├── chunker.py        # Découpage des documents
│   ├── embedder.py       # Embeddings locaux (sentence-transformers)
│   ├── store.py          # Index FAISS + métadonnées SQLite
│   └── retriever.py      # API de recherche
├── scripts/
│   ├── setup_db.py       # Création base de démo
│   ├── ingest_docs.py    # Indexation des documents
│   ├── test_tools.py     # Smoke tests
│   └── demo_questions.md # Exemples de questions
├── docs/                 # Vos documents à indexer
├── data/                 # Base SQLite + index FAISS (auto-créés)
├── tests/                # Tests unitaires pytest
├── .env.example          # Configuration exemple
└── pyproject.toml        # Dépendances
```

---

## 🗄️ Base de données de démo

```sql
products    -- 10 produits (Electronics, Furniture, Software...)
customers   --  8 clients (B2B/B2C, France/Allemagne/USA)
orders      -- 15 commandes (déc. 2024 → mars 2025)
order_items -- 26 lignes de commande
```

---

## 📄 Documents de démo

| Fichier | Contenu |
|---|---|
| `politique_commerciale.md` | Tarifs, remises volume (5-15%), remises fidélité |
| `politique_retours.md` | Retours B2C (14j), retours défaut, politique B2B |
| `onboarding_client.md` | Étapes onboarding, SLA support P1-P4 |
| `livraison_sla.txt` | Délais FR/EU/international, transporteurs, réclamations |

---

## 🔧 Configuration `.env`

```env
DB_PATH=data/app.db
DOCS_DIR=docs
INDEX_DIR=data/index
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE=1000
CHUNK_OVERLAP=150
LOG_LEVEL=INFO
# OPENAI_API_KEY=sk-...  # Optionnel, fallback OpenAI
```

---

## 🧪 Tests

```bash
# Smoke tests (3 outils + sécurité SQL)
python scripts/test_tools.py

# Tests unitaires
pytest tests/ -v
```

---

## 📦 Dépendances principales

| Package | Version | Rôle |
|---|---|---|
| `mcp` | ≥1.0.0 | Protocole MCP |
| `sentence-transformers` | ≥2.7.0 | Embeddings locaux |
| `faiss-cpu` | ≥1.7.4 | Index vectoriel |
| `aiosqlite` | ≥0.19.0 | SQLite async |
| `pydantic` | ≥2.5.0 | Validation config |

---

## 🔒 Sécurité SQL

Le moteur SQL refuse toute opération d'écriture via deux couches de protection :

1. **Liste blanche** — seuls `SELECT`, `WITH`, `EXPLAIN`, `PRAGMA` sont autorisés
2. **Liste noire** — 17 mots-clés bloqués : `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `REPLACE`, `TRUNCATE`, `ATTACH`, `DETACH`, `VACUUM`, `REINDEX`, `SAVEPOINT`, `ROLLBACK`, `COMMI[...]
3. **Connexion read-only** — SQLite ouvert en mode `uri=ro`

---

## 📝 Licence

MIT

---

## 👤 Auteur

**Amine Ait Ali**  
- GitHub: [@amine-LabsCraft](https://github.com/amine-LabsCraft)  
- Portfolio: [amine-aitali-5752.netlify.app](https://amine-aitali-5752.netlify.app/)
