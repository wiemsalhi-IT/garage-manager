import { useEffect, useState } from 'react';
import { devisApi, clientsApi, vehiculesApi, articlesApi, pdfApi } from '@/lib/api';
import { Plus, Pencil, Trash2, X, ArrowRightCircle, FileDown, Mail } from 'lucide-react';

interface DevisItem {
  id: number;
  numero: string;
  client_id: number;
  vehicule_id: number | null;
  date_devis: string | null;
  date_validite: string | null;
  statut: string;
  sous_total: number;
  tps: number;
  tvq: number;
  total: number;
  notes: string | null;
  lignes: Array<{ id: number; description: string; quantite: number; prix_unitaire: number; total: number; article_id: number | null }>;
}

interface Client { id: number; nom: string; prenom: string | null; }
interface Vehicule { id: number; client_id: number; marque: string; modele: string; }
interface Article { id: number; code: string; description: string; prix_vente: number; }

const statutColors: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-800',
  envoye: 'bg-blue-100 text-blue-800',
  accepte: 'bg-green-100 text-green-800',
  refuse: 'bg-red-100 text-red-800',
  converti: 'bg-purple-100 text-purple-800',
};

const statutLabels: Record<string, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
  converti: 'Converti',
};

export default function Devis() {
  const [items, setItems] = useState<DevisItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DevisItem | null>(null);
  const [form, setForm] = useState({ client_id: 0, vehicule_id: 0, statut: 'brouillon', notes: '', lignes: [{ description: '', quantite: '1', prix_unitaire: '0', article_id: '' }] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([devisApi.list(), clientsApi.list(), vehiculesApi.list(), articlesApi.list()]).then(([d, c, v, a]) => {
      setItems(d.data); setClients(c.data); setVehicules(v.data); setArticles(a.data); setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const getClientName = (id: number) => { const c = clients.find((cl) => cl.id === id); return c ? `${c.nom} ${c.prenom || ''}`.trim() : `#${id}`; };

  const openCreate = () => {
    setEditing(null);
    setForm({ client_id: 0, vehicule_id: 0, statut: 'brouillon', notes: '', lignes: [{ description: '', quantite: '1', prix_unitaire: '0', article_id: '' }] });
    setShowModal(true);
  };

  const openEdit = (d: DevisItem) => {
    setEditing(d);
    setForm({
      client_id: d.client_id, vehicule_id: d.vehicule_id || 0, statut: d.statut, notes: d.notes || '',
      lignes: d.lignes.map((l) => ({ description: l.description, quantite: l.quantite.toString(), prix_unitaire: l.prix_unitaire.toString(), article_id: l.article_id?.toString() || '' })),
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
      statut: form.statut,
      notes: form.notes || null,
      lignes: form.lignes.filter((l) => l.description).map((l) => ({
        description: l.description, quantite: parseFloat(l.quantite) || 1, prix_unitaire: parseFloat(l.prix_unitaire) || 0,
        article_id: l.article_id ? Number(l.article_id) : null,
      })),
    };
    if (editing) await devisApi.update(editing.id, data);
    else await devisApi.create(data);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => { if (confirm('Supprimer ce devis ?')) { await devisApi.delete(id); load(); } };

  const handleConvertBT = async (id: number, numero: string) => {
    if (confirm(`Convertir le devis ${numero} en bon de travail ?`)) {
      try {
        const res = await devisApi.convertirBT(id);
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
      const res = await pdfApi.downloadDevis(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Devis_${numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert('Erreur lors de la génération du PDF'); }
  };

  const handleSendEmail = async (id: number, numero: string) => {
    if (confirm(`Envoyer le devis ${numero} par email au client ?`)) {
      try {
        const res = await pdfApi.emailDevis(id);
        alert(res.data.message);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { detail?: string } } };
        alert(err.response?.data?.detail || 'Erreur lors de l\'envoi');
      }
    }
  };

  const filteredVehicules = form.client_id ? vehicules.filter((v) => v.client_id === Number(form.client_id)) : vehicules;

  const calcTotal = () => form.lignes.reduce((sum, l) => sum + (parseFloat(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Devis</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus size={18} /> Nouveau devis</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Numéro</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Client</th>
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
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Aucun devis</td></tr>
              ) : items.map((d) => (
                <tr key={d.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{d.numero}</td>
                  <td className="px-4 py-3 text-slate-600">{getClientName(d.client_id)}</td>
                  <td className="px-4 py-3 text-slate-600">{d.date_devis}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statutColors[d.statut] || 'bg-gray-100'}`}>{statutLabels[d.statut] || d.statut}</span></td>
                  <td className="px-4 py-3 text-right font-medium">{d.total.toFixed(2)} $</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {d.statut !== 'converti' && (
                      <button onClick={() => handleConvertBT(d.id, d.numero)} title="Convertir en bon de travail" className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded"><ArrowRightCircle size={16} /></button>
                    )}
                    <button onClick={() => handleDownloadPDF(d.id, d.numero)} title="Télécharger PDF" className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded"><FileDown size={16} /></button>
                    <button onClick={() => handleSendEmail(d.id, d.numero)} title="Envoyer par email" className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded"><Mail size={16} /></button>
                    <button onClick={() => openEdit(d)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(d.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
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
              <h2 className="text-lg font-semibold">{editing ? 'Modifier le devis' : 'Nouveau devis'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="brouillon">Brouillon</option>
                    <option value="envoye">Envoyé</option>
                    <option value="accepte">Accepté</option>
                    <option value="refuse">Refusé</option>
                    <option value="converti">Converti</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Lignes</label>
                  <button onClick={addLigne} className="text-sm text-blue-600 hover:text-blue-800">+ Ajouter une ligne</button>
                </div>
                <div className="space-y-2">
                  {form.lignes.map((l, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <select value={l.article_id} onChange={(e) => updateLigne(i, 'article_id', e.target.value)} className="w-36 border rounded px-2 py-1.5 text-sm">
                        <option value="">Article...</option>
                        {articles.map((a) => <option key={a.id} value={a.id}>{a.code}</option>)}
                      </select>
                      <input type="text" placeholder="Description" value={l.description} onChange={(e) => updateLigne(i, 'description', e.target.value)} className="flex-1 border rounded px-2 py-1.5 text-sm" />
                      <input type="number" placeholder="Qté" value={l.quantite} onChange={(e) => updateLigne(i, 'quantite', e.target.value)} className="w-20 border rounded px-2 py-1.5 text-sm text-right" />
                      <input type="number" step="0.01" placeholder="Prix" value={l.prix_unitaire} onChange={(e) => updateLigne(i, 'prix_unitaire', e.target.value)} className="w-28 border rounded px-2 py-1.5 text-sm text-right" />
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
              <button onClick={handleSave} disabled={!form.client_id} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
