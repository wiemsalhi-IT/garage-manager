from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("", response_model=List[ClientResponse])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_passager: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Client)
    if search:
        query = query.filter(
            (Client.nom.ilike(f"%{search}%"))
            | (Client.prenom.ilike(f"%{search}%"))
            | (Client.telephone.ilike(f"%{search}%"))
            | (Client.email.ilike(f"%{search}%"))
        )
    if is_passager is not None:
        query = query.filter(Client.is_passager == is_passager)
    return query.order_by(Client.nom).offset(skip).limit(limit).all()


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return client


@router.post("", response_model=ClientResponse, status_code=201)
def create_client(client_data: ClientCreate, db: Session = Depends(get_db)):
    client = Client(**client_data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client_data: ClientUpdate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    for key, value in client_data.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    db.delete(client)
    db.commit()
