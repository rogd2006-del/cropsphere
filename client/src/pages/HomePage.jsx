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
                e.currentTarget.style.borderColor = '#E3266F';
                e.currentTarget.style.backgroundColor = '#FDF0F5';
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

      {/* How FarmDirect Cloud Works (4 Steps with Pink Connecting Arrows) */}
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
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            position: 'relative',
            alignItems: 'stretch'
          }}>
            {/* Step 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '28px 18px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--raspberry-subtle)',
                  color: 'var(--raspberry-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '20px',
                  fontWeight: 800
                }}>
                  1
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--amazon-900)' }}>Farmers Harvest & List</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Local farmers set their own transparent prices and upload current stock quantities with harvest dates.
                </p>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--raspberry-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                Next <ArrowRight size={14} color="var(--raspberry-primary)" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '28px 18px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--raspberry-subtle)',
                  color: 'var(--raspberry-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '20px',
                  fontWeight: 800
                }}>
                  2
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--amazon-900)' }}>Consumers Discover</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Browse produce by freshness, organic status, distance, or farm story with complete origin transparency.
                </p>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--raspberry-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                Next <ArrowRight size={14} color="var(--raspberry-primary)" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ textAlign: 'center', padding: '28px 18px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--raspberry-subtle)',
                  color: 'var(--raspberry-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '20px',
                  fontWeight: 800
                }}>
                  3
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--amazon-900)' }}>Cloud Event Queue</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Serverless FaaS functions automatically process orders, decrement inventory, and notify farmers in real time.
                </p>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--raspberry-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                Next <ArrowRight size={14} color="var(--raspberry-primary)" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ textAlign: 'center', padding: '28px 18px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--raspberry-subtle)',
                  color: 'var(--raspberry-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '20px',
                  fontWeight: 800
                }}>
                  4
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--amazon-900)' }}>Pickup or Direct Delivery</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Collect your order at scheduled farm pickup locations or receive chilled front-door delivery.
                </p>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--raspberry-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                Complete <CheckCircle2 size={14} color="var(--raspberry-primary)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Computing Architecture Callout */}
      <section className="container">
        <div style={{
          background: 'linear-gradient(135deg, var(--amazon-900) 0%, var(--amazon-800) 100%)',
          borderRadius: '24px',
          padding: '48px',
          color: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '36px',
          alignItems: 'center',
          boxShadow: '0 20px 40px rgba(6, 28, 18, 0.2)'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'rgba(217, 36, 106, 0.2)',
              borderRadius: '999px',
              color: 'var(--raspberry-light)',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              <Cloud size={14} /> Cloud Architecture Demonstration
            </div>
            <h2 style={{ fontSize: '32px', color: '#ffffff', fontWeight: 800, marginBottom: '14px', lineHeight: 1.2 }}>
              Explore the Four Cloud Service Models
            </h2>
            <p style={{ color: 'var(--cannoli-cream)', opacity: 0.9, fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              FarmDirect Cloud was purpose-built to prove how real enterprise agricultural logistics run across IaaS Virtual Machines, PaaS APIs, SaaS web frontends, and FaaS serverless event pipelines.
            </p>
            <button
              onClick={() => onNavigate('cloud')}
              className="btn btn-primary"
              style={{
                background: 'var(--raspberry-primary)',
                color: '#ffffff',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(217, 36, 106, 0.35)'
              }}
            >
              Open Cloud Architecture Dashboard <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge" style={{ background: 'var(--raspberry-primary)', color: '#ffffff' }}>IaaS</span>
              <span style={{ fontSize: '13px', color: 'var(--cannoli-cream)' }}>Ubuntu Linux VM with systemd Process Guardian</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge" style={{ background: 'var(--raspberry-primary)', color: '#ffffff' }}>PaaS</span>
              <span style={{ fontSize: '13px', color: 'var(--cannoli-cream)' }}>Managed Express REST API with Health & Metrics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge" style={{ background: 'var(--raspberry-primary)', color: '#ffffff' }}>SaaS</span>
              <span style={{ fontSize: '13px', color: 'var(--cannoli-cream)' }}>Browser-Hosted Consumer & Farmer Portal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge" style={{ background: 'var(--raspberry-primary)', color: '#ffffff' }}>FaaS</span>
              <span style={{ fontSize: '13px', color: 'var(--cannoli-cream)' }}>OrderEventProcessor & InventoryAlertProcessor</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge" style={{ background: 'var(--raspberry-primary)', color: '#ffffff' }}>DBaaS</span>
              <span style={{ fontSize: '13px', color: 'var(--cannoli-cream)' }}>MongoDB Atlas Multi-Shard Cloud Cluster</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Seasonal Produce moved to the very last section */}
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
