import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ArrowRight
} from 'lucide-react';

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Razorpay Checkout. Check your connection and try again.'));
    document.body.appendChild(script);
  });
}

export default function CartDrawer({ onOrderSuccess, onNavigate }) {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    total,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchServerCart,
  } = useCart();
  const { user, logout } = useAuth();

  const [deliveryMethod, setDeliveryMethod] = useState('DELIVERY');
  const [addressLine, setAddressLine] = useState('42 Harvest Way, Apt 3B');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('78701');
  const [notes, setNotes] = useState('Leave on front porch in shade');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);
  const [gatewayMode, setGatewayMode] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);

  if (!cartDrawerOpen) return null;

  const verifyPaymentAndPlaceOrder = async ({ orderPayload, payment }) => {
    const res = await api.createOrder({
      ...orderPayload,
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
      razorpaySignature: payment.razorpay_signature,
    });
    if (!res.success) throw new Error(res.message || 'Could not verify the Razorpay payment.');

    const placedOrder = Array.isArray(res.data) ? res.data[0] : res.data;
    setSuccessOrder(placedOrder || { orderNumber: 'FD-CONFIRMED' });
    setPendingPayment(null);
    clearCart();
    if (onOrderSuccess) onOrderSuccess(res.data);
  };

  const handleCheckout = async () => {
    if (!user) {
      setError('Please sign in as a Consumer to complete checkout.');
      return;
    }
    if (user.role !== 'CONSUMER') {
      setError(`Your current account is ${user.role}. Please switch to a Consumer account to place orders.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? {
          line1: addressLine,
          city,
          state,
          zipCode: zip,
          country: 'US',
        } : undefined,
        notes,
      };

      if (pendingPayment) {
        await verifyPaymentAndPlaceOrder(pendingPayment);
        return;
      }

      const paymentOrderResponse = await api.createRazorpayOrder({ deliveryMethod });
      if (!paymentOrderResponse.success || !paymentOrderResponse.data) {
        throw new Error(paymentOrderResponse.message || 'Could not start Razorpay Checkout.');
      }
      const paymentOrder = paymentOrderResponse.data;
      setGatewayMode(paymentOrder.mode);

      if (paymentOrder.amount !== Math.round(total * 100)) {
        await fetchServerCart();
        throw new Error('Cart prices changed. Review the refreshed cart total and try checkout again.');
      }

      await loadRazorpayCheckout();
      const payment = await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: 'FarmDirect',
          description: 'Farm marketplace order',
          order_id: paymentOrder.orderId,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || '',
          },
          theme: { color: '#E3266F' },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled. No order was placed.')),
          },
          handler: resolve,
        });
        checkout.on('payment.failed', response => {
          reject(new Error(response.error?.description || 'Razorpay could not complete the payment.'));
        });
        checkout.open();
      });

      const verification = { orderPayload, payment };
      setPendingPayment(verification);
      try {
        await verifyPaymentAndPlaceOrder(verification);
      } catch {
        setError('Razorpay returned a payment response, but order confirmation is pending. Retry confirmation below; do not pay again.');
      }
    } catch (err) {
      setError(err.message || 'Checkout failed. Please check stock and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => setCartDrawerOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 28, 21, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #ebe7dc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fbfbf9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#FDF0F5',
              color: '#E3266F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#081c15' }}>Your Harvest Cart</h3>
              <div style={{ fontSize: '12px', color: '#52635a' }}>{itemCount} fresh farm items</div>
            </div>
          </div>

          <button
            onClick={() => setCartDrawerOpen(false)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7e9187'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {successOrder ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FDF0F5',
                color: '#E3266F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#081c15', marginBottom: '8px' }}>
                Order Confirmed!
              </h3>
              <p style={{ fontSize: '14px', color: '#52635a', marginBottom: '16px' }}>
                Thank you! Your payment was confirmed by Razorpay and your order has been placed.
              </p>
              <div style={{
                background: '#fbfbf9',
                border: '1px solid #ebe7dc',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '12px', color: '#7e9187' }}>Order Reference:</div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#E3266F' }}>
                  {successOrder.orderNumber || 'FD-ORDER-SAVED'}
                </div>
                <div style={{ fontSize: '12px', color: '#52635a', marginTop: '6px', overflowWrap: 'anywhere' }}>
                  Razorpay payment: <strong style={{ color: '#0369a1' }}>{successOrder.paymentReference || 'Verified'}</strong>
                </div>
              </div>
              <button
                onClick={() => {
                  setSuccessOrder(null);
                  setCartDrawerOpen(false);
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 10px', color: '#7e9187' }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#081c15', marginBottom: '6px' }}>
                Your cart is empty
              </div>
              <p style={{ fontSize: '13px', color: '#52635a', marginBottom: '20px' }}>
                Discover crisp seasonal greens, heirloom fruits, and farm fresh dairy in our marketplace.
              </p>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Product items list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map(item => (
                  <div
                    key={item.productId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#fbfbf9',
                      borderRadius: '12px',
                      border: '1px solid #ebe7dc'
                    }}
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80'}
                      alt={item.name}
                      style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#081c15', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#52635a' }}>
                        ₹{item.price.toFixed(2)} / {item.unit}
                      </div>
                      <div style={{ fontSize: '11px', color: '#7e9187' }}>
                        {item.farmerName}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1px solid #ebe7dc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#18231e'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1px solid #ebe7dc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#18231e'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      style={{
                        padding: '6px',
                        color: '#ef4444',
                        background: 'transparent'
                      }}
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery method selector */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '8px' }}>
                  Fulfillment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => setDeliveryMethod('DELIVERY')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `2px solid ${deliveryMethod === 'DELIVERY' ? '#E3266F' : '#ebe7dc'}`,
                      background: deliveryMethod === 'DELIVERY' ? '#FDF0F5' : '#ffffff',
                      color: deliveryMethod === 'DELIVERY' ? '#E3266F' : '#52635a',
                      fontWeight: 600,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Truck size={15} /> Home Delivery
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('PICKUP')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `2px solid ${deliveryMethod === 'PICKUP' ? '#E3266F' : '#ebe7dc'}`,
                      background: deliveryMethod === 'PICKUP' ? '#FDF0F5' : '#ffffff',
                      color: deliveryMethod === 'PICKUP' ? '#E3266F' : '#52635a',
                      fontWeight: 600,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <MapPin size={15} /> Farm Pickup
                  </button>
                </div>
              </div>

              {/* Delivery Address fields */}
              {deliveryMethod === 'DELIVERY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#081c15' }}>
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={e => setAddressLine(e.target.value)}
                    placeholder="Street Address"
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '6px' }}>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="City"
                      className="input-field"
                      style={{ fontSize: '13px' }}
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="State"
                      className="input-field"
                      style={{ fontSize: '13px' }}
                    />
                    <input
                      type="text"
                      value={zip}
                      onChange={e => setZip(e.target.value)}
                      placeholder="Zip"
                      className="input-field"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                  Farmer Delivery Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Special instructions for farmers"
                  className="input-field"
                  style={{ fontSize: '13px' }}
                />
              </div>

              {/* Authentication check or Quick Switch helper */}
              {!user ? (
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '13px',
                  color: '#92400e'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Sign in required to checkout</div>
                  <p style={{ marginBottom: '10px' }}>
                    Sign in with your consumer account to continue checkout.
                  </p>
                  <button
                    onClick={() => {
                      setCartDrawerOpen(false);
                      onNavigate?.('login');
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Sign in to continue
                  </button>
                </div>
              ) : user.role !== 'CONSUMER' ? (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '13px',
                  color: '#991b1b'
                }}>
                  You are signed in as <strong>{user.role}</strong>. Sign in with a consumer account to place an order.
                  <button
                    onClick={async () => {
                      await logout();
                      setCartDrawerOpen(false);
                      onNavigate?.('login');
                    }}
                    style={{
                      display: 'block',
                      marginTop: '8px',
                      color: '#081c15',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    Sign in with a different account
                  </button>
                </div>
              ) : null}

              {error && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with totals and secure checkout */}
        {!successOrder && items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid #ebe7dc',
            backgroundColor: '#fbfbf9'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52635a' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52635a' }}>
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#E3266F' }}>FREE</strong> : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52635a' }}>
                <span>Sales Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '17px',
                color: '#081c15',
                borderTop: '1px solid #ebe7dc',
                paddingTop: '8px',
                marginTop: '4px'
              }}>
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{
              background: '#e0f2fe',
              color: '#0369a1',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px'
            }}>
              <CreditCard size={14} /> Secure checkout by Razorpay{gatewayMode === 'test' ? ' · Test mode' : ''}
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting
                ? (pendingPayment ? 'Confirming Payment...' : 'Opening Razorpay...')
                : pendingPayment
                  ? 'Retry Order Confirmation'
                  : `Pay with Razorpay — ₹${total.toFixed(2)}`}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
