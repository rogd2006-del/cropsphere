import React from 'react';
import {
  Sprout,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  Truck,
  Leaf,
  Store,
  ArrowRight,
  Sparkles,
  Lock,
  Compass
} from 'lucide-react';

export default function AboutPage({ onNavigate }) {
  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '960px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          background: 'var(--raspberry-wash)',
          border: '1px solid var(--raspberry-soft)',
          borderRadius: '999px',
          color: 'var(--raspberry-dark)',
          fontSize: '12.5px',
          fontWeight: 700,
          marginBottom: '14px'
        }}>
          <Sparkles size={14} style={{ color: 'var(--raspberry-primary)' }} />
          Empowering Local Growers & Direct Consumers
        </div>
        <h1 style={{ fontSize: '38px', fontWeight: 800, color: 'var(--amazon-900)', marginBottom: '14px', letterSpacing: '-0.8px' }}>
          About FarmDirect Marketplace
        </h1>
        <p style={{ fontSize: '16.5px', color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          FarmDirect eliminates the 5 to 7 layers of traditional supermarket middlemen. We directly connect regional regenerative growers with conscious consumers for farm-fresh produce, fair farmer earnings, and complete harvest traceability.
        </p>
      </div>

      {/* 3 Core Value Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '54px'
      }}>
        <div className="card" style={{ padding: '28px', border: '1.5px solid var(--cannoli-cream-dark)', borderRadius: '18px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--raspberry-wash)',
            color: 'var(--raspberry-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <HeartHandshake size={22} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--amazon-900)', marginBottom: '8px' }}>
            Fair Prices for Farmers
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Traditional supermarkets return as little as 14¢ on the dollar to local farmers. On FarmDirect, producers set their own prices and keep over 90% of every sale.
          </p>
        </div>

        <div className="card" style={{ padding: '28px', border: '1.5px solid var(--cannoli-cream-dark)', borderRadius: '18px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--raspberry-wash)',
            color: 'var(--raspberry-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Leaf size={22} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--amazon-900)', marginBottom: '8px' }}>
            Peak Freshness & Nutrition
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Produce travels an average of 1,500 miles and sits weeks in cold storage. FarmDirect harvests are prepared on-demand and dispatched within 24 to 48 hours.
          </p>
        </div>

        <div className="card" style={{ padding: '28px', border: '1.5px solid var(--cannoli-cream-dark)', borderRadius: '18px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--raspberry-wash)',
            color: 'var(--raspberry-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Compass size={22} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--amazon-900)', marginBottom: '8px' }}>
            Radical Traceability
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Every product listing features farm location coordinates, soil practices, harvest date, and farmer profile so you always know who grew your food.
          </p>
        </div>
      </div>

      {/* Platform & Architecture Overview */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid var(--cannoli-cream-dark)',
        borderRadius: '20px',
        padding: '36px',
        marginBottom: '48px',
        boxShadow: '0 8px 24px rgba(6, 28, 18, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', background: 'var(--raspberry-wash)', color: 'var(--raspberry-primary)', borderRadius: '10px' }}>
            <Sprout size={20} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--amazon-900)' }}>
            Platform Technology & Architecture
          </h2>
        </div>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
          FarmDirect is built with a modern, high-performance web stack engineered for simplicity, responsiveness, and resilient operation:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--cannoli-cream-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--cannoli-cream-dark)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--amazon-900)', marginBottom: '4px' }}>
              ⚛️ Frontend Application
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              React 19 & Vite with rich responsive styling, live shopping cart drawer, and interactive farm locator map.
            </div>
          </div>

          <div style={{ background: 'var(--cannoli-cream-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--cannoli-cream-dark)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--amazon-900)', marginBottom: '4px' }}>
              🛡️ Secure Clerk & Google Authentication
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              1-click Google OAuth powered by Clerk integration alongside Argon2id password hashing and JWT sessions.
            </div>
          </div>

          <div style={{ background: 'var(--cannoli-cream-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--cannoli-cream-dark)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--amazon-900)', marginBottom: '4px' }}>
              ⚡ Node.js & Express API Backend
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              TypeScript REST architecture with Zod request validation, rate limiting, and structured OpenAPI Swagger docs.
            </div>
          </div>

          <div style={{ background: 'var(--cannoli-cream-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--cannoli-cream-dark)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--amazon-900)', marginBottom: '4px' }}>
              📦 Resilient Storage & Fallback
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Seamless dual-mode storage engine supporting production MongoDB Atlas or an immediate local in-memory store.
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div style={{
        background: 'linear-gradient(135deg, var(--amazon-900) 0%, var(--amazon-800) 100%)',
        borderRadius: '24px',
        padding: '40px',
        textAlign: 'center',
        color: '#ffffff',
        boxShadow: '0 16px 36px rgba(6, 28, 18, 0.15)'
      }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
          Experience Direct Farm-to-Table Freshness
        </h2>
        <p style={{ color: 'var(--cannoli-cream)', opacity: 0.9, fontSize: '15px', maxWidth: '580px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          Browse organic produce harvested by certified local growers within your community.
        </p>
        <button
          onClick={() => onNavigate('marketplace')}
          className="btn btn-primary"
          style={{
            background: 'var(--raspberry-primary)',
            color: '#ffffff',
            padding: '12px 28px',
            fontSize: '14.5px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(217, 36, 106, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Store size={16} /> Explore Produce Marketplace <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
