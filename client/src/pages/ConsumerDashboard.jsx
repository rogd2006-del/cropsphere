import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  XCircle,
  RefreshCw,
  ShoppingBag,
  User,
  ArrowRight
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function ConsumerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      const res = await api.cancelOrder(orderId, 'Cancelled by consumer');
      if (res.success) {
        setMessage('Order cancelled successfully.');
        await fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const getStepIndex = (status) => {
    const idx = STATUS_STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Header Profile Summary */}
      <div style={{
        background: 'linear-gradient(135deg, #E3266F 0%, #E3266F 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: '#ffffff',
        marginBottom: '36px',
        boxShadow: '0 10px 25px rgba(8, 28, 21, 0.12)',
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
            borderRadius: '50%',
            background: '#ffffff',
            color: '#E3266F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '22px'
          }}>
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <span style={{
              background: 'rgba(217, 36, 106, 0.25)',
              color: 'var(--raspberry-light)',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              border: '1px solid rgba(217, 36, 106, 0.4)'
            }}>
              Consumer Account
            </span>
            <h1 style={{ fontSize: '26px', color: '#ffffff', fontWeight: 800, marginTop: '2px' }}>
              Welcome, {user?.name || 'Customer'}
            </h1>
            <p style={{ color: 'var(--cannoli-cream)', opacity: 0.9, fontSize: '13px' }}>
              {user?.email} • Track your farm-direct produce orders & delivery timelines
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('marketplace')}
          className="btn btn-primary"
          style={{ background: 'var(--raspberry-primary)', color: '#ffffff' }}
        >
          <ShoppingBag size={15} /> Browse Fresh Produce
        </button>
      </div>

      {message && (
        <div style={{
          backgroundColor: '#FDF0F5',
          color: '#E3266F',
          border: '1px solid #F7A8C6',
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '24px',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {message}
        </div>
      )}

      {/* Orders Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#081c15' }}>
            Your Order History & Tracking
          </h2>
          <p style={{ fontSize: '13px', color: '#52635a' }}>
            Real-time status updates powered by serverless FaaS event pipeline
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7e9187' }}>
          Loading your orders from MongoDB Atlas...
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #ebe7dc',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <Package size={48} style={{ color: '#c2b9a1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#081c15', marginBottom: '6px' }}>
            No orders placed yet
          </h3>
          <p style={{ fontSize: '14px', color: '#52635a', marginBottom: '20px' }}>
            Browse local regenerative farms and fill your cart with fresh harvest produce.
          </p>
          <button onClick={() => onNavigate('marketplace')} className="btn btn-primary">
            Explore Marketplace Produce
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(order => {
            const currentStepIdx = getStepIndex(order.status);
            const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED';

            return (
              <div
                key={order._id}
                className="card"
                style={{ padding: '24px', backgroundColor: '#ffffff' }}
              >
                {/* Order Top Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f5f4ee',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '16px', color: '#081c15' }}>
                        Order #{order.orderNumber}
                      </span>
                      <span className={`badge ${
                        order.status === 'DELIVERED' ? 'badge-green' :
                        order.status === 'CANCELLED' ? 'badge-red' :
                        'badge-blue'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '4px' }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1b4332' }}>
                      ₹{order.total?.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#52635a' }}>
                      {order.deliveryMethod === 'DELIVERY' ? 'Home Delivery' : 'Farm Pickup'} • {order.paymentStatus}
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                {!isCancelled ? (
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#fbfbf9', borderRadius: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}>
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div
                            key={step.key}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              position: 'relative',
                              zIndex: 2,
                              flex: 1
                            }}
                          >
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: isCompleted ? '#E3266F' : '#ffffff',
                              border: `2px solid ${isCompleted ? '#E3266F' : '#ebe7dc'}`,
                              color: isCompleted ? '#ffffff' : '#7e9187',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                              boxShadow: isCurrent ? '0 0 0 4px rgba(227, 38, 111, 0.25)' : 'none'
                            }}>
                              {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                            </div>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: isCurrent ? 800 : 500,
                              color: isCurrent ? '#081c15' : '#7e9187',
                              marginTop: '6px',
                              textAlign: 'center'
                            }}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fee2e2',
                    borderRadius: '10px',
                    color: '#991b1b',
                    fontSize: '13px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <XCircle size={16} /> This order was {order.status.toLowerCase()} ({order.cancellationReason || 'No reason provided'}).
                  </div>
                )}

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {order.items?.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#fbfbf9',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#081c15' }}>{item.nameSnapshot}</strong>
                        <span style={{ color: '#52635a', marginLeft: '6px' }}>
                          x {item.quantity} {item.unitSnapshot}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, color: '#18231e' }}>
                        ₹{((item.priceSnapshot || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery details & cancellation action */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid #f5f4ee',
                  fontSize: '12px',
                  color: '#52635a',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  {order.deliveryAddress ? (
                    <div>
                      <strong>Delivery to:</strong> {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                    </div>
                  ) : (
                    <div><strong>Method:</strong> Farm Pickup directly at agricultural facility</div>
                  )}

                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      disabled={cancellingId === order._id}
                      style={{
                        color: '#ef4444',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #fecaca'
                      }}
                    >
                      {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
