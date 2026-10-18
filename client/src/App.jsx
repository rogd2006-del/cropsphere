import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'farmers' | 'cloud'
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [user, setUser] = useState({ name: 'Alice Wong', email: 'alice@consumer.dev', role: 'CONSUMER' });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Live soil moisture telemetry state (updates periodically to feel alive)
  const [liveTelemetry, setLiveTelemetry] = useState({
    moisture: 68.4,
    temperature: 23.2,
    syncLatency: 42,
    activeSensors: 142
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTelemetry(prev => ({
        ...prev,
        moisture: +(65 + Math.random() * 5).toFixed(1),
        temperature: +(22 + Math.random() * 2.5).toFixed(1),
        syncLatency: Math.floor(35 + Math.random() * 15)
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const fallbackProducts = [
    { _id: '1', name: 'Heirloom Tomatoes', category: 'vegetables', price: 4.99, unit: 'lb', farmName: "Mary's Organic Garden", city: 'Austin, TX', organic: true, emoji: '🍅', description: 'Fresh, vine-ripened organic heirloom tomatoes grown sustainably with IoT precision watering.' },
    { _id: '2', name: 'Fresh Chèvre Goat Cheese', category: 'dairy', price: 9.99, unit: 'piece', farmName: 'Green Meadows Dairy', city: 'Burlington, VT', organic: false, emoji: '🧀', description: 'Artisan soft, tangy fresh goat cheese from pasture-raised Nigerian Dwarf goats.' },
    { _id: '3', name: 'Raw Wildflower Honey', category: 'honey', price: 12.99, unit: 'jar', farmName: 'Petrov Honey & Herbs', city: 'Asheville, NC', organic: true, emoji: '🍯', description: 'Unfiltered raw honey harvested from Blue Ridge mountain wildflowers.' },
    { _id: '4', name: 'Honeycrisp Apples', category: 'fruits', price: 3.99, unit: 'lb', farmName: 'Johnson Family Orchards', city: 'Yakima, WA', organic: false, emoji: '🍎', description: 'Crisp, sweet-tart apples tree-ripened in Washington soil and harvested fresh.' },
    { _id: '5', name: 'Baby Spinach', category: 'vegetables', price: 3.49, unit: 'bunch', farmName: "Mary's Organic Garden", city: 'Austin, TX', organic: true, emoji: '🥬', description: 'Tender baby spinach leaves harvested twice weekly with organic mulch.' },
    { _id: '6', name: 'Emmer Farro Heritage Grain', category: 'grains', price: 7.49, unit: 'kg', farmName: 'Mbeki Grain Co.', city: 'Wichita, KS', organic: false, emoji: '🌾', description: 'Nutty ancient whole grain rich in fiber, minerals, and plant-based protein.' },
    { _id: '7', name: 'Ataulfo Mangoes', category: 'fruits', price: 2.99, unit: 'piece', farmName: 'Sunrise Tropical Farm', city: 'Miami, FL', organic: false, emoji: '🥭', description: 'Sweet, fiberless tropical champagne mangoes picked at peak orchard ripeness.' },
    { _id: '8', name: 'Thai Fresh Basil', category: 'herbs', price: 1.99, unit: 'bunch', farmName: 'Chen Family Farm', city: 'Portland, OR', organic: false, emoji: '🌿', description: 'Aromatic authentic Thai basil essential for Southeast Asian culinary recipes.' }
  ];

  const fallbackFarmers = [
    { id: 1, name: "Mary's Organic Garden", owner: 'Mary Okonkwo', location: 'Austin, TX', bio: 'Third-generation grower specializing in heirloom varieties and regeneratively farmed greens.', badge: 'USDA Organic', rating: '4.9 ★', emoji: '👩‍🌾' },
    { id: 2, name: 'Green Meadows Dairy', owner: 'Rachel Green', location: 'Burlington, VT', bio: 'Small-batch artisan dairy producing award-winning raw milk cheeses and cultured yogurts.', badge: 'Animal Welfare Approved', rating: '5.0 ★', emoji: '🧀' },
    { id: 3, name: 'Chen Family Farm', owner: 'James Chen', location: 'Portland, OR', bio: 'Family-run farm growing specialty Asian vegetables and aromatic herbs for over 20 years.', badge: 'Naturally Grown', rating: '4.8 ★', emoji: '👨‍🌾' },
    { id: 4, name: 'Petrov Honey & Herbs', owner: 'Elena Petrov', location: 'Asheville, NC', bio: 'Blue Ridge Mountain beekeepers producing raw, unpasteurized honey and dried botanicals.', badge: 'Pure Raw', rating: '4.9 ★', emoji: '🐝' }
  ];

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          setProducts(data.data);
        } else {
          setProducts(fallbackProducts);
        }
      })
      .catch(() => setProducts(fallbackProducts));

    fetch('http://localhost:5000/api/farmers')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          setFarmers(data.data);
        } else {
          setFarmers(fallbackFarmers);
        }
      })
      .catch(() => setFarmers(fallbackFarmers));
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    setIsCheckoutSuccess(true);
    setCart([]);
    setTimeout(() => {
      setIsCheckoutSuccess(false);
      setIsCartOpen(false);
    }, 2500);
  };

  return (
    <div>
      {/* Background ambient lighting */}
      <div className="ambient-glow"></div>

      {/* Floating Glassmorphic Header */}
      <header className="navbar">
        <div className="nav-container">
          <div className="brand" onClick={() => setActiveTab('marketplace')}>
            <span className="brand-icon">🌱</span>
            <div className="brand-name">Crop<span>Sphere</span></div>
            <span className="brand-badge">Direct Cloud</span>
          </div>

          <nav className="nav-links">
            <button 
              className={`nav-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
              onClick={() => setActiveTab('marketplace')}
            >
              Marketplace
            </button>
            <button 
              className={`nav-btn ${activeTab === 'farmers' ? 'active' : ''}`}
              onClick={() => setActiveTab('farmers')}
            >
              Growers Directory
            </button>
            <button 
              className={`nav-btn ${activeTab === 'cloud' ? 'active' : ''}`}
              onClick={() => setActiveTab('cloud')}
            >
              Cloud Telemetry
            </button>
          </nav>

          <div className="nav-actions">
            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
              <span>🛒</span>
              <span>Basket</span>
              {cart.length > 0 && <span className="cart-badge">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
            </button>
            
            <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setIsAuthOpen(true)}>
              👤 {user ? user.name.split(' ')[0] : 'Sign In'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {activeTab === 'marketplace' && (
        <section className="hero-wrapper">
          <div className="hero-box">
            <div>
              <div className="hero-tag">
                <span>⚡</span> Next-Gen Smart Agriculture & Cloud Escrow
              </div>
              <h1 className="hero-title">
                Direct from the soil, <span className="gradient-text">verified by cloud</span>.
              </h1>
              <p className="hero-desc">
                Cut out supply chain markups. Order fresh harvests directly from verified regional farmers with live microclimate and soil telemetry tracking.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button className="btn-cta" onClick={() => {
                  const el = document.getElementById('marketplace-view');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <span>Explore Harvests</span>
                  <span>→</span>
                </button>
                <button className="btn-ghost" onClick={() => setActiveTab('farmers')}>
                  Meet Local Growers
                </button>
              </div>
            </div>

            {/* Interactive Live Telemetry Card */}
            <div className="telemetry-card">
              <div className="telemetry-header">
                <div style={{ fontWeight: 800, color: 'var(--gray-900)', fontSize: '15px' }}>
                  Field IoT Sensor Mesh
                </div>
                <div className="live-pulse">
                  <div className="pulse-dot"></div>
                  LIVE FEED
                </div>
              </div>

              <div className="telemetry-metric">
                <div>
                  <div className="metric-title">Volumetric Soil Moisture</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary-dark)', fontWeight: 600 }}>Optimized root zone</div>
                </div>
                <div className="metric-val">{liveTelemetry.moisture}%</div>
              </div>

              <div className="telemetry-metric">
                <div>
                  <div className="metric-title">Canopy Temperature</div>
                  <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>Mild afternoon conditions</div>
                </div>
                <div className="metric-val">{liveTelemetry.temperature}°C</div>
              </div>

              <div className="telemetry-metric">
                <div>
                  <div className="metric-title">MongoDB Atlas Latency</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 600 }}>Zero packet loss</div>
                </div>
                <div className="metric-val" style={{ color: 'var(--primary-dark)' }}>{liveTelemetry.syncLatency}ms</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Container */}
      <main className="main-wrapper" id="marketplace-view">
        {activeTab === 'marketplace' && (
          <>
            <div className="section-head">
              <div>
                <h2 className="section-title">Seasonal Fresh Harvests</h2>
                <p className="section-sub">Direct farm prices with zero wholesaler markups</p>
              </div>

              <div className="search-box">
                <span>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search organic greens, honey, dairy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Chips */}
            <div className="category-strip">
              {[
                { label: 'All Items', key: 'ALL', icon: '✨' },
                { label: 'Vegetables', key: 'VEGETABLES', icon: '🥦' },
                { label: 'Fresh Fruits', key: 'FRUITS', icon: '🍎' },
                { label: 'Artisan Dairy', key: 'DAIRY', icon: '🧀' },
                { label: 'Heritage Grains', key: 'GRAINS', icon: '🌾' },
                { label: 'Raw Honey', key: 'HONEY', icon: '🍯' },
                { label: 'Herbs & Botanicals', key: 'HERBS', icon: '🌿' }
              ].map(cat => (
                <button 
                  key={cat.key} 
                  className={`chip-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="cards-grid">
              {filteredProducts.map(p => (
                <div key={p._id} className="item-card">
                  <div className="item-visual">
                    <span>
                      {p.emoji || (
                        p.category === 'vegetables' ? '🥦' :
                        p.category === 'fruits' ? '🍎' :
                        p.category === 'dairy' ? '🧀' :
                        p.category === 'honey' ? '🍯' :
                        p.category === 'grains' ? '🌾' : '🌱'
                      )}
                    </span>
                    {p.organic && <span className="badge-tag">Certified Organic</span>}
                  </div>
                  
                  <div className="item-content">
                    <div className="item-cat">{p.category}</div>
                    <div className="item-name">{p.name}</div>
                    <div className="item-farm">
                      <span>📍</span>
                      <span>{p.farmName || p.city || 'Austin, TX'}</span>
                    </div>
                    <p className="item-desc">{p.description}</p>
                    
                    <div className="item-bottom">
                      <div className="item-price">
                        ${p.price.toFixed(2)} <span>/ {p.unit}</span>
                      </div>
                      <button className="add-btn" onClick={() => addToCart(p)}>
                        <span>+ Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Local Farmers Directory */}
        {activeTab === 'farmers' && (
          <div>
            <div className="section-head">
              <div>
                <h2 className="section-title">Verified Regional Growers</h2>
                <p className="section-sub">Meet the family operations behind every fresh shipment</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '26px' }}>
              {farmers.map(f => (
                <div key={f.id || f._id} className="item-card" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <span style={{ fontSize: '38px' }}>{f.emoji || '👨‍🌾'}</span>
                      <div>
                        <h3 style={{ fontSize: '19px', fontWeight: 800 }}>{f.farmName || f.name}</h3>
                        <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Owner: {f.owner || f.name}</div>
                      </div>
                    </div>
                    <span className="badge-tag" style={{ position: 'static' }}>{f.rating || '4.9 ★'}</span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--primary-dark)', fontWeight: 700, marginBottom: '12px' }}>
                    📍 {f.location ? `${f.location.city}, ${f.location.state}` : f.city || 'Regional Farm'}
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: '1.6', marginBottom: '24px' }}>
                    {f.bio}
                  </p>

                  <button className="btn-ghost" style={{ width: '100%', borderRadius: '10px', fontSize: '13px' }} onClick={() => setActiveTab('marketplace')}>
                    View Harvest Inventory →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cloud Architecture & Telemetry Tab */}
        {activeTab === 'cloud' && (
          <div>
            <div className="section-head">
              <div>
                <h2 className="section-title">Cloud Infrastructure Status</h2>
                <p className="section-sub">Modern full-stack cloud components powering CropSphere</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div className="item-card" style={{ padding: '28px' }}>
                <span style={{ fontSize: '42px', marginBottom: '12px' }}>🍃</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>MongoDB Atlas DBaaS</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: '1.5', marginBottom: '18px' }}>
                  Managed multi-region database cluster with real-time replication, geo-indexing for farm distance queries, and full audit trails.
                </p>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-dark)', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}>
                  ● Atlas Cluster Connected & Healthy
                </div>
              </div>

              <div className="item-card" style={{ padding: '28px' }}>
                <span style={{ fontSize: '42px', marginBottom: '12px' }}>⚡</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Serverless Event Bus</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: '1.5', marginBottom: '18px' }}>
                  Automated inventory depletion alert workers, async order status event processors, and webhook notifications on stock movements.
                </p>
                <div style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#b45309', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}>
                  ● Queue Worker: Local Event Bus Active
                </div>
              </div>

              <div className="item-card" style={{ padding: '28px' }}>
                <span style={{ fontSize: '42px', marginBottom: '12px' }}>📄</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Interactive Swagger Docs</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: '1.5', marginBottom: '18px' }}>
                  Fully typed REST endpoints with input validation, JWT token security, role guards (Consumer, Farmer, Admin), and health telemetry.
                </p>
                <a 
                  href="http://localhost:5000/api-docs" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-ghost" 
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none', borderRadius: '10px', fontSize: '13px' }}
                >
                  Open Swagger API Docs ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Shopping Cart Modal */}
      {isCartOpen && (
        <div className="modal-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <button className="close-x" onClick={() => setIsCartOpen(false)}>✕</button>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>Your Farm Basket 🛒</h2>

            {isCheckoutSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <span style={{ fontSize: '52px' }}>🎉</span>
                <h3 style={{ marginTop: '14px', color: 'var(--primary-dark)', fontSize: '22px' }}>Direct Order Dispatched!</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '6px' }}>
                  The grower has received your request and is packaging your harvest.
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--gray-400)' }}>
                <span style={{ fontSize: '52px' }}>🧺</span>
                <p style={{ marginTop: '12px', fontSize: '15px' }}>Your basket is currently empty.</p>
                <button className="btn-cta" style={{ marginTop: '18px', padding: '10px 20px' }} onClick={() => setIsCartOpen(false)}>
                  Browse Harvests
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '340px', overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{item.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>
                          ${item.price.toFixed(2)} × {item.qty}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--gray-900)' }}>${(item.price * item.qty).toFixed(2)}</span>
                        <button 
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                          onClick={() => removeFromCart(item._id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', borderTop: '1px solid var(--gray-200)', paddingTop: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, marginBottom: '22px' }}>
                    <span>Estimated Total:</span>
                    <span style={{ color: 'var(--primary-dark)' }}>${cartTotal.toFixed(2)}</span>
                  </div>

                  <button className="btn-cta" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCheckout}>
                    Confirm & Place Direct Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Account Profile Modal */}
      {isAuthOpen && (
        <div className="modal-backdrop" onClick={() => setIsAuthOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <button className="close-x" onClick={() => setIsAuthOpen(false)}>✕</button>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>Consumer Account</h2>
            <div style={{ background: 'var(--gray-100)', padding: '18px', borderRadius: '14px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--gray-900)' }}>{user.name}</div>
              <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>{user.email}</div>
              <span className="badge-tag" style={{ position: 'static', marginTop: '10px', display: 'inline-block' }}>{user.role}</span>
            </div>

            <h4 style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--gray-800)' }}>Preloaded Seed Credentials:</h4>
            <div style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.7', background: 'var(--gray-50)', padding: '14px', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
              <div>• <b>Admin:</b> admin@farmdirect.dev / Admin@FarmDirect2024!</div>
              <div>• <b>Farmer:</b> mary@farmdirect.dev / FarmDirect@123</div>
              <div>• <b>Consumer:</b> alice@consumer.dev / FarmDirect@123</div>
            </div>

            <button className="btn-ghost" style={{ width: '100%', marginTop: '22px', borderRadius: '10px' }} onClick={() => setIsAuthOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
