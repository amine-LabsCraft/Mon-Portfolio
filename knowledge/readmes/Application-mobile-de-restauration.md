<p align="center">
  <img src="screenshots/banner.png" width="900">
</p>

<h1 align="center">🍔 Burger Queen</h1>

<p align="center">
Flutter • Dart • Android • iOS • Material Design 3
</p>

# 🍔 Burger Queen

Application mobile de restauration rapide développée avec Flutter et Dart dans le cadre du module Développement Mobile de l'ENSA Khouribga.

Burger Queen est une application cross-platform permettant aux utilisateurs de découvrir un menu interactif, consulter les offres du moment, localiser le restaurant le plus proche et parcourir différentes catégories de produits dans une interface moderne inspirée des standards UI/UX des grandes chaînes de restauration. :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}

---

## 📱 Aperçu du projet

L'application reproduit l'expérience d'une application mobile de restauration rapide moderne en proposant :

- 📍 Localisation du restaurant le plus proche
- 🎁 Bannière promotionnelle dynamique
- 🍔 Catalogue de burgers avec défilement horizontal
- 🍟 Liste des accompagnements
- 🥤 Catalogue des boissons
- 🍩 Galerie de desserts en grille
- 🎨 Interface fidèle à une maquette professionnelle
- 📲 Compatibilité Android et iOS à partir d'un unique code source Flutter :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4}

---

# 🎯 Objectifs du projet

Ce projet a été réalisé afin de :

- Maîtriser Flutter et Dart
- Construire une interface mobile moderne
- Organiser une application Flutter de manière maintenable
- Manipuler différents widgets Flutter
- Gérer des assets multimédias
- Produire une application cross-platform complète :contentReference[oaicite:5]{index=5}

---

# 🛠 Technologies utilisées

| Technologie | Utilisation |
|------------|------------|
| Flutter 3.41.9 | Développement mobile cross-platform |
| Dart 3.11.5 | Langage principal |
| Material Design 3 | Design System |
| VS Code | Environnement de développement |
| Mobile Device Preview | Prévisualisation mobile |
| pub.dev | Gestion des packages |

:contentReference[oaicite:6]{index=6}

---

# 🏗 Architecture du projet

```text
burger_queen/
│
├── lib/
│   ├── main.dart
│   └── home_screen.dart
│
├── assets/
│   └── images/
│
├── pubspec.yaml
│
└── README.md
```

:contentReference[oaicite:7]{index=7}

---

# 📂 Structure fonctionnelle

L'application est composée de 7 sections principales :

| N° | Section |
|----|----------|
| 1 | AppBar |
| 2 | Restaurant le plus proche |
| 3 | Bannière promotionnelle |
| 4 | Burgers |
| 5 | Accompagnements |
| 6 | Boissons |
| 7 | Desserts |

:contentReference[oaicite:8]{index=8}

---

# 🎨 Charte graphique

Palette principale :

| Couleur | Code |
|----------|---------|
| Rose principal | #E8759A |
| Rose foncé | #C2185B |
| Rose clair | #FCE4EC |
| Blanc | #FFFFFF |
| Gris texte | #505050 |

:contentReference[oaicite:9]{index=9}

Cette identité visuelle permet d'obtenir une interface cohérente, moderne et agréable à utiliser.

---

# 🧩 Architecture Flutter

```text
MaterialApp
│
└── HomeScreen
    │
    └── Scaffold
        │
        └── SingleChildScrollView
            │
            └── Column
                │
                ├── RestaurantCard
                ├── EnCeMomentSection
                ├── BurgersSection
                ├── AccompagnementsSection
                ├── BoissonsSection
                └── DessertsSection
```

:contentReference[oaicite:10]{index=10}

---

# 🍔 Contenu du menu

## Burgers

- Twins
- Big Queen
- Egg Bacon Burger
- Prince
- Cheese Burger

:contentReference[oaicite:11]{index=11}

---

## 🍟 Accompagnements

- Frites
- Patate douce
- Poutine
- Potatoes

:contentReference[oaicite:12]{index=12}

---

## 🥤 Boissons

- Cola classique
- Eau gazeuse
- Soda orange
- Soda fraise

:contentReference[oaicite:13]{index=13}

---

## 🍩 Desserts

- Glace Oreo
- Crêpe Fraise
- Donut
- Cupcake

:contentReference[oaicite:14]{index=14}

---

# 🖼 Gestion des Assets

Le projet utilise :

```text
19 images JPEG
1.65 MB
```

réparties entre :

- Burgers
- Accompagnements
- Boissons
- Desserts
- Bannière promotionnelle

:contentReference[oaicite:15]{index=15}

---

# ⚙ Installation

## Cloner le dépôt

```bash
git clone https://github.com/votre-compte/burger_queen.git
```

## Accéder au projet

```bash
cd burger_queen
```

## Installer les dépendances

```bash
flutter pub get
```

## Lancer l'application

```bash
flutter run
```

---

# 📋 Dépendances

```yaml
dependencies:
  flutter:
    sdk: flutter

  cupertino_icons: ^1.0.2
```

:contentReference[oaicite:16]{index=16}

---

# 🧪 Tests réalisés

L'application a été validée à travers plusieurs niveaux de tests.

## Tests unitaires

✔ Intégrité des burgers

✔ Intégrité des boissons

✔ Intégrité des desserts

✔ Intégrité des accompagnements

---

## Tests widgets

✔ AppBar

✔ Carte restaurant

✔ Scroll horizontal burgers

✔ Grille desserts

✔ Scroll vertical complet

---

## Tests visuels

✔ Conformité à la maquette

```text
100 %
8/8 critères validés
```

:contentReference[oaicite:17]{index=17}

---

## Tests de robustesse

✔ Chargement des 19 assets

✔ Aucun overflow Flutter

✔ Aucun crash observé

:contentReference[oaicite:18]{index=18}

---

# 📊 Résultats

| Indicateur | Valeur |
|------------|---------|
| Cas de tests | 12 |
| Succès | 12 |
| Échecs | 0 |
| Taux de réussite | 100 % |

:contentReference[oaicite:19]{index=19}

---

# 🚀 Perspectives d'évolution

Les futures versions pourraient intégrer :

### 🛒 Gestion de panier

Provider / Riverpod / Bloc

### 🔐 Authentification

Firebase Auth

### 🌍 API REST

FastAPI ou Node.js

### 📍 Géolocalisation réelle

Package Geolocator

### 💳 Paiement en ligne

Stripe ou CMI Maroc

### ✨ Animations avancées

Hero Animations

AnimatedContainer

:contentReference[oaicite:20]{index=20}

---

# 🎓 Contexte académique

Projet réalisé dans le cadre du module :

**Développement Mobile**

Filière :

**Ingénierie Informatique et Digitalisation (IID)**

École Nationale des Sciences Appliquées de Khouribga

Année universitaire 2025–2026. :contentReference[oaicite:21]{index=21}

---

# 👨‍💻 Auteur

 
<div align="center">

 
**MediSchool**
*by* **Amine Ait Ali** · Data & AI Engineer
 
[![GitHub](https://img.shields.io/badge/GitHub-amine--LabsCraft-181717?style=flat&logo=github)](https://github.com/amine-LabsCraft)
[![Portfolio](https://img.shields.io/badge/Portfolio-amine--aitali--5752.netlify.app-00C7B7?style=flat&logo=netlify&logoColor=white)](https://amine-aitali-5752.netlify.app/)
 
**[⬆ Retour en haut](#-medischool)**
 
</div>
 

---

# 📄 Licence

Projet académique réalisé à des fins pédagogiques.
