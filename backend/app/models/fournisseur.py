from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Fournisseur(Base):
    __tablename__ = "fournisseurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200), nullable=False)
    contact = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True)
    telephone = Column(String(20), nullable=True)
    adresse = Column(String(255), nullable=True)
    ville = Column(String(100), nullable=True)
    code_postal = Column(String(10), nullable=True)
    province = Column(String(50), default="QC")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    articles = relationship("Article", back_populates="fournisseur")
    commandes_achat = relationship("CommandeAchat", back_populates="fournisseur")
    factures_achat = relationship("FactureAchat", back_populates="fournisseur")
