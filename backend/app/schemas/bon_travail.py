from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class BonTravailLigneCreate(BaseModel):
    article_id: Optional[int] = None
    description: str
    quantite: float = 1.0
    prix_unitaire: float = 0.0


class BonTravailLigneResponse(BaseModel):
    id: int
    bon_travail_id: int
    article_id: Optional[int] = None
    description: str
    quantite: float
    prix_unitaire: float
    total: float

    model_config = {"from_attributes": True}


class BonTravailCreate(BaseModel):
    devis_id: Optional[int] = None
    client_id: int
    vehicule_id: Optional[int] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    statut: str = "ouvert"
    technicien: Optional[str] = None
    notes: Optional[str] = None
    lignes: List[BonTravailLigneCreate] = []


class BonTravailUpdate(BaseModel):
    devis_id: Optional[int] = None
    client_id: Optional[int] = None
    vehicule_id: Optional[int] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    statut: Optional[str] = None
    technicien: Optional[str] = None
    notes: Optional[str] = None
    lignes: Optional[List[BonTravailLigneCreate]] = None


class BonTravailResponse(BaseModel):
    id: int
    numero: str
    devis_id: Optional[int] = None
    client_id: int
    vehicule_id: Optional[int] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    statut: str
    technicien: Optional[str] = None
    notes: Optional[str] = None
    lignes: List[BonTravailLigneResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
