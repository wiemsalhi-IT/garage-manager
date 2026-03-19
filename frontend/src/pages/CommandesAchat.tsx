import { useEffect, useState } from 'react';
import { commandesAchatApi, fournisseursApi, articlesApi } from '@/lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Commande {
  id: number; numero: string; fournisseur_id: number; date_commande: string | null;
  statut: string; sous_total: number; tps: number; tvq: number; total: number;
  notes: string | null;
  lignes: Array<{ id: number; description: string; quantite: number; prix_unitaire: number; total: number; article_id: number | null }>;
}

interface Fournisseur { id: number; nom: string; }
interface Article { id: number; code: string; description: string; prix_achat: number; }

const statutColors: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-800', envoyee: 'bg-blue-100 text-blue-800',
  recue: 'bg-green-100 text-green-800', annulee: 'bg-red-100 text-red-800',
};

export default function CommandesAchat() {
  const [items, setItems] = useState<Commande[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Commande | null>(null);
  const [form, setForm] = useState({ fournisseur_id: 0, statut: 'brouillon', notes: '', lignes: [{ description: '', quantite: '1', prix_unitaire: '0', article_id: '' }] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([commandesAchatApi.list(), fournisseursApi.list(), articlesApi.list()]).then(([c, f, a]) => {
      setItems(c.data); setFournisseurs(f.data); setArticles(a.data); setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const getFournisseurName = (id: number) => fournisseurs.find((f) => f.id === id)?.nom || `#${id}`;

  const openCreate = () => { setEditing(null); setForm({ fournisseur_id: 0, statut: 'brouillon', notes: '', lignes: [{ description: '', quantite: '1', prix_unitaire: '0', article_id: '' }] }); setShowModal(true); };

  const openEdit = (c: Commande) => {
    setEditing(c);
    setForm({ fournisseur_id: c.fournisseur_id, statut: c.statut, notes: c.notes || '',
      lignes: c.lignes.map((l) => ({ description: l.description, quantite: l.quantite.toString(), prix_unitaire: l.prix_unitaire.toString(), article_id: l.article_id?.toString() || '' })) });
    setShowModal(true);
  };

  const addLigne = () => setForm({ ...form, lignes: [...form.lignes, { description: '', quantite: '1', prix_unitaire: '0', article_id: '' }] });
  const removeLigne = (i: number) => setForm({ ...form, lignes: form.lignes.filter((_, idx) => idx !== i) });
  const updateLigne = (i: number, field: string, value: string) => {
    const lignes = [...form.lignes];
    lignes[i] = { ...lignes[i], [field]: value };
    if (field === 'article_id' && value) {
      const art = articles.find((a) => a.id === Number(value));
      if (art) { lignes[i].description = art.description; lignes[i].prix_unitaire = art.prix_achat.toString(); }
    }
    setForm({ ...form, lignes });
  };

  const handleSave = async () => {
    const data = {
      fournisseur_id: Number(form.fournisseur_id), statut: form.statut, notes: form.notes || null,
      lignes: form.lignes.filter((l) => l.description).map((l) => ({
        description: l.description, quantite: parseFloat(l.quantite) || 1, prix_unitaire: parseFloat(l.prix_unitaire) || 0,
        article_id: l.article_id ? Number(l.article_id) : null,
      })),
    };
    if (editing) await commandesAchatApi.update(editing.id, data);
    else await commandesAchatApi.create(data);
    setShowModal(false); load();
  };

  const handleDelete = async (id: number) => { if (confirm('Supprimer ?')) { await commandesAchatApi.delete(id); load(); } };
  const calcTotal = () => form.lignes.reduce((s, l) => s + (parseFloat(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Commandes d'achat</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus size={18} /> Nouvelle commande</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Numéro</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Fournisseur</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Statut</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Total</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Aucune commande</td></tr>
              ) : items.map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.numero}</td>
                  <td className="px-4 py-3 text-slate-600">{getFournisseurName(c.fournisseur_id)}</td>
                  <td className="px-4 py-3 text-slate-600">{c.date_commande}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statutColors[c.statut] || 'bg-gray-100'}`}>{c.statut}</span></td>
                  <td className="px-4 py-3 text-right font-medium">{c.total.toFixed(2)} $</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded ml-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouvelle commande d\'achat'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fournisseur *</label>
                  <select value={form.fournisseur_id} onChange={(e) => setForm({ ...form, fournisseur_id: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2">
                    <option value={0}>Sélectionner</option>
                    {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="brouillon">Brouillon</option>
                    <option value="envoyee">Envoyée</option>
                    <option value="recue">Reçue</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Lignes</label>
                  <button onClick={addLigne} className="text-sm text-blue-600 hover:text-blue-800">+ Ajouter</button>
                </div>
                <div className="space-y-2">
                  {form.lignes.map((l, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <select value={l.article_id} onChange={(e) => updateLigne(i, 'article_id', e.target.value)} className="w-36 border rounded px-2 py-1.5 text-sm">
                        <option value="">Article...</option>
                        {articles.map((a) => <option key={a.id} value={a.id}>{a.code}</option>)}
                      </select>
                      <input type="text" placeholder="Description" value={l.description} onChange={(e) => updateLigne(i, 'description', e.target.value)} className="flex-1 border rounded px-2 py-1.5 text-sm" />
                      <input type="number" value={l.quantite} onChange={(e) => updateLigne(i, 'quantite', e.target.value)} className="w-20 border rounded px-2 py-1.5 text-sm text-right" />
                      <input type="number" step="0.01" value={l.prix_unitaire} onChange={(e) => updateLigne(i, 'prix_unitaire', e.target.value)} className="w-28 border rounded px-2 py-1.5 text-sm text-right" />
                      <span className="w-24 text-right text-sm py-1.5 font-medium">{((parseFloat(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0)).toFixed(2)} $</span>
                      <button onClick={() => removeLigne(i)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right space-y-1 text-sm">
                  <p>Sous-total: <span className="font-medium">{calcTotal().toFixed(2)} $</span></p>
                  <p>TPS (5%): <span className="font-medium">{(calcTotal() * 0.05).toFixed(2)} $</span></p>
                  <p>TVQ (9.975%): <span className="font-medium">{(calcTotal() * 0.09975).toFixed(2)} $</span></p>
                  <p className="text-base font-bold">Total: {(calcTotal() * 1.14975).toFixed(2)} $</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={handleSave} disabled={!form.fournisseur_id} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
