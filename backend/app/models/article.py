from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class TypeArticle(str, enum.Enum):
    PIECE = "piece"
    MAIN_DOEUVRE = "main_doeuvre"


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(String(500), nullable=False)
    type = Column(Enum(TypeArticle), nullable=False)
    prix_achat = Column(Float, default=0.0)
    prix_vente = Column(Float, default=0.0)
    unite = Column(String(20), default="unité")
    fournisseur_id = Column(Integer, ForeignKey("fournisseurs.id"), nullable=True)
    quantite_stock = Column(Integer, default=0)
    seuil_minimum = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fournisseur = relationship("Fournisseur", back_populates="articles")
