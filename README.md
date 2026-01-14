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
- **Backend** : Express + Prisma + PostgreSQL
- **Date** : date-fns

## Installation

### Avec Docker Compose (Recommandé)

```bash
# Cloner le repo
git clone https://github.com/Nespouique/breizh-smoker.git
cd breizh-smoker

# Lancer avec Docker Compose
docker-compose up --build
```

L'application sera accessible sur :
- Frontend : http://localhost
- API Backend : http://localhost:3001

### Développement local

```bash
# 1. Lancer PostgreSQL (Docker ou installation locale)
docker run -d --name smoker-db \
  -e POSTGRES_DB=smoker \
  -e POSTGRES_USER=smoker \
  -e POSTGRES_PASSWORD=smoker \
  -p 5432:5432 \
  postgres:17-alpine

# 2. Backend
cd server
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev

# 3. Frontend (nouveau terminal)
cd ..
cp .env.example .env.local
npm install
npm run dev
```

## Configuration

### Backend (server/.env)

```env
DATABASE_URL=postgresql://smoker:smoker@localhost:5432/smoker
PORT=3001
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3001/api
```

## Migration des données existantes

Si vous avez des données à importer :

```bash
# Après le premier démarrage de Docker Compose
docker exec -i smoker-db psql -U smoker -d smoker < scripts/migrate-data.sql
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
│   │   ├── routes/         # Routes API
│   │   └── index.ts        # Point d'entrée
│   └── prisma/
│       └── schema.prisma   # Schéma base de données
├── scripts/                # Scripts utilitaires
├── docker-compose.yml      # Orchestration Docker
└── Dockerfile              # Build frontend
```

## Licence

MIT
