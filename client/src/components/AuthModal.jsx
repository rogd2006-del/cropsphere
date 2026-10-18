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
        backgroundColor: 'rgba(8, 28, 21, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          padding: '28px'
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
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px'
          }}>
            <Sprout size={24} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#081c15' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create FarmDirect Account'}
          </h3>
          <p style={{ fontSize: '13px', color: '#52635a', marginTop: '2px' }}>
            {mode === 'login' ? 'Access your cloud marketplace dashboard' : 'Join our network of regenerative farmers and local buyers'}
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#f5f4ee',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '20px'
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
              color: mode === 'login' ? '#1b4332' : '#52635a',
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
              color: mode === 'register' ? '#1b4332' : '#52635a',
              boxShadow: mode === 'register' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Demo Fast Fill Buttons */}
        {mode === 'login' && (
          <div style={{
            background: '#edfbf1',
            border: '1px solid #b7e4c7',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '18px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 700, color: '#1b4332', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} /> Fast Fill Demo Credentials:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleFillDemo('ADMIN')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #74c69d',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#081c15'
                }}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('FARMER')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #74c69d',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#081c15'
                }}
              >
                Farmer (Mary)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('CONSUMER')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #74c69d',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#081c15'
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
                      border: `1.5px solid ${role === 'CONSUMER' ? '#2d6a4f' : '#ebe7dc'}`,
                      background: role === 'CONSUMER' ? '#edfbf1' : '#ffffff',
                      color: role === 'CONSUMER' ? '#1b4332' : '#52635a',
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
                      border: `1.5px solid ${role === 'FARMER' ? '#2d6a4f' : '#ebe7dc'}`,
                      background: role === 'FARMER' ? '#edfbf1' : '#ffffff',
                      color: role === 'FARMER' ? '#1b4332' : '#52635a',
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
