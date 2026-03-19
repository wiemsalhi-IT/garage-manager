from datetime import datetime, date
from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class StatutCommandeAchat(str, enum.Enum):
    BROUILLON = "brouillon"
    ENVOYEE = "envoyee"
    RECUE = "recue"
    ANNULEE = "annulee"


class CommandeAchat(Base):
    __tablename__ = "commandes_achat"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(20), unique=True, nullable=False)
    fournisseur_id = Column(Integer, ForeignKey("fournisseurs.id"), nullable=False)
    date_commande = Column(Date, default=date.today)
    date_reception = Column(Date, nullable=True)
    statut = Column(Enum(StatutCommandeAchat), default=StatutCommandeAchat.BROUILLON)
    sous_total = Column(Float, default=0.0)
    tps = Column(Float, default=0.0)
    tvq = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fournisseur = relationship("Fournisseur", back_populates="commandes_achat")
    lignes = relationship("CommandeAchatLigne", back_populates="commande", cascade="all, delete-orphan")
    factures_achat = relationship("FactureAchat", back_populates="commande_achat")


class CommandeAchatLigne(Base):
    __tablename__ = "commandes_achat_lignes"

    id = Column(Integer, primary_key=True, index=True)
    commande_id = Column(Integer, ForeignKey("commandes_achat.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=True)
    description = Column(String(500), nullable=False)
    quantite = Column(Float, default=1.0)
    prix_unitaire = Column(Float, default=0.0)
    total = Column(Float, default=0.0)

    commande = relationship("CommandeAchat", back_populates="lignes")
    article = relationship("Article")
