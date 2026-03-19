from datetime import datetime, date
from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class TypePaiement(str, enum.Enum):
    VENTE = "vente"
    ACHAT = "achat"


class ModePaiement(str, enum.Enum):
    ESPECES = "especes"
    CHEQUE = "cheque"
    CARTE = "carte"
    VIREMENT = "virement"
    INTERAC = "interac"


class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(TypePaiement), nullable=False)
    facture_vente_id = Column(Integer, ForeignKey("factures_vente.id"), nullable=True)
    facture_achat_id = Column(Integer, ForeignKey("factures_achat.id"), nullable=True)
    date_paiement = Column(Date, default=date.today)
    montant = Column(Float, nullable=False)
    mode_paiement = Column(Enum(ModePaiement), nullable=False)
    reference = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    facture_vente = relationship("FactureVente", back_populates="paiements")
    facture_achat = relationship("FactureAchat", back_populates="paiements")
