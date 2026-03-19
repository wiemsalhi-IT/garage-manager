import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  Truck,
  Package,
  FileText,
  Wrench,
  Receipt,
  ShoppingCart,
  FileInput,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/vehicules', icon: Car, label: 'Véhicules' },
  { to: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
  { to: '/articles', icon: Package, label: 'Articles' },
  { to: '/devis', icon: FileText, label: 'Devis' },
  { to: '/bons-travail', icon: Wrench, label: 'Bons de travail' },
  { to: '/factures-vente', icon: Receipt, label: 'Factures vente' },
  { to: '/commandes-achat', icon: ShoppingCart, label: 'Commandes achat' },
  { to: '/factures-achat', icon: FileInput, label: 'Factures achat' },
  { to: '/paiements', icon: CreditCard, label: 'Paiements' },
  { to: '/rapports', icon: BarChart3, label: 'Rapports' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-blue-400" />
            <span className="font-bold text-lg">GarageManager</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
          GarageManager v1.0
        </div>
      )}
    </aside>
  );
}
