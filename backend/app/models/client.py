from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    telephone = Column(String(20), nullable=True)
    adresse = Column(String(255), nullable=True)
    ville = Column(String(100), nullable=True)
    code_postal = Column(String(10), nullable=True)
    province = Column(String(50), default="QC")
    is_passager = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicules = relationship("Vehicule", back_populates="client")
    devis = relationship("Devis", back_populates="client")
    bons_travail = relationship("BonTravail", back_populates="client")
    factures_vente = relationship("FactureVente", back_populates="client")
