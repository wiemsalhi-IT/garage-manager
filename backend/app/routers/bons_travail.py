from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models.bon_travail import BonTravail, BonTravailLigne
from app.schemas.bon_travail import BonTravailCreate, BonTravailUpdate, BonTravailResponse
from app.services.numerotation import generer_numero

router = APIRouter(prefix="/api/bons-travail", tags=["bons_travail"])


@router.get("", response_model=List[BonTravailResponse])
def list_bons_travail(
    skip: int = 0,
    limit: int = 100,
    statut: Optional[str] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(BonTravail).options(joinedload(BonTravail.lignes))
    if statut:
        query = query.filter(BonTravail.statut == statut)
    if client_id:
        query = query.filter(BonTravail.client_id == client_id)
    return query.order_by(BonTravail.date_debut.desc()).offset(skip).limit(limit).all()


@router.get("/{bt_id}", response_model=BonTravailResponse)
def get_bon_travail(bt_id: int, db: Session = Depends(get_db)):
    bt = db.query(BonTravail).options(joinedload(BonTravail.lignes)).filter(BonTravail.id == bt_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="Bon de travail non trouvé")
    return bt


@router.post("", response_model=BonTravailResponse, status_code=201)
def create_bon_travail(data: BonTravailCreate, db: Session = Depends(get_db)):
    numero = generer_numero(db, BonTravail, "BT")
    lignes_data = data.lignes
    bt_dict = data.model_dump(exclude={"lignes"})
    bt_dict["numero"] = numero

    lignes = []
    for ligne_data in lignes_data:
        total_ligne = round(ligne_data.quantite * ligne_data.prix_unitaire, 2)
        lignes.append(BonTravailLigne(**ligne_data.model_dump(), total=total_ligne))

    bt = BonTravail(**bt_dict)
    bt.lignes = lignes
    db.add(bt)
    db.commit()
    db.refresh(bt)
    return bt


@router.put("/{bt_id}", response_model=BonTravailResponse)
def update_bon_travail(bt_id: int, data: BonTravailUpdate, db: Session = Depends(get_db)):
    bt = db.query(BonTravail).options(joinedload(BonTravail.lignes)).filter(BonTravail.id == bt_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="Bon de travail non trouvé")

    update_data = data.model_dump(exclude_unset=True, exclude={"lignes"})
    for key, value in update_data.items():
        setattr(bt, key, value)

    if data.lignes is not None:
        for ligne in bt.lignes:
            db.delete(ligne)

        new_lignes = []
        for ligne_data in data.lignes:
            total_ligne = round(ligne_data.quantite * ligne_data.prix_unitaire, 2)
            new_lignes.append(BonTravailLigne(**ligne_data.model_dump(), total=total_ligne, bon_travail_id=bt_id))
        bt.lignes = new_lignes

    db.commit()
    db.refresh(bt)
    return bt


@router.post("/{bt_id}/convertir-facture", status_code=201)
def convertir_bt_en_facture(bt_id: int, db: Session = Depends(get_db)):
    """Convertir un bon de travail terminé en facture de vente."""
    from app.models.facture_vente import FactureVente, FactureVenteLigne
    from app.services.taxes import calculer_taxes

    bt = db.query(BonTravail).options(joinedload(BonTravail.lignes)).filter(BonTravail.id == bt_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="Bon de travail non trouvé")
    if bt.statut not in ("termine", "ouvert", "en_cours"):
        raise HTTPException(status_code=400, detail="Ce bon de travail ne peut pas être converti")

    numero_fv = generer_numero(db, FactureVente, "FV")

    sous_total = sum(l.total for l in bt.lignes)
    taxes = calculer_taxes(sous_total)

    facture = FactureVente(
        numero=numero_fv,
        client_id=bt.client_id,
        vehicule_id=bt.vehicule_id,
        bon_travail_id=bt.id,
        sous_total=taxes["sous_total"],
        tps=taxes["tps"],
        tvq=taxes["tvq"],
        total=taxes["total"],
        notes=f"Créé depuis bon de travail {bt.numero}",
    )
    for ligne in bt.lignes:
        facture.lignes.append(FactureVenteLigne(
            article_id=ligne.article_id,
            description=ligne.description,
            quantite=ligne.quantite,
            prix_unitaire=ligne.prix_unitaire,
            total=ligne.total,
        ))

    from app.models.bon_travail import StatutBonTravail
    bt.statut = StatutBonTravail.FACTURE
    db.add(facture)
    db.commit()
    db.refresh(facture)
    return {"message": f"Facture {facture.numero} créée", "facture_id": facture.id, "numero": facture.numero}


@router.delete("/{bt_id}", status_code=204)
def delete_bon_travail(bt_id: int, db: Session = Depends(get_db)):
    bt = db.query(BonTravail).filter(BonTravail.id == bt_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="Bon de travail non trouvé")
    db.delete(bt)
    db.commit()
