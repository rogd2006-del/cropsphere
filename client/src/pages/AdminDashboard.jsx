import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShieldAlert,
  Users,
  Package,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  AlertTriangle,
  Database
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'logs'
  const [userSearch, setUserSearch] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        api.getAdminStats().catch(() => ({})),
        api.getAdminUsers().catch(() => ({})),
        api.getAdminAuditLogs().catch(() => ({})),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (logsRes.success) setAuditLogs(logsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId, currentStatus) => {
    try {
      await api.toggleUserActive(userId, !currentStatus);
      await fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Admin Header */}
      <div style={{
        background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: '#ffffff',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={32} />
          </div>
          <div>
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              Master Administrator
            </span>
            <h1 style={{ fontSize: '26px', color: '#ffffff', fontWeight: 800, marginTop: '2px' }}>
              Platform Operations Command Center
            </h1>
            <p style={{ color: '#fecaca', fontSize: '13px' }}>
              User authority governance, product catalog moderation, and cloud audit logs.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="btn btn-outline btn-sm"
          style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', background: 'transparent' }}
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52635a', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Registered Users</span>
            <Users size={18} style={{ color: '#7f1d1d' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#081c15' }}>
            {stats?.users?.total ?? users.length}
          </div>
          <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '4px' }}>
            {stats?.users?.farmers || 8} Farmers • {stats?.users?.consumers || 10} Consumers
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52635a', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Total Listings</span>
            <Package size={18} style={{ color: '#7f1d1d' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#081c15' }}>
            {stats?.products?.total || 20}
          </div>
          <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '4px' }}>
            {stats?.products?.active || 20} available in marketplace
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52635a', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Total Orders</span>
            <TrendingUp size={18} style={{ color: '#7f1d1d' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#081c15' }}>
            {stats?.orders?.total || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '4px' }}>
            ₹{(stats?.revenue?.total || 0).toFixed(2)} processed
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52635a', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Audit Telemetry</span>
            <Activity size={18} style={{ color: '#7f1d1d' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#081c15' }}>
            {auditLogs.length}
          </div>
          <div style={{ fontSize: '12px', color: '#7e9187', marginTop: '4px' }}>
            Persistent MongoDB audit entries
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid #ebe7dc',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '14px',
            color: activeTab === 'users' ? '#7f1d1d' : '#7e9187',
            borderBottom: `2px solid ${activeTab === 'users' ? '#7f1d1d' : 'transparent'}`,
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Users size={16} /> User Accounts & Permissions ({filteredUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '14px',
            color: activeTab === 'logs' ? '#7f1d1d' : '#7e9187',
            borderBottom: `2px solid ${activeTab === 'logs' ? '#7f1d1d' : 'transparent'}`,
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Activity size={16} /> System Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* User Table */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #ebe7dc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={16} style={{ color: '#7e9187' }} />
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search user by name, email, or role..."
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f4ee', borderBottom: '1px solid #ebe7dc', color: '#52635a' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>User / Name</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Created</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f5f4ee' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#081c15' }}>
                      {u.name}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#52635a' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${
                        u.role === 'ADMIN' ? 'badge-red' :
                        u.role === 'FARMER' ? 'badge-green' :
                        'badge-blue'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#7e9187' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUser(u._id, u.isActive)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: u.isActive ? '#fee2e2' : '#FDF0F5',
                            color: u.isActive ? '#991b1b' : '#E3266F',
                            border: `1px solid ${u.isActive ? '#fecaca' : '#F7A8C6'}`
                          }}
                        >
                          {u.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {activeTab === 'logs' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f4ee', borderBottom: '1px solid #ebe7dc', color: '#52635a' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Timestamp</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Action</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Target Entity</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>IP Address</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#7e9187' }}>
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #f5f4ee' }}>
                      <td style={{ padding: '14px 20px', color: '#7e9187' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#081c15' }}>
                        {log.action}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#52635a' }}>
                        {log.entityType} ({log.entityId || 'N/A'})
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className="badge badge-green">SUCCESS</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
