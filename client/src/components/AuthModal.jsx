import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { X, Lock, Mail, User, Sprout, ShoppingCart, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalMode, setAuthModalMode, login, register } = useAuth();

  const [mode, setMode] = useState(authModalMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('CONSUMER');
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!authModalOpen) return null;

  const handleFillDemo = (roleKey) => {
    const acc = DEMO_ACCOUNTS[roleKey];
    if (acc) {
      setEmail(acc.email);
      setPassword(acc.pass);
      setMode('login');
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          name,
          role,
          phone: phone || undefined,
          farmName: role === 'FARMER' ? farmName : undefined,
          city: city || undefined,
          state: state || undefined,
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => setAuthModalOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(6, 28, 18, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '24px 32px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(6, 28, 18, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          padding: '28px',
          border: '1px solid var(--cannoli-cream-dark)',
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <button
          onClick={() => setAuthModalOpen(false)}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            color: '#7e9187'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'left', marginBottom: '18px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--raspberry-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <Sprout size={22} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--amazon-900)', letterSpacing: '-0.3px' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create FarmDirect Account'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {mode === 'login' ? 'Access your cloud marketplace dashboard' : 'Join our network of regenerative farmers and local buyers'}
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--cannoli-cream-dark)',
          borderRadius: '10px',
          padding: '3px',
          marginBottom: '18px'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? 'var(--raspberry-dark)' : 'var(--text-muted)',
              boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              backgroundColor: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? 'var(--raspberry-dark)' : 'var(--text-muted)',
              boxShadow: mode === 'register' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Demo Fast Fill Buttons */}
        {mode === 'login' && (
          <div style={{
            background: 'var(--raspberry-wash)',
            border: '1px solid var(--raspberry-soft)',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--raspberry-dark)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} color="var(--raspberry-primary)" /> Fast Fill Demo Credentials:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleFillDemo('ADMIN')}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--raspberry-soft)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--amazon-900)'
                }}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('FARMER')}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--raspberry-soft)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--amazon-900)'
                }}
              >
                Farmer (Mary)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('CONSUMER')}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--raspberry-soft)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--amazon-900)'
                }}
              >
                Consumer (Alice)
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Miller"
                  className="input-field"
                  style={{ fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                  Account Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('CONSUMER')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: `1.5px solid ${role === 'CONSUMER' ? '#E3266F' : '#ebe7dc'}`,
                      background: role === 'CONSUMER' ? '#FDF0F5' : '#ffffff',
                      color: role === 'CONSUMER' ? '#E3266F' : '#52635a',
                      fontWeight: 600,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShoppingCart size={13} /> Consumer (Buyer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('FARMER')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: `1.5px solid ${role === 'FARMER' ? '#E3266F' : '#ebe7dc'}`,
                      background: role === 'FARMER' ? '#FDF0F5' : '#ffffff',
                      color: role === 'FARMER' ? '#E3266F' : '#52635a',
                      fontWeight: 600,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sprout size={13} /> Farmer (Seller)
                  </button>
                </div>
              </div>

              {role === 'FARMER' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
                    Farm / Orchard Name
                  </label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={e => setFarmName(e.target.value)}
                    placeholder="e.g. Sunny Brook Farm"
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@farmdirect.dev"
              className="input-field"
              style={{ fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#081c15', display: 'block', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Min 8 chars, 1 uppercase, 1 number' : '••••••••'}
              className="input-field"
              style={{ fontSize: '13px' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In to Marketplace' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
