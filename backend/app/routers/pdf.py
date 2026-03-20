"""PDF generation and email sending endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional
import io

from app.database import get_db
from app.models.devis import Devis
from app.models.bon_travail import BonTravail
from app.models.facture_vente import FactureVente
from app.models.client import Client
from app.services.pdf_generator import generate_devis_pdf, generate_facture_pdf, generate_bon_travail_pdf
from app.services.email_service import (
    send_document_email, build_devis_email_body, build_facture_email_body,
    is_email_configured,
)

router = APIRouter(prefix="/api/pdf", tags=["pdf"])


def _serialize_client(client: Client) -> dict:
    return {
        "nom": client.nom,
        "prenom": client.prenom,
        "email": client.email,
        "telephone": client.telephone,
        "adresse": client.adresse,
        "ville": client.ville,
        "code_postal": client.code_postal,
        "province": client.province,
    }


def _serialize_lignes(lignes: list) -> list:
    return [
        {
            "description": l.description,
            "quantite": l.quantite,
            "prix_unitaire": l.prix_unitaire,
            "total": l.total,
        }
        for l in lignes
    ]


# ---- PDF Download endpoints ----

@router.get("/devis/{devis_id}")
def download_devis_pdf(devis_id: int, db: Session = Depends(get_db)):
    devis = db.query(Devis).options(joinedload(Devis.lignes)).filter(Devis.id == devis_id).first()
    if not devis:
        raise HTTPException(status_code=404, detail="Devis non trouvé")
    client = db.query(Client).filter(Client.id == devis.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")

    devis_data = {
        "numero": devis.numero,
        "date_devis": str(devis.date_devis) if devis.date_devis else None,
        "date_validite": str(devis.date_validite) if devis.date_validite else None,
        "sous_total": devis.sous_total,
        "tps": devis.tps,
        "tvq": devis.tvq,
        "total": devis.total,
        "notes": devis.notes,
        "lignes": _serialize_lignes(devis.lignes),
    }
    pdf_bytes = generate_devis_pdf(devis_data, _serialize_client(client))

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Devis_{devis.numero}.pdf"},
    )


@router.get("/facture/{facture_id}")
def download_facture_pdf(facture_id: int, db: Session = Depends(get_db)):
    facture = db.query(FactureVente).options(joinedload(FactureVente.lignes)).filter(FactureVente.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture non trouvée")
    client = db.query(Client).filter(Client.id == facture.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")

    facture_data = {
        "numero": facture.numero,
        "date_facture": str(facture.date_facture) if facture.date_facture else None,
        "date_echeance": str(facture.date_echeance) if facture.date_echeance else None,
        "sous_total": facture.sous_total,
        "tps": facture.tps,
        "tvq": facture.tvq,
        "total": facture.total,
        "montant_paye": facture.montant_paye,
        "notes": facture.notes,
        "lignes": _serialize_lignes(facture.lignes),
    }
    pdf_bytes = generate_facture_pdf(facture_data, _serialize_client(client))

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Facture_{facture.numero}.pdf"},
    )


@router.get("/bon-travail/{bt_id}")
def download_bon_travail_pdf(bt_id: int, db: Session = Depends(get_db)):
    bt = db.query(BonTravail).options(joinedload(BonTravail.lignes)).filter(BonTravail.id == bt_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="Bon de travail non trouvé")
    client = db.query(Client).filter(Client.id == bt.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")

    bt_data = {
        "numero": bt.numero,
        "date_debut": str(bt.date_debut) if bt.date_debut else None,
        "date_fin": str(bt.date_fin) if bt.date_fin else None,
        "technicien": bt.technicien,
        "notes": bt.notes,
        "lignes": _serialize_lignes(bt.lignes),
    }
    pdf_bytes = generate_bon_travail_pdf(bt_data, _serialize_client(client))

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=BT_{bt.numero}.pdf"},
    )


# ---- Email sending endpoints ----

class EmailRequest(BaseModel):
    to_email: Optional[str] = None


@router.get("/email/status")
def email_status():
    """Check if email is configured."""
    return {"configured": is_email_configured()}


@router.post("/email/devis/{devis_id}")
def email_devis(devis_id: int, req: EmailRequest, db: Session = Depends(get_db)):
    """Send devis PDF by email."""
    devis = db.query(Devis).options(joinedload(Devis.lignes)).filter(Devis.id == devis_id).first()
    if not devis:
        raise HTTPException(status_code=404, detail="Devis non trouvé")
    client = db.query(Client).filter(Client.id == devis.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")

    to_email = req.to_email or client.email
    if not to_email:
        raise HTTPException(status_code=400, detail="Aucune adresse email. Ajoutez un email au client ou spécifiez-le.")

    client_data = _serialize_client(client)
    client_nom = f"{client.nom} {client.prenom or ''}".strip()

    devis_data = {
        "numero": devis.numero,
        "date_devis": str(devis.date_devis) if devis.date_devis else None,
        "date_validite": str(devis.date_validite) if devis.date_validite else None,
        "sous_total": devis.sous_total,
        "tps": devis.tps,
        "tvq": devis.tvq,
        "total": devis.total,
        "notes": devis.notes,
        "lignes": _serialize_lignes(devis.lignes),
    }

    pdf_bytes = generate_devis_pdf(devis_data, client_data)
    body = build_devis_email_body(devis.numero, client_nom, devis.total)
    result = send_document_email(
        to_email=to_email,
        subject=f"Devis {devis.numero} - GarageManager",
        body_html=body,
        pdf_bytes=pdf_bytes,
        pdf_filename=f"Devis_{devis.numero}.pdf",
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return result


@router.post("/email/facture/{facture_id}")
def email_facture(facture_id: int, req: EmailRequest, db: Session = Depends(get_db)):
    """Send facture PDF by email."""
    facture = db.query(FactureVente).options(joinedload(FactureVente.lignes)).filter(FactureVente.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture non trouvée")
    client = db.query(Client).filter(Client.id == facture.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")

    to_email = req.to_email or client.email
    if not to_email:
        raise HTTPException(status_code=400, detail="Aucune adresse email. Ajoutez un email au client ou spécifiez-le.")

    client_data = _serialize_client(client)
    client_nom = f"{client.nom} {client.prenom or ''}".strip()

    facture_data = {
        "numero": facture.numero,
        "date_facture": str(facture.date_facture) if facture.date_facture else None,
        "date_echeance": str(facture.date_echeance) if facture.date_echeance else None,
        "sous_total": facture.sous_total,
        "tps": facture.tps,
        "tvq": facture.tvq,
        "total": facture.total,
        "montant_paye": facture.montant_paye,
        "notes": facture.notes,
        "lignes": _serialize_lignes(facture.lignes),
    }

    pdf_bytes = generate_facture_pdf(facture_data, client_data)
    body = build_facture_email_body(facture.numero, client_nom, facture.total)
    result = send_document_email(
        to_email=to_email,
        subject=f"Facture {facture.numero} - GarageManager",
        body_html=body,
        pdf_bytes=pdf_bytes,
        pdf_filename=f"Facture_{facture.numero}.pdf",
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return result
