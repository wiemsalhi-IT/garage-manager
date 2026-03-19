import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clients
export const clientsApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/clients', { params }),
  get: (id: number) => api.get(`/api/clients/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/clients', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/clients/${id}`, data),
  delete: (id: number) => api.delete(`/api/clients/${id}`),
};

// Véhicules
export const vehiculesApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/vehicules', { params }),
  get: (id: number) => api.get(`/api/vehicules/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/vehicules', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/vehicules/${id}`, data),
  delete: (id: number) => api.delete(`/api/vehicules/${id}`),
};

// Fournisseurs
export const fournisseursApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/fournisseurs', { params }),
  get: (id: number) => api.get(`/api/fournisseurs/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/fournisseurs', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/fournisseurs/${id}`, data),
  delete: (id: number) => api.delete(`/api/fournisseurs/${id}`),
};

// Articles
export const articlesApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/articles', { params }),
  get: (id: number) => api.get(`/api/articles/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/articles', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/articles/${id}`, data),
  delete: (id: number) => api.delete(`/api/articles/${id}`),
};

// Devis
export const devisApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/devis', { params }),
  get: (id: number) => api.get(`/api/devis/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/devis', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/devis/${id}`, data),
  delete: (id: number) => api.delete(`/api/devis/${id}`),
};

// Bons de travail
export const bonsTravailApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/bons-travail', { params }),
  get: (id: number) => api.get(`/api/bons-travail/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/bons-travail', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/bons-travail/${id}`, data),
  delete: (id: number) => api.delete(`/api/bons-travail/${id}`),
};

// Factures de vente
export const facturesVenteApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/factures-vente', { params }),
  get: (id: number) => api.get(`/api/factures-vente/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/factures-vente', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/factures-vente/${id}`, data),
  delete: (id: number) => api.delete(`/api/factures-vente/${id}`),
};

// Commandes d'achat
export const commandesAchatApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/commandes-achat', { params }),
  get: (id: number) => api.get(`/api/commandes-achat/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/commandes-achat', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/commandes-achat/${id}`, data),
  delete: (id: number) => api.delete(`/api/commandes-achat/${id}`),
};

// Factures d'achat
export const facturesAchatApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/factures-achat', { params }),
  get: (id: number) => api.get(`/api/factures-achat/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/factures-achat', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/factures-achat/${id}`, data),
  delete: (id: number) => api.delete(`/api/factures-achat/${id}`),
};

// Paiements
export const paiementsApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/api/paiements', { params }),
  get: (id: number) => api.get(`/api/paiements/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/paiements', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/paiements/${id}`, data),
  delete: (id: number) => api.delete(`/api/paiements/${id}`),
};

// Dashboard
export const dashboardApi = {
  get: () => api.get('/api/dashboard'),
};

// Rapports
export const rapportsApi = {
  revenus: (params?: Record<string, string>) => api.get('/api/rapports/revenus', { params }),
  stock: () => api.get('/api/rapports/stock'),
  activite: (params?: Record<string, string>) => api.get('/api/rapports/activite', { params }),
};

export default api;
