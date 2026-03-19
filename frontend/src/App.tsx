import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Vehicules from '@/pages/Vehicules';
import Fournisseurs from '@/pages/Fournisseurs';
import Articles from '@/pages/Articles';
import Devis from '@/pages/Devis';
import BonsTravail from '@/pages/BonsTravail';
import FacturesVente from '@/pages/FacturesVente';
import CommandesAchat from '@/pages/CommandesAchat';
import FacturesAchat from '@/pages/FacturesAchat';
import Paiements from '@/pages/Paiements';
import Rapports from '@/pages/Rapports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/vehicules" element={<Vehicules />} />
          <Route path="/fournisseurs" element={<Fournisseurs />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/devis" element={<Devis />} />
          <Route path="/bons-travail" element={<BonsTravail />} />
          <Route path="/factures-vente" element={<FacturesVente />} />
          <Route path="/commandes-achat" element={<CommandesAchat />} />
          <Route path="/factures-achat" element={<FacturesAchat />} />
          <Route path="/paiements" element={<Paiements />} />
          <Route path="/rapports" element={<Rapports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
