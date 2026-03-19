from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models.commande_achat import CommandeAchat, CommandeAchatLigne
from app.schemas.commande_achat import CommandeAchatCreate, CommandeAchatUpdate, CommandeAchatResponse
from app.services.taxes import calculer_taxes
from app.services.numerotation import generer_numero

router = APIRouter(prefix="/api/commandes-achat", tags=["commandes_achat"])


@router.get("", response_model=List[CommandeAchatResponse])
def list_commandes_achat(
    skip: int = 0,
    limit: int = 100,
    statut: Optional[str] = None,
    fournisseur_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(CommandeAchat).options(joinedload(CommandeAchat.lignes))
    if statut:
        query = query.filter(CommandeAchat.statut == statut)
    if fournisseur_id:
        query = query.filter(CommandeAchat.fournisseur_id == fournisseur_id)
    return query.order_by(CommandeAchat.date_commande.desc()).offset(skip).limit(limit).all()


@router.get("/{commande_id}", response_model=CommandeAchatResponse)
def get_commande_achat(commande_id: int, db: Session = Depends(get_db)):
    commande = db.query(CommandeAchat).options(joinedload(CommandeAchat.lignes)).filter(CommandeAchat.id == commande_id).first()
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return commande


@router.post("", response_model=CommandeAchatResponse, status_code=201)
def create_commande_achat(data: CommandeAchatCreate, db: Session = Depends(get_db)):
    numero = generer_numero(db, CommandeAchat, "CA")
    lignes_data = data.lignes
    commande_dict = data.model_dump(exclude={"lignes"})
    commande_dict["numero"] = numero

    sous_total = 0.0
    lignes = []
    for ligne_data in lignes_data:
        total_ligne = round(ligne_data.quantite * ligne_data.prix_unitaire, 2)
        sous_total += total_ligne
        lignes.append(CommandeAchatLigne(**ligne_data.model_dump(), total=total_ligne))

    taxes = calculer_taxes(sous_total)
    commande_dict.update(taxes)

    commande = CommandeAchat(**commande_dict)
    commande.lignes = lignes
    db.add(commande)
    db.commit()
    db.refresh(commande)
    return commande


@router.put("/{commande_id}", response_model=CommandeAchatResponse)
def update_commande_achat(commande_id: int, data: CommandeAchatUpdate, db: Session = Depends(get_db)):
    commande = db.query(CommandeAchat).options(joinedload(CommandeAchat.lignes)).filter(CommandeAchat.id == commande_id).first()
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")

    update_data = data.model_dump(exclude_unset=True, exclude={"lignes"})
    for key, value in update_data.items():
        setattr(commande, key, value)

    if data.lignes is not None:
        for ligne in commande.lignes:
            db.delete(ligne)

        sous_total = 0.0
        new_lignes = []
        for ligne_data in data.lignes:
            total_ligne = round(ligne_data.quantite * ligne_data.prix_unitaire, 2)
            sous_total += total_ligne
            new_lignes.append(CommandeAchatLigne(**ligne_data.model_dump(), total=total_ligne, commande_id=commande_id))

        taxes = calculer_taxes(sous_total)
        commande.sous_total = taxes["sous_total"]
        commande.tps = taxes["tps"]
        commande.tvq = taxes["tvq"]
        commande.total = taxes["total"]
        commande.lignes = new_lignes

    db.commit()
    db.refresh(commande)
    return commande


@router.delete("/{commande_id}", status_code=204)
def delete_commande_achat(commande_id: int, db: Session = Depends(get_db)):
    commande = db.query(CommandeAchat).filter(CommandeAchat.id == commande_id).first()
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    db.delete(commande)
    db.commit()
