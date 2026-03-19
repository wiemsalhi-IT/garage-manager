from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.client import Client
from app.models.vehicule import Vehicule
from app.models.article import Article
from app.models.bon_travail import BonTravail
from app.models.facture_vente import FactureVente
from app.models.facture_achat import FactureAchat
from app.models.devis import Devis
from app.models.paiement import Paiement

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    total_clients = db.query(func.count(Client.id)).scalar() or 0
    total_vehicules = db.query(func.count(Vehicule.id)).scalar() or 0

    # Work orders stats
    bons_ouverts = db.query(func.count(BonTravail.id)).filter(
        BonTravail.statut.in_(["ouvert", "en_cours"])
    ).scalar() or 0

    # Revenue
    ca_total = db.query(func.sum(FactureVente.total)).filter(
        FactureVente.statut != "annulee"
    ).scalar() or 0.0

    ca_encaisse = db.query(func.sum(FactureVente.montant_paye)).scalar() or 0.0

    factures_impayees = db.query(func.count(FactureVente.id)).filter(
        FactureVente.statut.in_(["envoyee", "en_retard"])
    ).scalar() or 0

    montant_impaye = db.query(
        func.sum(FactureVente.total - FactureVente.montant_paye)
    ).filter(
        FactureVente.statut.in_(["envoyee", "en_retard"])
    ).scalar() or 0.0

    # Devis stats
    devis_en_attente = db.query(func.count(Devis.id)).filter(
        Devis.statut.in_(["brouillon", "envoye"])
    ).scalar() or 0

    # Low stock alerts
    articles_stock_bas = db.query(func.count(Article.id)).filter(
        Article.quantite_stock <= Article.seuil_minimum,
        Article.type == "piece",
    ).scalar() or 0

    # Recent invoices
    recent_factures = db.query(FactureVente).order_by(
        FactureVente.date_facture.desc()
    ).limit(5).all()

    # Recent work orders
    recent_bons = db.query(BonTravail).order_by(
        BonTravail.date_debut.desc()
    ).limit(5).all()

    return {
        "stats": {
            "total_clients": total_clients,
            "total_vehicules": total_vehicules,
            "bons_ouverts": bons_ouverts,
            "ca_total": round(ca_total, 2),
            "ca_encaisse": round(ca_encaisse, 2),
            "factures_impayees": factures_impayees,
            "montant_impaye": round(montant_impaye, 2),
            "devis_en_attente": devis_en_attente,
            "articles_stock_bas": articles_stock_bas,
        },
        "recent_factures": [
            {
                "id": f.id,
                "numero": f.numero,
                "total": f.total,
                "statut": f.statut.value if hasattr(f.statut, 'value') else f.statut,
                "date_facture": str(f.date_facture) if f.date_facture else None,
            }
            for f in recent_factures
        ],
        "recent_bons": [
            {
                "id": b.id,
                "numero": b.numero,
                "statut": b.statut.value if hasattr(b.statut, 'value') else b.statut,
                "date_debut": str(b.date_debut) if b.date_debut else None,
                "technicien": b.technicien,
            }
            for b in recent_bons
        ],
    }
