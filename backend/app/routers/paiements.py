from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.paiement import Paiement
from app.models.facture_vente import FactureVente
from app.models.facture_achat import FactureAchat
from app.schemas.paiement import PaiementCreate, PaiementUpdate, PaiementResponse

router = APIRouter(prefix="/api/paiements", tags=["paiements"])


@router.get("", response_model=List[PaiementResponse])
def list_paiements(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    facture_vente_id: Optional[int] = None,
    facture_achat_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Paiement)
    if type:
        query = query.filter(Paiement.type == type)
    if facture_vente_id:
        query = query.filter(Paiement.facture_vente_id == facture_vente_id)
    if facture_achat_id:
        query = query.filter(Paiement.facture_achat_id == facture_achat_id)
    return query.order_by(Paiement.date_paiement.desc()).offset(skip).limit(limit).all()


@router.get("/{paiement_id}", response_model=PaiementResponse)
def get_paiement(paiement_id: int, db: Session = Depends(get_db)):
    paiement = db.query(Paiement).filter(Paiement.id == paiement_id).first()
    if not paiement:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    return paiement


@router.post("", response_model=PaiementResponse, status_code=201)
def create_paiement(data: PaiementCreate, db: Session = Depends(get_db)):
    paiement = Paiement(**data.model_dump())
    db.add(paiement)
    db.flush()

    # Update paid amount on related invoice
    if paiement.facture_vente_id:
        facture = db.query(FactureVente).filter(FactureVente.id == paiement.facture_vente_id).first()
        if facture:
            facture.montant_paye = (facture.montant_paye or 0) + paiement.montant
            if facture.montant_paye >= facture.total:
                facture.statut = "payee"

    if paiement.facture_achat_id:
        facture = db.query(FactureAchat).filter(FactureAchat.id == paiement.facture_achat_id).first()
        if facture:
            facture.montant_paye = (facture.montant_paye or 0) + paiement.montant
            if facture.montant_paye >= facture.total:
                facture.statut = "payee"

    db.commit()
    db.refresh(paiement)
    return paiement


@router.put("/{paiement_id}", response_model=PaiementResponse)
def update_paiement(paiement_id: int, data: PaiementUpdate, db: Session = Depends(get_db)):
    paiement = db.query(Paiement).filter(Paiement.id == paiement_id).first()
    if not paiement:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(paiement, key, value)
    db.commit()
    db.refresh(paiement)
    return paiement


@router.delete("/{paiement_id}", status_code=204)
def delete_paiement(paiement_id: int, db: Session = Depends(get_db)):
    paiement = db.query(Paiement).filter(Paiement.id == paiement_id).first()
    if not paiement:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    db.delete(paiement)
    db.commit()
