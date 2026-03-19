import { useEffect, useState } from 'react';
import { paiementsApi, facturesVenteApi, facturesAchatApi } from '@/lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface PaiementItem {
  id: number; type: string; facture_vente_id: number | null; facture_achat_id: number | null;
  date_paiement: string | null; montant: number; mode_paiement: string; reference: string | null; notes: string | null;
}

interface FactureRef { id: number; numero: string; total: number; }

const modeLabels: Record<string, string> = { especes: 'Espèces', cheque: 'Chèque', carte: 'Carte', virement: 'Virement', interac: 'Interac' };

export default function Paiements() {
  const [items, setItems] = useState<PaiementItem[]>([]);
  const [facturesVente, setFacturesVente] = useState<FactureRef[]>([]);
  const [facturesAchat, setFacturesAchat] = useState<FactureRef[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PaiementItem | null>(null);
  const [form, setForm] = useState({ type: 'vente', facture_vente_id: '', facture_achat_id: '', montant: '', mode_paiement: 'interac', reference: '', notes: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([paiementsApi.list(), facturesVenteApi.list(), facturesAchatApi.list()]).then(([p, fv, fa]) => {
      setItems(p.data); setFacturesVente(fv.data); setFacturesAchat(fa.data); setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const getFactureNum = (p: PaiementItem) => {
    if (p.facture_vente_id) { const f = facturesVente.find((fv) => fv.id === p.facture_vente_id); return f?.numero || `FV#${p.facture_vente_id}`; }
    if (p.facture_achat_id) { const f = facturesAchat.find((fa) => fa.id === p.facture_achat_id); return f?.numero || `FA#${p.facture_achat_id}`; }
    return '-';
  };

  const openCreate = () => { setEditing(null); setForm({ type: 'vente', facture_vente_id: '', facture_achat_id: '', montant: '', mode_paiement: 'interac', reference: '', notes: '' }); setShowModal(true); };

  const openEdit = (p: PaiementItem) => {
    setEditing(p);
    setForm({ type: p.type, facture_vente_id: p.facture_vente_id?.toString() || '', facture_achat_id: p.facture_achat_id?.toString() || '', montant: p.montant.toString(), mode_paiement: p.mode_paiement, reference: p.reference || '', notes: p.notes || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    const data = {
      type: form.type, montant: parseFloat(form.montant) || 0, mode_paiement: form.mode_paiement,
      facture_vente_id: form.type === 'vente' && form.facture_vente_id ? Number(form.facture_vente_id) : null,
      facture_achat_id: form.type === 'achat' && form.facture_achat_id ? Number(form.facture_achat_id) : null,
      reference: form.reference || null, notes: form.notes || null,
    };
    if (editing) await paiementsApi.update(editing.id, data);
    else await paiementsApi.create(data);
    setShowModal(false); load();
  };

  const handleDelete = async (id: number) => { if (confirm('Supprimer ?')) { await paiementsApi.delete(id); load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Paiements</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus size={18} /> Nouveau paiement</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Facture</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Mode</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Montant</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Réf.</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Aucun paiement</td></tr>
              ) : items.map((p) => (
                <tr key={p.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{p.date_paiement}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.type === 'vente' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {p.type === 'vente' ? 'Vente' : 'Achat'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{getFactureNum(p)}</td>
                  <td className="px-4 py-3 text-slate-600">{modeLabels[p.mode_paiement] || p.mode_paiement}</td>
                  <td className="px-4 py-3 text-right font-medium">{p.montant.toFixed(2)} $</td>
                  <td className="px-4 py-3 text-slate-600 text-sm">{p.reference}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded ml-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouveau paiement'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                  <option value="vente">Paiement client (vente)</option>
                  <option value="achat">Paiement fournisseur (achat)</option>
                </select>
              </div>
              {form.type === 'vente' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facture de vente</label>
                  <select value={form.facture_vente_id} onChange={(e) => setForm({ ...form, facture_vente_id: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Sélectionner</option>
                    {facturesVente.map((f) => <option key={f.id} value={f.id}>{f.numero} - {f.total.toFixed(2)} $</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facture d'achat</label>
                  <select value={form.facture_achat_id} onChange={(e) => setForm({ ...form, facture_achat_id: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Sélectionner</option>
                    {facturesAchat.map((f) => <option key={f.id} value={f.id}>{f.numero} - {f.total.toFixed(2)} $</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant ($) *</label>
                  <input type="number" step="0.01" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mode *</label>
                  <select value={form.mode_paiement} onChange={(e) => setForm({ ...form, mode_paiement: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="interac">Interac</option>
                    <option value="carte">Carte</option>
                    <option value="especes">Espèces</option>
                    <option value="cheque">Chèque</option>
                    <option value="virement">Virement</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Référence</label>
                <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={handleSave} disabled={!form.montant} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
