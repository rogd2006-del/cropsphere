import React from 'react';
import {
  Server,
  Layers,
  Sprout,
  Cpu,
  Database,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  FileText,
  BookOpen,
  Award
} from 'lucide-react';

export default function AboutPage({ onNavigate }) {
  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '960px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          background: '#edfbf1',
          border: '1px solid #b7e4c7',
          borderRadius: '999px',
          color: '#1b4332',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Award size={14} style={{ color: '#2d6a4f' }} /> Academic Cloud Computing Mini Project
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#081c15', marginBottom: '12px' }}>
          FarmDirect Cloud Project Documentation
        </h1>
        <p style={{ fontSize: '16px', color: '#52635a', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Comprehensive cloud-based smart marketplace architecture directly connecting regional farmers with local consumers through verified IaaS, PaaS, SaaS, and serverless FaaS tiers.
        </p>
      </div>

      {/* Cloud Model Breakdown Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
        {/* IaaS */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', background: '#edfbf1', color: '#1b4332', borderRadius: '10px' }}>
              <Server size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>1. IaaS — Infrastructure as a Service</h3>
              <div style={{ fontSize: '12px', color: '#52635a' }}>Virtual Machine Compute, Operating System & Process Supervision</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#52635a', lineHeight: 1.6, marginBottom: '12px' }}>
            <strong>Implementation:</strong> The backend runs in a Linux virtual environment configured with process supervision (<code style={{ background: '#f5f4ee', padding: '2px 6px', borderRadius: '4px' }}>systemd</code>) to maintain continuous uptime, automatic restarts upon failures, and OS-level network isolation.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#18231e' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> Memory & vCPU spec isolation (Ubuntu Linux, 2 vCPUs, 4GB RAM)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> Systemd service guardian ensuring automated restart and zero-downtime restarts
            </li>
          </ul>
        </div>

        {/* PaaS */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', background: '#edfbf1', color: '#1b4332', borderRadius: '10px' }}>
              <Layers size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>2. PaaS — Platform as a Service</h3>
              <div style={{ fontSize: '12px', color: '#52635a' }}>Managed Application Platform hosting REST API</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#52635a', lineHeight: 1.6, marginBottom: '12px' }}>
            <strong>Implementation:</strong> Built on Node.js and Express in TypeScript. Exposes certified REST endpoints for authentication, products, order management, carts, farmer statistics, and cloud health monitoring.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#18231e' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> Centralized error handling, Zod schema validation, and rate limiting
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> Swagger OpenAPI documentation accessible at <code style={{ background: '#f5f4ee', padding: '2px 6px', borderRadius: '4px' }}>/api-docs</code>
            </li>
          </ul>
        </div>

        {/* SaaS */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', background: '#edfbf1', color: '#1b4332', borderRadius: '10px' }}>
              <Sprout size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>3. SaaS — Software as a Service</h3>
              <div style={{ fontSize: '12px', color: '#52635a' }}>End-User Multi-Role Agricultural Web Marketplace</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#52635a', lineHeight: 1.6, marginBottom: '12px' }}>
            <strong>Implementation:</strong> The user-facing web software delivers tailored experiences for three distinct roles (Consumer, Farmer, Administrator) with responsive layouts, fluid cart checkouts, and live notifications.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#18231e' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> Zero installation required — fully browser-accessible with secure JWT session handling
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> Role-based views preventing consumers from altering farmer listings or admin controls
            </li>
          </ul>
        </div>

        {/* FaaS */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', background: '#edfbf1', color: '#1b4332', borderRadius: '10px' }}>
              <Cpu size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>4. FaaS — Function as a Service</h3>
              <div style={{ fontSize: '12px', color: '#52635a' }}>Serverless Event Handlers & Asynchronous Queue Workers</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#52635a', lineHeight: 1.6, marginBottom: '12px' }}>
            <strong>Implementation:</strong> Two distinct serverless functions handle asynchronous background processing decoupled from the primary HTTP request loop:
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#18231e' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> <strong>OrderEventProcessor:</strong> Triggered on <code style={{ background: '#f5f4ee', padding: '2px 4px', borderRadius: '4px' }}>ORDER_PLACED</code> to verify stock, create in-app notifications, and dispatch simulated email confirmations.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> <strong>InventoryAlertProcessor:</strong> Triggered on inventory changes to detect items below safety thresholds and create automated low-stock warnings for farmers.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> Idempotency verified via unique event keys to guarantee exactly-once processing semantics.
            </li>
          </ul>
        </div>

        {/* DBaaS */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', background: '#edfbf1', color: '#1b4332', borderRadius: '10px' }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>5. DBaaS & Object Storage</h3>
              <div style={{ fontSize: '12px', color: '#52635a' }}>Managed MongoDB Atlas Cluster & Cloud Media Storage</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#52635a', lineHeight: 1.6, marginBottom: '12px' }}>
            <strong>Implementation:</strong> The database layer resides on MongoDB Atlas with connection pooling, IP whitelisting, replica set failover, and comprehensive schemas (User, FarmerProfile, Product, Cart, Order, Address, Notification, AuditLog, CloudServiceEvent).
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#18231e' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> Historical orders snapshot product names and unit prices to prevent retroactive alteration
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#2d6a4f' }} /> Object storage adapter supporting Azure Blob, AWS S3, and local uploads with strict MIME whitelist
            </li>
          </ul>
        </div>
      </div>

      {/* Evaluator Quick Reference */}
      <div style={{
        background: '#fbfbf9',
        border: '1.5px solid #ebe7dc',
        borderRadius: '20px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#081c15', marginBottom: '8px' }}>
          Ready to inspect the live cloud telemetry?
        </h3>
        <p style={{ fontSize: '14px', color: '#52635a', marginBottom: '20px' }}>
          Test the interactive probes, ping database health, and trigger serverless event executions on the Cloud Services dashboard.
        </p>
        <button
          onClick={() => onNavigate('cloud')}
          className="btn btn-primary"
          style={{ padding: '12px 24px' }}
        >
          Open Cloud Services Architecture Dashboard
        </button>
      </div>
    </div>
  );
}
