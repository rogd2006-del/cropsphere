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

const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=80',
    alt: 'Organic Farm Harvest',
    caption: 'Cloud-Managed Fresh Produce Dispatch'
  },
  {
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
    alt: 'Local Farmers Market Stand',
    caption: 'Local Direct Farmer Network'
  },
  {
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=80',
    alt: 'Fresh Organic Berries & Greenery',
    caption: 'Real-time Cold Chain & Inventory Tracking'
  },
  {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
    alt: 'Lush Regenerative Farmland',
    caption: 'Sustainable Agriculture to Consumer Cloud'
  }
];

export default function HomePage({ onNavigate, onSelectProduct }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotate hero image every 3 seconds smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
        background: 'radial-gradient(circle at 80% 20%, rgba(227, 38, 111, 0.15), transparent 50%), linear-gradient(180deg, #FDF0F5 0%, #fbfbf9 100%)',
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
                border: '1px solid #F7A8C6',
                borderRadius: '999px',
                color: '#E3266F',
                fontWeight: 700,
                fontSize: '12px',
                marginBottom: '20px',
                boxShadow: '0 2px 6px rgba(227, 38, 111, 0.08)'
              }}>
                <Sparkles size={14} style={{ color: '#E3266F' }} />
                Cloud-Native Smart Agricultural Marketplace
              </div>

              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 54px)',
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: '-1.5px',
                color: 'var(--amazon-900)',
                marginBottom: '20px'
              }}>
                Fresh harvest directly from <span style={{ color: 'var(--raspberry-primary)' }}>local farms</span> to your table.
              </h1>

              <p style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: '#52635a',
                marginBottom: '30px',
                maxWidth: '540px'
              }}>
                Bypass traditional retail markups and support regenerative farmers. Powered by high-reliability cloud architecture across IaaS, PaaS, SaaS, and serverless FaaS event logistics.
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
                <Search size={20} style={{ color: '#E3266F', flexShrink: 0 }} />
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
                borderTop: '1px solid var(--cannoli-cream-dark)'
              }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--raspberry-primary)' }}>8+</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified Local Farms</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--raspberry-primary)' }}>100%</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Direct Farmer Revenue</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--raspberry-primary)' }}>4 Tiers</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>IaaS / PaaS / SaaS / FaaS</div>
                </div>
              </div>
            </div>

            {/* Right Graphic Banner */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(6, 28, 18, 0.16)',
                border: '4px solid #ffffff',
                height: '420px',
                position: 'relative',
                backgroundColor: 'var(--cannoli-cream-dark)'
              }}>
                {HERO_IMAGES.map((img, idx) => (
                  <img
                    key={img.url}
                    src={img.url}
                    alt={img.alt}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: idx === currentImageIndex ? 1 : 0,
                      transform: idx === currentImageIndex ? 'scale(1)' : 'scale(1.04)',
                      transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                ))}

                {/* Subtle Image Indicator Dots */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  display: 'flex',
                  gap: '6px',
                  background: 'rgba(6, 28, 18, 0.45)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 8px',
                  borderRadius: '999px',
                  zIndex: 2
                }}>
                  {HERO_IMAGES.map((_, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: idx === currentImageIndex ? '16px' : '6px',
                        height: '6px',
                        borderRadius: '999px',
                        backgroundColor: idx === currentImageIndex ? 'var(--raspberry-primary)' : 'rgba(255,255,255,0.6)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Cloud Badge */}
              <div style={{
                position: 'absolute',
                bottom: '-16px',
                left: '20px',
                background: '#ffffff',
                border: '1px solid var(--cannoli-cream-dark)',
                borderRadius: '16px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 12px 28px rgba(6, 28, 18, 0.12)',
                zIndex: 3
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--raspberry-wash)',
                  color: 'var(--raspberry-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Cloud size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--amazon-900)' }}>Cloud-Managed Logistics</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automated FaaS Inventory Alerts & Queue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How FarmDirect Cloud Works (4 Steps Connected with Pink Arrows) */}
      <section style={{ backgroundColor: 'var(--cannoli-cream-light)', padding: '70px 0', borderTop: '1px solid var(--cannoli-cream-dark)', borderBottom: '1px solid var(--cannoli-cream-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--raspberry-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Simple, Transparent, Decentralized
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--amazon-900)', marginTop: '4px' }}>
              How FarmDirect Cloud Works
            </h2>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            position: 'relative'
          }}>
            {/* Step 1 */}
            <div className="card" style={{ flex: '1 1 220px', minWidth: '220px', maxWidth: '280px', textAlign: 'center', padding: '28px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid var(--border-subtle)', boxShadow: '0 4px 14px rgba(6, 28, 18, 0.05)' }}>
              <div>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'var(--raspberry-subtle)',
                  color: 'var(--raspberry-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '22px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(227, 38, 111, 0.18)'
                }}>
                  1
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--amazon-900)' }}>Farmers Harvest & List</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Local farmers set their own transparent prices and upload current stock quantities with harvest dates.
                </p>
              </div>
            </div>

            {/* Connecting Pink Arrow 1 -> 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--raspberry-primary)',
              padding: '0 4px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--raspberry-subtle)',
                border: '1.5px solid var(--raspberry-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(227, 38, 111, 0.25)'
              }}>
                <ArrowRight size={20} color="var(--raspberry-primary)" strokeWidth={2.5} />
              </div>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ flex: '1 1 220px', minWidth: '220px', maxWidth: '280px', textAlign: 'center', padding: '28px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid var(--border-subtle)', boxShadow: '0 4px 14px rgba(6, 28, 18, 0.05)' }}>
              <div>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'var(--raspberry-subtle)',
                  color: 'var(--raspberry-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '22px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(227, 38, 111, 0.18)'
                }}>
                  2
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--amazon-900)' }}>Consumers Discover</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Browse produce by freshness, organic status, distance, or farm story with complete origin transparency.
                </p>
              </div>
            </div>

            {/* Connecting Pink Arrow 2 -> 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--raspberry-primary)',
              padding: '0 4px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--raspberry-subtle)',
                border: '1.5px solid var(--raspberry-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(227, 38, 111, 0.25)'
              }}>
                <ArrowRight size={20} color="var(--raspberry-primary)" strokeWidth={2.5} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ flex: '1 1 220px', minWidth: '220px', maxWidth: '280px', textAlign: 'center', padding: '28px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid var(--border-subtle)', boxShadow: '0 4px 14px rgba(6, 28, 18, 0.05)' }}>
              <div>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'var(--raspberry-subtle)',
                  color: 'var(--raspberry-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '22px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(227, 38, 111, 0.18)'
                }}>
                  3
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--amazon-900)' }}>Cloud Event Queue</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Serverless FaaS functions automatically process orders, decrement inventory, and notify farmers in real time.
                </p>
              </div>
            </div>

            {/* Connecting Pink Arrow 3 -> 4 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--raspberry-primary)',
              padding: '0 4px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--raspberry-subtle)',
                border: '1.5px solid var(--raspberry-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(227, 38, 111, 0.25)'
              }}>
                <ArrowRight size={20} color="var(--raspberry-primary)" strokeWidth={2.5} />
              </div>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ flex: '1 1 220px', minWidth: '220px', maxWidth: '280px', textAlign: 'center', padding: '28px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid var(--border-subtle)', boxShadow: '0 4px 14px rgba(6, 28, 18, 0.05)' }}>
              <div>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'var(--raspberry-subtle)',
                  color: 'var(--raspberry-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '22px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(227, 38, 111, 0.18)'
                }}>
                  4
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--amazon-900)' }}>Pickup or Direct Delivery</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Collect your order at scheduled farm pickup locations or receive chilled front-door delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Seasonal Produce & Category Pills under Seasonal Highlights */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--raspberry-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '4px'
            }}>
              Direct From Regional Harvests
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--amazon-900)' }}>
              Seasonal Highlights
            </h2>
          </div>

          <button
            onClick={() => onNavigate('marketplace')}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '10px', color: 'var(--raspberry-primary)', borderColor: 'var(--raspberry-primary)' }}
          >
            View All Marketplace Produce <ArrowRight size={15} color="var(--raspberry-primary)" />
          </button>
        </div>

        {/* Category Pills Bar positioned directly under Seasonal Highlights */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '20px',
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
                padding: '9px 16px',
                borderRadius: '14px',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--cannoli-cream-dark)',
                color: 'var(--amazon-900)',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--raspberry-primary)';
                e.currentTarget.style.backgroundColor = 'var(--raspberry-wash)';
                e.currentTarget.style.color = 'var(--raspberry-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--cannoli-cream-dark)';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = 'var(--amazon-900)';
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
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
    </div>
  );
}
