/**
 * FarmDirect Cloud — Local Fallback Middleware
 * 
 * When MongoDB Atlas is unavailable (IP not whitelisted, network issues, etc.),
 * this middleware intercepts API requests and serves data from the in-memory
 * localStore — giving a fully interactive demo experience without any database.
 */

import { Router, Request, Response } from 'express';
import { isDBConnected } from '../config/database';
import { localStore } from '../services/localStore';
import { askGemini } from '../services/geminiService';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'farmdirect-dev-jwt-secret-change-in-production';

function makeToken(user: { _id: string; email: string; role: string; name: string }) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function getUserFromToken(req: Request) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as any;
    return localStore.users.find(u => u._id === decoded.id || u.email === decoded.email) || null;
  } catch {
    return null;
  }
}

// ─── Guard: Only intercept when DB is NOT connected ──────────────────────────
router.use((req, res, next) => {
  if (isDBConnected()) {
    return next('router'); // Skip entire fallback router, use real routes
  }
  next();
});

// ─── Health ──────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FarmDirect API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    dataSource: 'LOCAL_STORE',
    database: { connected: false, readyState: 0, fallback: 'in-memory' },
    environment: process.env.NODE_ENV || 'development',
    products: localStore.products.length,
    farmers: localStore.farmerProfiles.length,
  });
});

// ─── Auth ────────────────────────────────────────────────────────────────────
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = localStore.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const token = makeToken(user);
  const profile = localStore.farmerProfiles.find(fp => fp.userId === user._id);
  res.json({
    success: true,
    token,
    user: { ...user, password: undefined },
    farmerProfile: profile || null,
    message: `Welcome back, ${user.name}!`,
  });
});

router.post('/auth/register', (req: Request, res: Response) => {
  const { email, name, role = 'CONSUMER', farmName, city, state } = req.body;
  let user = localStore.users.find(u => u.email === email);
  if (user) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  user = {
    _id: `user_${Date.now()}`,
    name: name || email.split('@')[0],
    email,
    role,
    isActive: true,
  };
  localStore.users.push(user);
  if (role === 'FARMER' && farmName) {
    localStore.farmerProfiles.push({
      _id: `prof_${user._id}`,
      userId: user._id,
      farmName,
      bio: '',
      location: { address: '', city: city || '', state: state || '', coordinates: { lat: 0, lng: 0 } },
      certifications: [],
      farmingPractices: [],
      rating: 0,
      totalReviews: 0,
      yearsInFarming: 0,
      isVerified: false,
    });
  }
  const token = makeToken(user);
  res.status(201).json({ success: true, token, user, message: 'Account created!' });
});

router.post('/auth/clerk-sync', (req: Request, res: Response) => {
  const { clerkId, email, name, avatar, role = 'CONSUMER', farmName, city, state } = req.body;
  let user = localStore.users.find(u => u.email === email);
  if (!user) {
    user = {
      _id: `user_clerk_${Date.now()}`,
      name: name || 'Clerk User',
      email,
      role,
      avatar,
      isActive: true,
    };
    localStore.users.push(user);
  }
  const token = makeToken(user);
  const profile = localStore.farmerProfiles.find(fp => fp.userId === user!._id);
  res.json({ success: true, token, user, farmerProfile: profile || null });
});

router.get('/auth/me', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const profile = localStore.farmerProfiles.find(fp => fp.userId === user._id);
  res.json({ success: true, user, farmerProfile: profile || null });
});

router.put('/auth/me', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  Object.assign(user, req.body);
  res.json({ success: true, user, message: 'Profile updated' });
});

