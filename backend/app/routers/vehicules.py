from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.vehicule import Vehicule
from app.schemas.vehicule import VehiculeCreate, VehiculeUpdate, VehiculeResponse

router = APIRouter(prefix="/api/vehicules", tags=["vehicules"])


@router.get("", response_model=List[VehiculeResponse])
def list_vehicules(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Vehicule)
    if client_id:
        query = query.filter(Vehicule.client_id == client_id)
    if search:
        query = query.filter(
            (Vehicule.marque.ilike(f"%{search}%"))
            | (Vehicule.modele.ilike(f"%{search}%"))
            | (Vehicule.plaque.ilike(f"%{search}%"))
            | (Vehicule.vin.ilike(f"%{search}%"))
        )
    return query.order_by(Vehicule.marque).offset(skip).limit(limit).all()


@router.get("/{vehicule_id}", response_model=VehiculeResponse)
def get_vehicule(vehicule_id: int, db: Session = Depends(get_db)):
    vehicule = db.query(Vehicule).filter(Vehicule.id == vehicule_id).first()
    if not vehicule:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    return vehicule


@router.post("", response_model=VehiculeResponse, status_code=201)
def create_vehicule(vehicule_data: VehiculeCreate, db: Session = Depends(get_db)):
    vehicule = Vehicule(**vehicule_data.model_dump())
    db.add(vehicule)
    db.commit()
    db.refresh(vehicule)
    return vehicule


@router.put("/{vehicule_id}", response_model=VehiculeResponse)
def update_vehicule(vehicule_id: int, vehicule_data: VehiculeUpdate, db: Session = Depends(get_db)):
    vehicule = db.query(Vehicule).filter(Vehicule.id == vehicule_id).first()
    if not vehicule:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    for key, value in vehicule_data.model_dump(exclude_unset=True).items():
        setattr(vehicule, key, value)
    db.commit()
    db.refresh(vehicule)
    return vehicule


@router.delete("/{vehicule_id}", status_code=204)
def delete_vehicule(vehicule_id: int, db: Session = Depends(get_db)):
    vehicule = db.query(Vehicule).filter(Vehicule.id == vehicule_id).first()
    if not vehicule:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    db.delete(vehicule)
    db.commit()
