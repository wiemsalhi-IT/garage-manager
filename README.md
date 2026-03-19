# GarageManager - Gestion de Garage Mécanique (Québec)

Application web moderne pour la gestion de petits garages mécaniques au Québec. Remplace les fichiers Excel par une interface simple, ergonomique et évolutive.

## Fonctionnalités

- **Clients** : Gestion des clients réguliers et passagers
- **Véhicules** : Suivi des véhicules par client (VIN, plaque, kilométrage)
- **Fournisseurs** : Répertoire des fournisseurs de pièces
- **Articles** : Catalogue de pièces et tarifs de main-d'oeuvre avec gestion du stock
- **Devis** : Création de devis avec lignes de détail et calcul automatique des taxes
- **Bons de travail** : Suivi des interventions en atelier
- **Factures de vente** : Facturation clients avec TPS/TVQ
- **Commandes d'achat** : Commandes aux fournisseurs
- **Factures d'achat** : Enregistrement des factures fournisseurs
- **Paiements** : Suivi des encaissements et paiements (Interac, carte, espèces, chèque, virement)
- **Dashboard** : Tableau de bord avec indicateurs clés (CA, impayés, stock bas)
- **Rapports** : Rapports de revenus et de stock avec graphiques

## Taxes Québec

Le système calcule automatiquement :
- **TPS** : 5 %
- **TVQ** : 9.975 %

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui + Lucide icons |
| Graphiques | Recharts |
| Backend | FastAPI (Python 3.12) |
| ORM | SQLAlchemy 2.x |
| Validation | Pydantic 2.x |
| Base de données | SQLite |

## Prérequis

- **Python** 3.12+
- **Node.js** 18+
- **Poetry** (gestionnaire de dépendances Python)

## Démarrage Rapide

### 1. Cloner le projet

```bash
git clone <repo-url>
cd garage-manager
```

### 2. Backend

```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

Le backend démarre sur http://localhost:8000

Documentation API interactive : http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur http://localhost:5173

### 4. Variables d'environnement

**Frontend** (`frontend/.env`) :
```
VITE_API_URL=http://localhost:8000
```

**Backend** : Aucune configuration requise pour le développement local (SQLite).

## Structure du Projet

```
garage-manager/
├── backend/           # API FastAPI
│   ├── app/
│   │   ├── main.py          # Point d'entrée
│   │   ├── database.py      # Config SQLAlchemy
│   │   ├── models/          # Modèles ORM
│   │   ├── schemas/         # Schémas Pydantic
│   │   ├── routers/         # Routes API
│   │   └── services/        # Logique métier
│   └── pyproject.toml
├── frontend/          # Application React
│   ├── src/
│   │   ├── App.tsx           # Routing
│   │   ├── components/       # Composants UI
│   │   ├── pages/            # Pages
│   │   └── lib/              # API client, utilitaires
│   └── package.json
└── docs/              # Documentation
    ├── architecture.md       # Architecture technique
    └── jira-backlog.md       # Backlog Jira (Epics/Stories)
```

## API Endpoints

| Ressource | Endpoint | Méthodes |
|-----------|----------|----------|
| Clients | `/api/clients` | GET, POST, PUT, DELETE |
| Véhicules | `/api/vehicules` | GET, POST, PUT, DELETE |
| Fournisseurs | `/api/fournisseurs` | GET, POST, PUT, DELETE |
| Articles | `/api/articles` | GET, POST, PUT, DELETE |
| Devis | `/api/devis` | GET, POST, PUT, DELETE |
| Bons de travail | `/api/bons-travail` | GET, POST, PUT, DELETE |
| Factures vente | `/api/factures-vente` | GET, POST, PUT, DELETE |
| Commandes achat | `/api/commandes-achat` | GET, POST, PUT, DELETE |
| Factures achat | `/api/factures-achat` | GET, POST, PUT, DELETE |
| Paiements | `/api/paiements` | GET, POST, PUT, DELETE |
| Dashboard | `/api/dashboard` | GET |
| Rapports | `/api/rapports/*` | GET |

## Build pour Production

```bash
# Frontend
cd frontend
npm run build    # Génère le dossier dist/

# Backend
cd backend
poetry run fastapi run app/main.py
```

## Licence

Projet privé - Tous droits réservés.
