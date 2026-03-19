from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class DevisLigneCreate(BaseModel):
    article_id: Optional[int] = None
    description: str
    quantite: float = 1.0
    prix_unitaire: float = 0.0


class DevisLigneResponse(BaseModel):
    id: int
    devis_id: int
    article_id: Optional[int] = None
    description: str
    quantite: float
    prix_unitaire: float
    total: float

    model_config = {"from_attributes": True}


class DevisCreate(BaseModel):
    client_id: int
    vehicule_id: Optional[int] = None
    date_devis: Optional[date] = None
    date_validite: Optional[date] = None
    statut: str = "brouillon"
    notes: Optional[str] = None
    lignes: List[DevisLigneCreate] = []


class DevisUpdate(BaseModel):
    client_id: Optional[int] = None
    vehicule_id: Optional[int] = None
    date_devis: Optional[date] = None
    date_validite: Optional[date] = None
    statut: Optional[str] = None
    notes: Optional[str] = None
    lignes: Optional[List[DevisLigneCreate]] = None


class DevisResponse(BaseModel):
    id: int
    numero: str
    client_id: int
    vehicule_id: Optional[int] = None
    date_devis: Optional[date] = None
    date_validite: Optional[date] = None
    statut: str
    sous_total: float
    tps: float
    tvq: float
    total: float
    notes: Optional[str] = None
    lignes: List[DevisLigneResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
