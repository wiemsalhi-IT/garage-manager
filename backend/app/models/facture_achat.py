from datetime import datetime, date
from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class StatutFactureAchat(str, enum.Enum):
    BROUILLON = "brouillon"
    RECUE = "recue"
    PAYEE = "payee"
    EN_RETARD = "en_retard"


class FactureAchat(Base):
    __tablename__ = "factures_achat"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(20), unique=True, nullable=False)
    fournisseur_id = Column(Integer, ForeignKey("fournisseurs.id"), nullable=False)
    commande_achat_id = Column(Integer, ForeignKey("commandes_achat.id"), nullable=True)
    date_facture = Column(Date, default=date.today)
    date_echeance = Column(Date, nullable=True)
    statut = Column(Enum(StatutFactureAchat), default=StatutFactureAchat.BROUILLON)
    sous_total = Column(Float, default=0.0)
    tps = Column(Float, default=0.0)
    tvq = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    montant_paye = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fournisseur = relationship("Fournisseur", back_populates="factures_achat")
    commande_achat = relationship("CommandeAchat", back_populates="factures_achat")
    lignes = relationship("FactureAchatLigne", back_populates="facture", cascade="all, delete-orphan")
    paiements = relationship("Paiement", back_populates="facture_achat")


class FactureAchatLigne(Base):
    __tablename__ = "factures_achat_lignes"

    id = Column(Integer, primary_key=True, index=True)
    facture_id = Column(Integer, ForeignKey("factures_achat.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=True)
    description = Column(String(500), nullable=False)
    quantite = Column(Float, default=1.0)
    prix_unitaire = Column(Float, default=0.0)
    total = Column(Float, default=0.0)

    facture = relationship("FactureAchat", back_populates="lignes")
    article = relationship("Article")
