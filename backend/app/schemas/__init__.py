from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.schemas.vehicule import VehiculeCreate, VehiculeUpdate, VehiculeResponse
from app.schemas.fournisseur import FournisseurCreate, FournisseurUpdate, FournisseurResponse
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse
from app.schemas.devis import DevisCreate, DevisUpdate, DevisResponse, DevisLigneCreate, DevisLigneResponse
from app.schemas.bon_travail import BonTravailCreate, BonTravailUpdate, BonTravailResponse, BonTravailLigneCreate, BonTravailLigneResponse
from app.schemas.facture_vente import FactureVenteCreate, FactureVenteUpdate, FactureVenteResponse, FactureVenteLigneCreate, FactureVenteLigneResponse
from app.schemas.commande_achat import CommandeAchatCreate, CommandeAchatUpdate, CommandeAchatResponse, CommandeAchatLigneCreate, CommandeAchatLigneResponse
from app.schemas.facture_achat import FactureAchatCreate, FactureAchatUpdate, FactureAchatResponse, FactureAchatLigneCreate, FactureAchatLigneResponse
from app.schemas.paiement import PaiementCreate, PaiementUpdate, PaiementResponse

__all__ = [
    "ClientCreate", "ClientUpdate", "ClientResponse",
    "VehiculeCreate", "VehiculeUpdate", "VehiculeResponse",
    "FournisseurCreate", "FournisseurUpdate", "FournisseurResponse",
    "ArticleCreate", "ArticleUpdate", "ArticleResponse",
    "DevisCreate", "DevisUpdate", "DevisResponse", "DevisLigneCreate", "DevisLigneResponse",
    "BonTravailCreate", "BonTravailUpdate", "BonTravailResponse", "BonTravailLigneCreate", "BonTravailLigneResponse",
    "FactureVenteCreate", "FactureVenteUpdate", "FactureVenteResponse", "FactureVenteLigneCreate", "FactureVenteLigneResponse",
    "CommandeAchatCreate", "CommandeAchatUpdate", "CommandeAchatResponse", "CommandeAchatLigneCreate", "CommandeAchatLigneResponse",
    "FactureAchatCreate", "FactureAchatUpdate", "FactureAchatResponse", "FactureAchatLigneCreate", "FactureAchatLigneResponse",
    "PaiementCreate", "PaiementUpdate", "PaiementResponse",
]
