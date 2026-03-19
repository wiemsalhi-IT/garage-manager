from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, timedelta
from typing import Optional
from app.database import get_db
from app.models.facture_vente import FactureVente
from app.models.facture_achat import FactureAchat
from app.models.paiement import Paiement
from app.models.article import Article
from app.models.bon_travail import BonTravail

router = APIRouter(prefix="/api/rapports", tags=["rapports"])


@router.get("/revenus")
def rapport_revenus(
    date_debut: Optional[date] = None,
    date_fin: Optional[date] = None,
    db: Session = Depends(get_db),
):
    if not date_debut:
        date_debut = date.today().replace(day=1)
    if not date_fin:
        date_fin = date.today()

    ventes = db.query(
        func.sum(FactureVente.sous_total).label("sous_total"),
        func.sum(FactureVente.tps).label("tps"),
        func.sum(FactureVente.tvq).label("tvq"),
        func.sum(FactureVente.total).label("total"),
        func.sum(FactureVente.montant_paye).label("montant_paye"),
        func.count(FactureVente.id).label("nombre"),
    ).filter(
        FactureVente.date_facture >= date_debut,
        FactureVente.date_facture <= date_fin,
        FactureVente.statut != "annulee",
    ).first()

    achats = db.query(
        func.sum(FactureAchat.total).label("total"),
        func.count(FactureAchat.id).label("nombre"),
    ).filter(
        FactureAchat.date_facture >= date_debut,
        FactureAchat.date_facture <= date_fin,
    ).first()

    return {
        "periode": {"debut": str(date_debut), "fin": str(date_fin)},
        "ventes": {
            "sous_total": round(ventes.sous_total or 0, 2),
            "tps": round(ventes.tps or 0, 2),
            "tvq": round(ventes.tvq or 0, 2),
            "total": round(ventes.total or 0, 2),
            "montant_paye": round(ventes.montant_paye or 0, 2),
            "nombre": ventes.nombre or 0,
        },
        "achats": {
            "total": round(achats.total or 0, 2),
            "nombre": achats.nombre or 0,
        },
        "marge_brute": round((ventes.sous_total or 0) - (achats.total or 0), 2),
    }


@router.get("/stock")
def rapport_stock(db: Session = Depends(get_db)):
    articles = db.query(Article).filter(Article.type == "piece").order_by(Article.code).all()

    total_valeur = sum(a.quantite_stock * a.prix_achat for a in articles)
    articles_stock_bas = [a for a in articles if a.quantite_stock <= a.seuil_minimum]

    return {
        "total_articles": len(articles),
        "valeur_stock": round(total_valeur, 2),
        "articles_stock_bas": [
            {
                "id": a.id,
                "code": a.code,
                "description": a.description,
                "quantite_stock": a.quantite_stock,
                "seuil_minimum": a.seuil_minimum,
            }
            for a in articles_stock_bas
        ],
        "articles": [
            {
                "id": a.id,
                "code": a.code,
                "description": a.description,
                "quantite_stock": a.quantite_stock,
                "prix_achat": a.prix_achat,
                "valeur": round(a.quantite_stock * a.prix_achat, 2),
            }
            for a in articles
        ],
    }


@router.get("/activite")
def rapport_activite(
    date_debut: Optional[date] = None,
    date_fin: Optional[date] = None,
    db: Session = Depends(get_db),
):
    if not date_debut:
        date_debut = date.today() - timedelta(days=30)
    if not date_fin:
        date_fin = date.today()

    bons = db.query(
        func.count(BonTravail.id).label("total"),
    ).filter(
        BonTravail.date_debut >= date_debut,
        BonTravail.date_debut <= date_fin,
    ).first()

    bons_termines = db.query(
        func.count(BonTravail.id).label("total"),
    ).filter(
        BonTravail.date_debut >= date_debut,
        BonTravail.date_debut <= date_fin,
        BonTravail.statut.in_(["termine", "facture"]),
    ).first()

    return {
        "periode": {"debut": str(date_debut), "fin": str(date_fin)},
        "bons_travail": {
            "total": bons.total or 0,
            "termines": bons_termines.total or 0,
        },
    }
