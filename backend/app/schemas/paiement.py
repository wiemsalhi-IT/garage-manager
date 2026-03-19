from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class PaiementCreate(BaseModel):
    type: str  # "vente" or "achat"
    facture_vente_id: Optional[int] = None
    facture_achat_id: Optional[int] = None
    date_paiement: Optional[date] = None
    montant: float
    mode_paiement: str  # "especes", "cheque", "carte", "virement", "interac"
    reference: Optional[str] = None
    notes: Optional[str] = None


class PaiementUpdate(BaseModel):
    type: Optional[str] = None
    facture_vente_id: Optional[int] = None
    facture_achat_id: Optional[int] = None
    date_paiement: Optional[date] = None
    montant: Optional[float] = None
    mode_paiement: Optional[str] = None
    reference: Optional[str] = None
    notes: Optional[str] = None


class PaiementResponse(BaseModel):
    id: int
    type: str
    facture_vente_id: Optional[int] = None
    facture_achat_id: Optional[int] = None
    date_paiement: Optional[date] = None
    montant: float
    mode_paiement: str
    reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
