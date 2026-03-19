import { useEffect, useState } from 'react';
import { vehiculesApi, clientsApi } from '@/lib/api';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

interface Vehicule {
  id: number;
  client_id: number;
  marque: string;
  modele: string;
  annee: number | null;
  vin: string | null;
  plaque: string | null;
  couleur: string | null;
  kilometrage: number | null;
  notes: string | null;
}

interface Client {
  id: number;
  nom: string;
  prenom: string | null;
}

const emptyForm = {
  client_id: 0,
  marque: '',
  modele: '',
  annee: '',
  vin: '',
  plaque: '',
  couleur: '',
  kilometrage: '',
  notes: '',
};

export default function Vehicules() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vehicule | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      vehiculesApi.list({ search }),
      clientsApi.list(),
    ]).then(([vRes, cRes]) => {
      setVehicules(vRes.data);
      setClients(cRes.data);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [search]);

  const getClientName = (clientId: number) => {
    const c = clients.find((cl) => cl.id === clientId);
    return c ? `${c.nom} ${c.prenom || ''}`.trim() : `#${clientId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (v: Vehicule) => {
    setEditing(v);
    setForm({
      client_id: v.client_id,
      marque: v.marque,
      modele: v.modele,
      annee: v.annee?.toString() || '',
      vin: v.vin || '',
      plaque: v.plaque || '',
      couleur: v.couleur || '',
      kilometrage: v.kilometrage?.toString() || '',
      notes: v.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const data = {
      ...form,
      client_id: Number(form.client_id),
      annee: form.annee ? Number(form.annee) : null,
      kilometrage: form.kilometrage ? Number(form.kilometrage) : null,
    };
    if (editing) {
      await vehiculesApi.update(editing.id, data);
    } else {
      await vehiculesApi.create(data);
    }
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer ce véhicule ?')) {
      await vehiculesApi.delete(id);
      loadData();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Véhicules</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={18} /> Nouveau véhicule
        </button>
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
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Marque / Modèle</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Année</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Plaque</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">VIN</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Km</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
              ) : vehicules.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Aucun véhicule trouvé</td></tr>
              ) : (
                vehicules.map((v) => (
                  <tr key={v.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{v.marque} {v.modele}</td>
                    <td className="px-4 py-3 text-slate-600">{v.annee}</td>
                    <td className="px-4 py-3 text-slate-600">{v.plaque}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs font-mono">{v.vin}</td>
                    <td className="px-4 py-3 text-slate-600">{getClientName(v.client_id)}</td>
                    <td className="px-4 py-3 text-slate-600">{v.kilometrage ? `${v.kilometrage.toLocaleString()} km` : ''}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(v)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded ml-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier le véhicule' : 'Nouveau véhicule'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
                <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={0}>Sélectionner un client</option>
                  {clients.map((c) => (<option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marque *</label>
                  <input type="text" value={form.marque} onChange={(e) => setForm({ ...form, marque: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modèle *</label>
                  <input type="text" value={form.modele} onChange={(e) => setForm({ ...form, modele: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Année</label>
                  <input type="number" value={form.annee} onChange={(e) => setForm({ ...form, annee: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plaque</label>
                  <input type="text" value={form.plaque} onChange={(e) => setForm({ ...form, plaque: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Couleur</label>
                  <input type="text" value={form.couleur} onChange={(e) => setForm({ ...form, couleur: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">VIN</label>
                  <input type="text" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} maxLength={17} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kilométrage</label>
                  <input type="number" value={form.kilometrage} onChange={(e) => setForm({ ...form, kilometrage: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={handleSave} disabled={!form.marque || !form.modele || !form.client_id} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
