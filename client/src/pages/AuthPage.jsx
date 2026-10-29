import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import {
  Sprout,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Building,
  Phone,
  MapPin,
  AlertCircle,
  Truck,
  Leaf,
  Cloud
} from 'lucide-react';

export default function AuthPage({ initialMode = 'login', onNavigate }) {
  const { user, login, register, quickLogin, clerkBridge } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState('CONSUMER'); // 'CONSUMER' | 'FARMER'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // If user is already logged in, show an option or auto-redirect
  useEffect(() => {
    if (user && !submitting) {
      // User is authenticated
    }
  }, [user, submitting]);

  // Handle switching tabs
  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  // Quick fill demo accounts
  const handleFastFill = (roleKey) => {
    const acc = DEMO_ACCOUNTS[roleKey];
    if (acc) {
      setEmail(acc.email);
      setPassword(acc.password || 'Password123!');
      setMode('login');
      setError(null);
    }
  };

  // Direct 1-click login with demo role
  const handleInstantDemoLogin = async (roleKey) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await quickLogin(roleKey);
      if (res && res.success) {
        setSuccessMsg(`Logged in successfully as ${roleKey}! Redirecting...`);
        setTimeout(() => {
          if (roleKey === 'FARMER') onNavigate('farmer-dashboard');
          else if (roleKey === 'ADMIN') onNavigate('admin-dashboard');
          else onNavigate('marketplace');
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (role === 'FARMER' && !farmName.trim()) {
        setError('Farm or Orchard name is required for farmer accounts.');
        return;
      }
      if (!agreeTerms) {
        setError('You must accept the terms of service and privacy agreement.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res && res.success) {
          setSuccessMsg('Authentication successful! Directing to your workspace...');
          setTimeout(() => {
            const userRole = res.user?.role;
            if (userRole === 'FARMER') onNavigate('farmer-dashboard');
            else if (userRole === 'ADMIN') onNavigate('admin-dashboard');
            else onNavigate('marketplace');
          }, 600);
        }
      } else {
        const payload = {
          email: email.trim(),
          password,
          name: name.trim(),
          role,
          phone: phone.trim() || undefined,
          farmName: role === 'FARMER' ? farmName.trim() : undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
        };

        const res = await register(payload);
        if (res && res.success) {
          setSuccessMsg('Account created successfully! Welcome to FarmDirect Cloud.');
          setTimeout(() => {
            if (role === 'FARMER') onNavigate('farmer-dashboard');
            else onNavigate('marketplace');
          }, 700);
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(180deg, #FDF0F5 0%, #f0efe2 100%)',
      padding: '40px 20px 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Top Navigation Bar Helper */}
      <div style={{
        maxWidth: '1100px',
        width: '100%',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => onNavigate('home')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid var(--cannoli-cream-dark)',
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--raspberry-primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cannoli-cream-dark)'}
        >
          <ArrowLeft size={16} color="var(--raspberry-primary)" />
          Back to Home
        </button>

        <button
          onClick={() => onNavigate('marketplace')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--raspberry-primary)',
            cursor: 'pointer'
          }}
        >
          Browse Marketplace <ArrowRight size={15} />
        </button>
      </div>

      {/* Main Container Card */}
      <div style={{
        maxWidth: '1100px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(6, 28, 18, 0.09)',
        border: '1px solid var(--cannoli-cream-dark)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))'
      }}>
        {/* Left Side: Brand Story & Demo Personas */}
        <div style={{
          background: 'linear-gradient(145deg, #0d3b24 0%, #061c12 100%)',
          color: '#ffffff',
          padding: '44px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Subtle Background Glow Effect */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            left: '-60px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(227, 38, 111, 0.28) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div>
            {/* Logo Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--raspberry-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(227, 38, 111, 0.4)'
              }}>
                <Sprout size={24} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                  color: '#ffffff'
                }}>
                  FarmDirect <span style={{ color: 'var(--raspberry-light)' }}>Cloud</span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#F7A8C6',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  Smart Agricultural Marketplace
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '28px',
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#ffffff',
              marginBottom: '16px'
            }}>
              Connecting local soil with modern cloud intelligence.
            </h2>

            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#d6dfd9',
              marginBottom: '32px'
            }}>
              Whether you are an organic farmer listing seasonal yields or a consumer looking for chemical-free produce, FarmDirect delivers direct farm-to-door transparency.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(227, 38, 111, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--raspberry-light)',
                  flexShrink: 0
                }}>
                  <Leaf size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>100% Direct Farmer Margins</div>
                  <div style={{ fontSize: '12px', color: '#a7dfc2', marginTop: '2px' }}>
                    Zero predatory intermediaries. Farmers earn true market value for regenerative harvests.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(227, 38, 111, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--raspberry-light)',
                  flexShrink: 0
                }}>
                  <Truck size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>Real-time Dispatch & Cold Chain</div>
                  <div style={{ fontSize: '12px', color: '#a7dfc2', marginTop: '2px' }}>
                    Orders route immediately to nearest local distribution nodes with transparent tracking.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(227, 38, 111, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--raspberry-light)',
                  flexShrink: 0
                }}>
                  <Cloud size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>Cloud-Native Multi-Tier Stack</div>
                  <div style={{ fontSize: '12px', color: '#a7dfc2', marginTop: '2px' }}>
                    Architected across IaaS, PaaS, SaaS, FaaS, and DBaaS for high availability.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Evaluation Fast Access */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '16px',
            padding: '18px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--raspberry-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={14} /> 1-Click Evaluation Personas
              </span>
              <span style={{ fontSize: '11px', color: '#a7dfc2' }}>Instant Demo Login</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleInstantDemoLogin('ADMIN')}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(227, 38, 111, 0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              >
                <div style={{ fontWeight: 700, color: 'var(--raspberry-light)' }}>Admin</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>System Ops</div>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleInstantDemoLogin('FARMER')}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(227, 38, 111, 0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              >
                <div style={{ fontWeight: 700, color: '#F7A8C6' }}>Farmer Mary</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Producer Studio</div>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleInstantDemoLogin('CONSUMER')}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(227, 38, 111, 0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              >
                <div style={{ fontWeight: 700, color: '#FCE4EE' }}>Consumer Alice</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Marketplace</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Login / Register Form */}
        <div style={{
          padding: '44px 38px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Header Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--cannoli-cream-dark)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '26px'
          }}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                padding: '11px',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? 'var(--raspberry-dark)' : 'var(--text-muted)',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              style={{
                padding: '11px',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? 'var(--raspberry-dark)' : 'var(--text-muted)',
                boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              Create Account
            </button>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--amazon-900)',
              letterSpacing: '-0.3px',
              marginBottom: '6px'
            }}>
              {mode === 'login' ? 'Welcome Back to FarmDirect' : 'Start Your FarmDirect Journey'}
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              {mode === 'login'
                ? 'Sign in to access your dashboard, orders, and produce listings.'
                : 'Register as a consumer to buy local, or as a farmer to sell your harvest.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} flexShrink={0} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Registration Specific Fields */}
            {mode === 'register' && (
              <>
                {/* Role Selection */}
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--amazon-900)', display: 'block', marginBottom: '8px' }}>
                    I want to register as:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div
                      onClick={() => setRole('CONSUMER')}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `2px solid ${role === 'CONSUMER' ? 'var(--raspberry-primary)' : 'var(--cannoli-cream-dark)'}`,
                        background: role === 'CONSUMER' ? 'var(--raspberry-wash)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: role === 'CONSUMER' ? 'var(--raspberry-dark)' : 'var(--amazon-900)'
                      }}>
                        <ShoppingBag size={16} color={role === 'CONSUMER' ? 'var(--raspberry-primary)' : '#7e9187'} />
                        Consumer / Buyer
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Shop farm fresh organic crops and artisan goods
                      </div>
                    </div>

                    <div
                      onClick={() => setRole('FARMER')}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `2px solid ${role === 'FARMER' ? 'var(--raspberry-primary)' : 'var(--cannoli-cream-dark)'}`,
                        background: role === 'FARMER' ? 'var(--raspberry-wash)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: role === 'FARMER' ? 'var(--raspberry-dark)' : 'var(--amazon-900)'
                      }}>
                        <Sprout size={16} color={role === 'FARMER' ? 'var(--raspberry-primary)' : '#7e9187'} />
                        Farmer / Producer
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        List farm inventory and manage direct sales
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--amazon-900)', display: 'block', marginBottom: '6px' }}>
                    Full Name <span style={{ color: 'var(--raspberry-primary)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#7e9187' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="input-field"
                      style={{ paddingLeft: '40px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                {/* Farmer specific fields */}
                {role === 'FARMER' && (
                  <div style={{
                    background: 'var(--earth-50)',
                    border: '1px solid var(--cannoli-cream-dark)',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amazon-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={14} color="var(--raspberry-primary)" /> Farm Details
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                        Farm or Orchard Name <span style={{ color: 'var(--raspberry-primary)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={farmName}
                        onChange={e => setFarmName(e.target.value)}
                        placeholder="e.g. Green Meadow Organic Orchard"
                        className="input-field"
                        style={{ fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                          City / Town
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          placeholder="e.g. Boulder"
                          className="input-field"
                          style={{ fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                          State / Province
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={e => setState(e.target.value)}
                          placeholder="e.g. CO"
                          className="input-field"
                          style={{ fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email Address */}
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--amazon-900)', display: 'block', marginBottom: '6px' }}>
                Email Address <span style={{ color: 'var(--raspberry-primary)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#7e9187' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="input-field"
                  style={{ paddingLeft: '40px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--amazon-900)' }}>
                  Password <span style={{ color: 'var(--raspberry-primary)' }}>*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      alert('For the evaluation demo, you can reset or fast-fill credentials using the demo buttons on the left.');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      color: 'var(--raspberry-primary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#7e9187' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Min 8 characters' : 'Enter your password'}
                  className="input-field"
                  style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '13.5px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#7e9187',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register mode) */}
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--amazon-900)', display: 'block', marginBottom: '6px' }}>
                  Confirm Password <span style={{ color: 'var(--raspberry-primary)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#7e9187' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="input-field"
                    style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '13.5px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#7e9187',
                      cursor: 'pointer'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Terms checkbox for register */}
            {mode === 'register' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: 'var(--raspberry-primary)' }}
                />
                <span>
                  I agree to the <strong style={{ color: 'var(--amazon-900)' }}>Terms of Service</strong> and understand FarmDirect's agricultural fair pricing guidelines.
                </span>
              </label>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '14.5px',
                fontWeight: 700,
                borderRadius: '12px',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(227, 38, 111, 0.35)'
              }}
            >
              {submitting ? (
                <span>Please wait...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <span>Create {role === 'FARMER' ? 'Farmer' : 'Consumer'} Account</span>
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </form>

          {/* Fast Fill Demo Buttons on the Form */}
          {mode === 'login' && (
            <div style={{
              marginTop: '22px',
              paddingTop: '18px',
              borderTop: '1px solid var(--cannoli-cream-dark)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                Fill Form with Test Credentials:
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleFastFill('ADMIN')}
                  style={{
                    background: 'var(--earth-50)',
                    border: '1px solid var(--cannoli-cream-dark)',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--amazon-900)',
                    cursor: 'pointer'
                  }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleFastFill('FARMER')}
                  style={{
                    background: 'var(--earth-50)',
                    border: '1px solid var(--cannoli-cream-dark)',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--amazon-900)',
                    cursor: 'pointer'
                  }}
                >
                  Farmer (Mary)
                </button>
                <button
                  type="button"
                  onClick={() => handleFastFill('CONSUMER')}
                  style={{
                    background: 'var(--earth-50)',
                    border: '1px solid var(--cannoli-cream-dark)',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--amazon-900)',
                    cursor: 'pointer'
                  }}
                >
                  Consumer (Alice)
                </button>
              </div>
            </div>
          )}

          {/* Footer Switcher */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--raspberry-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--raspberry-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
