import React from 'react';
import { Sprout, Server, Layers, Cpu, Database, HardDrive, Shield } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      background: '#081c15',
      color: '#d8f3dc',
      paddingTop: '60px',
      paddingBottom: '30px',
      marginTop: 'auto',
      borderTop: '1px solid rgba(82, 183, 136, 0.2)'
    }}>
      <div className="container">
        {/* Top Cloud Tier Highlights */}
        <div style={{
          background: 'rgba(27, 67, 50, 0.5)',
          borderRadius: '16px',
          border: '1px solid rgba(82, 183, 136, 0.2)',
          padding: '24px',
          marginBottom: '50px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(82, 183, 136, 0.15)', borderRadius: '10px', color: '#52b788' }}>
              <Server size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>IaaS Tier</div>
              <div style={{ fontSize: '11px', color: '#95d5b2' }}>Ubuntu Linux VM / systemd</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(82, 183, 136, 0.15)', borderRadius: '10px', color: '#52b788' }}>
              <Layers size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>PaaS Tier</div>
              <div style={{ fontSize: '11px', color: '#95d5b2' }}>Express API Platform</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(82, 183, 136, 0.15)', borderRadius: '10px', color: '#52b788' }}>
              <Sprout size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>SaaS Tier</div>
              <div style={{ fontSize: '11px', color: '#95d5b2' }}>FarmDirect Marketplace</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(82, 183, 136, 0.15)', borderRadius: '10px', color: '#52b788' }}>
              <Cpu size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>FaaS Tier</div>
              <div style={{ fontSize: '11px', color: '#95d5b2' }}>Serverless Event Handlers</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(82, 183, 136, 0.15)', borderRadius: '10px', color: '#52b788' }}>
              <Database size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>DBaaS Tier</div>
              <div style={{ fontSize: '11px', color: '#95d5b2' }}>MongoDB Atlas Cluster</div>
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
                background: '#2d6a4f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Sprout size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: '#ffffff' }}>
                FarmDirect <span style={{ color: '#52b788' }}>Cloud</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#b7e4c7', marginBottom: '16px' }}>
              A cloud-native smart marketplace empowering local regenerative farmers with direct-to-consumer trade, transparent pricing, and automated inventory logistics.
            </p>
            <div style={{ fontSize: '12px', color: '#74c69d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> Full Cloud Computing Architecture Project
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Marketplace
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <button onClick={() => onNavigate('marketplace')} style={{ color: '#b7e4c7', cursor: 'pointer' }}>
                  Browse All Produce
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace', { category: 'vegetables' })} style={{ color: '#b7e4c7', cursor: 'pointer' }}>
                  Organic Vegetables
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace', { category: 'fruits' })} style={{ color: '#b7e4c7', cursor: 'pointer' }}>
                  Orchard Fresh Fruits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace', { category: 'dairy' })} style={{ color: '#b7e4c7', cursor: 'pointer' }}>
                  Artisan Dairy & Cheese
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Cloud Computing
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <button onClick={() => onNavigate('cloud')} style={{ color: '#b7e4c7', cursor: 'pointer' }}>
                  Architecture Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} style={{ color: '#b7e4c7', cursor: 'pointer' }}>
                  Rubric & Cloud Service Models
                </button>
              </li>
              <li>
                <a href="/api/health" target="_blank" rel="noreferrer" style={{ color: '#b7e4c7' }}>
                  Live API Health Probe ↗
                </a>
              </li>
              <li>
                <a href="/api-docs" target="_blank" rel="noreferrer" style={{ color: '#b7e4c7' }}>
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
              border: '1px solid rgba(82,183,136,0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              lineHeight: '1.6'
            }}>
              <div><strong>Admin:</strong> admin@farmdirect.dev</div>
              <div><strong>Farmer:</strong> mary@farmdirect.dev</div>
              <div><strong>Consumer:</strong> alice@consumer.dev</div>
              <div style={{ color: '#74c69d', marginTop: '6px', fontSize: '11px' }}>
                Use top banner for instant 1-click evaluation login.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid rgba(82, 183, 136, 0.15)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: '#74c69d'
        }}>
          <div>
            © {new Date().getFullYear()} FarmDirect Cloud. Built with React, Express, MongoDB Atlas, and Serverless Cloud Functions.
          </div>
          <div>
            Academic Cloud Computing Capstone Project
          </div>
        </div>
      </div>
    </footer>
  );
}
