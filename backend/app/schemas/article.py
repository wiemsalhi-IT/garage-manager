from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ArticleCreate(BaseModel):
    code: str
    description: str
    type: str  # "piece" or "main_doeuvre"
    prix_achat: float = 0.0
    prix_vente: float = 0.0
    unite: str = "unité"
    fournisseur_id: Optional[int] = None
    quantite_stock: int = 0
    seuil_minimum: int = 0
    notes: Optional[str] = None


class ArticleUpdate(BaseModel):
    code: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    prix_achat: Optional[float] = None
    prix_vente: Optional[float] = None
    unite: Optional[str] = None
    fournisseur_id: Optional[int] = None
    quantite_stock: Optional[int] = None
    seuil_minimum: Optional[int] = None
    notes: Optional[str] = None


class ArticleResponse(BaseModel):
    id: int
    code: str
    description: str
    type: str
    prix_achat: float
    prix_vente: float
    unite: str
    fournisseur_id: Optional[int] = None
    quantite_stock: int
    seuil_minimum: int
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
