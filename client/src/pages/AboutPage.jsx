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
    </div>
  );
}
