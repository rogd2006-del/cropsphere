import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  Sprout,
  ShoppingCart,
  AlertCircle,
  KeyRound,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    clerkPubKey,
    saveClerkPublishableKey,
    clerkBridge,
    setPendingClerkRole,
  } = useAuth();

  const [mode, setMode] = useState(authModalMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('CONSUMER');
  const [farmName, setFarmName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Clerk Setup helper state (shown if user clicks Google without key set up)
  const [showClerkSetup, setShowClerkSetup] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogleSignIn = () => {
    setError(null);
    setPendingClerkRole(role);

    if (clerkBridge?.isReady) {
      try {
        if (mode === 'register') {
          clerkBridge.openSignUp({
            initialHint: 'oauth_google',
          });
        } else {
          clerkBridge.openSignIn({
            initialHint: 'oauth_google',
          });
        }
      } catch (err) {
        console.error('Error launching Clerk Google Auth:', err);
        setError('Could not open Google Sign-In. Please try email login.');
      }
    } else {
      // Prompt user to provide their Clerk key
      setShowClerkSetup(true);
    }
  };

  const handleSaveClerkKey = (e) => {
    e.preventDefault();
    if (!customKeyInput.trim().startsWith('pk_')) {
      setError('Clerk Publishable Key must start with pk_test_ or pk_live_');
      return;
    }
    saveClerkPublishableKey(customKeyInput.trim());
    setKeySavedMessage(true);
    setError(null);
    setTimeout(() => {
      window.location.reload();
    }, 800);
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
          farmName: role === 'FARMER' ? farmName : undefined,
          city: city || undefined,
          state: state || undefined,
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          padding: '28px',
        }}
      >
        <button
          onClick={() => setAuthModalOpen(false)}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            color: '#7e9187',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <Sprout size={24} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#081c15' }}>
            {mode === 'login' ? 'Welcome Back' : 'Join CropSphere'}
          </h3>
          <p style={{ fontSize: '13px', color: '#52635a', marginTop: '2px' }}>
            {mode === 'login'
              ? 'Access your cloud marketplace dashboard'
              : 'Direct connection between local farmers and consumers'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#f5f4ee',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '18px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? '#1b4332' : '#52635a',
              boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              backgroundColor: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? '#1b4332' : '#52635a',
              boxShadow: mode === 'register' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Register
          </button>
        </div>

        {/* Role Selector (Applies to both Google OAuth and Email registration) */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#52635a',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            I am participating as:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setRole('CONSUMER')}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: `1.5px solid ${role === 'CONSUMER' ? '#2d6a4f' : '#ebe7dc'}`,
                background: role === 'CONSUMER' ? '#edfbf1' : '#ffffff',
                color: role === 'CONSUMER' ? '#1b4332' : '#52635a',
                fontWeight: 600,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <ShoppingCart size={14} /> Consumer (Buyer)
            </button>
            <button
              type="button"
              onClick={() => setRole('FARMER')}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: `1.5px solid ${role === 'FARMER' ? '#2d6a4f' : '#ebe7dc'}`,
                background: role === 'FARMER' ? '#edfbf1' : '#ffffff',
                color: role === 'FARMER' ? '#1b4332' : '#52635a',
                fontWeight: 600,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Sprout size={14} /> Farmer (Seller)
            </button>
          </div>
        </div>

        {/* Google Authentication via Clerk */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '11px 16px',
            borderRadius: '10px',
            border: '1.5px solid #ebe7dc',
            background: '#ffffff',
            color: '#18231e',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            marginBottom: '16px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2d6a4f')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ebe7dc')}
        >
          {/* Official Google G Logo */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
          {clerkBridge?.isReady && (
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#edfbf1',
                color: '#1b4332',
                fontWeight: 700,
                marginLeft: 'auto',
              }}
            >
              Clerk OAuth
            </span>
          )}
        </button>

        {/* Clerk Configuration helper (appears if Clerk key is missing or setup requested) */}
        {showClerkSetup && !clerkBridge?.isReady && (
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '12px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              <KeyRound size={14} color="#0284c7" />
              Configure Clerk Publishable Key
            </div>
            <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '8px', lineHeight: 1.4 }}>
              To enable one-click Google OAuth via Clerk, paste your <code>pk_test_...</code> key below or set{' '}
              <code>VITE_CLERK_PUBLISHABLE_KEY</code> in <code>.env</code>.
            </p>
            <form onSubmit={handleSaveClerkKey} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="pk_test_..."
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </form>
            {keySavedMessage && (
              <div
                style={{
                  color: '#15803d',
                  fontSize: '11px',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={12} /> Key saved! Reloading Clerk...
              </div>
            )}
            <div style={{ marginTop: '6px' }}>
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#0284c7',
                  fontSize: '11px',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                Get free key from Clerk Dashboard <ExternalLink size={10} />
              </a>
            </div>
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '16px 0',
            color: '#a3a3a3',
            fontSize: '12px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          <span>or continue with email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Real Email / Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'register' && (
            <>
              <div>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#081c15',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Martinez"
                  className="input-field"
                  style={{ fontSize: '13px' }}
                />
              </div>

              {role === 'FARMER' && (
                <>
                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#081c15',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Farm / Orchard Name
                    </label>
                    <input
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Green Valley Organic Farm"
                      className="input-field"
                      style={{ fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#081c15',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Portland"
                        className="input-field"
                        style={{ fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#081c15',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        State
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. OR"
                        className="input-field"
                        style={{ fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#081c15',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              style={{ fontSize: '13px' }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#081c15',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {submitting
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In to Marketplace'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
