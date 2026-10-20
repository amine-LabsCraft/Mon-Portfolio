# 🩺 MediSchool

**Système de gestion médicale scolaire** — une application web pour centraliser et suivre le suivi médical des élèves au sein d'un établissement scolaire (infirmerie, dossiers médicaux, consultations, vaccinations, prescriptions).

![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📖 À propos

MediSchool est une application développée pour digitaliser la gestion de l'infirmerie scolaire. Elle permet au personnel médical d'un établissement (médecins, infirmiers, assistants) de suivre les élèves de manière structurée : dossiers médicaux, consultations, vaccinations et prescriptions, le tout depuis un tableau de bord unique.

## 🚀 Fonctionnalités

- 🧑‍🎓 **Gestion des élèves** — fiches élèves (nom, prénom, date de naissance, classe, sexe, groupe sanguin, contact parent)
- 👩‍⚕️ **Gestion du personnel médical** — médecins, infirmiers, assistants (grade, téléphone, email)
- 📁 **Dossiers médicaux** — antécédents, allergies, note médicale par élève
- 🩺 **Consultations** — motif, diagnostic, tension artérielle, température, liées à un élève et un membre du personnel
- 💉 **Vaccinations** — suivi des vaccins administrés et des rappels nécessaires
- 💊 **Prescriptions & ordonnances** — instructions médicales et détail des médicaments (dose, durée)
- 📊 **Tableau de bord** — vue d'ensemble de l'activité médicale de l'établissement
- 🧾 **Journal d'actions** (`LOG_ACTIONS`) — traçabilité des opérations effectuées

## 🎯 Objectif

Remplacer le suivi papier de l'infirmerie scolaire par un outil numérique simple, fiable et centralisé, permettant un accès rapide à l'historique médical de chaque élève et une meilleure coordination entre le personnel médical.

## 🛠 Stack technique

| Couche | Technologie |
|---|---|
| Backend | Python / Flask (architecture en Blueprints) |
| Base de données | MySQL (`mysql-connector-python`) |
| Frontend | HTML / CSS / Jinja2 (templates Flask) |
| Structure | MVC simplifié : `models/`, `routes/`, `templates/`, `static/` |

## 📂 Structure du projet

```
Medischool/
├── app.py                  # Point d'entrée Flask, enregistrement des Blueprints
├── config.py                # Configuration (clé secrète, connexion BDD)
├── db.sql                   # Script de création de la base de données MEDISCHOOL
├── requirements.txt          # Dépendances Python
├── db/                      # Connexion / accès base de données
├── models/                  # Modèles de données
├── routes/                  # Blueprints Flask (eleves, personnel, dossiers, consultations, vaccinations, prescriptions)
├── templates/                # Vues HTML (Jinja2), dont dashboard.html
└── static/css/               # Feuilles de style
```

## 🗄 Modèle de données

La base `MEDISCHOOL` s'articule autour de 7 tables principales :

- `ELEVE` — informations sur les élèves
- `PERSONNEL_MEDICAL` — personnel de l'infirmerie
- `DOSSIER_MEDICAL` — antécédents et allergies (1-1 avec un élève)
- `CONSULTATION` — visites médicales
- `VACCINATION` — historique vaccinal
- `PRESCRIPTION` / `ORDONNANCE` — instructions et détails des traitements
- `LOG_ACTIONS` — journal des actions effectuées dans le système

## ⚙️ Installation

### Prérequis
- Python 3.x
- MySQL (serveur local ou distant)
- pip

### Étapes

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/amine-LabsCraft/Medischool.git
   cd Medischool
   ```

2. **Créer un environnement virtuel et installer les dépendances**
   ```bash
   python -m venv venv
   source venv/bin/activate   # Windows : venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Créer la base de données**
   ```bash
   mysql -u root -p < db.sql
   ```

4. **Configurer la connexion**
   Renseigner les identifiants MySQL et la clé secrète dans `config.py`.

5. **Lancer l'application**
   ```bash
   python app.py
   ```
   L'application est accessible sur `http://127.0.0.1:5000/`

## 📌 Améliorations futures

- 🔐 Authentification et gestion des rôles (médecin / infirmier / admin)
- 📈 Statistiques et export des rapports médicaux
- 🔔 Alertes automatiques pour les rappels de vaccination
- 📱 Version mobile
- 🖨 Génération d'ordonnances en PDF

## 🤝 Contribuer

Les contributions sont les bienvenues !
1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

<div align="center">

**MediSchool**
*by* **Amine Ait Ali** · Data & AI Engineer

[![GitHub](https://img.shields.io/badge/GitHub-amine--LabsCraft-181717?style=flat&logo=github)](https://github.com/amine-LabsCraft)
[![Portfolio](https://img.shields.io/badge/Portfolio-amine--aitali--5752.netlify.app-00C7B7?style=flat&logo=netlify&logoColor=white)](https://amine-aitali-5752.netlify.app/)

**[⬆ Retour en haut](#-medischool)**

</div>
