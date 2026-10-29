import React from 'react';
import { Sprout, Server, Layers, Cpu, Database, HardDrive, Shield } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      background: '#081c15',
      color: '#FCE4EE',
      paddingTop: '60px',
      paddingBottom: '30px',
      marginTop: 'auto',
      borderTop: '1px solid rgba(227, 38, 111, 0.2)'
    }}>
      <div className="container">
        {/* Marketplace Value Pillars */}
        <div style={{
          background: 'rgba(227, 38, 111, 0.1)',
          borderRadius: '16px',
          border: '1px solid rgba(227, 38, 111, 0.2)',
          padding: '24px',
          marginBottom: '50px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(227, 38, 111, 0.2)', borderRadius: '10px', color: '#E3266F' }}>
              <Sprout size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>100% Farm Direct</div>
              <div style={{ fontSize: '11px', color: '#F7A8C6' }}>Harvested by local producers</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(227, 38, 111, 0.2)', borderRadius: '10px', color: '#E3266F' }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>Verified Growers</div>
              <div style={{ fontSize: '11px', color: '#F7A8C6' }}>Transparent farming practices</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(227, 38, 111, 0.2)', borderRadius: '10px', color: '#E3266F' }}>
              <Database size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>Fair Pricing</div>
              <div style={{ fontSize: '11px', color: '#F7A8C6' }}>Zero middleman deductions</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(227, 38, 111, 0.2)', borderRadius: '10px', color: '#E3266F' }}>
              <Layers size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>Traceable Harvest</div>
              <div style={{ fontSize: '11px', color: '#F7A8C6' }}>Origin farm & batch verified</div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          marginBottom: '50px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#E3266F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Sprout size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: '#ffffff' }}>
                FarmDirect <span style={{ color: 'var(--raspberry-primary)' }}>Cloud</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--cannoli-cream)', opacity: 0.9, marginBottom: '16px' }}>
              A cloud-native smart marketplace empowering local regenerative farmers with direct-to-consumer trade, transparent pricing, and automated inventory logistics.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--raspberry-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> Full Cloud Computing Architecture Project
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Marketplace
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <button onClick={() => onNavigate('marketplace')} style={{ color: '#F7A8C6', cursor: 'pointer' }}>
                  Browse All Produce
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace', { category: 'vegetables' })} style={{ color: '#F7A8C6', cursor: 'pointer' }}>
                  Organic Vegetables
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace', { category: 'fruits' })} style={{ color: '#F7A8C6', cursor: 'pointer' }}>
                  Orchard Fresh Fruits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace', { category: 'dairy' })} style={{ color: '#F7A8C6', cursor: 'pointer' }}>
                  Artisan Dairy & Cheese
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              About & Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <button onClick={() => onNavigate('about')} style={{ color: '#F7A8C6', cursor: 'pointer' }}>
                  About FarmDirect & Mission
                </button>
              </li>
              <li>
                <a href="/api/health" target="_blank" rel="noreferrer" style={{ color: '#F7A8C6' }}>
                  Live API Health Probe ↗
                </a>
              </li>
              <li>
                <a href="/api-docs" target="_blank" rel="noreferrer" style={{ color: '#F7A8C6' }}>
                  Swagger OpenAPI Docs ↗
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Join the Community
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <span style={{ color: '#F7A8C6', fontSize: '12.5px' }}>Fresh harvests from local regenerative farms directly to your home.</span>
              </li>
              <li>
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(227, 38, 111, 0.25)',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: '#ffffff'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--raspberry-light)' }}>Instant Account Access</div>
                  <div>Sign in with Google or email to track orders and manage farm listings.</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid rgba(227, 38, 111, 0.15)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: '#EC5A92'
        }}>
          <div>
            © {new Date().getFullYear()} FarmDirect. Direct Farmer-to-Consumer Fresh Marketplace.
          </div>
          <div>
            React · TypeScript · Express · Node.js
          </div>
        </div>
      </div>
    </footer>
  );
}
