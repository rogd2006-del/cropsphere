import React from 'react';
import { Sprout } from 'lucide-react';

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
              Platform & Docs
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <button onClick={() => onNavigate('about')} style={{ color: '#F7A8C6', cursor: 'pointer' }}>
                  Project Documentation
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
              Demo Credentials
            </h4>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(227, 38, 111,0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              lineHeight: '1.6'
            }}>
              <div><strong>Admin:</strong> admin@farmdirect.dev</div>
              <div><strong>Farmer:</strong> mary@farmdirect.dev</div>
              <div><strong>Consumer:</strong> alice@farmdirect.dev</div>
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={() => onNavigate('login')}
                  style={{
                    background: 'var(--raspberry-primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Sign In / Register →
                </button>
              </div>
            </div>
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
            © {new Date().getFullYear()} FarmDirect Cloud. Built with React, Express, MongoDB Atlas, and Serverless Cloud Functions.
          </div>
        </div>
      </div>
    </footer>
  );
}
