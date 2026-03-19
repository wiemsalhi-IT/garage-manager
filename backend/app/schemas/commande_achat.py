from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class CommandeAchatLigneCreate(BaseModel):
    article_id: Optional[int] = None
    description: str
    quantite: float = 1.0
    prix_unitaire: float = 0.0


class CommandeAchatLigneResponse(BaseModel):
    id: int
    commande_id: int
    article_id: Optional[int] = None
    description: str
    quantite: float
    prix_unitaire: float
    total: float

    model_config = {"from_attributes": True}


class CommandeAchatCreate(BaseModel):
    fournisseur_id: int
    date_commande: Optional[date] = None
    date_reception: Optional[date] = None
    statut: str = "brouillon"
    notes: Optional[str] = None
    lignes: List[CommandeAchatLigneCreate] = []


class CommandeAchatUpdate(BaseModel):
    fournisseur_id: Optional[int] = None
    date_commande: Optional[date] = None
    date_reception: Optional[date] = None
    statut: Optional[str] = None
    notes: Optional[str] = None
    lignes: Optional[List[CommandeAchatLigneCreate]] = None


class CommandeAchatResponse(BaseModel):
    id: int
    numero: str
    fournisseur_id: int
    date_commande: Optional[date] = None
    date_reception: Optional[date] = None
    statut: str
    sous_total: float
    tps: float
    tvq: float
    total: float
    notes: Optional[str] = None
    lignes: List[CommandeAchatLigneResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
