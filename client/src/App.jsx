import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ClerkWrapper from './components/ClerkWrapper';
import DemoBanner from './components/DemoBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import NotificationDrawer from './components/NotificationDrawer';
import AIAssistantWidget from './components/AIAssistantWidget';

// Pages
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import ConsumerDashboard from './pages/ConsumerDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';

function MainApp() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [marketplaceParams, setMarketplaceParams] = useState({});
  const [authParams, setAuthParams] = useState({ mode: 'login' });

  const handleNavigate = (page, params = {}) => {
    if (page === 'login') {
      setActivePage('auth');
      setAuthParams({ mode: 'login', ...params });
    } else if (page === 'register') {
      setActivePage('auth');
      setAuthParams({ mode: 'register', ...params });
    } else if (page === 'auth') {
      setActivePage('auth');
      setAuthParams(params.mode ? params : { mode: 'login', ...params });
    } else {
      setActivePage(page);
    }
    if (page === 'marketplace') {
      setMarketplaceParams(params);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleOrderSuccess = () => {
    if (user?.role === 'CONSUMER') {
      setActivePage('consumer-dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1-Click Academic Evaluation Demo Banner */}
      <DemoBanner onNavigate={handleNavigate} />

      {/* Main Navigation Header */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Main Body Pages */}
      <main style={{ flex: 1 }}>
        {activePage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'marketplace' && (
          <MarketplacePage
            initialCategory={marketplaceParams.category}
            initialSearch={marketplaceParams.search}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'consumer-dashboard' && (
          <ConsumerDashboard onNavigate={handleNavigate} />
        )}

        {activePage === 'farmer-dashboard' && (
          <FarmerDashboard onNavigate={handleNavigate} />
        )}

        {activePage === 'admin-dashboard' && (
          <AdminDashboard />
        )}

        {activePage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {activePage === 'auth' && (
          <AuthPage
            initialMode={authParams.mode || 'login'}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Drawers and Modals */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        onNavigate={handleNavigate}
        onOrderSuccess={handleOrderSuccess}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <AIAssistantWidget />
    </div>
  );
}

export default function App() {
  return (
    <ClerkWrapper>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </ClerkWrapper>
  );
}
