from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VehiculeCreate(BaseModel):
    client_id: int
    marque: str
    modele: str
    annee: Optional[int] = None
    vin: Optional[str] = None
    plaque: Optional[str] = None
    couleur: Optional[str] = None
    kilometrage: Optional[int] = None
    notes: Optional[str] = None


class VehiculeUpdate(BaseModel):
    client_id: Optional[int] = None
    marque: Optional[str] = None
    modele: Optional[str] = None
    annee: Optional[int] = None
    vin: Optional[str] = None
    plaque: Optional[str] = None
    couleur: Optional[str] = None
    kilometrage: Optional[int] = None
    notes: Optional[str] = None


class VehiculeResponse(BaseModel):
    id: int
    client_id: int
    marque: str
    modele: str
    annee: Optional[int] = None
    vin: Optional[str] = None
    plaque: Optional[str] = None
    couleur: Optional[str] = None
    kilometrage: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
