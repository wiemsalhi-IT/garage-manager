"""PDF generation service for devis, bons de travail, and factures."""

import io
from datetime import date
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_RIGHT, TA_CENTER

from app.services.taxes import TPS_RATE, TVQ_RATE

GARAGE_INFO = {
    "nom": "GarageManager",
    "adresse": "123 Rue Principale",
    "ville": "Montréal, QC H2X 1Y6",
    "telephone": "(514) 555-0123",
    "email": "info@garagemanager.ca",
    "tps_no": "123456789 RT0001",
    "tvq_no": "1234567890 TQ0001",
}


def _build_header(styles: dict, doc_type: str, numero: str, date_doc: str) -> list:
    """Build document header with garage info."""
    elements = []
    title_style = ParagraphStyle(
        "DocTitle", parent=styles["Title"], fontSize=22, spaceAfter=6,
        textColor=colors.HexColor("#1e40af"),
    )
    elements.append(Paragraph(GARAGE_INFO["nom"], title_style))
    elements.append(Paragraph(
        f"{GARAGE_INFO['adresse']}<br/>{GARAGE_INFO['ville']}<br/>"
        f"Tél: {GARAGE_INFO['telephone']} | {GARAGE_INFO['email']}",
        styles["Normal"],
    ))
    elements.append(Spacer(1, 12))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1e40af")))
    elements.append(Spacer(1, 12))

    doc_title_style = ParagraphStyle(
        "DocType", parent=styles["Heading1"], fontSize=16,
        textColor=colors.HexColor("#1e40af"), spaceAfter=4,
    )
    elements.append(Paragraph(f"{doc_type} N° {numero}", doc_title_style))
    elements.append(Paragraph(f"Date: {date_doc}", styles["Normal"]))
    elements.append(Spacer(1, 12))
    return elements


def _build_client_section(styles: dict, client_nom: str, client_info: str) -> list:
    """Build client info section."""
    elements = []
    elements.append(Paragraph("<b>Client:</b>", styles["Normal"]))
    elements.append(Paragraph(client_nom, ParagraphStyle(
        "ClientName", parent=styles["Normal"], fontSize=12, spaceAfter=2,
    )))
    if client_info:
        elements.append(Paragraph(client_info, styles["Normal"]))
    elements.append(Spacer(1, 12))
    return elements


def _build_lines_table(lignes: list) -> list:
    """Build the line items table."""
    elements = []
    table_data = [["Description", "Qté", "Prix unitaire", "Total"]]
    for ligne in lignes:
        table_data.append([
            ligne["description"],
            f"{ligne['quantite']:.2f}",
            f"{ligne['prix_unitaire']:.2f} $",
            f"{ligne['total']:.2f} $",
        ])

    table = Table(table_data, colWidths=[3.5 * inch, 0.8 * inch, 1.2 * inch, 1.2 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
        ("TOPPADDING", (0, 1), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 12))
    return elements


def _build_totals_section(styles: dict, sous_total: float, tps: float, tvq: float, total: float) -> list:
    """Build the totals section with taxes."""
    elements = []
    right_style = ParagraphStyle("RightAlign", parent=styles["Normal"], alignment=TA_RIGHT)
    right_bold = ParagraphStyle("RightBold", parent=right_style, fontSize=12, fontName="Helvetica-Bold")

    totals_data = [
        ["Sous-total:", f"{sous_total:.2f} $"],
        [f"TPS ({TPS_RATE*100:.0f}%) - N° {GARAGE_INFO['tps_no']}:", f"{tps:.2f} $"],
        [f"TVQ ({TVQ_RATE*100:.3f}%) - N° {GARAGE_INFO['tvq_no']}:", f"{tvq:.2f} $"],
        ["TOTAL:", f"{total:.2f} $"],
    ]
    totals_table = Table(totals_data, colWidths=[4.5 * inch, 2.2 * inch])
    totals_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEABOVE", (0, -1), (-1, -1), 1.5, colors.HexColor("#1e40af")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, -1), (-1, -1), 12),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.HexColor("#1e40af")),
    ]))
    elements.append(totals_table)
    return elements


def _build_footer(styles: dict, notes: str | None) -> list:
    """Build footer with notes and legal text."""
    elements = []
    elements.append(Spacer(1, 24))
    if notes:
        elements.append(Paragraph("<b>Notes:</b>", styles["Normal"]))
        elements.append(Paragraph(notes, styles["Normal"]))
        elements.append(Spacer(1, 12))

    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8")))
    elements.append(Spacer(1, 6))
    footer_style = ParagraphStyle(
        "Footer", parent=styles["Normal"], fontSize=7,
        textColor=colors.HexColor("#94a3b8"), alignment=TA_CENTER,
    )
    elements.append(Paragraph(
        f"{GARAGE_INFO['nom']} | {GARAGE_INFO['adresse']}, {GARAGE_INFO['ville']} | "
        f"TPS: {GARAGE_INFO['tps_no']} | TVQ: {GARAGE_INFO['tvq_no']}",
        footer_style,
    ))
    return elements


