# EcoRide - Full Stack Project

![Project Status](https://img.shields.io/badge/Project%20Status-In%20Progress-orange?style=flat-square)
[![CodeFactor](https://www.codefactor.io/repository/github/lndbgaa/ecoride/badge)](https://www.codefactor.io/repository/github/lndbgaa/ecoride)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

**EcoRide** est une application web de covoiturage écoresponsable, conçue pour mettre en relation passagers et conducteurs souhaitant partager des trajets. Elle propose une expérience fluide, sécurisée et orientée vers la mobilité durable.

## Tech Stack

- **Frontend**: React, TypeScript, CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL/Sequelize, MongoDB/Mongoose

## Features

- Authentification sécurisée avec JWT
- Gestion des profils et rôles utilisateurs (passager, conducteur, employé, administrateur)
- Gestion des véhicules et publication de trajets
- Recherche avancée de trajets avec filtres personnalisés
- Système de réservation de trajet
- Système de notation et d'évaluation des conducteurs
- Déclaration et suivi des incidents
- Historique des trajets et réservations
- Historique des avis reçus et laissés
- Dashboards pour la gestion interne (employés et administrateurs)

## Installation & Setup

### Pré-requis

- [Node.js](https://nodejs.org/) ≥ 18
- [MySQL](https://www.mysql.com/) ≥ 8
- [MongoDB](https://www.mongodb.com/) ≥ 6
- Un compte [Cloudinary](https://cloudinary.com/) (pour le stockage d’images)
- Un service SMTP pour l’envoi d’e-mails (ex. Gmail, Mailtrap)

### Installation

1. Cloner le dépôt: git clone `https://github.com/lndbgaa/ecoride.git`
2. Se placer dans le dossier du projet: `cd ecoride`
3. **Mettre en place le serveur**

- Se placer dans le dossier du serveur : `cd server`
- Installer les dépendances : `npm install`
- Créer un fichier **.env** avec les variables suivantes :

  - `SERVER_URL` — URL publique de l’API côté serveur (requise en production, ex. `https://api.ecoride.com`)
  - `CLIENT_URL` — URL publique de l’application front-end (requise en production, ex. `https://ecoride.com`)

  - `MYSQL_DB_HOST` — Adresse de l’hôte MySQL (ex. `localhost` ou une URL distante)
  - `MYSQL_DB_USER` — Nom d’utilisateur pour accéder à la base MySQL
  - `MYSQL_DB_PWD` — Mot de passe associé à l’utilisateur MySQL
  - `MYSQL_DB_NAME` — Nom de la base de données MySQL à utiliser

  - `MONGO_DB_URI` — URI de connexion à la base MongoDB (ex. `mongodb://...`)

  - `JWT_ACCESS_SECRET` — Clé secrète pour signer les tokens d’accès (JWT)

  - `SMTP_HOST` — Hôte SMTP utilisé pour l’envoi d’e-mails (ex. `smtp.gmail.com`)
  - `SMTP_PORT` — Port utilisé par le serveur SMTP (souvent `465` ou `587`)
  - `SMTP_USER` — Identifiant du compte email utilisé pour l’envoi
  - `SMTP_PASSWORD` — Mot de passe ou clé d’application du compte email

  - `CLOUDINARY_CLOUD_NAME` — Nom du cloud (Cloudinary) pour le stockage des images
  - `CLOUDINARY_KEY` — Clé API Cloudinary
  - `CLOUDINARY_SECRET` — Clé secrète API Cloudinary

- Initialiser la base de données (mysql): `npm run db:init:mysql`
- Lancer le serveur de développement : `npm run dev`
- Le serveur sera accessible à l'adresse : **http://localhost:8080**

4. **Mettre en place le client**

- Se placer dans le dossier du client : `cd ../client`
- Installer les dépendances : `npm install`
- Créer un fichier **.env** avec les variables suivantes :

  - `VITE_API_BASE_URL` — URL de base de l’API (ex. `http://localhost:8080/api/v1` en développement)

- Lancer l'application de développement : `npm run dev`
- Le client sera accessible à l'adresse : **http://localhost:5173**

## Future Improvements

- Ajout d’un système de logging centralisé pour suivre les erreurs, les requêtes, etc. (ex : Winston).
- Amélioration de la logique métier des trajets et des réservations.
- Optimisation des performances : mise en cache, pagination, amélioration des requêtes de recherche.
- Accessibilité : amélioration selon les standards WCAG.
- Renforcement de la sécurité (ex : prévention des attaques côté client, meilleure gestion des permissions, etc.).
- Amélioration de l’UX/UI, notamment pour les dashboards employé et administrateur.
- Implémentation d’une API publique et documentée (ex : Swagger).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
