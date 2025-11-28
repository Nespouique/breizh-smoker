# 🥓 Breizh Smoker

Application de suivi de fumage et d'affinage de viandes et poissons.

## 📖 Description

Breizh Smoker est une application web permettant de gérer et suivre vos sessions de fumage, salaison et affinage. Elle vous aide à :

- **Créer des sessions** de fumage/affinage avec plusieurs morceaux
- **Suivre l'évolution du poids** de chaque pièce au cours de l'affinage
- **Visualiser les projections** de perte de poids pour atteindre votre cible
- **Documenter vos processus** de préparation, salaison et fumage

## ✨ Fonctionnalités

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

## 🛠️ Technologies

- **Frontend** : React 19 + TypeScript + Vite
- **UI** : Tailwind CSS + shadcn/ui
- **Graphiques** : Recharts
- **Backend** : Supabase (PostgreSQL + Auth)
- **Date** : date-fns

## 🚀 Installation

```bash
# Cloner le repo
git clone https://github.com/Nespouique/breizh-smoker.git
cd breizh-smoker

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

## ⚙️ Configuration

Créez un fichier `.env.local` avec vos credentials Supabase :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Captures d'écran

*À venir*

## 📄 Licence

MIT
