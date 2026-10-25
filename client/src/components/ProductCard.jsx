import React from 'react';
import { useCart } from '../context/CartContext';
import { Plus, Check, MapPin, Sparkles, AlertCircle } from 'lucide-react';

const FALLBACK_IMAGES = {
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
  grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  dairy: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
  herbs: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
  other: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
};

export default function ProductCard({ product, onSelect }) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = React.useState(false);

  const cartItem = items.find(i => i.productId === (product._id || product.id));
  const inCartQty = cartItem?.quantity || 0;

  const farmName = product.farmerProfile?.farmName || product.farmerId?.name || 'Local Farm';
  const location = product.city && product.state ? `${product.city}, ${product.state}` : 'Local Harvest';
  const imageUrl = product.images?.[0] || FALLBACK_IMAGES[product.category] || FALLBACK_IMAGES.other;

  const isLowStock = product.stockQuantity <= (product.lowStockThreshold || 15);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(8, 28, 21, 0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Top Media Container */}
      <div style={{ position: 'relative', height: '185px', backgroundColor: '#ebe7dc', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {product.organic && (
            <span className="badge badge-green" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              <Sparkles size={11} /> Organic
            </span>
          )}
          {product.freshness === 'very-fresh' && (
            <span className="badge badge-gold" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              Harvested Today
            </span>
          )}
        </div>

        {isLowStock && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(4px)'
          }}>
            <AlertCircle size={12} /> Only {product.stockQuantity} left
          </div>
        )}
      </div>

      {/* Content Container */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          fontSize: '12px',
          color: '#52635a',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '4px'
        }}>
          <MapPin size={12} style={{ color: '#E3266F' }} />
          <span>{farmName}</span>
          <span style={{ color: '#c2b9a1' }}>•</span>
          <span>{location}</span>
        </div>

        <h3 style={{
          fontSize: '17px',
          fontWeight: 700,
          color: '#081c15',
          marginBottom: '6px',
          lineHeight: '1.3'
        }}>
          {product.name}
        </h3>

        <p style={{
          fontSize: '13px',
          color: '#52635a',
          lineHeight: '1.45',
          marginBottom: '14px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}>
          {product.description || 'Locally harvested fresh agricultural produce straight from certified regional farmers.'}
        </p>

        {/* Pricing and Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #f5f4ee',
          marginTop: 'auto'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
              Price
            </div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: '#1b4332', fontFamily: 'var(--font-heading)' }}>
              ₹{product.price.toFixed(2)}
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#52635a', marginLeft: '2px' }}>
                /{product.unit}
              </span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              borderRadius: '10px'
            }}
          >
            {added ? (
              <>
                <Check size={15} /> Added
              </>
            ) : inCartQty > 0 ? (
              <>
                <Check size={14} /> ({inCartQty}) More
              </>
            ) : (
              <>
                <Plus size={15} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
