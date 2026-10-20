# ⚽ BOTOLA PRO - Application Web de Gestion du Championnat Marocain

Application web professionnelle pour la gestion complète de la Botola Pro Inwi (championnat marocain de football).

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Flask](https://img.shields.io/badge/flask-3.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [API REST](#-api-rest)
- [Captures d'écran](#-captures-décran)
- [Contributions](#-contributions)
- [License](#-license)

## ✨ Fonctionnalités

### 🏟️ Gestion des Équipes
- ✅ Créer, modifier et supprimer des équipes
- ✅ Suivre les statistiques (matchs joués, victoires, nuls, défaites, buts, points)
- ✅ Remettre à zéro les statistiques
- ✅ Affichage en temps réel

### 👤 Gestion des Joueurs
- ✅ Ajouter des joueurs par équipe
- ✅ Gérer les informations personnelles (nom, prénom, poste, numéro, etc.)
- ✅ Suivre les statistiques détaillées (buts, passes, cartons, etc.)
- ✅ Système de transfert entre équipes
- ✅ Historique des équipes précédentes
- ✅ Statistiques par poste (Gardien, Défenseur, Milieu, Attaquant)

### 🎮 Gestion des Matchs
- ✅ Programmer des matchs avec lieu, date et arbitre
- ✅ Démarrer et terminer les matchs
- ✅ Saisir les scores manuellement
- ✅ Simuler automatiquement les matchs
- ✅ Suivi des statuts (Programmé, En cours, Terminé)
- ✅ Mise à jour automatique du classement

### 🏆 Classement
- ✅ Affichage en temps réel du classement général
- ✅ Tri automatique par points et différence de buts
- ✅ Statistiques complètes par équipe
- ✅ Mise en évidence du podium
- ✅ Statistiques globales du championnat

### 👔 Gestion du Staff
- ✅ Gestion des arbitres (création, statistiques)
- ✅ Incrémentation des statistiques d'arbitrage (cartons, penalties)
- ✅ Gestion des entraîneurs par équipe
- ✅ Gestion des présidents (budget, objectifs)
- ✅ Consultation du staff par équipe

## 🛠️ Technologies utilisées

### Backend
- **Flask 3.0** - Framework web Python
- **SQLite** - Base de données légère et portable
- **Python 3.8+** - Langage de programmation

### Frontend
- **HTML5** - Structure
- **CSS3** - Design moderne avec thème mauve
- **JavaScript (Vanilla)** - Interactions dynamiques
- **API REST** - Communication avec le backend

### Design
- **Thème mauve élégant** - Inspiré d'Arcane
- **Responsive design** - Compatible mobile et desktop
- **Animations fluides** - Transitions et effets visuels
- **Interface intuitive** - UX optimisée


## 📥 Installation

### Prérequis

- Python 3.8 ou supérieur
- pip (gestionnaire de paquets Python)
- Le fichier `main.py` (contenant les modèles et la logique métier)

### Étapes d'installation

1. **Télécharger le projet**
   ```bash
   # Décompresser l'archive dans un dossier
   cd botola_web
   ```

2. **Créer un environnement virtuel** (recommandé)
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt
   ```

4. **Vérifier la présence de main.py**
   
   Assurez-vous que le fichier `main.py` (contenant toute la logique métier et les modèles) est présent dans le même dossier que `app.py`.

5. **Lancer l'application**
   ```bash
   python app.py
   ```

6. **Accéder à l'application**
   
   Ouvrez votre navigateur et accédez à :
   - Local : `http://localhost:5000`
   - Réseau : `http://0.0.0.0:5000`

## 🚀 Utilisation

### Démarrage rapide

1. **Page d'accueil**
   - Vue d'ensemble avec statistiques globales
   - Accès rapide à toutes les sections

2. **Créer des équipes**
   - Aller dans "Équipes"
   - Remplir le formulaire (nom, ville)
   - Cliquer sur "Créer l'équipe"

3. **Ajouter des joueurs**
   - Aller dans "Joueurs"
   - Sélectionner une équipe
   - Cliquer sur "Ajouter un joueur"
   - Remplir les informations

4. **Programmer un match**
   - Aller dans "Matchs"
   - Sélectionner les deux équipes
   - Définir lieu, date et arbitre
   - Cliquer sur "Programmer le match"

5. **Gérer un match**
   - Cliquer sur "Démarrer" pour commencer
   - Cliquer sur "Terminer" et saisir les scores
   - Ou cliquer sur "Simuler" pour générer automatiquement le résultat

6. **Consulter le classement**
   - Aller dans "Classement"
   - Le classement est mis à jour en temps réel après chaque match

## 📁 Structure du projet

```
botola_web/
│
├── app.py                          # Application Flask principale
├── database.py                     # Gestion de la base de données
├── models.py                       # Import des modèles depuis main.py
├── main.py                         # ⚠️ À fournir (logique métier)
├── requirements.txt                # Dépendances Python
├── README.md                       # Documentation
│
├── static/                         # Fichiers statiques
│   ├── css/
│   │   └── style.css              # Styles CSS (design mauve)
│   ├── js/
│   │   └── main.js                # JavaScript principal
│   └── images/
│       └── logo.png               # Logo (optionnel)
│
└── templates/                      # Templates HTML
    ├── base.html                   # Template de base
    ├── index.html                  # Page d'accueil
    ├── equipes.html                # Gestion des équipes
    ├── joueurs.html                # Gestion des joueurs
    ├── matchs.html                 # Gestion des matchs
    ├── classement.html             # Classement général
    └── staff.html                  # Gestion du staff
```

## 🔌 API REST

L'application expose une API REST complète :

### Équipes
- `GET /api/equipes` - Liste toutes les équipes
- `GET /api/equipes/<id>` - Détails d'une équipe
- `POST /api/equipes` - Crée une équipe
- `PUT /api/equipes/<id>` - Modifie une équipe
- `DELETE /api/equipes/<id>` - Supprime une équipe
- `POST /api/equipes/<id>/reset` - RAZ stats d'une équipe

### Joueurs
- `GET /api/joueurs/equipe/<id>` - Joueurs d'une équipe
- `GET /api/joueurs/<id>` - Détails d'un joueur
- `POST /api/joueurs` - Crée un joueur
- `PUT /api/joueurs/<id>` - Modifie un joueur
- `PUT /api/joueurs/<id>/stats` - Met à jour les stats
- `POST /api/joueurs/<id>/transfer` - Transfère un joueur
- `DELETE /api/joueurs/<id>` - Supprime un joueur

### Matchs
- `GET /api/matchs` - Liste tous les matchs
- `POST /api/matchs` - Programme un match
- `POST /api/matchs/<id>/start` - Démarre un match
- `POST /api/matchs/<id>/finish` - Termine un match (avec score)
- `POST /api/matchs/<id>/simulate` - Simule un match
- `DELETE /api/matchs/<id>` - Supprime un match

### Arbitres
- `GET /api/arbitres` - Liste tous les arbitres
- `POST /api/arbitres` - Crée un arbitre
- `POST /api/arbitres/<id>/increment` - Incrémente une stat

### Staff
- `POST /api/staff/entraineur` - Crée un entraîneur
- `POST /api/staff/president` - Crée un président
- `GET /api/staff/equipe/<id>` - Staff d'une équipe

## 🎨 Design

### Thème Mauve Élégant
- Palette de couleurs inspirée d'Arcane
- Dégradés violets et roses
- Effets de néon et de glow
- Animations fluides et modernes

### Responsive Design
- Compatible desktop, tablette et mobile
- Tableaux adaptatifs
- Navigation optimisée

### Expérience Utilisateur
- Interface intuitive et professionnelle
- Notifications en temps réel
- Modals pour les actions importantes
- Loading indicators
- Confirmations pour les suppressions

## 🐛 Dépannage

### Erreur "Module main not found"
```bash
# Assurez-vous que main.py est dans le même dossier que app.py
ls -la  # Vérifier la présence du fichier
```

### Erreur de port déjà utilisé
```bash
# Changer le port dans app.py (dernière ligne)
app.run(debug=True, host='0.0.0.0', port=8000)  # Au lieu de 5000
```

### Base de données corrompue
```bash
# Supprimer la base de données et relancer
rm botola_pro.db
python app.py
```

## 📝 Notes importantes

1. **Fichier main.py requis** : Ce fichier doit contenir toutes les classes (Equipe, Joueur, Match, etc.) et fonctions métier (save_equipe, load_equipes, etc.)

2. **Base de données** : La base SQLite est créée automatiquement au premier lancement

3. **Données de démonstration** : Si la base est vide, des données d'exemple sont automatiquement créées

4. **Mode debug** : L'application démarre en mode debug par défaut (rechargement automatique)

## 🤝 Contributions

Les contributions sont les bienvenues ! N'hésitez pas à :
- Reporter des bugs
- Proposer des améliorations
- Soumettre des pull requests

## 📄 License

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 👨‍💻 Auteur

Développé avec ❤️ pour la gestion de la Botola Pro Inwi

## 📧 Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur le dépôt du projet.

---

⚽ **Botola Pro Web** - Version 1.0 • Édition Mauve • © 2024
```

## 🎯 Feuille de route

### Version actuelle (1.0)
- ✅ Gestion complète des équipes
- ✅ Gestion complète des joueurs
- ✅ Gestion complète des matchs
- ✅ Classement en temps réel
- ✅ Gestion du staff (arbitres, coaches, présidents)
- ✅ API REST complète
- ✅ Design mauve élégant

### Futures versions
- 📅 Calendrier visuel des matchs
- 📊 Graphiques et statistiques avancées
- 🏅 Meilleurs buteurs, passeurs
- 📱 Application mobile native
- 🔐 Système d'authentification
- 📧 Notifications par email
- 🖨️ Export PDF des rapports
- 📸 Upload de photos d'équipes/joueurs
