import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, MapPin, Calendar, Award, CheckCircle2, AlertCircle, Plus, Minus, ShoppingBag } from 'lucide-react';

const FALLBACK_IMAGES = {
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
  grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  dairy: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80',
  herbs: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
  other: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
};

export default function ProductModal({ product, onClose }) {
  const { addToCart, setCartDrawerOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const farmName = product.farmerProfile?.farmName || product.farmerId?.name || 'Local Farm';
  const location = product.city && product.state ? `${product.city}, ${product.state}` : 'Certified Regional Harvest';
  const imageUrl = product.images?.[0] || FALLBACK_IMAGES[product.category] || FALLBACK_IMAGES.other;

  const handleAdd = (openDrawer = false) => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      if (openDrawer) {
        onClose();
        setCartDrawerOpen(true);
      }
    }, 400);
  };

  const harvestDateFormatted = product.harvestDate
    ? new Date(product.harvestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent seasonal harvest';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 28, 21, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #ebe7dc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#18231e',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <X size={18} />
        </button>

        {/* Media Left */}
        <div style={{
          backgroundColor: '#f5f4ee',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          minHeight: '320px',
          position: 'relative'
        }}>
          <img
            src={imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {product.organic && (
            <span style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: '#E3266F',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={13} /> Certified Organic
            </span>
          )}
        </div>

        {/* Content Right */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#E3266F',
            fontWeight: 600,
            fontSize: '13px',
            marginBottom: '6px'
          }}>
            <MapPin size={14} />
            <span>{farmName}</span>
            <span>•</span>
            <span>{location}</span>
          </div>

          <h2 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#081c15',
            marginBottom: '10px'
          }}>
            {product.name}
          </h2>

          <div style={{
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--raspberry-primary)',
            fontFamily: 'var(--font-heading)',
            marginBottom: '16px'
          }}>
            ${product.price.toFixed(2)}
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>
              per {product.unit}
            </span>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#52635a',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            {product.description || 'Harvested sustainably at peak ripeness with zero synthetic pesticides or post-harvest waxes. Sourced directly from our partner agricultural co-ops.'}
          </p>

          {/* Metadata Highlights */}
          <div style={{
            background: '#fbfbf9',
            border: '1px solid #ebe7dc',
            borderRadius: '14px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
            fontSize: '13px'
          }}>
            <div>
              <div style={{ color: '#7e9187', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> Harvest Date
              </div>
              <div style={{ fontWeight: 600, color: '#081c15', marginTop: '2px' }}>
                {harvestDateFormatted}
              </div>
            </div>

            <div>
              <div style={{ color: '#7e9187', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={13} /> Freshness
              </div>
              <div style={{ fontWeight: 600, color: '#081c15', marginTop: '2px', textTransform: 'capitalize' }}>
                {product.freshness?.replace('-', ' ') || 'Farm Fresh'}
              </div>
            </div>

            <div>
              <div style={{ color: '#7e9187' }}>Available Stock</div>
              <div style={{ fontWeight: 600, color: '#081c15', marginTop: '2px' }}>
                {product.stockQuantity} {product.unit}s
              </div>
            </div>

            <div>
              <div style={{ color: '#7e9187' }}>Category</div>
              <div style={{ fontWeight: 600, color: '#081c15', marginTop: '2px', textTransform: 'capitalize' }}>
                {product.category}
              </div>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#18231e' }}>Quantity:</span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1.5px solid #ebe7dc',
                borderRadius: '10px',
                padding: '4px'
              }}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#f5f4ee',
                    color: '#18231e'
                  }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: '0 16px', fontWeight: 700, fontSize: '15px' }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#f5f4ee',
                    color: '#18231e'
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <span style={{ fontSize: '13px', color: '#7e9187' }}>
                Total: ${(product.price * qty).toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleAdd(false)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '12px' }}
              >
                {added ? '✓ Added' : 'Add to Cart'}
              </button>

              <button
                onClick={() => handleAdd(true)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <ShoppingBag size={16} />
                Buy & Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
