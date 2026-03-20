import { useEffect, useState } from 'react';
import { bonsTravailApi, clientsApi, vehiculesApi, articlesApi, pdfApi } from '@/lib/api';
import { Plus, Pencil, Trash2, X, ArrowRightCircle, FileDown } from 'lucide-react';

interface BonTravail {
  id: number;
  numero: string;
  client_id: number;
  vehicule_id: number | null;
  date_debut: string | null;
  date_fin: string | null;
  statut: string;
  technicien: string | null;
  notes: string | null;
  lignes: Array<{ id: number; description: string; quantite: number; prix_unitaire: number; total: number; article_id: number | null }>;
}

interface Client { id: number; nom: string; prenom: string | null; }
interface Vehicule { id: number; client_id: number; marque: string; modele: string; }
interface Article { id: number; code: string; description: string; prix_vente: number; }

const statutColors: Record<string, string> = {
  ouvert: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-yellow-100 text-yellow-800',
  termine: 'bg-green-100 text-green-800',
  facture: 'bg-purple-100 text-purple-800',
};

export default function BonsTravail() {
  const [items, setItems] = useState<BonTravail[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BonTravail | null>(null);
  const [form, setForm] = useState({ client_id: 0, vehicule_id: 0, statut: 'ouvert', technicien: '', notes: '', lignes: [{ description: '', quantite: '1', prix_unitaire: '0', article_id: '' }] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([bonsTravailApi.list(), clientsApi.list(), vehiculesApi.list(), articlesApi.list()]).then(([b, c, v, a]) => {
      setItems(b.data); setClients(c.data); setVehicules(v.data); setArticles(a.data); setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const getClientName = (id: number) => { const c = clients.find((cl) => cl.id === id); return c ? `${c.nom} ${c.prenom || ''}`.trim() : `#${id}`; };

  const openCreate = () => {
    setEditing(null);
    setForm({ client_id: 0, vehicule_id: 0, statut: 'ouvert', technicien: '', notes: '', lignes: [{ description: '', quantite: '1', prix_unitaire: '0', article_id: '' }] });
    setShowModal(true);
  };

  const openEdit = (bt: BonTravail) => {
    setEditing(bt);
    setForm({
      client_id: bt.client_id, vehicule_id: bt.vehicule_id || 0, statut: bt.statut, technicien: bt.technicien || '', notes: bt.notes || '',
      lignes: bt.lignes.map((l) => ({ description: l.description, quantite: l.quantite.toString(), prix_unitaire: l.prix_unitaire.toString(), article_id: l.article_id?.toString() || '' })),
    });
    setShowModal(true);
  };

  const addLigne = () => setForm({ ...form, lignes: [...form.lignes, { description: '', quantite: '1', prix_unitaire: '0', article_id: '' }] });
  const removeLigne = (i: number) => setForm({ ...form, lignes: form.lignes.filter((_, idx) => idx !== i) });
  const updateLigne = (i: number, field: string, value: string) => {
    const lignes = [...form.lignes];
    lignes[i] = { ...lignes[i], [field]: value };
    if (field === 'article_id' && value) {
      const art = articles.find((a) => a.id === Number(value));
      if (art) { lignes[i].description = art.description; lignes[i].prix_unitaire = art.prix_vente.toString(); }
    }
    setForm({ ...form, lignes });
  };

  const handleSave = async () => {
    const data = {
      client_id: Number(form.client_id),
      vehicule_id: form.vehicule_id ? Number(form.vehicule_id) : null,
      statut: form.statut, technicien: form.technicien || null, notes: form.notes || null,
      lignes: form.lignes.filter((l) => l.description).map((l) => ({
        description: l.description, quantite: parseFloat(l.quantite) || 1, prix_unitaire: parseFloat(l.prix_unitaire) || 0,
        article_id: l.article_id ? Number(l.article_id) : null,
      })),
    };
    if (editing) await bonsTravailApi.update(editing.id, data);
    else await bonsTravailApi.create(data);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => { if (confirm('Supprimer ?')) { await bonsTravailApi.delete(id); load(); } };

  const handleConvertFacture = async (id: number, numero: string) => {
    if (confirm(`Convertir le bon ${numero} en facture ?`)) {
      try {
        const res = await bonsTravailApi.convertirFacture(id);
        alert(`${res.data.message}`);
        load();
      } catch (e: unknown) {
        const err = e as { response?: { data?: { detail?: string } } };
        alert(err.response?.data?.detail || 'Erreur lors de la conversion');
      }
    }
  };

  const handleDownloadPDF = async (id: number, numero: string) => {
    try {
      const res = await pdfApi.downloadBonTravail(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `BT_${numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert('Erreur lors de la génération du PDF'); }
  };

  const filteredVehicules = form.client_id ? vehicules.filter((v) => v.client_id === Number(form.client_id)) : vehicules;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Bons de travail</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus size={18} /> Nouveau bon</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Numéro</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Date début</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Technicien</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Statut</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Aucun bon de travail</td></tr>
              ) : items.map((bt) => (
                <tr key={bt.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{bt.numero}</td>
                  <td className="px-4 py-3 text-slate-600">{getClientName(bt.client_id)}</td>
                  <td className="px-4 py-3 text-slate-600">{bt.date_debut}</td>
                  <td className="px-4 py-3 text-slate-600">{bt.technicien}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statutColors[bt.statut] || 'bg-gray-100'}`}>{bt.statut}</span></td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {bt.statut !== 'facture' && (
                      <button onClick={() => handleConvertFacture(bt.id, bt.numero)} title="Convertir en facture" className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded"><ArrowRightCircle size={16} /></button>
                    )}
                    <button onClick={() => handleDownloadPDF(bt.id, bt.numero)} title="Télécharger PDF" className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded"><FileDown size={16} /></button>
                    <button onClick={() => openEdit(bt)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(bt.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
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
              <h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouveau bon de travail'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
                  <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: Number(e.target.value), vehicule_id: 0 })} className="w-full border rounded-lg px-3 py-2">
                    <option value={0}>Sélectionner</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Véhicule</label>
                  <select value={form.vehicule_id} onChange={(e) => setForm({ ...form, vehicule_id: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2">
                    <option value={0}>Aucun</option>
                    {filteredVehicules.map((v) => <option key={v.id} value={v.id}>{v.marque} {v.modele}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Technicien</label>
                  <input type="text" value={form.technicien} onChange={(e) => setForm({ ...form, technicien: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="ouvert">Ouvert</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="facture">Facturé</option>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={handleSave} disabled={!form.client_id} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
