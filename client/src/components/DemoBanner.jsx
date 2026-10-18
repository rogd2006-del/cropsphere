import React from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Sprout, LogOut, CheckCircle2 } from 'lucide-react';

export default function DemoBanner({ onNavigate }) {
  const { user, quickLogin, logout } = useAuth();

  return (
    <div style={{
      background: 'linear-gradient(90deg, #081c15 0%, #1b4332 50%, #2d6a4f 100%)',
      color: '#ffffff',
      padding: '8px 16px',
      fontSize: '13px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '8px',
      zIndex: 60,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          background: 'rgba(82, 183, 136, 0.25)',
          color: '#b7e4c7',
          padding: '2px 8px',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          border: '1px solid rgba(82, 183, 136, 0.4)'
        }}>
          🎓 Academic Evaluator Quick-Switch
        </span>
        <span style={{ color: '#d8f3dc', opacity: 0.9 }}>
          Current Role: <strong style={{ color: '#ffffff' }}>{user ? `${user.role} (${user.name})` : 'Guest / Visitor'}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => quickLogin('ADMIN')}
          style={{
            background: user?.role === 'ADMIN' ? '#52b788' : 'rgba(255,255,255,0.12)',
            color: user?.role === 'ADMIN' ? '#081c15' : '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s'
          }}
          title="Login as Platform Administrator"
        >
          <ShieldCheck size={14} />
          {user?.role === 'ADMIN' && <CheckCircle2 size={12} />}
          Admin Demo
        </button>

        <button
          onClick={() => quickLogin('FARMER')}
          style={{
            background: user?.role === 'FARMER' ? '#52b788' : 'rgba(255,255,255,0.12)',
            color: user?.role === 'FARMER' ? '#081c15' : '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s'
          }}
          title="Login as Farmer Mary Okonkwo"
        >
          <Sprout size={14} />
          {user?.role === 'FARMER' && <CheckCircle2 size={12} />}
          Farmer Demo (Mary)
        </button>

        <button
          onClick={() => quickLogin('CONSUMER')}
          style={{
            background: user?.role === 'CONSUMER' ? '#52b788' : 'rgba(255,255,255,0.12)',
            color: user?.role === 'CONSUMER' ? '#081c15' : '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s'
          }}
          title="Login as Consumer Alice Wong"
        >
          <UserCheck size={14} />
          {user?.role === 'CONSUMER' && <CheckCircle2 size={12} />}
          Consumer Demo (Alice)
        </button>

        {user && (
          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Reset to Guest"
          >
            <LogOut size={13} />
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
