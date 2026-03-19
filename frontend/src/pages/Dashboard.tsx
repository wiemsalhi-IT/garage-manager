import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import {
  Users,
  Car,
  Wrench,
  DollarSign,
  FileText,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

interface DashboardData {
  stats: {
    total_clients: number;
    total_vehicules: number;
    bons_ouverts: number;
    ca_total: number;
    ca_encaisse: number;
    factures_impayees: number;
    montant_impaye: number;
    devis_en_attente: number;
    articles_stock_bas: number;
  };
  recent_factures: Array<{
    id: number;
    numero: string;
    total: number;
    statut: string;
    date_facture: string | null;
  }>;
  recent_bons: Array<{
    id: number;
    numero: string;
    statut: string;
    date_debut: string | null;
    technicien: string | null;
  }>;
}

const statutColors: Record<string, string> = {
  ouvert: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-yellow-100 text-yellow-800',
  termine: 'bg-green-100 text-green-800',
  facture: 'bg-purple-100 text-purple-800',
  brouillon: 'bg-gray-100 text-gray-800',
  envoyee: 'bg-blue-100 text-blue-800',
  payee: 'bg-green-100 text-green-800',
  en_retard: 'bg-red-100 text-red-800',
  annulee: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Chargement...</div>;
  }

  if (!data) {
    return <div className="text-red-500">Erreur de chargement du tableau de bord</div>;
  }

  const stats = data.stats;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Clients" value={stats.total_clients} color="blue" />
        <StatCard icon={Car} label="Véhicules" value={stats.total_vehicules} color="indigo" />
        <StatCard icon={Wrench} label="Bons ouverts" value={stats.bons_ouverts} color="amber" />
        <StatCard icon={DollarSign} label="CA Total" value={`${stats.ca_total.toFixed(2)} $`} color="green" />
        <StatCard icon={DollarSign} label="Encaissé" value={`${stats.ca_encaisse.toFixed(2)} $`} color="emerald" />
        <StatCard icon={Receipt} label="Factures impayées" value={stats.factures_impayees} color="red" />
        <StatCard icon={FileText} label="Devis en attente" value={stats.devis_en_attente} color="purple" />
        <StatCard icon={AlertTriangle} label="Stock bas" value={stats.articles_stock_bas} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Dernières factures</h2>
          {data.recent_factures.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune facture</p>
          ) : (
            <div className="space-y-3">
              {data.recent_factures.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-slate-700">{f.numero}</span>
                    <span className="text-sm text-slate-500 ml-2">{f.date_facture}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statutColors[f.statut] || 'bg-gray-100'}`}>
                      {f.statut}
                    </span>
                    <span className="font-medium">{f.total.toFixed(2)} $</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Derniers bons de travail</h2>
          {data.recent_bons.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucun bon de travail</p>
          ) : (
            <div className="space-y-3">
              {data.recent_bons.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-slate-700">{b.numero}</span>
                    <span className="text-sm text-slate-500 ml-2">{b.date_debut}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statutColors[b.statut] || 'bg-gray-100'}`}>
                      {b.statut}
                    </span>
                    {b.technicien && <span className="text-sm text-slate-600">{b.technicien}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.blue}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
