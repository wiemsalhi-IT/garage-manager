from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import (
    clients,
    vehicules,
    fournisseurs,
    articles,
    devis,
    bons_travail,
    factures_vente,
    commandes_achat,
    factures_achat,
    paiements,
    dashboard,
    rapports,
    pdf,
)

app = FastAPI(
    title="GarageManager API",
    description="API de gestion de garage mécanique - Québec",
    version="1.0.0",
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Register all routers
app.include_router(clients.router)
app.include_router(vehicules.router)
app.include_router(fournisseurs.router)
app.include_router(articles.router)
app.include_router(devis.router)
app.include_router(bons_travail.router)
app.include_router(factures_vente.router)
app.include_router(commandes_achat.router)
app.include_router(factures_achat.router)
app.include_router(paiements.router)
app.include_router(dashboard.router)
app.include_router(rapports.router)
app.include_router(pdf.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
