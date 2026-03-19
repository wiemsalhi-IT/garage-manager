from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Vehicule(Base):
    __tablename__ = "vehicules"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    marque = Column(String(100), nullable=False)
    modele = Column(String(100), nullable=False)
    annee = Column(Integer, nullable=True)
    vin = Column(String(17), nullable=True, unique=True)
    plaque = Column(String(20), nullable=True)
    couleur = Column(String(50), nullable=True)
    kilometrage = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="vehicules")
    devis = relationship("Devis", back_populates="vehicule")
    bons_travail = relationship("BonTravail", back_populates="vehicule")
    factures_vente = relationship("FactureVente", back_populates="vehicule")
