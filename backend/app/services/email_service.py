"""Email sending service for devis and factures."""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication


SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "info@garagemanager.ca")


def is_email_configured() -> bool:
    """Check if SMTP is configured."""
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD)


def send_document_email(
    to_email: str,
    subject: str,
    body_html: str,
    pdf_bytes: bytes | None = None,
    pdf_filename: str = "document.pdf",
) -> dict:
    """Send an email with optional PDF attachment.

    Returns a dict with status and message.
    """
    if not is_email_configured():
        return {
            "success": False,
            "message": "SMTP non configuré. Définissez les variables d'environnement SMTP_HOST, SMTP_USER, SMTP_PASSWORD.",
        }

    if not to_email:
        return {"success": False, "message": "Aucune adresse email fournie pour le client."}

    msg = MIMEMultipart()
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body_html, "html"))

    if pdf_bytes:
        pdf_part = MIMEApplication(pdf_bytes, _subtype="pdf")
        pdf_part.add_header("Content-Disposition", "attachment", filename=pdf_filename)
        msg.attach(pdf_part)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            if SMTP_PORT == 587:
                server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [to_email], msg.as_string())
        return {"success": True, "message": f"Email envoyé à {to_email}"}
    except Exception as e:
        return {"success": False, "message": f"Erreur d'envoi: {str(e)}"}


def build_devis_email_body(numero: str, client_nom: str, total: float, garage_nom: str = "GarageManager") -> str:
    """Build HTML email body for a devis."""
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1e40af;">Devis {numero}</h2>
        <p>Bonjour {client_nom},</p>
        <p>Veuillez trouver ci-joint votre devis <strong>{numero}</strong> d'un montant de <strong>{total:.2f} $</strong> (taxes incluses).</p>
        <p>N'hésitez pas à nous contacter pour toute question.</p>
        <br/>
        <p>Cordialement,<br/><strong>{garage_nom}</strong></p>
    </body>
    </html>
    """


def build_facture_email_body(numero: str, client_nom: str, total: float, garage_nom: str = "GarageManager") -> str:
    """Build HTML email body for a facture."""
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1e40af;">Facture {numero}</h2>
        <p>Bonjour {client_nom},</p>
        <p>Veuillez trouver ci-joint votre facture <strong>{numero}</strong> d'un montant de <strong>{total:.2f} $</strong> (taxes incluses).</p>
        <p>Merci pour votre confiance.</p>
        <br/>
        <p>Cordialement,<br/><strong>{garage_nom}</strong></p>
    </body>
    </html>
    """
