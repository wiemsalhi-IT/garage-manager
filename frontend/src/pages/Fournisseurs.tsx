import { useEffect, useState } from 'react';
import { fournisseursApi } from '@/lib/api';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

interface Fournisseur {
  id: number;
  nom: string;
  contact: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  notes: string | null;
}

const emptyForm = { nom: '', contact: '', email: '', telephone: '', adresse: '', ville: '', code_postal: '', province: 'QC', notes: '' };

export default function Fournisseurs() {
  const [items, setItems] = useState<Fournisseur[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fournisseursApi.list({ search }).then((res) => { setItems(res.data); setLoading(false); });
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (f: Fournisseur) => {
    setEditing(f);
    setForm({ nom: f.nom, contact: f.contact || '', email: f.email || '', telephone: f.telephone || '', adresse: f.adresse || '', ville: f.ville || '', code_postal: '', province: 'QC', notes: f.notes || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editing) await fournisseursApi.update(editing.id, form);
    else await fournisseursApi.create(form);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer ce fournisseur ?')) { await fournisseursApi.delete(id); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Fournisseurs</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus size={18} /> Nouveau fournisseur</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nom</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Contact</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Téléphone</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Ville</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Aucun fournisseur</td></tr>
              ) : items.map((f) => (
                <tr key={f.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{f.nom}</td>
                  <td className="px-4 py-3 text-slate-600">{f.contact}</td>
                  <td className="px-4 py-3 text-slate-600">{f.telephone}</td>
                  <td className="px-4 py-3 text-slate-600">{f.email}</td>
                  <td className="px-4 py-3 text-slate-600">{f.ville}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(f)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded ml-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouveau fournisseur'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                  <input type="text" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  <input type="text" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <input type="text" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                  <input type="text" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
                  <input type="text" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={handleSave} disabled={!form.nom} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