def generate_devis_pdf(devis_data: dict, client_data: dict) -> bytes:
    """Generate a PDF for a devis (quote)."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch, bottomMargin=0.5 * inch)
    styles = getSampleStyleSheet()
    elements = []

    date_str = devis_data.get("date_devis") or str(date.today())
    elements.extend(_build_header(styles, "DEVIS", devis_data["numero"], date_str))

    client_nom = f"{client_data.get('nom', '')} {client_data.get('prenom', '') or ''}".strip()
    client_info_parts = []
    if client_data.get("adresse"):
        client_info_parts.append(client_data["adresse"])
    if client_data.get("ville"):
        client_info_parts.append(f"{client_data['ville']}, {client_data.get('province', 'QC')} {client_data.get('code_postal', '')}")
    if client_data.get("telephone"):
        client_info_parts.append(f"Tél: {client_data['telephone']}")
    if client_data.get("email"):
        client_info_parts.append(client_data["email"])
    elements.extend(_build_client_section(styles, client_nom, "<br/>".join(client_info_parts)))

    if devis_data.get("date_validite"):
        elements.append(Paragraph(f"<b>Valide jusqu'au:</b> {devis_data['date_validite']}", styles["Normal"]))
        elements.append(Spacer(1, 8))

    lignes = [{"description": l.get("description", ""), "quantite": l.get("quantite", 0),
               "prix_unitaire": l.get("prix_unitaire", 0), "total": l.get("total", 0)}
              for l in devis_data.get("lignes", [])]
    elements.extend(_build_lines_table(lignes))
    elements.extend(_build_totals_section(styles, devis_data["sous_total"], devis_data["tps"], devis_data["tvq"], devis_data["total"]))
    elements.extend(_build_footer(styles, devis_data.get("notes")))

    doc.build(elements)
    return buffer.getvalue()


def generate_facture_pdf(facture_data: dict, client_data: dict) -> bytes:
    """Generate a PDF for a facture (invoice)."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch, bottomMargin=0.5 * inch)
    styles = getSampleStyleSheet()
    elements = []

    date_str = facture_data.get("date_facture") or str(date.today())
    elements.extend(_build_header(styles, "FACTURE", facture_data["numero"], date_str))

    client_nom = f"{client_data.get('nom', '')} {client_data.get('prenom', '') or ''}".strip()
    client_info_parts = []
    if client_data.get("adresse"):
        client_info_parts.append(client_data["adresse"])
    if client_data.get("ville"):
        client_info_parts.append(f"{client_data['ville']}, {client_data.get('province', 'QC')} {client_data.get('code_postal', '')}")
    if client_data.get("telephone"):
        client_info_parts.append(f"Tél: {client_data['telephone']}")
    if client_data.get("email"):
        client_info_parts.append(client_data["email"])
    elements.extend(_build_client_section(styles, client_nom, "<br/>".join(client_info_parts)))

    if facture_data.get("date_echeance"):
        elements.append(Paragraph(f"<b>Échéance:</b> {facture_data['date_echeance']}", styles["Normal"]))
        elements.append(Spacer(1, 8))

    lignes = [{"description": l.get("description", ""), "quantite": l.get("quantite", 0),
               "prix_unitaire": l.get("prix_unitaire", 0), "total": l.get("total", 0)}
              for l in facture_data.get("lignes", [])]
    elements.extend(_build_lines_table(lignes))
    elements.extend(_build_totals_section(styles, facture_data["sous_total"], facture_data["tps"], facture_data["tvq"], facture_data["total"]))

    montant_paye = facture_data.get("montant_paye", 0)
    solde = facture_data["total"] - montant_paye
    if montant_paye > 0:
        payment_style = ParagraphStyle("Payment", parent=styles["Normal"], alignment=TA_RIGHT, fontSize=10)
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(f"Montant payé: {montant_paye:.2f} $", payment_style))
        bold_right = ParagraphStyle("BoldRight", parent=payment_style, fontName="Helvetica-Bold", fontSize=12)
        elements.append(Paragraph(f"Solde dû: {solde:.2f} $", bold_right))

    elements.extend(_build_footer(styles, facture_data.get("notes")))

    doc.build(elements)
    return buffer.getvalue()


def generate_bon_travail_pdf(bt_data: dict, client_data: dict) -> bytes:
    """Generate a PDF for a bon de travail (work order)."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch, bottomMargin=0.5 * inch)
    styles = getSampleStyleSheet()
    elements = []

    date_str = bt_data.get("date_debut") or str(date.today())
    elements.extend(_build_header(styles, "BON DE TRAVAIL", bt_data["numero"], date_str))

    client_nom = f"{client_data.get('nom', '')} {client_data.get('prenom', '') or ''}".strip()
    client_info_parts = []
    if client_data.get("telephone"):
        client_info_parts.append(f"Tél: {client_data['telephone']}")
    if client_data.get("email"):
        client_info_parts.append(client_data["email"])
    elements.extend(_build_client_section(styles, client_nom, "<br/>".join(client_info_parts)))

    if bt_data.get("technicien"):
        elements.append(Paragraph(f"<b>Technicien:</b> {bt_data['technicien']}", styles["Normal"]))
    if bt_data.get("date_fin"):
        elements.append(Paragraph(f"<b>Date fin prévue:</b> {bt_data['date_fin']}", styles["Normal"]))
    elements.append(Spacer(1, 8))

    lignes = [{"description": l.get("description", ""), "quantite": l.get("quantite", 0),
               "prix_unitaire": l.get("prix_unitaire", 0), "total": l.get("total", 0)}
              for l in bt_data.get("lignes", [])]
    elements.extend(_build_lines_table(lignes))

    elements.extend(_build_footer(styles, bt_data.get("notes")))

    doc.build(elements)
    return buffer.getvalue()
