from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class FactureVenteLigneCreate(BaseModel):
    article_id: Optional[int] = None
    description: str
    quantite: float = 1.0
    prix_unitaire: float = 0.0


class FactureVenteLigneResponse(BaseModel):
    id: int
    facture_id: int
    article_id: Optional[int] = None
    description: str
    quantite: float
    prix_unitaire: float
    total: float

    model_config = {"from_attributes": True}


class FactureVenteCreate(BaseModel):
    client_id: int
    vehicule_id: Optional[int] = None
    bon_travail_id: Optional[int] = None
    date_facture: Optional[date] = None
    date_echeance: Optional[date] = None
    statut: str = "brouillon"
    notes: Optional[str] = None
    lignes: List[FactureVenteLigneCreate] = []


class FactureVenteUpdate(BaseModel):
    client_id: Optional[int] = None
    vehicule_id: Optional[int] = None
    bon_travail_id: Optional[int] = None
    date_facture: Optional[date] = None
    date_echeance: Optional[date] = None
    statut: Optional[str] = None
    notes: Optional[str] = None
    lignes: Optional[List[FactureVenteLigneCreate]] = None


class FactureVenteResponse(BaseModel):
    id: int
    numero: str
    client_id: int
    vehicule_id: Optional[int] = None
    bon_travail_id: Optional[int] = None
    date_facture: Optional[date] = None
    date_echeance: Optional[date] = None
    statut: str
    sous_total: float
    tps: float
    tvq: float
    total: float
    montant_paye: float
    notes: Optional[str] = None
    lignes: List[FactureVenteLigneResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
