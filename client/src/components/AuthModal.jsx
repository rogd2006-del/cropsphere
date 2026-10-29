import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Sprout, ShoppingCart, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    syncClerkSession,
    clerkBridge,
    setPendingClerkRole,
  } = useAuth();

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

  const handleGoogleAuth = async () => {
    setError(null);
    setSubmitting(true);
    setPendingClerkRole(role);

    try {
      const clerk = clerkBridge?.clerk;
      if (!clerk) {
        setError('Clerk authentication service is connecting. Please try again in a moment.');
        setSubmitting(false);
        return;
      }

      // Wait for Clerk to be fully loaded
      if (!clerkBridge.isLoaded) {
        setError('Authentication is still loading. Please wait a moment and try again.');
        setSubmitting(false);
        return;
      }

      // Check if user is already signed in on Clerk (e.g. from a prior Google login)
      const activeClerkUser = clerkBridge.clerkUser || clerk.user;
      if (activeClerkUser || clerkBridge.isSignedIn) {
        const userToSync = activeClerkUser || clerk.user;
        if (userToSync) {
          await syncClerkSession(userToSync, { role });
          setAuthModalOpen(false);
          return;
        }
      }

      // If a session exists in Clerk without a user, sign out to prevent single-session conflicts
      if (clerk.session) {
        try {
          await clerk.signOut();
        } catch {
          // ignore
        }
      }

      // Direct OAuth redirect to Google
      if (clerk.client?.signIn?.authenticateWithRedirect) {
        await clerk.client.signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: window.location.origin,
          redirectUrlComplete: window.location.origin,
        });
        return;
      }

      if (typeof clerk.authenticateWithRedirect === 'function') {
        await clerk.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: window.location.origin,
          redirectUrlComplete: window.location.origin,
        });
        return;
      }

      // Fallback: open Clerk sign-in modal
      setAuthModalOpen(false);
      clerk.openSignIn?.({
        appearance: {
          elements: {
            rootBox: { zIndex: 9999 }
          }
        }
      });
    } catch (err) {
      console.warn('Google auth notice:', err);
      // If error is single-session related, user already has a Clerk session
      if (err?.message?.includes('single_session') || err?.code === 'cannot_render_single_session_enabled') {
        try {
          const u = clerkBridge?.clerk?.user || clerkBridge?.clerkUser;
          if (u) {
            await syncClerkSession(u, { role });
            setAuthModalOpen(false);
            return;
          }
          await clerkBridge?.clerk?.signOut();
          setAuthModalOpen(false);
          clerkBridge?.openSignIn?.();
          return;
        } catch (recoverErr) {
          console.warn('Recovery error:', recoverErr);
        }
      }
      setError(err.message || 'Google authentication failed to initialize.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authModalOpen) return null;

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
            {mode === 'login' ? 'Access your FarmDirect marketplace account' : 'Join our network of regenerative farmers and local buyers'}
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

        {/* Direct Google Authentication via Clerk */}
        <div style={{ marginBottom: '14px' }}>
          {mode === 'register' && (
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Join As:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setRole('CONSUMER'); setPendingClerkRole('CONSUMER'); }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: `1.5px solid ${role === 'CONSUMER' ? 'var(--raspberry-primary)' : 'var(--cannoli-cream-dark)'}`,
                    background: role === 'CONSUMER' ? 'var(--raspberry-wash)' : '#ffffff',
                    color: role === 'CONSUMER' ? 'var(--raspberry-dark)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <ShoppingCart size={13} /> Consumer
                </button>
                <button
                  type="button"
                  onClick={() => { setRole('FARMER'); setPendingClerkRole('FARMER'); }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: `1.5px solid ${role === 'FARMER' ? 'var(--raspberry-primary)' : 'var(--cannoli-cream-dark)'}`,
                    background: role === 'FARMER' ? 'var(--raspberry-wash)' : '#ffffff',
                    color: role === 'FARMER' ? 'var(--raspberry-dark)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Sprout size={13} /> Farmer
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '11px 16px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #dadce0',
              borderRadius: '12px',
              color: '#3c4043',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 1px 3px rgba(60,64,67, 0.08)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#c6c9cc';
              }
            }}
            onMouseLeave={e => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#dadce0';
              }
            }}
          >
            <GoogleIcon />
            <span>Continue directly with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '12px 0 14px',
          color: '#80868b',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          <span style={{ padding: '0 10px' }}>or continue with credentials</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        </div>

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
              placeholder="you@example.com"
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
