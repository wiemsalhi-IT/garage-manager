import { useEffect, useState } from 'react';
import { rapportsApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Package } from 'lucide-react';

interface RevenusData {
  periode: { debut: string; fin: string };
  ventes: { sous_total: number; tps: number; tvq: number; total: number; montant_paye: number; nombre: number };
  achats: { total: number; nombre: number };
  marge_brute: number;
}

interface StockData {
  total_articles: number;
  valeur_stock: number;
  articles_stock_bas: Array<{ id: number; code: string; description: string; quantite_stock: number; seuil_minimum: number }>;
  articles: Array<{ id: number; code: string; description: string; quantite_stock: number; prix_achat: number; valeur: number }>;
}

export default function Rapports() {
  const [tab, setTab] = useState<'revenus' | 'stock'>('revenus');
  const [revenus, setRevenus] = useState<RevenusData | null>(null);
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === 'revenus') {
      rapportsApi.revenus().then((res) => { setRevenus(res.data); setLoading(false); });
    } else {
      rapportsApi.stock().then((res) => { setStock(res.data); setLoading(false); });
    }
  }, [tab]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Rapports</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('revenus')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'revenus' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-slate-50'}`}>
          <DollarSign size={16} className="inline mr-1" /> Revenus
        </button>
        <button onClick={() => setTab('stock')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'stock' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-slate-50'}`}>
          <Package size={16} className="inline mr-1" /> Stock
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Chargement...</div>
      ) : tab === 'revenus' && revenus ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-slate-500">CA ventes (HT)</p>
              <p className="text-2xl font-bold text-slate-800">{revenus.ventes.sous_total.toFixed(2)} $</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-slate-500">TPS collectée</p>
              <p className="text-2xl font-bold text-slate-800">{revenus.ventes.tps.toFixed(2)} $</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-slate-500">TVQ collectée</p>
              <p className="text-2xl font-bold text-slate-800">{revenus.ventes.tvq.toFixed(2)} $</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-slate-500">Marge brute</p>
              <p className={`text-2xl font-bold ${revenus.marge_brute >= 0 ? 'text-green-600' : 'text-red-600'}`}>{revenus.marge_brute.toFixed(2)} $</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Résumé financier</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Ventes TTC', montant: revenus.ventes.total },
                  { name: 'Encaissé', montant: revenus.ventes.montant_paye },
                  { name: 'Achats', montant: revenus.achats.total },
                  { name: 'Marge', montant: revenus.marge_brute },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} $`} />
                  <Bar dataKey="montant" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Détails période: {revenus.periode.debut} au {revenus.periode.fin}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Ventes</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Nombre de factures:</span><span className="font-medium">{revenus.ventes.nombre}</span></div>
                  <div className="flex justify-between"><span>Sous-total HT:</span><span className="font-medium">{revenus.ventes.sous_total.toFixed(2)} $</span></div>
                  <div className="flex justify-between"><span>TPS (5%):</span><span className="font-medium">{revenus.ventes.tps.toFixed(2)} $</span></div>
                  <div className="flex justify-between"><span>TVQ (9.975%):</span><span className="font-medium">{revenus.ventes.tvq.toFixed(2)} $</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-medium">Total TTC:</span><span className="font-bold">{revenus.ventes.total.toFixed(2)} $</span></div>
                  <div className="flex justify-between"><span>Montant encaissé:</span><span className="font-medium text-green-600">{revenus.ventes.montant_paye.toFixed(2)} $</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Achats</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Nombre de factures:</span><span className="font-medium">{revenus.achats.nombre}</span></div>
                  <div className="flex justify-between"><span>Total:</span><span className="font-medium">{revenus.achats.total.toFixed(2)} $</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : tab === 'stock' && stock ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-slate-500">Total articles</p>
              <p className="text-2xl font-bold text-slate-800">{stock.total_articles}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-slate-500">Valeur du stock</p>
              <p className="text-2xl font-bold text-slate-800">{stock.valeur_stock.toFixed(2)} $</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-slate-500">Alertes stock bas</p>
              <p className="text-2xl font-bold text-red-600">{stock.articles_stock_bas.length}</p>
            </div>
          </div>

          {stock.articles_stock_bas.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Articles en stock bas</h3>
              <div className="space-y-2">
                {stock.articles_stock_bas.map((a) => (
                  <div key={a.id} className="flex justify-between items-center bg-white rounded-lg p-3">
                    <div>
                      <span className="font-mono text-sm text-slate-600">{a.code}</span>
                      <span className="ml-2 text-slate-800">{a.description}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-red-600 font-medium">{a.quantite_stock}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-slate-600">{a.seuil_minimum} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Inventaire complet</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Code</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Description</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Qté</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Prix achat</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.articles.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-4 py-2 font-mono text-sm">{a.code}</td>
                      <td className="px-4 py-2 text-slate-700">{a.description}</td>
                      <td className="px-4 py-2 text-right">{a.quantite_stock}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{a.prix_achat.toFixed(2)} $</td>
                      <td className="px-4 py-2 text-right font-medium">{a.valeur.toFixed(2)} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
