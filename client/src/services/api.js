/**
 * FarmDirect Cloud — API Client Service
 */

const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('farmdirect_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('farmdirect_token', token);
  else localStorage.removeItem('farmdirect_token');
};

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP error ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  clerkSync: (clerkData) => apiRequest('/auth/clerk-sync', { method: 'POST', body: clerkData }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (data) => apiRequest('/auth/me', { method: 'PUT', body: data }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) query.append(k, v);
    });
    return apiRequest(`/products?${query.toString()}`);
  },
  getFeaturedProducts: () => apiRequest('/products/featured'),
  getProductCategories: () => apiRequest('/products/categories'),
  getProductById: (id) => apiRequest(`/products/${id}`),
  createProduct: (data) => apiRequest('/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Farmers
  getFarmers: () => apiRequest('/farmers'),
  getFarmerById: (id) => apiRequest(`/farmers/${id}`),
  getFarmerProfile: () => apiRequest('/farmers/me/profile'),
  updateFarmerProfile: (data) => apiRequest('/farmers/me/profile', { method: 'PUT', body: data }),
  getFarmerDashboard: () => apiRequest('/farmers/me/dashboard'),

  // Cart
  getCart: () => apiRequest('/cart'),
  addToCart: (productId, quantity = 1) => apiRequest('/cart/items', { method: 'POST', body: { productId, quantity } }),
  removeFromCart: (productId) => apiRequest(`/cart/items/${productId}`, { method: 'DELETE' }),
  clearCart: () => apiRequest('/cart', { method: 'DELETE' }),

  // Orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/orders?${query}`);
  },
  getOrderById: (id) => apiRequest(`/orders/${id}`),
  createOrder: (orderData) => apiRequest('/orders', { method: 'POST', body: orderData }),
  updateOrderStatus: (id, status, notes) => apiRequest(`/orders/${id}/status`, { method: 'PUT', body: { status, notes } }),
  cancelOrder: (id, reason) => apiRequest(`/orders/${id}/cancel`, { method: 'POST', body: { reason } }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),

  // Cloud Status
  getCloudStatus: () => apiRequest('/cloud/status'),
  triggerCloudTestEvent: (type) => apiRequest('/cloud/test-event', { method: 'POST', body: { type } }),

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${query}`);
  },
  toggleUserActive: (id, isActive) => apiRequest(`/admin/users/${id}/status`, { method: 'PUT', body: { isActive } }),
  getAdminAuditLogs: () => apiRequest('/admin/audit-logs'),

  // Health
  getHealth: () => apiRequest('/health'),
};
