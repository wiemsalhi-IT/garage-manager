from datetime import datetime, date
from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class StatutBonTravail(str, enum.Enum):
    OUVERT = "ouvert"
    EN_COURS = "en_cours"
    TERMINE = "termine"
    FACTURE = "facture"


class BonTravail(Base):
    __tablename__ = "bons_travail"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(20), unique=True, nullable=False)
    devis_id = Column(Integer, ForeignKey("devis.id"), nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    vehicule_id = Column(Integer, ForeignKey("vehicules.id"), nullable=True)
    date_debut = Column(Date, default=date.today)
    date_fin = Column(Date, nullable=True)
    statut = Column(Enum(StatutBonTravail), default=StatutBonTravail.OUVERT)
    technicien = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="bons_travail")
    vehicule = relationship("Vehicule", back_populates="bons_travail")
    devis = relationship("Devis")
    lignes = relationship("BonTravailLigne", back_populates="bon_travail", cascade="all, delete-orphan")
    factures_vente = relationship("FactureVente", back_populates="bon_travail")


class BonTravailLigne(Base):
    __tablename__ = "bons_travail_lignes"

    id = Column(Integer, primary_key=True, index=True)
    bon_travail_id = Column(Integer, ForeignKey("bons_travail.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=True)
    description = Column(String(500), nullable=False)
    quantite = Column(Float, default=1.0)
    prix_unitaire = Column(Float, default=0.0)
    total = Column(Float, default=0.0)

    bon_travail = relationship("BonTravail", back_populates="lignes")
    article = relationship("Article")
