from datetime import datetime, date
from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class StatutDevis(str, enum.Enum):
    BROUILLON = "brouillon"
    ENVOYE = "envoye"
    ACCEPTE = "accepte"
    REFUSE = "refuse"
    CONVERTI = "converti"


class Devis(Base):
    __tablename__ = "devis"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(20), unique=True, nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    vehicule_id = Column(Integer, ForeignKey("vehicules.id"), nullable=True)
    date_devis = Column(Date, default=date.today)
    date_validite = Column(Date, nullable=True)
    statut = Column(Enum(StatutDevis), default=StatutDevis.BROUILLON)
    sous_total = Column(Float, default=0.0)
    tps = Column(Float, default=0.0)
    tvq = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="devis")
    vehicule = relationship("Vehicule", back_populates="devis")
    lignes = relationship("DevisLigne", back_populates="devis", cascade="all, delete-orphan")


class DevisLigne(Base):
    __tablename__ = "devis_lignes"

    id = Column(Integer, primary_key=True, index=True)
    devis_id = Column(Integer, ForeignKey("devis.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=True)
    description = Column(String(500), nullable=False)
    quantite = Column(Float, default=1.0)
    prix_unitaire = Column(Float, default=0.0)
    total = Column(Float, default=0.0)

    devis = relationship("Devis", back_populates="lignes")
    article = relationship("Article")
