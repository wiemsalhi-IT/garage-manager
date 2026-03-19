from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models.devis import Devis, DevisLigne
from app.schemas.devis import DevisCreate, DevisUpdate, DevisResponse
from app.services.taxes import calculer_taxes
from app.services.numerotation import generer_numero

router = APIRouter(prefix="/api/devis", tags=["devis"])


@router.get("", response_model=List[DevisResponse])
def list_devis(
    skip: int = 0,
    limit: int = 100,
    statut: Optional[str] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Devis).options(joinedload(Devis.lignes))
    if statut:
        query = query.filter(Devis.statut == statut)
    if client_id:
        query = query.filter(Devis.client_id == client_id)
    return query.order_by(Devis.date_devis.desc()).offset(skip).limit(limit).all()


@router.get("/{devis_id}", response_model=DevisResponse)
def get_devis(devis_id: int, db: Session = Depends(get_db)):
    devis = db.query(Devis).options(joinedload(Devis.lignes)).filter(Devis.id == devis_id).first()
    if not devis:
        raise HTTPException(status_code=404, detail="Devis non trouvé")
    return devis


@router.post("", response_model=DevisResponse, status_code=201)
def create_devis(data: DevisCreate, db: Session = Depends(get_db)):
    numero = generer_numero(db, Devis, "DEV")
    lignes_data = data.lignes
    devis_dict = data.model_dump(exclude={"lignes"})
    devis_dict["numero"] = numero

    sous_total = 0.0
    lignes = []
    for ligne_data in lignes_data:
        total_ligne = round(ligne_data.quantite * ligne_data.prix_unitaire, 2)
        sous_total += total_ligne
        lignes.append(DevisLigne(
            **ligne_data.model_dump(),
            total=total_ligne,
        ))

    taxes = calculer_taxes(sous_total)
    devis_dict.update(taxes)

    devis = Devis(**devis_dict)
    devis.lignes = lignes
    db.add(devis)
    db.commit()
    db.refresh(devis)
    return devis


@router.put("/{devis_id}", response_model=DevisResponse)
def update_devis(devis_id: int, data: DevisUpdate, db: Session = Depends(get_db)):
    devis = db.query(Devis).options(joinedload(Devis.lignes)).filter(Devis.id == devis_id).first()
    if not devis:
        raise HTTPException(status_code=404, detail="Devis non trouvé")

    update_data = data.model_dump(exclude_unset=True, exclude={"lignes"})
    for key, value in update_data.items():
        setattr(devis, key, value)

    if data.lignes is not None:
        for ligne in devis.lignes:
            db.delete(ligne)

        sous_total = 0.0
        new_lignes = []
        for ligne_data in data.lignes:
            total_ligne = round(ligne_data.quantite * ligne_data.prix_unitaire, 2)
            sous_total += total_ligne
            new_lignes.append(DevisLigne(
                **ligne_data.model_dump(),
                total=total_ligne,
                devis_id=devis_id,
            ))

        taxes = calculer_taxes(sous_total)
        devis.sous_total = taxes["sous_total"]
        devis.tps = taxes["tps"]
        devis.tvq = taxes["tvq"]
        devis.total = taxes["total"]
        devis.lignes = new_lignes

    db.commit()
    db.refresh(devis)
    return devis


@router.delete("/{devis_id}", status_code=204)
def delete_devis(devis_id: int, db: Session = Depends(get_db)):
    devis = db.query(Devis).filter(Devis.id == devis_id).first()
    if not devis:
        raise HTTPException(status_code=404, detail="Devis non trouvé")
    db.delete(devis)
    db.commit()
