# Architecture Technique - GarageManager

## Vue d'ensemble

GarageManager est une application web de gestion pour petits garages mécaniques au Québec. Elle remplace les fichiers Excel par une interface moderne, simple et évolutive.

## Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | React + TypeScript | 18.x |
| Bundler | Vite | 6.x |
| CSS | Tailwind CSS | 3.x |
| Composants UI | shadcn/ui | - |
| Icônes | Lucide React | 0.364+ |
| Graphiques | Recharts | 2.12+ |
| Routing | React Router DOM | 7.x |
| HTTP Client | Axios | 1.x |
| Backend | FastAPI (Python) | 0.115+ |
| ORM | SQLAlchemy | 2.x |
| Validation | Pydantic | 2.x |
| Base de données | SQLite | 3.x |
| Serveur ASGI | Uvicorn | - |

## Architecture Globale

```
┌──────────────────────┐     HTTP/REST     ┌──────────────────────┐
│                      │ ◄───────────────► │                      │
│   Frontend React     │    JSON API       │   Backend FastAPI    │
│   (SPA - Vite)       │                   │   (Python)           │
│                      │                   │                      │
│   Port: 5173 (dev)   │                   │   Port: 8000         │
│                      │                   │                      │
└──────────────────────┘                   └──────────┬───────────┘
                                                      │
                                                      │ SQLAlchemy ORM
                                                      │
                                                ┌─────▼─────┐
                                                │  SQLite    │
                                                │  Database  │
                                                └───────────┘
```

## Structure du Projet

```
garage-manager/
├── backend/
│   ├── app/
│   │   ├── main.py              # Point d'entrée FastAPI
│   │   ├── database.py          # Configuration SQLAlchemy
│   │   ├── models/              # Modèles ORM (SQLAlchemy)
│   │   │   ├── client.py
│   │   │   ├── vehicule.py
│   │   │   ├── fournisseur.py
│   │   │   ├── article.py
│   │   │   ├── devis.py
│   │   │   ├── bon_travail.py
│   │   │   ├── facture_vente.py
│   │   │   ├── commande_achat.py
│   │   │   ├── facture_achat.py
│   │   │   └── paiement.py
│   │   ├── schemas/             # Schémas Pydantic (validation)
│   │   │   ├── client.py
│   │   │   ├── vehicule.py
│   │   │   ├── fournisseur.py
│   │   │   ├── article.py
│   │   │   ├── devis.py
│   │   │   ├── bon_travail.py
│   │   │   ├── facture_vente.py
│   │   │   ├── commande_achat.py
│   │   │   ├── facture_achat.py
│   │   │   └── paiement.py
│   │   ├── routers/             # Routes API (endpoints)
│   │   │   ├── clients.py
│   │   │   ├── vehicules.py
│   │   │   ├── fournisseurs.py
│   │   │   ├── articles.py
│   │   │   ├── devis.py
│   │   │   ├── bons_travail.py
│   │   │   ├── factures_vente.py
│   │   │   ├── commandes_achat.py
│   │   │   ├── factures_achat.py
│   │   │   ├── paiements.py
│   │   │   ├── dashboard.py
│   │   │   └── rapports.py
│   │   └── services/            # Logique métier
│   │       ├── taxes.py         # Calcul TPS/TVQ
│   │       └── numerotation.py  # Numérotation auto
│   ├── pyproject.toml
│   └── poetry.lock
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Routing principal
│   │   ├── main.tsx             # Point d'entrée
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Layout.tsx   # Layout principal
│   │   │       └── Sidebar.tsx  # Navigation latérale
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Clients.tsx
│   │   │   ├── Vehicules.tsx
│   │   │   ├── Fournisseurs.tsx
│   │   │   ├── Articles.tsx
│   │   │   ├── Devis.tsx
│   │   │   ├── BonsTravail.tsx
│   │   │   ├── FacturesVente.tsx
│   │   │   ├── CommandesAchat.tsx
│   │   │   ├── FacturesAchat.tsx
│   │   │   ├── Paiements.tsx
│   │   │   └── Rapports.tsx
│   │   └── lib/
│   │       ├── api.ts           # Client API (Axios)
│   │       └── utils.ts         # Utilitaires
│   ├── package.json
│   └── vite.config.ts
└── docs/
    ├── architecture.md          # Ce document
    └── jira-backlog.md          # Backlog Jira
```

## Modèle de Données

### Diagramme Entité-Relation

```
┌──────────┐     1:N     ┌──────────┐
│  Client  │────────────►│ Véhicule │
└────┬─────┘             └────┬─────┘
     │ 1:N                    │
     │    ┌───────────┐       │
     ├───►│   Devis   │◄──────┘
     │    └───────────┘       │
     │    ┌───────────┐       │
     ├───►│Bon Travail│◄──────┘
     │    └───────────┘       │
     │    ┌───────────┐       │
     └───►│Fact. Vente│◄──────┘
          └─────┬─────┘
                │ 1:N
          ┌─────▼──────┐
          │  Paiement  │
          └─────┬──────┘
                │ N:1
          ┌─────▼──────┐
          │ Fact. Achat│
          └─────┬──────┘
                │ N:1
        ┌───────▼────────┐
        │  Fournisseur   │
        └───────┬────────┘
                │ 1:N
        ┌───────▼────────┐     ┌──────────┐
        │ Cmd. Achat     │     │ Article  │
        └────────────────┘     └──────────┘
```

### Entités Principales

#### Client
| Champ | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Identifiant unique |
| nom | String | Nom de famille (requis) |
| prenom | String | Prénom |
| email | String | Courriel |
| telephone | String | Numéro de téléphone |
| adresse | String | Adresse complète |
| ville | String | Ville |
| code_postal | String | Code postal |
| province | String | Province (défaut: QC) |
| is_passager | Boolean | Client passager (sans dossier) |
| notes | Text | Notes libres |
| created_at | DateTime | Date de création |
| updated_at | DateTime | Date de modification |