router.post('/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// ─── Products ────────────────────────────────────────────────────────────────
router.get('/products', (req: Request, res: Response) => {
  const {
    search, category, minPrice, maxPrice, organic,
    freshness, sort, order, page, limit,
  } = req.query as Record<string, string>;

  const result = localStore.getProducts({
    search,
    category,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    organic: organic === 'true' ? true : undefined,
    freshness,
    sort,
    order: order as 'asc' | 'desc',
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 12,
  });

  // Enrich products with farmer profile data
  const enriched = result.products.map(p => {
    const fp = localStore.farmerProfiles.find(f => f.userId === p.farmerId);
    return {
      ...p,
      farmerProfile: fp ? {
        farmName: fp.farmName,
        location: fp.location,
        rating: fp.rating,
        isVerified: fp.isVerified,
        certifications: fp.certifications,
      } : undefined,
    };
  });

  res.json({
    success: true,
    data: enriched,
    pagination: result.pagination,
  });
});

router.get('/products/featured', (_req: Request, res: Response) => {
  const result = localStore.getProducts({ limit: 8, sort: 'rating', order: 'desc' });
  const enriched = result.products.map(p => {
    const fp = localStore.farmerProfiles.find(f => f.userId === p.farmerId);
    return {
      ...p,
      farmerProfile: fp ? {
        farmName: fp.farmName,
        location: fp.location,
        rating: fp.rating,
        isVerified: fp.isVerified,
        certifications: fp.certifications,
      } : undefined,
    };
  });
  res.json({ success: true, data: enriched });
});

router.get('/products/categories', (_req, res) => {
  const categories = [
    { id: 'vegetables', name: 'Vegetables', count: localStore.products.filter(p => p.category === 'vegetables').length },
    { id: 'fruits', name: 'Fruits', count: localStore.products.filter(p => p.category === 'fruits').length },
    { id: 'grains', name: 'Grains & Flour', count: localStore.products.filter(p => p.category === 'grains').length },
    { id: 'dairy', name: 'Dairy & Cheese', count: localStore.products.filter(p => p.category === 'dairy').length },
    { id: 'herbs', name: 'Herbs & Botanicals', count: localStore.products.filter(p => p.category === 'herbs').length },
    { id: 'honey', name: 'Honey', count: localStore.products.filter(p => p.category === 'honey').length },
  ];
  res.json({ success: true, data: categories });
});

router.get('/products/:id', (req: Request, res: Response) => {
  const product = localStore.getProductById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const fp = localStore.farmerProfiles.find(f => f.userId === product.farmerId);
  res.json({
    success: true,
    data: {
      ...product,
      farmerProfile: fp ? {
        farmName: fp.farmName,
        location: fp.location,
        rating: fp.rating,
        isVerified: fp.isVerified,
        certifications: fp.certifications,
      } : undefined,
    },
  });
});

// Farmer CRUD for products
router.post('/products', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user || user.role !== 'FARMER') return res.status(403).json({ success: false, message: 'Farmers only' });
  const fp = localStore.farmerProfiles.find(f => f.userId === user._id);
  const product = {
    _id: `prod_${Date.now()}`,
    farmerId: user._id,
    farmerName: user.name,
    farmName: fp?.farmName || 'My Farm',
    ...req.body,
    coordinates: fp?.location?.coordinates || { lat: 0, lng: 0 },
    city: req.body.city || fp?.location?.city || '',
    state: req.body.state || fp?.location?.state || '',
    images: req.body.images || [],
    rating: 0,
    totalReviews: 0,
    soldCount: 0,
    harvestDate: req.body.harvestDate || new Date().toISOString(),
    availability: true,
    lowStockThreshold: req.body.lowStockThreshold || 10,
  };
  localStore.products.push(product);
  res.status(201).json({ success: true, data: product, message: 'Product listed successfully!' });
});

router.put('/products/:id', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const idx = localStore.products.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  if (localStore.products[idx].farmerId !== user._id && user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Not your product' });
  }
  Object.assign(localStore.products[idx], req.body);
  res.json({ success: true, data: localStore.products[idx], message: 'Product updated' });
});

router.delete('/products/:id', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const idx = localStore.products.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  localStore.products.splice(idx, 1);
  res.json({ success: true, message: 'Product deleted' });
});

// ─── Farmers ─────────────────────────────────────────────────────────────────
router.get('/farms/locations', (_req, res) => {
  res.json({ success: true, data: localStore.getFarmLocations() });
});

router.get('/farmers/locations', (_req, res) => {
  res.json({ success: true, data: localStore.getFarmLocations() });
});

router.get('/farmers', (_req, res) => {
  const data = localStore.getFarmers();
  res.json({ success: true, data });
});

router.get('/farmers/me/profile', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const profile = localStore.farmerProfiles.find(fp => fp.userId === user._id);
  if (!profile) return res.status(404).json({ success: false, message: 'Farmer profile not found' });
  res.json({ success: true, data: profile });
});

router.put('/farmers/me/profile', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const profile = localStore.farmerProfiles.find(fp => fp.userId === user._id);
  if (!profile) return res.status(404).json({ success: false, message: 'Farmer profile not found' });
  Object.assign(profile, req.body);
  res.json({ success: true, data: profile, message: 'Profile updated successfully' });
});

router.get('/farmers/me/dashboard', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const data = localStore.getFarmerDashboard(user._id);
  res.json({ success: true, data });
});

router.get('/farmers/me/products', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const products = localStore.products.filter(p => p.farmerId === user._id);
  res.json({ success: true, data: products, pagination: { page: 1, limit: 50, total: products.length } });
});

router.get('/farmers/:id', (req: Request, res: Response) => {
  const data = localStore.getFarmerById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Farmer not found' });
  res.json({ success: true, data });
});

// ─── Cart ────────────────────────────────────────────────────────────────────
router.get('/cart', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const cart = localStore.getCart(user._id);
  res.json({
    success: true,
    data: {
      items: cart.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        product: i.product,
      })),
      subtotal: cart.subtotal,
    },
  });
});

