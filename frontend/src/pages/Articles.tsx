import { useEffect, useState } from 'react';
import { articlesApi } from '@/lib/api';
import { Plus, Search, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';

interface Article {
  id: number;
  code: string;
  description: string;
  type: string;
  prix_achat: number;
  prix_vente: number;
  unite: string;
  quantite_stock: number;
  seuil_minimum: number;
}

const emptyForm = { code: '', description: '', type: 'piece', prix_achat: '', prix_vente: '', unite: 'unité', quantite_stock: '0', seuil_minimum: '0', notes: '' };

export default function Articles() {
  const [items, setItems] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    articlesApi.list(params).then((res) => { setItems(res.data); setLoading(false); });
  };

  useEffect(() => { load(); }, [search, typeFilter]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({ code: a.code, description: a.description, type: a.type, prix_achat: a.prix_achat.toString(), prix_vente: a.prix_vente.toString(), unite: a.unite, quantite_stock: a.quantite_stock.toString(), seuil_minimum: a.seuil_minimum.toString(), notes: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    const data = { ...form, prix_achat: parseFloat(form.prix_achat) || 0, prix_vente: parseFloat(form.prix_vente) || 0, quantite_stock: parseInt(form.quantite_stock) || 0, seuil_minimum: parseInt(form.seuil_minimum) || 0 };
    if (editing) await articlesApi.update(editing.id, data);
    else await articlesApi.create(data);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer cet article ?')) { await articlesApi.delete(id); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Articles (Pièces & Main-d'oeuvre)</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus size={18} /> Nouvel article</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les types</option>
            <option value="piece">Pièces</option>
            <option value="main_doeuvre">Main-d'oeuvre</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Code</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Description</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Type</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Prix achat</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Prix vente</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Stock</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Aucun article</td></tr>
              ) : items.map((a) => (
                <tr key={a.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm text-slate-800">{a.code}</td>
                  <td className="px-4 py-3 text-slate-700">{a.description}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${a.type === 'piece' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {a.type === 'piece' ? 'Pièce' : 'Main-d\'oeuvre'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{a.prix_achat.toFixed(2)} $</td>
                  <td className="px-4 py-3 text-right text-slate-600">{a.prix_vente.toFixed(2)} $</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${a.quantite_stock <= a.seuil_minimum ? 'text-red-600' : 'text-slate-700'}`}>
                      {a.quantite_stock <= a.seuil_minimum && <AlertTriangle size={14} className="inline mr-1" />}
                      {a.quantite_stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded ml-1"><Trash2 size={16} /></button>
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
              <h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouvel article'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="piece">Pièce</option>
                    <option value="main_doeuvre">Main-d'oeuvre</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix achat ($)</label>
                  <input type="number" step="0.01" value={form.prix_achat} onChange={(e) => setForm({ ...form, prix_achat: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix vente ($)</label>
                  <input type="number" step="0.01" value={form.prix_vente} onChange={(e) => setForm({ ...form, prix_vente: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unité</label>
                  <input type="text" value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Qté en stock</label>
                  <input type="number" value={form.quantite_stock} onChange={(e) => setForm({ ...form, quantite_stock: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seuil minimum</label>
                  <input type="number" value={form.seuil_minimum} onChange={(e) => setForm({ ...form, seuil_minimum: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={handleSave} disabled={!form.code || !form.description} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
