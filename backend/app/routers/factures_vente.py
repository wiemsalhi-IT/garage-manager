from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models.facture_vente import FactureVente, FactureVenteLigne
from app.schemas.facture_vente import FactureVenteCreate, FactureVenteUpdate, FactureVenteResponse
from app.services.taxes import calculer_taxes
from app.services.numerotation import generer_numero

router = APIRouter(prefix="/api/factures-vente", tags=["factures_vente"])


@router.get("", response_model=List[FactureVenteResponse])
def list_factures_vente(
    skip: int = 0,
    limit: int = 100,
    statut: Optional[str] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(FactureVente).options(joinedload(FactureVente.lignes))
    if statut:
        query = query.filter(FactureVente.statut == statut)
    if client_id:
        query = query.filter(FactureVente.client_id == client_id)
    return query.order_by(FactureVente.date_facture.desc()).offset(skip).limit(limit).all()


@router.get("/{facture_id}", response_model=FactureVenteResponse)
def get_facture_vente(facture_id: int, db: Session = Depends(get_db)):
    facture = db.query(FactureVente).options(joinedload(FactureVente.lignes)).filter(FactureVente.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture non trouvée")
    return facture


@router.post("", response_model=FactureVenteResponse, status_code=201)
def create_facture_vente(data: FactureVenteCreate, db: Session = Depends(get_db)):
    numero = generer_numero(db, FactureVente, "FV")
    lignes_data = data.lignes
    facture_dict = data.model_dump(exclude={"lignes"})
    facture_dict["numero"] = numero

    sous_total = 0.0
    lignes = []
    for ligne_data in lignes_data:
        total_ligne = round(ligne_data.quantite * ligne_data.prix_unitaire, 2)
        sous_total += total_ligne
        lignes.append(FactureVenteLigne(**ligne_data.model_dump(), total=total_ligne))

    taxes = calculer_taxes(sous_total)
    facture_dict.update(taxes)

    facture = FactureVente(**facture_dict)
    facture.lignes = lignes
    db.add(facture)
    db.commit()
    db.refresh(facture)
    return facture


@router.put("/{facture_id}", response_model=FactureVenteResponse)
def update_facture_vente(facture_id: int, data: FactureVenteUpdate, db: Session = Depends(get_db)):
    facture = db.query(FactureVente).options(joinedload(FactureVente.lignes)).filter(FactureVente.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture non trouvée")

    update_data = data.model_dump(exclude_unset=True, exclude={"lignes"})
    for key, value in update_data.items():
        setattr(facture, key, value)

    if data.lignes is not None:
        for ligne in facture.lignes:
            db.delete(ligne)

        sous_total = 0.0
        new_lignes = []
        for ligne_data in data.lignes:
            total_ligne = round(ligne_data.quantite * ligne_data.prix_unitaire, 2)
            sous_total += total_ligne
            new_lignes.append(FactureVenteLigne(**ligne_data.model_dump(), total=total_ligne, facture_id=facture_id))

        taxes = calculer_taxes(sous_total)
        facture.sous_total = taxes["sous_total"]
        facture.tps = taxes["tps"]
        facture.tvq = taxes["tvq"]
        facture.total = taxes["total"]
        facture.lignes = new_lignes

    db.commit()
    db.refresh(facture)
    return facture


@router.delete("/{facture_id}", status_code=204)
def delete_facture_vente(facture_id: int, db: Session = Depends(get_db)):
    facture = db.query(FactureVente).filter(FactureVente.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture non trouvée")
    db.delete(facture)
    db.commit()
