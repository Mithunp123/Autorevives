import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getOfficeStats: () => api.get('/dashboard/office-stats'),
  getVehiclesByState: (state) => api.get('/dashboard/vehicles-by-state', { params: { state } }),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  block: (id) => api.patch(`/users/${id}/block`),
  unblock: (id) => api.patch(`/users/${id}/unblock`),
  delete: (id) => api.delete(`/users/${id}`),
};

export const managerService = {
  getAll: (params) => api.get('/offices', { params }),
  getById: (id) => api.get(`/offices/${id}`),
  create: (data) => api.post('/offices', data),
  update: (id, data) => api.put(`/offices/${id}`, data),
  delete: (id) => api.delete(`/offices/${id}`),
};

export const officeService = {
  getAll: (params) => api.get('/offices', { params }),
  getById: (id) => api.get(`/offices/${id}`),
  create: (data) => api.post('/offices', data),
  update: (id, data) => api.put(`/offices/${id}`, data),
  approve: (id) => api.patch(`/offices/${id}/approve`),
  delete: (id) => api.delete(`/offices/${id}`),
};

export const vehicleService = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
  update: (id, data) => api.put(`/vehicles/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
  /** Upload a single image; returns { path: "uploads/..." } */
  uploadImage: (file, category = '', type = 'vehicle') => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('category', category);
    fd.append('type', type);
    return api.post('/vehicles/upload-image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  delete: (id) => api.delete(`/vehicles/${id}`),
  approve: (id) => api.patch(`/vehicles/${id}/approve`),
  reject: (id) => api.patch(`/vehicles/${id}/reject`),
  placeBid: (id, data) => api.post(`/vehicles/${id}/bid`, data),
};

export const auctionService = {
  getAll: (params) => api.get('/auctions', { params }),
  getById: (id) => api.get(`/auctions/${id}`),
  getBids: (id) => api.get(`/auctions/${id}/bids`),
};

export const approvalService = {
  getPendingVehicles: () => api.get('/vehicles', { params: { status: 'pending' } }),
  getPendingOffices: () => api.get('/offices', { params: { status: 'pending' } }),
  approveVehicle: (id) => api.patch(`/vehicles/${id}/approve`),
  rejectVehicle: (id) => api.patch(`/vehicles/${id}/reject`),
  approveOffice: (id) => api.patch(`/offices/${id}/approve`),
};

export const reportService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const settingsService = {
  get: () => Promise.resolve({ data: null }),
  update: (data) => Promise.resolve({ data }),
};

export const officeDetailsService = {
  get: () => api.get('/offices/details'),
  update: (data) => api.put('/offices/details', data),
  getByUserId: (userId) => api.get(`/offices/details/${userId}`),
};

export const publicService = {
  getHomeData: () => api.get('/public/home'),
  submitContact: (data) => api.post('/public/contact', data),
};

export const planService = {
  getAll: () => api.get('/plans/all'),
  getActive: () => api.get('/plans'),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

export const featureService = {
  getTransactions: () => api.get('/features/transactions'),
  getWinnings: (params) => api.get('/features/winnings', { params }),
  submitPayment: (txnId, formData) => api.post(`/features/transactions/${txnId}/pay`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPendingPayments: (params) => api.get('/features/transactions/pending-payments', { params }),
  verifyPayment: (txnId, data) => api.patch(`/features/transactions/${txnId}/verify`, data),
};
