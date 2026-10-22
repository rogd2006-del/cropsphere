import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Sprout,
  ShoppingBag,
  Bell,
  Cloud,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Store,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export default function Navbar({ activePage, onNavigate, onOpenNotifications }) {
  const { user, logout, unreadCount, setAuthModalOpen, setAuthModalMode } = useAuth();
  const { itemCount, setCartDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(251, 251, 249, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(45, 106, 79, 0.12)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Logo */}
        <div
          onClick={() => handleNav('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(45, 106, 79, 0.25)',
          }}>
            <Sprout size={24} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '20px',
              color: '#081c15',
              letterSpacing: '-0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              FarmDirect <span style={{ color: '#40916c', fontWeight: 600 }}>Cloud</span>
            </div>
            <div style={{
              fontSize: '11px',
              color: '#52635a',
              letterSpacing: '0.4px',
              fontWeight: 500,
              textTransform: 'uppercase'
            }}>
              Smart Cloud Marketplace
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }} className="desktop-nav">
          <button
            onClick={() => handleNav('home')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              color: activePage === 'home' ? '#1b4332' : '#52635a',
              background: activePage === 'home' ? '#edfbf1' : 'transparent',
              transition: 'all 0.15s'
            }}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('marketplace')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              color: activePage === 'marketplace' ? '#1b4332' : '#52635a',
              background: activePage === 'marketplace' ? '#edfbf1' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Store size={16} />
            Marketplace
          </button>


          <button
            onClick={() => handleNav('about')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              color: activePage === 'about' ? '#1b4332' : '#52635a',
              background: activePage === 'about' ? '#edfbf1' : 'transparent',
            }}
          >
            About & Rubric
          </button>
        </nav>

        {/* Right Actions: Notifications, Cart, User Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Notifications Button */}
          {user && (
            <button
              onClick={onOpenNotifications}
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1b4332',
                background: '#ffffff',
                border: '1px solid #ebe7dc',
                transition: 'all 0.15s'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 15px',
              borderRadius: '10px',
              backgroundColor: '#1b4332',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 4px 10px rgba(27, 67, 50, 0.2)',
              transition: 'all 0.15s'
            }}
          >
            <ShoppingBag size={18} />
            <span className="cart-text">Cart</span>
            {itemCount > 0 && (
              <span style={{
                background: '#52b788',
                color: '#081c15',
                fontSize: '12px',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '999px',
                marginLeft: '2px'
              }}>
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account / Login */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #ebe7dc',
                  color: '#18231e',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #52b788, #2d6a4f)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700
                }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="user-name" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <ChevronDown size={14} style={{ color: '#7e9187' }} />
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  width: '220px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  border: '1px solid #ebe7dc',
                  padding: '8px',
                  zIndex: 100,
                  animation: 'fadeIn 0.15s ease'
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f4f1ea' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#081c15' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#7e9187' }}>{user.email}</div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: user.role === 'ADMIN' ? '#fee2e2' : user.role === 'FARMER' ? '#edfbf1' : '#e0f2fe',
                      color: user.role === 'ADMIN' ? '#991b1b' : user.role === 'FARMER' ? '#1b4332' : '#0369a1'
                    }}>
                      {user.role} ROLE
                    </span>
                  </div>

                  {user.role === 'CONSUMER' && (
                    <button
                      onClick={() => handleNav('consumer-dashboard')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1b4332',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#edfbf1'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={16} /> My Orders & Profile
                    </button>
                  )}

                  {user.role === 'FARMER' && (
                    <button
                      onClick={() => handleNav('farmer-dashboard')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1b4332',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#edfbf1'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={16} /> Farmer Studio
                    </button>
                  )}

                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => handleNav('admin-dashboard')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#991b1b',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={16} /> Admin Command Center
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ef4444',
                      borderRadius: '6px',
                      borderTop: '1px solid #f4f1ea'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              }}
              className="btn btn-outline btn-sm"
              style={{
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '13px'
              }}
            >
              <User size={15} />
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              padding: '8px',
              borderRadius: '8px',
              display: 'none',
              color: '#18231e'
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #ebe7dc',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            onClick={() => handleNav('home')}
            style={{ textAlign: 'left', padding: '10px', fontWeight: 600, color: activePage === 'home' ? '#1b4332' : '#52635a' }}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('marketplace')}
            style={{ textAlign: 'left', padding: '10px', fontWeight: 600, color: activePage === 'marketplace' ? '#1b4332' : '#52635a' }}
          >
            Marketplace
          </button>
          <button
            onClick={() => handleNav('about')}
            style={{ textAlign: 'left', padding: '10px', fontWeight: 600, color: activePage === 'about' ? '#1b4332' : '#52635a' }}
          >
            About Project
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .cart-text { display: none !important; }
          .user-name { display: none !important; }
        }
      `}</style>
    </header>
  );
}
