import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sprout,
  DollarSign,
  Package,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Truck,
  ArrowRight,
  TrendingUp,
  X,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

export default function FarmerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'

  // Product modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('vegetables');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('lb');
  const [formStock, setFormStock] = useState('');
  const [formOrganic, setFormOrganic] = useState(true);
  const [formFreshness, setFormFreshness] = useState('very-fresh');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, ordersRes, productsRes] = await Promise.all([
        api.getFarmerDashboard().catch(() => ({})),
        api.getOrders().catch(() => ({})),
        api.getProducts().catch(() => ({})),
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (productsRes.success) {
        // filter by this farmer
        const farmerProds = productsRes.data?.filter(p =>
          (p.farmerId?._id || p.farmerId)?.toString() === user?._id?.toString()
        ) || [];
        setProducts(farmerProds);
      }
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormCategory('vegetables');
    setFormPrice('3.99');
    setFormUnit('lb');
    setFormStock('50');
    setFormOrganic(true);
    setFormFreshness('very-fresh');
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormDesc(prod.description || '');
    setFormCategory(prod.category || 'vegetables');
    setFormPrice(prod.price.toString());
    setFormUnit(prod.unit || 'lb');
    setFormStock(prod.stockQuantity.toString());
    setFormOrganic(prod.organic || false);
    setFormFreshness(prod.freshness || 'fresh');
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      const payload = {
        name: formName,
        description: formDesc,
        category: formCategory,
        price: parseFloat(formPrice),
        unit: formUnit,
        stockQuantity: parseInt(formStock, 10),
        organic: formOrganic,
        freshness: formFreshness,
        availability: parseInt(formStock, 10) > 0,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id, payload);
      } else {
        await api.createProduct(payload);
      }

      setModalOpen(false);
      await fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteProduct(id);
      await fetchDashboard();
    } catch (err) {
      alert(err.message || 'Could not delete product');
    }
  };

  const handleOrderStatusTransition = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const stats = dashboardData?.stats || {};
  const lowStockItems = dashboardData?.lowStockItems || [];

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #081c15 0%, #1b4332 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: '#ffffff',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(82, 183, 136, 0.25)',
            color: '#b7e4c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sprout size={32} />
          </div>
          <div>
            <span style={{
              background: '#52b788',
              color: '#081c15',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              Farmer Producer Studio
            </span>
            <h1 style={{ fontSize: '26px', color: '#ffffff', fontWeight: 800, marginTop: '2px' }}>
              {user?.name || 'Farmer'} Dashboard
            </h1>
            <p style={{ color: '#b7e4c7', fontSize: '13px' }}>
              Manage crop inventories, fulfill consumer orders, and inspect automated cloud telemetry.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchDashboard}
            className="btn btn-outline btn-sm"
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', background: 'transparent' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm"
            style={{ background: '#52b788', color: '#081c15' }}
          >
            <Plus size={15} /> Add Produce Listing
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#52635a', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Gross Revenue</span>
            <DollarSign size={18} style={{ color: '#2d6a4f' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#081c15' }}>
            ${(stats.totalRevenue || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '4px' }}>
            Direct earnings from consumers
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#52635a', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Active Listings</span>
            <Sprout size={18} style={{ color: '#2d6a4f' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#081c15' }}>
            {stats.activeProducts ?? products.length}
          </div>
          <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '4px' }}>
            Currently available in marketplace
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#52635a', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Pending Orders</span>
            <Clock size={18} style={{ color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706' }}>
            {stats.pendingOrders ?? orders.filter(o => o.status === 'PENDING').length}
          </div>
          <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '4px' }}>
            Awaiting acceptance or packing
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#52635a', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>FaaS Low Stock</span>
            <AlertTriangle size={18} style={{ color: '#ef4444' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ef4444' }}>
            {lowStockItems.length}
          </div>
          <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '4px' }}>
            Monitored by InventoryAlertProcessor
          </div>
        </div>
      </div>

      {/* FaaS Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)'
        }}>
          <AlertTriangle size={24} style={{ color: '#d97706', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#92400e' }}>
              Serverless FaaS Alert: {lowStockItems.length} Item(s) Below Inventory Threshold
            </div>
            <div style={{ fontSize: '13px', color: '#b45309', marginTop: '2px' }}>
              {lowStockItems.map(item => `${item.name} (${item.stockQuantity} left)`).join(' • ')}
            </div>
          </div>
          <span className="badge badge-gold">Auto-Triggered</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid #ebe7dc',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '14px',
            color: activeTab === 'inventory' ? '#1b4332' : '#7e9187',
            borderBottom: `2px solid ${activeTab === 'inventory' ? '#2d6a4f' : 'transparent'}`,
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Package size={16} /> Harvest Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '14px',
            color: activeTab === 'orders' ? '#1b4332' : '#7e9187',
            borderBottom: `2px solid ${activeTab === 'orders' ? '#2d6a4f' : 'transparent'}`,
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Truck size={16} /> Incoming Orders ({orders.length})
        </button>
      </div>

      {/* Tab: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f4ee', borderBottom: '1px solid #ebe7dc', color: '#52635a' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Produce</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Price</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Stock Qty</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Freshness</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#7e9187' }}>
                      No listings registered under your farmer account. Click "+ Add Produce Listing" to begin selling!
                    </td>
                  </tr>
                ) : (
                  products.map(prod => (
                    <tr key={prod._id} style={{ borderBottom: '1px solid #f5f4ee' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#081c15' }}>{prod.name}</div>
                        {prod.organic && (
                          <span style={{ fontSize: '11px', color: '#2d6a4f', fontWeight: 600 }}>
                            🌱 Certified Organic
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', textTransform: 'capitalize', color: '#52635a' }}>
                        {prod.category}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1b4332' }}>
                        ${prod.price.toFixed(2)} / {prod.unit}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: prod.stockQuantity <= 15 ? '#ef4444' : '#081c15'
                        }}>
                          {prod.stockQuantity} {prod.unit}s
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textTransform: 'capitalize' }}>
                        <span className="badge badge-gold">{prod.freshness}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${prod.availability ? 'badge-green' : 'badge-red'}`}>
                          {prod.availability ? 'Active' : 'Sold Out'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            style={{ padding: '6px', color: '#2d6a4f' }}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id)}
                            style={{ padding: '6px', color: '#ef4444' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Orders Management */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#7e9187' }}>
              <Truck size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <div>No orders received yet. Once consumers check out, orders will appear here.</div>
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="card" style={{ padding: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '15px', color: '#081c15' }}>
                        Order #{order.orderNumber}
                      </strong>
                      <span className="badge badge-blue">{order.status}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '2px' }}>
                      Consumer: {order.consumerId?.name || 'Local Buyer'} • {order.deliveryMethod}
                    </div>
                  </div>

                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1b4332' }}>
                    ${order.total?.toFixed(2)}
                  </div>
                </div>

                {/* Items */}
                <div style={{ backgroundColor: '#fbfbf9', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span>{item.nameSnapshot} x {item.quantity} {item.unitSnapshot}</span>
                      <strong>${((item.priceSnapshot || 0) * item.quantity).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                {/* State Transition Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#52635a' }}>Advance Workflow:</span>

                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleOrderStatusTransition(order._id, 'ACCEPTED')}
                        className="btn btn-primary btn-sm"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleOrderStatusTransition(order._id, 'REJECTED')}
                        className="btn btn-danger btn-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleOrderStatusTransition(order._id, 'PREPARING')}
                      className="btn btn-primary btn-sm"
                    >
                      Start Preparing Harvest
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => handleOrderStatusTransition(order._id, 'DISPATCHED')}
                      className="btn btn-primary btn-sm"
                    >
                      Mark Dispatched / Out for Delivery
                    </button>
                  )}

                  {order.status === 'DISPATCHED' && (
                    <button
                      onClick={() => handleOrderStatusTransition(order._id, 'DELIVERED')}
                      className="btn btn-secondary btn-sm"
                      style={{ background: '#2d6a4f', color: '#ffffff' }}
                    >
                      Confirm Delivered / Completed
                    </button>
                  )}

                  {['DELIVERED', 'COMPLETED'].includes(order.status) && (
                    <span style={{ fontSize: '12px', color: '#2d6a4f', fontWeight: 700 }}>
                      ✓ Order Fulfilled
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Product Create / Edit Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(8, 28, 21, 0.65)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
                {editingProduct ? 'Edit Produce Listing' : 'New Farm Produce Listing'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ color: '#7e9187' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                  Crop / Produce Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Crisp Butterhead Lettuce"
                  className="input-field"
                  style={{ fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="dairy">Dairy</option>
                    <option value="herbs">Herbs</option>
                    <option value="honey">Honey</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                    Freshness
                  </label>
                  <select
                    value={formFreshness}
                    onChange={e => setFormFreshness(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  >
                    <option value="very-fresh">Harvested Today (Very Fresh)</option>
                    <option value="fresh">Fresh (Within 2-3 Days)</option>
                    <option value="good">Cured / Shelf-Stable</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="4.99"
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                    Unit
                  </label>
                  <select
                    value={formUnit}
                    onChange={e => setFormUnit(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  >
                    <option value="lb">lb (pound)</option>
                    <option value="bunch">bunch</option>
                    <option value="piece">piece</option>
                    <option value="kg">kg</option>
                    <option value="litre">litre</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                    Available Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={e => setFormStock(e.target.value)}
                    placeholder="50"
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                  Description & Origin Details
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Describe variety, soil management, taste profile..."
                  className="input-field"
                  style={{ fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formOrganic}
                  onChange={e => setFormOrganic(e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>Certified Organic Crop</span>
              </label>

              <button
                type="submit"
                disabled={submittingProduct}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              >
                {submittingProduct ? 'Saving to Database...' : editingProduct ? 'Update Listing' : 'Publish Produce Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
