import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Sprout, LogOut, CheckCircle2, ChevronDown, User } from 'lucide-react';

export default function DemoBanner({ onNavigate }) {
  const { user, quickLogin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (roleKey) => {
    quickLogin(roleKey);
    setDropdownOpen(false);
  };

  const getRoleLabel = () => {
    if (!user) return 'Select Demo Role';
    if (user.role === 'ADMIN') return 'Admin Demo';
    if (user.role === 'FARMER') return 'Farmer Demo (Mary)';
    if (user.role === 'CONSUMER') return 'Consumer Demo (Alice)';
    return user.role;
  };

  return (
    <div style={{
      background: 'var(--amazon-900)',
      color: '#ffffff',
      padding: '7px 20px',
      fontSize: '12.5px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      zIndex: 80,
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      {/* Left side: Evaluation Mode & Role Dropdown + Sign In directly under/alongside */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{
          background: 'rgba(217, 36, 106, 0.2)',
          color: 'var(--raspberry-light)',
          padding: '2px 8px',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
          border: '1px solid rgba(217, 36, 106, 0.35)'
        }}>
          Evaluation Mode
        </span>

        {/* Demo Role Dropdown on the left */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: user ? 'var(--raspberry-primary)' : 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '8px',
              padding: '5px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.18s ease'
            }}
            title="Switch Demo Role"
          >
            {user?.role === 'ADMIN' && <ShieldCheck size={14} color="var(--raspberry-light)" />}
            {user?.role === 'FARMER' && <Sprout size={14} color="#F7A8C6" />}
            {user?.role === 'CONSUMER' && <UserCheck size={14} color="#FCE4EE" />}
            <span>{getRoleLabel()}</span>
            <ChevronDown
              size={14}
              style={{
                transition: 'transform 0.2s ease',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '230px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 12px 28px rgba(6, 28, 18, 0.22)',
              border: '1px solid var(--cannoli-cream-dark)',
              padding: '6px',
              zIndex: 100,
              animation: 'fadeIn 0.15s ease'
            }}>
              <div style={{
                padding: '6px 10px 4px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-muted)'
              }}>
                Quick-Switch Persona
              </div>

              <button
                onClick={() => handleSelectRole('ADMIN')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--amazon-900)',
                  backgroundColor: user?.role === 'ADMIN' ? 'var(--raspberry-wash)' : 'transparent',
                  textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => { if (user?.role !== 'ADMIN') e.currentTarget.style.backgroundColor = 'var(--cannoli-cream-light)'; }}
                onMouseLeave={(e) => { if (user?.role !== 'ADMIN') e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={15} color="var(--raspberry-primary)" />
                  Admin Demo
                </span>
                {user?.role === 'ADMIN' && <CheckCircle2 size={14} color="var(--raspberry-primary)" />}
              </button>

              <button
                onClick={() => handleSelectRole('FARMER')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--amazon-900)',
                  backgroundColor: user?.role === 'FARMER' ? 'var(--raspberry-wash)' : 'transparent',
                  textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => { if (user?.role !== 'FARMER') e.currentTarget.style.backgroundColor = 'var(--cannoli-cream-light)'; }}
                onMouseLeave={(e) => { if (user?.role !== 'FARMER') e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sprout size={15} color="var(--raspberry-primary)" />
                  Farmer Demo (Mary)
                </span>
                {user?.role === 'FARMER' && <CheckCircle2 size={14} color="var(--raspberry-primary)" />}
              </button>

              <button
                onClick={() => handleSelectRole('CONSUMER')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--amazon-900)',
                  backgroundColor: user?.role === 'CONSUMER' ? 'var(--raspberry-wash)' : 'transparent',
                  textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => { if (user?.role !== 'CONSUMER') e.currentTarget.style.backgroundColor = 'var(--cannoli-cream-light)'; }}
                onMouseLeave={(e) => { if (user?.role !== 'CONSUMER') e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={15} color="var(--raspberry-primary)" />
                  Consumer Demo (Alice)
                </span>
                {user?.role === 'CONSUMER' && <CheckCircle2 size={14} color="var(--raspberry-primary)" />}
              </button>

              {user && (
                <>
                  <div style={{ height: '1px', backgroundColor: 'var(--cannoli-cream-dark)', margin: '4px 0' }} />
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={14} />
                    Reset to Guest
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side active role and sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: 'var(--cannoli-cream)', opacity: 0.9, fontSize: '12px' }}>
          Active: <strong style={{ color: '#ffffff', fontWeight: 600 }}>{user ? `${user.role} (${user.name})` : 'Guest / Visitor'}</strong>
        </span>
        {user && (
          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LogOut size={12} /> Logout
          </button>
        )}
      </div>
    </div>
  );
}
