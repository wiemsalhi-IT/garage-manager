"""Auto-numbering service for documents."""

from sqlalchemy.orm import Session
from sqlalchemy import func


def generer_numero(db: Session, model_class: type, prefix: str) -> str:
    max_id = db.query(func.max(model_class.id)).scalar()
    next_id = (max_id or 0) + 1
    return f"{prefix}-{next_id:05d}"
