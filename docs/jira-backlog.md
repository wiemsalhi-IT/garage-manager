# Backlog Jira - GarageManager

## Organisation du Backlog

### Epics MVP (Sprint 1-4)

---

## EPIC 1: Gestion des Clients et Véhicules
**Priorité**: Haute | **Sprint**: 1 | **Points**: 21

### Story 1.1: Gestion des clients
**En tant que** gérant de garage, **je veux** gérer ma liste de clients **afin de** avoir un répertoire centralisé.

**Critères d'acceptation**:
- Créer un client avec nom, prénom, téléphone, email, adresse
- Modifier les informations d'un client
- Supprimer un client (avec confirmation)
- Rechercher un client par nom ou téléphone
- Distinguer client régulier et client passager (is_passager)
- Afficher la province par défaut à "QC"

**Sous-tâches**:
- [TASK] Modèle SQLAlchemy Client (2 pts)
- [TASK] Schémas Pydantic Client (1 pt)
- [TASK] API CRUD /api/clients (3 pts)
- [TASK] Page frontend Clients avec tableau et modal (5 pts)
- [TASK] Recherche et filtres clients (2 pts)

---

### Story 1.2: Gestion des véhicules
**En tant que** gérant de garage, **je veux** associer des véhicules à mes clients **afin de** suivre l'historique des interventions par véhicule.

**Critères d'acceptation**:
- Créer un véhicule associé à un client
- Renseigner marque, modèle, année, VIN, plaque, couleur, kilométrage
- Modifier/Supprimer un véhicule
- Filtrer les véhicules par client

**Dépendances**: Story 1.1

**Sous-tâches**:
- [TASK] Modèle SQLAlchemy Véhicule avec FK client (2 pts)
- [TASK] Schémas Pydantic Véhicule (1 pt)
- [TASK] API CRUD /api/vehicules avec filtre client_id (3 pts)
- [TASK] Page frontend Véhicules avec sélection client (5 pts)

---

## EPIC 2: Gestion des Articles et Fournisseurs
**Priorité**: Haute | **Sprint**: 1-2 | **Points**: 18

### Story 2.1: Gestion des fournisseurs
**En tant que** gérant de garage, **je veux** gérer mes fournisseurs **afin de** passer des commandes facilement.

**Critères d'acceptation**:
- CRUD fournisseurs (nom, contact, téléphone, email, adresse)
- Recherche par nom
- Notes libres

**Sous-tâches**:
- [TASK] Modèle + Schémas Fournisseur (2 pts)
- [TASK] API CRUD /api/fournisseurs (2 pts)
- [TASK] Page frontend Fournisseurs (4 pts)

---

### Story 2.2: Gestion des articles (pièces et main-d'oeuvre)
**En tant que** gérant de garage, **je veux** gérer mon catalogue de pièces et tarifs de main-d'oeuvre **afin de** créer rapidement des devis et factures.

