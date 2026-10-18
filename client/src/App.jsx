import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'farmers' | 'orders'
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [user, setUser] = useState({ name: 'Alice Wong', email: 'alice@consumer.dev', role: 'CONSUMER' });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Fallback demo data in case backend server is paused or offline
  const fallbackProducts = [
    { _id: '1', name: 'Heirloom Tomatoes', category: 'vegetables', price: 4.99, unit: 'lb', farmName: "Mary's Organic Garden", city: 'Austin, TX', organic: true, emoji: '🍅', description: 'Fresh, vine-ripened organic heirloom tomatoes grown sustainably.' },
    { _id: '2', name: 'Fresh Chèvre Goat Cheese', category: 'dairy', price: 9.99, unit: 'piece', farmName: 'Green Meadows Dairy', city: 'Burlington, VT', organic: false, emoji: '🧀', description: 'Artisan soft, tangy fresh goat cheese from pasture-raised Nigerian Dwarf goats.' },
    { _id: '3', name: 'Raw Wildflower Honey', category: 'honey', price: 12.99, unit: 'jar', farmName: 'Petrov Honey & Herbs', city: 'Asheville, NC', organic: true, emoji: '🍯', description: 'Unfiltered raw honey harvested from Blue Ridge mountain wildflowers.' },
    { _id: '4', name: 'Honeycrisp Apples', category: 'fruits', price: 3.99, unit: 'lb', farmName: 'Johnson Family Orchards', city: 'Yakima, WA', organic: false, emoji: '🍎', description: 'Crisp, sweet-tart apples tree-ripened in Washington soil.' },
    { _id: '5', name: 'Baby Spinach', category: 'vegetables', price: 3.49, unit: 'bunch', farmName: "Mary's Organic Garden", city: 'Austin, TX', organic: true, emoji: '🥬', description: 'Tender baby spinach leaves harvested twice weekly.' },
    { _id: '6', name: 'Emmer Farro Heritage Grain', category: 'grains', price: 7.49, unit: 'kg', farmName: 'Mbeki Grain Co.', city: 'Wichita, KS', organic: false, emoji: '🌾', description: 'Nutty ancient whole grain rich in fiber and plant-based protein.' },
    { _id: '7', name: 'Ataulfo Mangoes', category: 'fruits', price: 2.99, unit: 'piece', farmName: 'Sunrise Tropical Farm', city: 'Miami, FL', organic: false, emoji: '🥭', description: 'Sweet, fiberless tropical champagne mangoes at peak ripeness.' },
    { _id: '8', name: 'Thai Fresh Basil', category: 'herbs', price: 1.99, unit: 'bunch', farmName: 'Chen Family Farm', city: 'Portland, OR', organic: false, emoji: '🌿', description: 'Aromatic authentic Thai basil essential for Southeast Asian culinary recipes.' }
  ];

  const fallbackFarmers = [
    { id: 1, name: "Mary's Organic Garden", owner: 'Mary Okonkwo', location: 'Austin, TX', bio: 'Specializing in heirloom varieties and regeneratively farmed greens.', badge: 'USDA Organic' },
    { id: 2, name: 'Green Meadows Dairy', owner: 'Rachel Green', location: 'Burlington, VT', bio: 'Small-batch artisan dairy producing award-winning raw milk cheeses.', badge: 'Animal Welfare Approved' },
    { id: 3, name: 'Chen Family Farm', owner: 'James Chen', location: 'Portland, OR', bio: 'Specialty Asian vegetables and aromatic herbs for over 20 years.', badge: 'Naturally Grown' },
    { id: 4, name: 'Petrov Honey & Herbs', owner: 'Elena Petrov', location: 'Asheville, NC', bio: 'Blue Ridge Mountain beekeepers producing raw, unpasteurized honey.', badge: 'Pure Raw' }
  ];

  // Fetch live products & farmers from the Express backend
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
      .catch(() => {
        setProducts(fallbackProducts);
      });

    fetch('http://localhost:5000/api/farmers')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          setFarmers(data.data);
        } else {
          setFarmers(fallbackFarmers);
        }
      })
      .catch(() => {
        setFarmers(fallbackFarmers);
      });
  }, []);

  // Filter products by category & search query
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
      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-container">
          <div className="brand" onClick={() => setActiveTab('marketplace')}>
            <span className="brand-icon">🌱</span>
            <span className="brand-name">FarmDirect</span>
            <span className="brand-badge">Cloud</span>
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
              Local Producers
            </button>
            <button 
              className={`nav-btn ${activeTab === 'cloud' ? 'active' : ''}`}
              onClick={() => setActiveTab('cloud')}
            >
              Cloud & Telemetry
            </button>
          </nav>

          <div className="nav-actions">
            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
              <span>🛒 Cart</span>
              {cart.length > 0 && <span className="cart-badge">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
            </button>
            
            <button className="btn-outline" onClick={() => setIsAuthOpen(true)}>
              👤 {user ? user.name : 'Sign In'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {activeTab === 'marketplace' && (
        <section className="hero">
          <div className="hero-inner">
            <div>
              <h1 className="hero-title">
                Fresh from local farms, <span>delivered direct</span> to your door.
              </h1>
              <p className="hero-desc">
                Support independent family growers. Cut out supermarket middlemen, reduce carbon footprints, and enjoy peak-fresh harvests powered by cloud transparency.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button className="btn-primary" onClick={() => {
                  const el = document.getElementById('browse-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Explore Fresh Harvests
                </button>
                <button className="btn-outline" onClick={() => setActiveTab('farmers')}>
                  Meet Our Farmers
                </button>
              </div>

              <div className="hero-stats">
                <div>
                  <div className="stat-num">100%</div>
                  <div className="stat-label">Transparent Sourcing</div>
                </div>
                <div>
                  <div className="stat-num">&lt; 48 hrs</div>
                  <div className="stat-label">Harvest to Delivery</div>
                </div>
                <div>
                  <div className="stat-num">8+</div>
                  <div className="stat-label">Regional Hubs</div>
                </div>
              </div>
            </div>

            <div className="hero-card">
              <h3 style={{ marginBottom: '12px' }}>🌿 Live Harvest Guarantee</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '20px' }}>
                Every product is traced with automated temperature and soil telemetry. Guaranteed non-GMO or certified organic straight from regional growers.
              </p>
              <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                  🚀 Free Express Delivery
                </div>
                <div style={{ fontSize: '13px', color: 'var(--gray-700)' }}>
                  On all farm-direct grocery baskets over $35.00
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="main-content" id="browse-section">
        {activeTab === 'marketplace' && (
          <>
            <div className="section-header">
              <div>
                <h2>Featured Fresh Produce</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Browse seasonal harvests sourced today</p>
              </div>

              <div className="search-bar">
                <span>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search tomatoes, honey, dairy, cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="filter-pills">
              {['ALL', 'VEGETABLES', 'FRUITS', 'DAIRY', 'GRAINS', 'HONEY', 'HERBS'].map(cat => (
                <button 
                  key={cat} 
                  className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Product Cards */}
            <div className="products-grid">
              {filteredProducts.map(p => (
                <div key={p._id} className="product-card">
                  <div className="product-img">
                    {p.emoji || (
                      p.category === 'vegetables' ? '🥦' :
                      p.category === 'fruits' ? '🍎' :
                      p.category === 'dairy' ? '🧀' :
                      p.category === 'honey' ? '🍯' :
                      p.category === 'grains' ? '🌾' : '🌱'
                    )}
                    {p.organic && <span className="product-badge">Organic</span>}
                  </div>
                  <div className="product-body">
                    <span className="product-category">{p.category}</span>
                    <h3 className="product-name">{p.name}</h3>
                    <div className="product-origin">
                      <span>📍</span> {p.farmName || p.city || 'Local Farm'}
                    </div>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-footer">
                      <div className="product-price">
                        ${p.price.toFixed(2)} <span>/ {p.unit}</span>
                      </div>
                      <button className="btn-primary" onClick={() => addToCart(p)}>
                        + Add
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
            <div className="section-header">
              <div>
                <h2>Partner Farmers & Producers</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Family-owned growers directly powering CropSphere</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {farmers.map(f => (
                <div key={f.id || f._id} className="hero-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px' }}>{f.farmName || f.name}</h3>
                      <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                        👤 Managed by {f.owner || f.name}
                      </div>
                    </div>
                    <span className="brand-badge">{f.badge || 'Verified Partner'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary)', fontWeight: 600, marginBottom: '12px' }}>
                    📍 {f.location ? `${f.location.city}, ${f.location.state}` : f.city || 'Austin, TX'}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--gray-700)', marginBottom: '16px' }}>
                    {f.bio}
                  </p>
                  <button className="btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('marketplace')}>
                    Browse Farm Inventory
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cloud Architecture & Telemetry Tab */}
        {activeTab === 'cloud' && (
          <div>
            <div className="section-header">
              <div>
                <h2>Cloud Architecture & IoT Telemetry</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Under the hood of FarmDirect's distributed cloud backend</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div className="hero-card">
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🍃</div>
                <h3>MongoDB Atlas DBaaS</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)', margin: '8px 0 16px' }}>
                  Managed multi-region database cluster with real-time replication, geo-indexing for local farm distance queries, and full audit trails.
                </p>
                <div style={{ background: 'var(--primary-light)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>
                  ● Status: Live & Connected
                </div>
              </div>

              <div className="hero-card">
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
                <h3>Serverless FaaS Pipelines</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)', margin: '8px 0 16px' }}>
                  Automated inventory depletion alert workers, async order status event processors, and webhook notifications on stock movements.
                </p>
                <div style={{ background: '#fef3c7', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#b45309', fontWeight: 700 }}>
                  ● Queue Service: Local Event Bus Active
                </div>
              </div>

              <div className="hero-card">
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📡</div>
                <h3>Swagger API Contracts</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)', margin: '8px 0 16px' }}>
                  Fully typed REST endpoints with input validation, JWT token security, role guards (Consumer, Farmer, Admin), and health telemetry.
                </p>
                <a 
                  href="http://localhost:5000/api-docs" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-outline" 
                  style={{ display: 'inline-block', textAlign: 'center', width: '100%', textDecoration: 'none' }}
                >
                  Open Swagger API Docs ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Shopping Cart Drawer Modal */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
            <h2 style={{ marginBottom: '20px' }}>Your Farm Basket 🛒</h2>

            {isCheckoutSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <span style={{ fontSize: '48px' }}>🎉</span>
                <h3 style={{ marginTop: '12px', color: 'var(--primary)' }}>Order Placed Successfully!</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '6px' }}>
                  The grower has received your request and is preparing the harvest.
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-500)' }}>
                <span style={{ fontSize: '48px' }}>🧺</span>
                <p style={{ marginTop: '12px' }}>Your basket is currently empty.</p>
                <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setIsCartOpen(false)}>
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                          ${item.price.toFixed(2)} × {item.qty}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700 }}>${(item.price * item.qty).toFixed(2)}</span>
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '16px' }}
                          onClick={() => removeFromCart(item._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', borderTop: '2px solid var(--gray-100)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
                    <span>Estimated Total:</span>
                    <span style={{ color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</span>
                  </div>

                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handleCheckout}>
                    Confirm & Place Direct Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth / Account Profile Modal */}
      {isAuthOpen && (
        <div className="modal-overlay" onClick={() => setIsAuthOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsAuthOpen(false)}>✕</button>
            <h2 style={{ marginBottom: '16px' }}>Consumer Account</h2>
            <div style={{ background: 'var(--gray-100)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{user.name}</div>
              <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>{user.email}</div>
              <span className="brand-badge" style={{ marginTop: '8px', display: 'inline-block' }}>{user.role}</span>
            </div>

            <h4 style={{ marginBottom: '8px' }}>Preloaded Seed Credentials:</h4>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)', lineHeight: '1.6', background: 'var(--gray-50)', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-300)' }}>
              <div>• <b>Admin:</b> admin@farmdirect.dev / Admin@FarmDirect2024!</div>
              <div>• <b>Farmer:</b> mary@farmdirect.dev / FarmDirect@123</div>
              <div>• <b>Consumer:</b> alice@consumer.dev / FarmDirect@123</div>
            </div>

            <button className="btn-primary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }} onClick={() => setIsAuthOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