#### Véhicule
| Champ | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Identifiant unique |
| client_id | Integer (FK) | Référence au client |
| marque | String | Marque du véhicule |
| modele | String | Modèle |
| annee | Integer | Année |
| vin | String(17) | Numéro d'identification |
| plaque | String | Plaque d'immatriculation |
| couleur | String | Couleur |
| kilometrage | Integer | Kilométrage actuel |
| notes | Text | Notes |

#### Article
| Champ | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Identifiant unique |
| code | String | Code article (unique) |
| description | String | Description |
| type | Enum | PIECE ou MAIN_DOEUVRE |
| prix_achat | Float | Prix d'achat |
| prix_vente | Float | Prix de vente |
| unite | String | Unité de mesure |
| quantite_stock | Integer | Quantité en stock |
| seuil_minimum | Integer | Seuil d'alerte stock |
| fournisseur_id | Integer (FK) | Fournisseur principal |

#### Devis / Facture de Vente / Bon de Travail
Ces documents partagent une structure similaire:
- En-tête: client, véhicule, date, statut, numéro auto-généré
- Lignes: description, quantité, prix unitaire, article (optionnel)
- Totaux: sous-total, TPS (5%), TVQ (9.975%), total TTC

#### Commande d'Achat / Facture d'Achat
- En-tête: fournisseur, date, statut, numéro auto-généré
- Lignes: description, quantité, prix unitaire, article (optionnel)
- Totaux: sous-total, TPS, TVQ, total

#### Paiement
| Champ | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Identifiant unique |
| type | Enum | VENTE ou ACHAT |
| facture_vente_id | Integer (FK) | Facture de vente liée |
| facture_achat_id | Integer (FK) | Facture d'achat liée |
| date_paiement | Date | Date du paiement |
| montant | Float | Montant payé |
| mode_paiement | Enum | ESPECES, CHEQUE, CARTE, VIREMENT, INTERAC |
| reference | String | Référence de transaction |

## API REST

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | /api/clients | Liste / Créer un client |
| GET/PUT/DELETE | /api/clients/{id} | Détail / Modifier / Supprimer |
| GET/POST | /api/vehicules | Liste / Créer un véhicule |
| GET/PUT/DELETE | /api/vehicules/{id} | Détail / Modifier / Supprimer |
| GET/POST | /api/fournisseurs | Liste / Créer un fournisseur |
| GET/PUT/DELETE | /api/fournisseurs/{id} | Détail / Modifier / Supprimer |
| GET/POST | /api/articles | Liste / Créer un article |
| GET/PUT/DELETE | /api/articles/{id} | Détail / Modifier / Supprimer |
| GET/POST | /api/devis | Liste / Créer un devis |
| GET/PUT/DELETE | /api/devis/{id} | Détail / Modifier / Supprimer |
| GET/POST | /api/bons-travail | Liste / Créer un bon de travail |
| GET/PUT/DELETE | /api/bons-travail/{id} | Détail / Modifier / Supprimer |
| GET/POST | /api/factures-vente | Liste / Créer une facture |
| GET/PUT/DELETE | /api/factures-vente/{id} | Détail / Modifier / Supprimer |
| GET/POST | /api/commandes-achat | Liste / Créer une commande |
| GET/PUT/DELETE | /api/commandes-achat/{id} | Détail / Modifier / Supprimer |
| GET/POST | /api/factures-achat | Liste / Créer une facture |
| GET/PUT/DELETE | /api/factures-achat/{id} | Détail / Modifier / Supprimer |
| GET/POST | /api/paiements | Liste / Créer un paiement |
| GET/PUT/DELETE | /api/paiements/{id} | Détail / Modifier / Supprimer |
| GET | /api/dashboard | Tableau de bord (stats) |
| GET | /api/rapports/revenus | Rapport de revenus |
| GET | /api/rapports/stock | Rapport de stock |
| GET | /api/rapports/activite | Rapport d'activité |

## Taxes Québec

Le système applique automatiquement les taxes du Québec:
- **TPS** (Taxe sur les Produits et Services): 5%
- **TVQ** (Taxe de Vente du Québec): 9.975%
- **Total taxes**: 14.975%

Calcul:
```
sous_total = Σ (quantité × prix_unitaire)
tps = sous_total × 0.05
tvq = sous_total × 0.09975
total = sous_total + tps + tvq
```

## Numérotation Automatique

Les documents sont numérotés automatiquement avec un préfixe:
| Document | Préfixe | Exemple |
|----------|---------|---------|
| Devis | DEV | DEV-00001 |
| Bon de travail | BT | BT-00001 |
| Facture de vente | FV | FV-00001 |
| Commande d'achat | CA | CA-00001 |
| Facture d'achat | FA | FA-00001 |

## Sécurité

- CORS configuré pour permettre les requêtes cross-origin en développement
- Validation des données entrantes via Pydantic
- Protection contre les injections SQL via SQLAlchemy ORM

## Évolutivité

L'architecture est conçue pour évoluer facilement:
1. **Authentification**: Ajouter JWT/OAuth2 via FastAPI Security
2. **PDF**: Intégrer ReportLab pour la génération de PDF
3. **Migration DB**: Passer à PostgreSQL si besoin (changement de connection string uniquement)
4. **Multi-tenant**: Ajouter un champ garage_id à chaque modèle
5. **Notifications**: Ajouter un système de notification par email
6. **Mobile**: L'interface responsive fonctionne déjà sur mobile
