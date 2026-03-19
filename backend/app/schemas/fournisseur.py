from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FournisseurCreate(BaseModel):
    nom: str
    contact: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    ville: Optional[str] = None
    code_postal: Optional[str] = None
    province: str = "QC"
    notes: Optional[str] = None


class FournisseurUpdate(BaseModel):
    nom: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    ville: Optional[str] = None
    code_postal: Optional[str] = None
    province: Optional[str] = None
    notes: Optional[str] = None


class FournisseurResponse(BaseModel):
    id: int
    nom: str
    contact: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    ville: Optional[str] = None
    code_postal: Optional[str] = None
    province: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
