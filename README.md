# Breizh Smoker

Application de suivi de fumage et d'affinage de viandes et poissons.

## Description

Breizh Smoker est une application web permettant de gérer et suivre vos sessions de fumage, salaison et affinage. Elle vous aide à :

- **Créer des sessions** de fumage/affinage avec plusieurs morceaux
- **Suivre l'évolution du poids** de chaque pièce au cours de l'affinage
- **Visualiser les projections** de perte de poids pour atteindre votre cible
- **Documenter vos processus** de préparation, salaison et fumage

## Fonctionnalités

### Gestion des morceaux
- Ajout de morceaux avec nom, poids initial et icône personnalisée
- Configuration du pourcentage de perte cible
- Suivi du statut (préparation, salaison, fumage, affinage, terminé)

### Suivi des pesées
- Enregistrement des pesées avec date et heure
- Calcul automatique de la perte de poids actuelle
- Graphique d'évolution avec projection vers le poids cible
- Estimation de la date de fin d'affinage

### Processus de préparation
- Documentation des étapes de préparation
- Suivi de la salaison (type de sel, durée, retournements)
- Configuration du fumage (type de bois, durée, température)

## Technologies

- **Frontend** : React 19 + TypeScript + Vite
- **UI** : Tailwind CSS + shadcn/ui
- **Graphiques** : Recharts
- **Backend** : Express + Prisma
- **Base de données** : PostgreSQL 17
- **Date** : date-fns

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│   PostgreSQL    │
│  (React/Nginx)  │     │ (Express/Prisma)│     │                 │
│     :80         │     │     :3001       │     │     :5432       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         └──────────── Prisma Studio :5555 ──────────────┘
```

## Déploiement avec Docker Compose

### Production (recommandé)

Créez un fichier `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres:17-alpine
    container_name: smoker-db
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: smoker
      POSTGRES_USER: smoker
      POSTGRES_PASSWORD: ${DB_PASSWORD:-votre_mot_de_passe}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U smoker -d smoker"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    image: nespouique/breizh-smoker-backend:latest
    container_name: smoker-backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://smoker:${DB_PASSWORD:-votre_mot_de_passe}@db:5432/smoker
      PORT: 3001
    expose:
      - "3001"

  frontend:
    image: nespouique/breizh-smoker-frontend:latest
    container_name: smoker-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "80:80"

  prisma-studio:
    image: nespouique/breizh-smoker-backend:latest
    container_name: smoker-prisma-studio
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://smoker:${DB_PASSWORD:-votre_mot_de_passe}@db:5432/smoker
    command: npx prisma studio --port 5555 --browser none
    ports:
      - "5555:5555"

volumes:
  postgres_data:
```

Lancez la stack :

```bash
# Optionnel : créer un fichier .env avec un mot de passe sécurisé
echo "DB_PASSWORD=mon_mot_de_passe_securise" > .env

# Lancer
docker compose up -d
```

**Services disponibles :**
| Service | URL | Description |
|---------|-----|-------------|
| Application | http://localhost | Interface utilisateur |
| Prisma Studio | http://localhost:5555 | Interface d'administration de la BDD |

### Développement local

```bash
# 1. Cloner le repo
git clone https://github.com/Nespouique/breizh-smoker.git
cd breizh-smoker

# 2. Lancer PostgreSQL
docker run -d --name smoker-db \
  -e POSTGRES_DB=smoker \
  -e POSTGRES_USER=smoker \
  -e POSTGRES_PASSWORD=smoker \
  -p 5432:5432 \
  postgres:17-alpine

# 3. Backend
cd server
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev

# 4. Frontend (nouveau terminal)
cd ..
npm install
npm run dev
```

## Configuration

### Backend (server/.env)

```env
DATABASE_URL=postgresql://smoker:smoker@localhost:5432/smoker
PORT=3001
```

### Frontend (.env.local - optionnel pour le dev)

```env
VITE_API_URL=http://localhost:3001/api
```

> **Note** : En production, le frontend utilise `/api` comme URL relative, et Nginx fait le proxy vers le backend.

## Base de données

### Schéma Prisma

Le schéma est défini dans `server/prisma/schema.prisma` et comprend :

- **Smoke** : Une session de fumage (ex: "Fumaisons 2025")
- **Item** : Un morceau de viande/poisson avec toutes ses caractéristiques
- **WeightLog** : Historique des pesées pour suivre l'affinage

### Migrations

Les migrations sont gérées automatiquement par Prisma au démarrage du backend :

```bash
# Appliquer les migrations manuellement
npx prisma migrate deploy

# Créer une nouvelle migration (développement)
npx prisma migrate dev --name nom_de_la_migration
```

### Prisma Studio

Interface graphique pour explorer et modifier les données :

```bash
# En local
cd server && npx prisma studio

# En production : accessible sur le port 5555
```

## Structure du projet

```
smoker/
├── src/                    # Frontend React
│   ├── components/         # Composants UI (shadcn)
│   ├── features/           # Fonctionnalités métier
│   ├── lib/                # Utilitaires (api.ts)
│   └── types/              # Types TypeScript
├── server/                 # Backend Express + Prisma
│   ├── src/
│   │   ├── routes/         # Routes API (smokes, items, weight-logs)
│   │   └── index.ts        # Point d'entrée
│   └── prisma/
│       ├── schema.prisma   # Schéma base de données
│       └── migrations/     # Historique des migrations
├── docker-compose.yml      # Orchestration Docker (dev)
├── Dockerfile              # Build frontend (Nginx)
└── server/Dockerfile       # Build backend
```

## API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/smokes` | Liste toutes les sessions |
| POST | `/api/smokes` | Crée une nouvelle session |
| GET | `/api/smokes/:id` | Détails d'une session |
| PUT | `/api/smokes/:id` | Met à jour une session |
| DELETE | `/api/smokes/:id` | Supprime une session |
| GET | `/api/items` | Liste tous les items |
| POST | `/api/items` | Crée un nouvel item |
| PUT | `/api/items/:id` | Met à jour un item |
| DELETE | `/api/items/:id` | Supprime un item |
| POST | `/api/weight-logs` | Ajoute une pesée |
| DELETE | `/api/weight-logs/:id` | Supprime une pesée |

## CI/CD

Le projet utilise GitHub Actions pour builder et pousser automatiquement les images Docker sur DockerHub à chaque push sur `main` :

- `nespouique/breizh-smoker-frontend:latest`
- `nespouique/breizh-smoker-backend:latest`

## Licence

MIT
