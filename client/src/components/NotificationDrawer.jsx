import React from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Bell, Package, AlertTriangle, Info, Check, RefreshCw } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, fetchNotifications } = useAuth();
  const [marking, setMarking] = React.useState(false);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await api.markAllNotificationsRead();
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    } finally {
      setMarking(false);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await api.markNotificationRead(id);
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_PLACED':
      case 'ORDER_STATUS_CHANGED':
        return <Package size={16} style={{ color: '#2d6a4f' }} />;
      case 'LOW_STOCK_ALERT':
        return <AlertTriangle size={16} style={{ color: '#d97706' }} />;
      default:
        return <Info size={16} style={{ color: '#0284c7' }} />;
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 28, 21, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #ebe7dc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fbfbf9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: '#1b4332' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#081c15' }}>Activity Notifications</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={fetchNotifications}
              style={{ padding: '6px', color: '#52635a' }}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={onClose}
              style={{ padding: '6px', color: '#7e9187' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#f5f4ee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px'
          }}>
            <span style={{ color: '#52635a' }}>
              {notifications.filter(n => !n.isRead).length} unread updates
            </span>
            <button
              onClick={handleMarkAllRead}
              disabled={marking}
              style={{
                color: '#2d6a4f',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 10px', color: '#7e9187' }}>
              <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#081c15', marginBottom: '4px' }}>
                All caught up!
              </div>
              <p style={{ fontSize: '13px' }}>
                You have no notifications at the moment. Orders and inventory alerts will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && handleMarkOne(n._id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: n.isRead ? '#ffffff' : '#edfbf1',
                    border: `1px solid ${n.isRead ? '#ebe7dc' : '#b7e4c7'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: n.isRead ? 'default' : 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{
                    padding: '6px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #ebe7dc',
                    marginTop: '2px'
                  }}>
                    {getIcon(n.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: n.isRead ? 600 : 700,
                      fontSize: '13px',
                      color: '#081c15',
                      marginBottom: '2px'
                    }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#52635a', lineHeight: '1.4' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#7e9187', marginTop: '6px' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {!n.isRead && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#52b788',
                      marginTop: '6px'
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
