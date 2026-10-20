<div align="center">

# VMAX PARFUMS

### *La puissance au masculin.*

**Plateforme e-commerce premium dédiée à une collection de 22 fragrances masculines de luxe.**

![Node](https://img.shields.io/badge/Node.js-≥20-2ecc71?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-CC0000?style=flat-square&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=flat-square&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT_+_OAuth_+_OTP-0A0A0A?style=flat-square)
![License](https://img.shields.io/badge/License-Propriétaire-CC0000?style=flat-square)

</div>

---

## 📜 Sommaire

1. [Aperçu](#-aperçu)
2. [Démarrage rapide](#-démarrage-rapide)
3. [Stack technique](#-stack-technique)
4. [Structure du projet](#-structure-du-projet)
5. [Pages & fonctionnalités](#-pages--fonctionnalités)
6. [API REST](#-api-rest)
7. [Schéma de la base de données](#-schéma-de-la-base-de-données)
8. [Flux d'authentification](#-flux-dauthentification)
9. [Variables d'environnement](#-variables-denvironnement)
10. [Sécurité](#-sécurité)
11. [Mode offline (sans backend)](#-mode-offline-sans-backend)
12. [Documentation complète](#-documentation-complète)

---

## ✨ Aperçu

VMAX est une plateforme web full-stack construite **sans framework frontend** (HTML/CSS/JS vanilla), avec un backend Node.js + Express + SQLite. Le projet incarne le positionnement *« La puissance au masculin »* à travers une expérience cinématographique : hero vidéo, pyramide olfactive interactive, quiz de recommandation, modal boutiques en temps réel, et tunnel de commande Stripe.

| 🛍️ Catalogue | 🔐 Auth | 🛒 Commerce | 📊 Data |
|:---:|:---:|:---:|:---:|
| **22** parfums | Email + Google OAuth | Stripe + COD | Analytics natif |
| 5 catégories | OTP obligatoire | Codes promo | Quiz olfactif |
| Pyramide notes | JWT HS256 | 6 boutiques live | Tableau de bord |

> **Chiffres clés :** 22 parfums · 6 boutiques · 28 routes API · 6 tables SQL · 9 640 lignes de code

---

## 🚀 Démarrage rapide

### Prérequis
- **Node.js ≥ 20** (utilise `fetch` natif et `AbortSignal.timeout`)
- npm
- Un compte Gmail (App Password) pour l'envoi des OTP
- (optionnel) Identifiants OAuth Google et clé Stripe

### Installation

```bash
# 1. Cloner le projet et entrer dans le backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env à partir du modèle
cp .env.example .env       # macOS / Linux
copy .env.example .env     # Windows

# 4. Éditer .env (voir la section "Variables d'environnement")

# 5. Démarrer le serveur
node server.js
```

✅ Le serveur s'expose sur **http://localhost:3000**
✅ Le frontend est servi automatiquement par Express depuis la racine du projet
✅ Comptes admin garantis au démarrage (voir [Sécurité](#-sécurité))

### Pages accessibles

| URL | Page |
|---|---|
| `http://localhost:3000/` | Accueil (vitrine + catalogue) |
| `http://localhost:3000/product.html?id=1` | Fiche produit (1 → 22) |
| `http://localhost:3000/quiz.html` | Quiz olfactif |
| `http://localhost:3000/checkout.html` | Tunnel de commande |
| `http://localhost:3000/docs/presentation.html` | Présentation slides 🎥 |

---

## 🧰 Stack technique

### Frontend (zéro dépendance)

| Composant | Détails |
|---|---|
| HTML5 sémantique | 4 pages : `index.html` · `product.html` · `quiz.html` · `checkout.html` |
| CSS3 vanilla | **1 776 lignes** · Grid · Flexbox · `clip-path` · `@keyframes` · variables CSS |
| JavaScript ES2022 | **1 901 lignes** · `async/await` · `IntersectionObserver` · `AbortSignal.timeout()` · `Intl.DateTimeFormat` |
| Web APIs natives | `fetch` · `localStorage` · `URLSearchParams` |

### Backend

| Brique | Rôle |
|---|---|
| **Node.js ≥ 20** | Runtime (fetch natif, AbortSignal) |
| **Express 4** | Framework HTTP, routing déclaratif |
| **better-sqlite3** | Driver SQLite synchrone, transactions ACID |
| **bcrypt** | Hash passwords (12 rounds) |
| **jsonwebtoken** | JWT HS256 avec expiration paramétrée |
| **nodemailer** | SMTP Gmail (App Password) — OTP & marketing |
| **helmet** | Headers de sécurité (CSP, X-Frame-Options) |
| **express-rate-limit** | Anti brute-force sur `/login`, `/register`, `/forgot-password` |
| **stripe** | Paiement Payment Intent (mode test ou simulation) |

---

## 📁 Structure du projet

```
Vmax_ri7a_2/
├── index.html              ← Accueil (vitrine + catalogue)
├── product.html            ← Fiche produit (lit ?id=N)
├── quiz.html               ← Quiz olfactif interactif
├── checkout.html           ← Tunnel de commande
├── styles.css              ← Feuille de style globale (1 776 l.)
├── script.js               ← Logique frontend complète (1 901 l.)
├── admin.html.disabled     ← Panneau admin désactivé (conservé)
├── README.md               ← Ce fichier
│
├── images/                 ← 22 visuels produits + assets
│   ├── Parfum signature.jpg
│   ├── Parfum aquatique.png
│   ├── ... (22 fichiers)
│   ├── special1.png · special2.png
│   └── vedio.mp4           ← Hero vidéo (orthographe d'origine)
│
├── docs/                   ← Documentation
│   ├── rapport.tex         ← Rapport technique LaTeX (~900 l.)
│   ├── presentation.html   ← Slideshow interactif 14 slides
│   └── README.md           ← Guide compilation + présentation
│
└── backend/
    ├── server.js           ← Serveur Express + routes (1 075 l.)
    ├── vmax_users.db       ← Base SQLite (auto-créée)
    ├── .env                ← Variables d'env (non versionné)
    ├── .env.example        ← Modèle public
    └── package.json
```

---

## 🛍️ Pages & fonctionnalités

### `index.html` — La vitrine
- **Hero vidéo** : `<video autoplay muted loop>` avec contrôles overlayed
- **Collection** : grille des 22 parfums, filtres par catégorie (intense · boisé · oriental · frais · sport)
- **Pyramide olfactive interactive** sur 4 fragrances signature
- **Témoignages** carrousel auto-scroll (13 avis)
- **Modal boutiques** : 6 villes avec statut temps réel (Casablanca, Rabat, Marrakech, Khouribga, Paris, Dubai)
- **Modaux** : authentification, panier drawer, wishlist, cookies

### `product.html` — Fiche produit
- Lecture du paramètre `?id=N` (1 à 22)
- Notes olfactives détaillées + timeline d'évolution (0–30 min · 30 min–3 h · +3 h)
- Sélecteur de contenance (50 ml · 100 ml · 200 ml)
- Produits similaires

### `quiz.html` — Recommandation olfactive
- **7 questions pondérées** sur les goûts et l'occasion
- Recommandation de 2–3 fragrances correspondant au profil
- Sauvegarde anonyme dans `quiz_results`

### `checkout.html` — Tunnel de commande
- Récapitulatif du panier (lu depuis `localStorage`)
- Codes promo : `VMAX20` · `NOIR50` · `BIENVENUE` · `VMAX10`
- Stripe Payment Intent (test) ou COD (Cash on Delivery)
- Référence générée : `VMAX-YYYYMMDD-XXXX`
- Timeline de livraison

---

## 🔗 API REST

**28 routes** au total, organisées en 5 groupes.

<details>
<summary><strong>🔐 Authentification — 10 routes</strong></summary>

| Verbe | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | Public | Création de compte + envoi OTP |
| POST | `/api/verify-email` | Public | Validation OTP, renvoi JWT |
| POST | `/api/resend-code` | Public | Renvoi du code OTP |
| POST | `/api/login` | Public | Connexion classique |
| GET | `/api/me` | Bearer | Profil utilisateur courant |
| POST | `/api/forgot-password` | Public | Envoi code de réinitialisation |
| POST | `/api/reset-password` | Public | Réinitialisation du mot de passe |
| POST | `/api/logout` | Bearer | Déconnexion |
| GET | `/api/auth/google` | Public | Redirige vers Google OAuth |
| GET | `/api/auth/google/callback` | Public | Callback : génère OTP, redirige |

</details>

<details>
<summary><strong>🛒 Wishlist & Commandes — 5 routes</strong></summary>

| Verbe | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/wishlist` | Bearer | Liste des produits favoris |
| POST | `/api/wishlist` | Bearer | Toggle produit en wishlist |
| POST | `/api/orders` | Optional | Création de commande |
| GET | `/api/orders/:ref` | Optional | Détail d'une commande |
| GET | `/api/me/orders` | Bearer | Historique utilisateur |

</details>

<details>
<summary><strong>📊 Analytics & Quiz — 3 routes</strong></summary>

| Verbe | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/analytics` | Optional | Tracking d'événement |
| GET | `/api/analytics/summary` | Admin | Tableau de bord agrégé |
| POST | `/api/quiz` | Optional | Sauvegarde réponses quiz |

</details>

<details>
<summary><strong>💳 Paiement Stripe — 2 routes</strong></summary>

| Verbe | Route | Description |
|---|---|---|
| POST | `/api/create-payment-intent` | Génère un Payment Intent Stripe |
| POST | `/api/webhook/stripe` | Webhook Stripe (raw body, signé) |

</details>

<details>
<summary><strong>⚙️ Administration — 8 routes (réservées admin)</strong></summary>

| Verbe | Route | Description |
|---|---|---|
| GET | `/api/admin/users` | Liste de tous les utilisateurs |
| GET | `/api/orders/all` | Toutes les commandes |
| PATCH | `/api/orders/:ref/status` | Changement de statut commande |
| POST | `/api/admin/promote` | Accorde droits admin |
| POST | `/api/admin/demote` | Révoque droits admin |
| GET | `/api/users` | Liste rapide (dev only) |

> Le panneau `admin.html` est désactivé. Les routes sont conservées pour reprise future.

</details>

### Conventions

```json
// Succès
{ "success": true, "data": ... }

// Erreur
{ "error": "Message en français" }    // 400 / 401 / 403 / 404 / 500
```

**Authentification :** header `Authorization: Bearer <jwt>` pour les routes protégées.

---

## 🗄️ Schéma de la base de données

`vmax_users.db` (SQLite, créée automatiquement au premier lancement).

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     users       │    │     orders      │    │    wishlist     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id PK           │    │ id PK           │    │ user_id FK      │
│ prenom · nom    │    │ ref UNIQUE      │    │ product_id      │
│ email UNIQUE    │◄───┤ user_id FK      │◄───┤ created_at      │
│ password (hash) │    │ email · phone   │    └─────────────────┘
│ email_verified  │    │ items (JSON)    │
│ verif_code      │    │ total · promo   │    ┌─────────────────┐
│ verif_expires   │    │ payment · status│    │   analytics     │
│ reset_code      │    │ stripe_id       │    ├─────────────────┤
│ reset_expires   │    │ address · city  │    │ event · data    │
│ is_admin        │    │ created_at      │    │ session_id      │
│ created_at      │    └─────────────────┘    │ user_id · ip    │
│ last_login      │                           │ created_at      │
└─────────────────┘    ┌─────────────────┐    └─────────────────┘
                       │  quiz_results   │
                       ├─────────────────┤    ┌─────────────────┐
                       │ email · answers │    │   products      │
                       │ recommended_ids │    │ (conservée mais │
                       │ top_category    │    │  inutilisée —   │
                       │ created_at      │    │  source en dur  │
                       └─────────────────┘    │  dans script.js)│
                                              └─────────────────┘
```

---

## 🔐 Flux d'authentification

### Flow 1 — Inscription email + OTP

```
1. POST /api/register       → bcrypt 12 rounds + INSERT users
2. sendVerificationEmail()  → OTP 6 chiffres (10 min)
3. Frontend affiche écran OTP (showAuthState 3)
4. POST /api/verify-email   → email_verified=1, JWT signé
5. localStorage.vmaxToken   → connecté
```

### Flow 2 — Google OAuth + OTP (double facteur)

```
1. Clic « Continuer avec Google »
   → GET /api/auth/google
   → Redirect accounts.google.com (scope openid email profile)

2. Callback /api/auth/google/callback
   → Échange code → access_token
   → Récupère profil Google
   → Crée/met à jour user avec email_verified=0
   → Génère OTP + sendVerificationEmail()
   → Redirect /?google_pending=true&email=...&prenom=...

3. Frontend handleGoogleCallback()
   → Détecte google_pending=true
   → Ouvre l'écran OTP avec l'email pré-rempli

4. POST /api/verify-email   → email_verified=1, JWT
   → Même 2FA que pour l'inscription classique
```

> **Pourquoi un OTP même avec Google ?** Un pirate qui obtiendrait un cookie Google valide ne pourrait pas usurper le compte sans accès à la boîte email. Conforme aux exigences 2FA des banques.

### Flow 3 — Vérification de session au lancement

```
checkExistingLogin()
  ├─ Token absent       → ouvre modal auth après 800 ms
  ├─ Token valide       → GET /api/me → connecté silencieux
  ├─ Token expiré (401) → nettoyer localStorage + ouvrir modal
  └─ Serveur HS         → mode dégradé (conserve session locale)
```

---

## 🔧 Variables d'environnement

Fichier `backend/.env` (non versionné, modèle dans `.env.example`) :

```bash
PORT=3000
NODE_ENV=development

# JWT — chaîne aléatoire 64+ caractères
JWT_SECRET=<générer avec : openssl rand -hex 32>

# Gmail SMTP (App Password depuis Google Account > Sécurité)
GMAIL_USER=votre.adresse@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Google OAuth (Google Cloud Console > Credentials)
GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<secret>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Stripe (laisser vide pour mode simulation)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS production
FRONTEND_URL=http://localhost:3000
```

> Si `GMAIL_APP_PASSWORD` est vide, les OTP s'affichent en console (`[DEV] Code pour ...`).
> Si `STRIPE_SECRET_KEY` est vide, le paiement passe en mode simulation.

---

## 🛡️ Sécurité

### 5 couches défensives (OWASP Top 10)

1. **bcrypt 12 rounds** — passwords jamais en clair
2. **JWT HS256** — signés serveur, expiration paramétrée
3. **Prepared statements** — zéro requête concaténée, injection SQL impossible
4. **Helmet + CSP** — headers `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
5. **Rate limiting** — anti brute-force sur `/login`, `/register`, `/forgot-password`

### Comptes admin garantis au démarrage

```
amineaitali2005@gmail.com    / Amine.5050
amineaitalioff.pro@gmail.com / Amine.5050
```

> Créés/mis à jour automatiquement par `ensureAdminAccounts()` (idempotent).

### Gestion des secrets

- Tous les secrets vivent **uniquement dans `.env`** (jamais committé)
- `.env.example` fournit le modèle public sans valeurs
- En production, `NODE_ENV=production` bloque la route `/api/users` (dev-only)

---

## 📡 Mode offline (sans backend)

Le frontend détecte le protocole `file://` (variable `IS_FILE_PROTOCOL`) pour fonctionner **sans serveur** :

| Fonctionnalité | Mode offline |
|---|---|
| Catalogue 22 produits | ✅ codé en dur dans `script.js` |
| Panier + wishlist | ✅ via `localStorage` |
| Recherche · filtres · quiz | ✅ logique 100 % frontend |
| Connexion | ⚠️ simulation (toast informatif) |
| Paiement | ⚠️ confirmation locale uniquement |

```bash
# Ouvrir directement dans le navigateur :
file:///C:/Users/.../Vmax_ri7a_2/index.html
```

---

## 📚 Documentation complète

Le dossier [`docs/`](./docs) contient :

| Fichier | Format | Description |
|---|---|---|
| **`rapport.tex`** | LaTeX | Rapport technique complet (12 chapitres, ~900 lignes) |
| **`presentation.html`** | HTML autonome | Slideshow interactif 14 slides (navigation clavier + tactile) |
| **`README.md`** | Markdown | Guide de compilation LaTeX + visualisation slideshow |

### Compiler le rapport en PDF

```bash
cd docs
pdflatex -shell-escape rapport.tex
pdflatex -shell-escape rapport.tex   # 2e passe pour la TOC
```

Ou utiliser [Overleaf](https://overleaf.com) sans installation locale.

### Lancer la présentation

```
http://localhost:3000/docs/presentation.html
```

Navigation : `←` `→` ou `Space` ou swipe tactile · `Escape` retourne au début.

---

## 🏛️ Décisions d'architecture (ADR)

| ADR | Décision | Raison |
|---|---|---|
| **01** | Produits codés en dur dans `script.js` | Élimine les doublons API/local, débogage centralisé |
| **02** | OTP obligatoire même pour Google OAuth | 2FA par défaut, sécurité bancaire |
| **03** | Page admin désactivée (`.disabled`) | Focus UX client, code conservé pour reprise |
| **04** | Zéro dépendance frontend | Performance maximale, 3 fichiers servis |

Détails complets dans le rapport LaTeX (chapitre 11).

---

## 🐛 Dépannage

<details>
<summary><strong>Le serveur ne démarre pas — <code>EADDRINUSE</code></strong></summary>

```bash
npx kill-port 3000
node server.js
```
</details>

<details>
<summary><strong>Les emails OTP n'arrivent pas</strong></summary>

1. Vérifier que `GMAIL_USER` et `GMAIL_APP_PASSWORD` sont bien définis dans `.env`
2. Le mot de passe doit être un **App Password** Google (pas le mot de passe du compte)
3. En mode dev, le code OTP s'affiche dans la console serveur : `[DEV] Code pour user@x.com: 123456`
</details>

<details>
<summary><strong>Google OAuth renvoie une erreur</strong></summary>

1. Vérifier dans Google Cloud Console que `http://localhost:3000/api/auth/google/callback` est dans les URI de redirection autorisés
2. `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` doivent correspondre au même projet
</details>

<details>
<summary><strong>Stripe — paiement bloqué</strong></summary>

Si `STRIPE_SECRET_KEY` est vide ou invalide, le backend passe automatiquement en mode simulation. Vérifier la console serveur pour les logs Stripe.
</details>

---

<div align="center">

### *« La puissance ne se définit pas. Elle se sent. »*

**VMAX** · Amine Ait Ali · 2026

[📄 Rapport technique](./docs/rapport.tex) · [🎥 Présentation](./docs/presentation.html) · [🛠️ Backend](./backend/server.js)

</div>