**Critères d'acceptation**:
- Créer un article avec code, description, type (Pièce/Main-d'oeuvre)
- Prix d'achat et prix de vente
- Gestion du stock (quantité, seuil minimum)
- Alerte visuelle quand le stock est bas
- Filtrer par type d'article

**Dépendances**: Story 2.1 (pour fournisseur_id)

**Sous-tâches**:
- [TASK] Modèle Article avec enum TypeArticle (2 pts)
- [TASK] Schémas Pydantic Article (1 pt)
- [TASK] API CRUD /api/articles avec filtres (3 pts)
- [TASK] Page frontend Articles avec indicateur stock (5 pts)

---

## EPIC 3: Devis et Bons de Travail
**Priorité**: Haute | **Sprint**: 2 | **Points**: 26

### Story 3.1: Création et gestion des devis
**En tant que** gérant de garage, **je veux** créer des devis pour mes clients **afin de** leur proposer un prix avant intervention.

**Critères d'acceptation**:
- Créer un devis avec client, véhicule (optionnel), lignes de détail
- Chaque ligne: description, quantité, prix unitaire, article (optionnel)
- Calcul automatique sous-total, TPS (5%), TVQ (9.975%), total TTC
- Numérotation automatique (DEV-00001)
- Statuts: Brouillon, Envoyé, Accepté, Refusé, Converti
- Sélection d'article pré-remplit description et prix

**Dépendances**: Epic 1, Epic 2

**Sous-tâches**:
- [TASK] Modèle Devis + DevisLigne (3 pts)
- [TASK] Schémas Pydantic Devis (2 pts)
- [TASK] API CRUD /api/devis avec calcul taxes (5 pts)
- [TASK] Service de calcul des taxes TPS/TVQ (2 pts)
- [TASK] Service de numérotation automatique (1 pt)
- [TASK] Page frontend Devis avec formulaire lignes (8 pts)

---

### Story 3.2: Création et gestion des bons de travail
**En tant que** gérant de garage, **je veux** créer des bons de travail **afin de** suivre les interventions en cours.

**Critères d'acceptation**:
- Créer un bon avec client, véhicule, technicien
- Lignes de travail avec description, quantité, prix
- Statuts: Ouvert, En cours, Terminé, Facturé
- Numérotation automatique (BT-00001)

**Dépendances**: Epic 1, Epic 2

**Sous-tâches**:
- [TASK] Modèle BonTravail + BonTravailLigne (3 pts)
- [TASK] Schémas + API CRUD /api/bons-travail (5 pts)
- [TASK] Page frontend Bons de travail (8 pts)

---

## EPIC 4: Facturation Vente
**Priorité**: Haute | **Sprint**: 3 | **Points**: 21

### Story 4.1: Factures de vente
**En tant que** gérant de garage, **je veux** créer des factures de vente **afin de** facturer mes clients.

**Critères d'acceptation**:
- Créer une facture avec client, véhicule, lignes de détail
- Calcul automatique TPS/TVQ
- Numérotation automatique (FV-00001)
- Statuts: Brouillon, Envoyée, Payée, En retard, Annulée
- Suivi du montant payé

**Dépendances**: Epic 1, Epic 2

**Sous-tâches**:
- [TASK] Modèle FactureVente + FactureVenteLigne (3 pts)
- [TASK] Schémas + API CRUD /api/factures-vente (5 pts)
- [TASK] Page frontend Factures de vente (8 pts)
- [TASK] Mise à jour statut automatique lors des paiements (3 pts)

---

## EPIC 5: Achats (Commandes et Factures)
**Priorité**: Moyenne | **Sprint**: 3 | **Points**: 18

### Story 5.1: Commandes d'achat
**En tant que** gérant de garage, **je veux** créer des commandes d'achat **afin de** commander des pièces chez mes fournisseurs.

**Critères d'acceptation**:
- Créer une commande avec fournisseur et lignes
- Calcul automatique taxes
- Numérotation automatique (CA-00001)
- Statuts: Brouillon, Envoyée, Reçue, Annulée

**Dépendances**: Epic 2

**Sous-tâches**:
- [TASK] Modèle CommandeAchat + CommandeAchatLigne (2 pts)
- [TASK] Schémas + API CRUD (3 pts)
- [TASK] Page frontend Commandes d'achat (5 pts)

---

### Story 5.2: Factures d'achat
**En tant que** gérant de garage, **je veux** enregistrer les factures de mes fournisseurs **afin de** suivre mes dépenses.

**Critères d'acceptation**:
- Créer une facture d'achat avec fournisseur et lignes
- Suivi du montant payé
- Statuts: Brouillon, Reçue, Payée, En retard

**Dépendances**: Epic 2

**Sous-tâches**:
- [TASK] Modèle FactureAchat + FactureAchatLigne (2 pts)
- [TASK] Schémas + API CRUD (3 pts)
- [TASK] Page frontend Factures d'achat (5 pts)

---

## EPIC 6: Paiements
**Priorité**: Haute | **Sprint**: 3-4 | **Points**: 13

### Story 6.1: Enregistrement des paiements
**En tant que** gérant de garage, **je veux** enregistrer les paiements **afin de** suivre l'encaissement et les paiements fournisseurs.

**Critères d'acceptation**:
- Paiements de type Vente (client) ou Achat (fournisseur)
- Lier un paiement à une facture
- Modes: Espèces, Chèque, Carte, Virement, Interac
- Mise à jour automatique du statut de la facture liée
- Référence de transaction

**Dépendances**: Epic 4, Epic 5

**Sous-tâches**:
- [TASK] Modèle Paiement avec enums (2 pts)
- [TASK] Schémas + API CRUD avec logique métier (5 pts)
- [TASK] Mise à jour automatique statut facture (3 pts)
- [TASK] Page frontend Paiements (5 pts)

---

## EPIC 7: Tableau de Bord et Rapports
**Priorité**: Moyenne | **Sprint**: 4 | **Points**: 16

### Story 7.1: Tableau de bord
**En tant que** gérant de garage, **je veux** voir un résumé de mon activité **afin de** piloter mon garage.

**Critères d'acceptation**:
- Nombre de clients, véhicules
- Bons de travail ouverts
- Chiffre d'affaires total et encaissé
- Factures impayées (nombre et montant)
- Devis en attente
- Alertes de stock bas
- Dernières factures et derniers bons de travail

**Sous-tâches**:
- [TASK] API /api/dashboard avec agrégations (5 pts)
- [TASK] Page Dashboard avec cartes KPI et listes (5 pts)

---

### Story 7.2: Rapports
**En tant que** gérant de garage, **je veux** générer des rapports **afin de** analyser mes revenus et mon stock.

**Critères d'acceptation**:
- Rapport de revenus: ventes, achats, marge brute, taxes
- Rapport de stock: valeur totale, articles en stock bas
- Graphique de synthèse financière
- Filtrage par période

**Sous-tâches**:
- [TASK] API /api/rapports avec calculs (5 pts)
- [TASK] Page Rapports avec graphiques Recharts (5 pts)

---

## EPIC 8: Génération PDF (Post-MVP)
**Priorité**: Basse | **Sprint**: 5 | **Points**: 13

### Story 8.1: PDF pour devis
**Critères d'acceptation**:
- Générer un PDF à partir d'un devis
- Logo et coordonnées du garage
- Détail des lignes avec taxes TPS/TVQ
- Téléchargement direct

**Sous-tâches**:
- [TASK] Intégrer ReportLab (1 pt)
- [TASK] Template PDF devis (5 pts)
- [TASK] Bouton télécharger PDF frontend (2 pts)

### Story 8.2: PDF pour factures
**Critères d'acceptation**:
- Générer un PDF à partir d'une facture de vente
- Conforme aux exigences fiscales du Québec
- Numéros TPS/TVQ du garage

**Sous-tâches**:
- [TASK] Template PDF facture (5 pts)
- [TASK] Bouton télécharger PDF frontend (2 pts)

---

## EPIC 9: Infrastructure et Qualité (Transverse)
**Priorité**: Haute | **Sprint**: 1-4 | **Points**: 13

### Story 9.1: Setup du projet
**Sous-tâches**:
- [TASK] Créer le repo GitHub (1 pt)
- [TASK] Scaffolding backend FastAPI (2 pts)
- [TASK] Scaffolding frontend React/Vite (2 pts)
- [TASK] Configuration CORS (1 pt)
- [TASK] Configuration base de données SQLite (1 pt)
- [TASK] README et documentation de démarrage (2 pts)

### Story 9.2: Tests et CI/CD (Post-MVP)
**Sous-tâches**:
- [TASK] Tests unitaires backend (5 pts)
- [TASK] Tests frontend (5 pts)
- [TASK] Pipeline CI/CD GitHub Actions (3 pts)

---

## Résumé du Backlog MVP

| Sprint | Epics | Points | Durée estimée |
|--------|-------|--------|---------------|
| Sprint 1 | E1 (Clients/Véhicules) + E2 (Articles/Fournisseurs) + E9 (Setup) | 52 | 2 semaines |
| Sprint 2 | E3 (Devis/Bons de travail) | 26 | 2 semaines |
| Sprint 3 | E4 (Factures Vente) + E5 (Achats) | 39 | 2 semaines |
| Sprint 4 | E6 (Paiements) + E7 (Dashboard/Rapports) | 29 | 2 semaines |
| Sprint 5 | E8 (PDF) - Post-MVP | 13 | 1 semaine |

**Total MVP (Sprints 1-4)**: ~146 points | ~8 semaines
**Total avec PDF (Sprint 5)**: ~159 points | ~9 semaines

---

## Priorité des Stories

| Priorité | Stories |
|----------|---------|
| **P0 - Critique** | 1.1 Clients, 1.2 Véhicules, 2.2 Articles, 9.1 Setup |
| **P1 - Haute** | 2.1 Fournisseurs, 3.1 Devis, 3.2 Bons de travail, 4.1 Factures vente |
| **P2 - Moyenne** | 5.1 Commandes achat, 5.2 Factures achat, 6.1 Paiements, 7.1 Dashboard |
| **P3 - Basse** | 7.2 Rapports, 8.1 PDF Devis, 8.2 PDF Factures |

## Dépendances entre Epics

```
E9 (Setup) ──► E1 (Clients/Véhicules) ──► E3 (Devis/BT) ──► E4 (Factures) ──► E6 (Paiements)
                                      │                                     │
               E2 (Articles/Fourn.) ──┘                  E5 (Achats) ───────┘
                                                                            │
                                                         E7 (Dashboard) ◄──┘
                                                                            │
                                                         E8 (PDF) ◄────────┘
```
