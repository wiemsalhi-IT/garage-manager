from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.fournisseur import Fournisseur
from app.schemas.fournisseur import FournisseurCreate, FournisseurUpdate, FournisseurResponse

router = APIRouter(prefix="/api/fournisseurs", tags=["fournisseurs"])


@router.get("", response_model=List[FournisseurResponse])
def list_fournisseurs(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Fournisseur)
    if search:
        query = query.filter(
            (Fournisseur.nom.ilike(f"%{search}%"))
            | (Fournisseur.contact.ilike(f"%{search}%"))
            | (Fournisseur.email.ilike(f"%{search}%"))
        )
    return query.order_by(Fournisseur.nom).offset(skip).limit(limit).all()


@router.get("/{fournisseur_id}", response_model=FournisseurResponse)
def get_fournisseur(fournisseur_id: int, db: Session = Depends(get_db)):
    fournisseur = db.query(Fournisseur).filter(Fournisseur.id == fournisseur_id).first()
    if not fournisseur:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    return fournisseur


@router.post("", response_model=FournisseurResponse, status_code=201)
def create_fournisseur(data: FournisseurCreate, db: Session = Depends(get_db)):
    fournisseur = Fournisseur(**data.model_dump())
    db.add(fournisseur)
    db.commit()
    db.refresh(fournisseur)
    return fournisseur


@router.put("/{fournisseur_id}", response_model=FournisseurResponse)
def update_fournisseur(fournisseur_id: int, data: FournisseurUpdate, db: Session = Depends(get_db)):
    fournisseur = db.query(Fournisseur).filter(Fournisseur.id == fournisseur_id).first()
    if not fournisseur:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(fournisseur, key, value)
    db.commit()
    db.refresh(fournisseur)
    return fournisseur


@router.delete("/{fournisseur_id}", status_code=204)
def delete_fournisseur(fournisseur_id: int, db: Session = Depends(get_db)):
    fournisseur = db.query(Fournisseur).filter(Fournisseur.id == fournisseur_id).first()
    if not fournisseur:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    db.delete(fournisseur)
    db.commit()
