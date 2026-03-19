from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("", response_model=List[ArticleResponse])
def list_articles(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    type: Optional[str] = None,
    low_stock: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Article)
    if search:
        query = query.filter(
            (Article.code.ilike(f"%{search}%"))
            | (Article.description.ilike(f"%{search}%"))
        )
    if type:
        query = query.filter(Article.type == type)
    if low_stock:
        query = query.filter(Article.quantite_stock <= Article.seuil_minimum)
    return query.order_by(Article.code).offset(skip).limit(limit).all()


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return article


@router.post("", response_model=ArticleResponse, status_code=201)
def create_article(data: ArticleCreate, db: Session = Depends(get_db)):
    existing = db.query(Article).filter(Article.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ce code article existe déjà")
    article = Article(**data.model_dump())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.put("/{article_id}", response_model=ArticleResponse)
def update_article(article_id: int, data: ArticleUpdate, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(article, key, value)
    db.commit()
    db.refresh(article)
    return article


@router.delete("/{article_id}", status_code=204)
def delete_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    db.delete(article)
    db.commit()
