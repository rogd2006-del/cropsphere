import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  Search,
  Sprout,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Cloud,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Produce', icon: '🌿' },
  { id: 'vegetables', label: 'Vegetables', icon: '🥕' },
  { id: 'fruits', label: 'Fruits', icon: '🍎' },
  { id: 'grains', label: 'Grains & Flour', icon: '🌾' },
  { id: 'dairy', label: 'Artisan Dairy', icon: '🧀' },
  { id: 'herbs', label: 'Herbs & Botanicals', icon: '🌱' },
  { id: 'honey', label: 'Raw Honey', icon: '🍯' },
];

export default function HomePage({ onNavigate, onSelectProduct }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.getFeaturedProducts();
        if (res.success && res.data) {
          setFeaturedProducts(res.data.slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('marketplace', { search: searchQuery });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'radial-gradient(circle at 80% 20%, rgba(82, 183, 136, 0.15), transparent 50%), linear-gradient(180deg, #edfbf1 0%, #fbfbf9 100%)',
        paddingTop: '60px',
        paddingBottom: '80px',
        borderBottom: '1px solid #ebe7dc'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            {/* Left Copy */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: '#ffffff',
                border: '1px solid #b7e4c7',
                borderRadius: '999px',
                color: '#1b4332',
                fontWeight: 700,
                fontSize: '12px',
                marginBottom: '20px',
                boxShadow: '0 2px 6px rgba(45, 106, 79, 0.08)'
              }}>
                <Sparkles size={14} style={{ color: '#52b788' }} />
                Cloud-Native Smart Agricultural Marketplace
              </div>

              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 54px)',
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: '-1.5px',
                color: '#081c15',
                marginBottom: '20px'
              }}>
                Fresh harvest directly from <span style={{ color: '#2d6a4f' }}>local farms</span> to your table.
              </h1>

              <p style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: '#52635a',
                marginBottom: '30px',
                maxWidth: '540px'
              }}>
                Bypass traditional retail markups and support regenerative farmers with fresh produce, transparent pricing, and fast local harvest delivery.
              </p>

              {/* Search Box */}
              <form
                onSubmit={handleSearchSubmit}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #ebe7dc',
                  borderRadius: '16px',
                  padding: '6px 8px 6px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 25px rgba(8, 28, 21, 0.08)',
                  maxWidth: '540px',
                  marginBottom: '28px'
                }}
              >
                <Search size={20} style={{ color: '#52b788', flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search heirloom tomatoes, peaches, raw honey..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '15px',
                    color: '#081c15',
                    background: 'transparent'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 22px', borderRadius: '12px' }}
                >
                  Explore
                </button>
              </form>

              {/* Trust Metrics */}
              <div style={{
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap',
                paddingTop: '16px',
                borderTop: '1px solid #ebe7dc'
              }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1b4332' }}>8+</div>
                  <div style={{ fontSize: '12px', color: '#52635a' }}>Verified Local Farms</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1b4332' }}>100%</div>
                  <div style={{ fontSize: '12px', color: '#52635a' }}>Direct Farmer Revenue</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1b4332' }}>4 Tiers</div>
                  <div style={{ fontSize: '12px', color: '#52635a' }}>IaaS / PaaS / SaaS / FaaS</div>
                </div>
              </div>
            </div>

            {/* Right Graphic Banner */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: '28px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(8, 28, 21, 0.16)',
                border: '4px solid #ffffff'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=80"
                  alt="Organic Farm Harvest"
                  style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                />
              </div>

              {/* Floating Cloud Badge */}
              <div style={{
                position: 'absolute',
                bottom: '-16px',
                left: '20px',
                background: '#ffffff',
                border: '1px solid #ebe7dc',
                borderRadius: '16px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 12px 28px rgba(8, 28, 21, 0.12)'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#edfbf1',
                  color: '#2d6a4f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Cloud size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#081c15' }}>Cloud-Managed Logistics</div>
                  <div style={{ fontSize: '11px', color: '#52635a' }}>Automated FaaS Inventory Alerts & Queue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="container">
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none'
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate('marketplace', { category: cat.id === 'all' ? undefined : cat.id })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '14px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #ebe7dc',
                color: '#18231e',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#40916c';
                e.currentTarget.style.backgroundColor = '#edfbf1';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#ebe7dc';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Seasonal Produce */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#2d6a4f',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '4px'
            }}>
              Direct From Regional Harvests
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#081c15' }}>
              Seasonal Highlights
            </h2>
          </div>

          <button
            onClick={() => onNavigate('marketplace')}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '10px' }}
          >
            View All Marketplace Produce <ArrowRight size={15} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#7e9187' }}>
            Loading crisp produce from MongoDB Atlas...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {featuredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* How FarmDirect Works (4 Steps) */}
      <section style={{ backgroundColor: '#f5f4ee', padding: '70px 0', borderTop: '1px solid #ebe7dc', borderBottom: '1px solid #ebe7dc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Simple, Transparent, Decentralized
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#081c15', marginTop: '4px' }}>
              How FarmDirect Cloud Works
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: '#edfbf1',
                color: '#2d6a4f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '22px',
                fontWeight: 800
              }}>
                1
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Farmers Harvest & List</h3>
              <p style={{ fontSize: '13px', color: '#52635a', lineHeight: 1.5 }}>
                Local farmers set their own transparent prices and upload current stock quantities with harvest dates.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: '#edfbf1',
                color: '#2d6a4f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '22px',
                fontWeight: 800
              }}>
                2
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Consumers Discover</h3>
              <p style={{ fontSize: '13px', color: '#52635a', lineHeight: 1.5 }}>
                Browse produce by freshness, organic status, distance, or farm story with complete origin transparency.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: '#edfbf1',
                color: '#2d6a4f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '22px',
                fontWeight: 800
              }}>
                3
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Cloud Event Queue</h3>
              <p style={{ fontSize: '13px', color: '#52635a', lineHeight: 1.5 }}>
                Serverless FaaS functions automatically process orders, decrement inventory, and notify farmers in real time.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: '#edfbf1',
                color: '#2d6a4f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '22px',
                fontWeight: 800
              }}>
                4
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Pickup or Direct Delivery</h3>
              <p style={{ fontSize: '13px', color: '#52635a', lineHeight: 1.5 }}>
                Collect your order at scheduled farm pickup locations or receive chilled front-door delivery.
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