router.post('/cart/items', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const cart = localStore.addToCart(user._id, req.body.productId, req.body.quantity || 1);
    res.json({ success: true, data: cart, message: 'Added to cart!' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/cart/items/:productId', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const cart = localStore.updateCartItem(user._id, req.params.productId, req.body.quantity);
  res.json({ success: true, data: cart });
});

router.delete('/cart/items/:productId', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const cart = localStore.removeFromCart(user._id, req.params.productId);
  res.json({ success: true, data: cart, message: 'Removed from cart' });
});

router.delete('/cart', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  localStore.clearCart(user._id);
  res.json({ success: true, message: 'Cart cleared' });
});

// ─── Orders ──────────────────────────────────────────────────────────────────
router.get('/orders', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const orders = localStore.getOrders(user._id, user.role);
  res.json({ success: true, data: orders, pagination: { page: 1, total: orders.length } });
});

router.get('/orders/:id', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const order = localStore.orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

router.post('/orders', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const cart = localStore.getCart(user._id);
  if (cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  // Group by farmer
  const farmerGroups = new Map<string, typeof cart.items>();
  cart.items.forEach(item => {
    const fid = item.product.farmerId;
    if (!farmerGroups.has(fid)) farmerGroups.set(fid, []);
    farmerGroups.get(fid)!.push(item);
  });

  const createdOrders: any[] = [];
  for (const [farmerId, items] of farmerGroups) {
    const subtotal = Math.round(items.reduce((s, i) => s + i.product.price * i.quantity, 0) * 100) / 100;
    const deliveryFee = req.body.fulfillmentType === 'PICKUP' ? 0 : 4.99;
    const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
    const total = Math.round((subtotal + deliveryFee + platformFee) * 100) / 100;

    const order = localStore.createOrder(user._id, {
      farmerId,
      farmName: items[0].product.farmName,
      items: items.map(i => ({
        productId: i.productId,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        unit: i.product.unit,
        total: Math.round(i.product.price * i.quantity * 100) / 100,
      })),
      subtotal,
      deliveryFee,
      platformFee,
      total,
      fulfillmentType: req.body.fulfillmentType || 'DELIVERY',
      shippingAddress: req.body.shippingAddress,
      pickupTime: req.body.pickupTime,
      notes: req.body.notes,
    });
    createdOrders.push(order);
  }

  res.status(201).json({
    success: true,
    data: createdOrders.length === 1 ? createdOrders[0] : createdOrders,
    message: `🌿 Order placed successfully! ${createdOrders.length} order(s) created.`,
  });
});

router.put('/orders/:id/status', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const order = localStore.orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  res.json({ success: true, data: order, message: `Order status updated to ${req.body.status}` });
});

router.post('/orders/:id/cancel', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const order = localStore.orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = 'CANCELLED';
  order.updatedAt = new Date().toISOString();
  res.json({ success: true, data: order, message: 'Order cancelled' });
});

// ─── Notifications ───────────────────────────────────────────────────────────
router.get('/notifications', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const notifs = localStore.notifications.filter(n => n.userId === user._id);
  res.json({ success: true, data: notifs });
});

router.put('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = localStore.notifications.find(n => n._id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true, message: 'Marked as read' });
});

router.put('/notifications/read-all', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.json({ success: true });
  localStore.notifications.filter(n => n.userId === user._id).forEach(n => (n.isRead = true));
  res.json({ success: true, message: 'All notifications marked as read' });
});

// ─── Admin ───────────────────────────────────────────────────────────────────
router.get('/admin/users', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Admin only' });
  res.json({
    success: true,
    data: localStore.users.map(u => ({ ...u, password: undefined })),
  });
});

router.get('/admin/audit', (_req, res) => {
  res.json({
    success: true,
    data: [
      { _id: 'audit_1', action: 'USER_LOGIN', actor: 'admin@farmdirect.dev', target: 'system', timestamp: new Date().toISOString(), details: 'Admin logged in (local mode)' },
    ],
  });
});

router.put('/admin/users/:id/status', (req: Request, res: Response) => {
  const targetUser = localStore.users.find(u => u._id === req.params.id);
  if (targetUser) {
    targetUser.isActive = req.body.isActive ?? true;
  }
  res.json({ success: true, message: 'User status updated' });
});

// ─── Uploads (mock) ─────────────────────────────────────────────────────────
router.post('/uploads', (_req, res) => {
  res.json({
    success: true,
    urls: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
    message: 'Upload simulated (local mode)',
  });
});

// ─── Gemini AI Assistant ───────────────────────────────────────────────────
router.post('/ai/ask', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    const sampleProducts = localStore.products.slice(0, 8).map(p => `${p.name} ($${p.price}/${p.unit}) from ${p.farmName}`).join(', ');
    const answer = await askGemini(prompt, `Available fresh products: ${sampleProducts}`);
    res.json({ success: true, answer });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'AI request failed' });
  }
});

export default router;
