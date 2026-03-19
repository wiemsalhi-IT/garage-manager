from datetime import datetime, date
from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class StatutFactureVente(str, enum.Enum):
    BROUILLON = "brouillon"
    ENVOYEE = "envoyee"
    PAYEE = "payee"
    EN_RETARD = "en_retard"
    ANNULEE = "annulee"


class FactureVente(Base):
    __tablename__ = "factures_vente"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(20), unique=True, nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    vehicule_id = Column(Integer, ForeignKey("vehicules.id"), nullable=True)
    bon_travail_id = Column(Integer, ForeignKey("bons_travail.id"), nullable=True)
    date_facture = Column(Date, default=date.today)
    date_echeance = Column(Date, nullable=True)
    statut = Column(Enum(StatutFactureVente), default=StatutFactureVente.BROUILLON)
    sous_total = Column(Float, default=0.0)
    tps = Column(Float, default=0.0)
    tvq = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    montant_paye = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="factures_vente")
    vehicule = relationship("Vehicule", back_populates="factures_vente")
    bon_travail = relationship("BonTravail", back_populates="factures_vente")
    lignes = relationship("FactureVenteLigne", back_populates="facture", cascade="all, delete-orphan")
    paiements = relationship("Paiement", back_populates="facture_vente")


class FactureVenteLigne(Base):
    __tablename__ = "factures_vente_lignes"

    id = Column(Integer, primary_key=True, index=True)
    facture_id = Column(Integer, ForeignKey("factures_vente.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=True)
    description = Column(String(500), nullable=False)
    quantite = Column(Float, default=1.0)
    prix_unitaire = Column(Float, default=0.0)
    total = Column(Float, default=0.0)

    facture = relationship("FactureVente", back_populates="lignes")
    article = relationship("Article")
