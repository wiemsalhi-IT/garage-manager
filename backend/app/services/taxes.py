"""Quebec tax calculation service - TPS (GST) 5% and TVQ (QST) 9.975%"""

TPS_RATE = 0.05
TVQ_RATE = 0.09975


def calculer_taxes(sous_total: float) -> dict:
    tps = round(sous_total * TPS_RATE, 2)
    tvq = round(sous_total * TVQ_RATE, 2)
    total = round(sous_total + tps + tvq, 2)
    return {
        "sous_total": round(sous_total, 2),
        "tps": tps,
        "tvq": tvq,
        "total": total,
    }
