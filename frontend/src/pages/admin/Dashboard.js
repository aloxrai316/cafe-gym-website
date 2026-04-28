import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, orderAPI, waiterAPI, menuAPI } from '../../services/api';
import { FiDollarSign, FiUsers, FiShoppingBag, FiClock, FiLogOut, FiRefreshCw, FiAlertCircle, FiCheck, FiList, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [waiterCalls, setWaiterCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [menuItems, setMenuItems] = useState([]);

  const qrUrl = window.location.origin;

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, callsRes] = await Promise.all([
        adminAPI.getDashboard(),
        waiterAPI.getActive()
      ]);
      setDashboard(dashRes.data.data);
      setWaiterCalls(callsRes.data.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin/login'); return; }
      toast.error('Failed to load dashboard');
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab === 'menu') {
      menuAPI.getAll().then(res => setMenuItems(res.data.data)).catch(() => {});
    }
  }, [activeTab]);

  const handleOrderStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success(`Order ${status}`);
      fetchDashboard();
    } catch (err) { toast.error('Failed to update order'); }
  };

  const handleResolveCall = async (id) => {
    try {
      await waiterAPI.resolve(id);
      toast.success('Call resolved');
      fetchDashboard();
    } catch (err) { toast.error('Failed to resolve call'); }
  };

  const handleToggleItem = async (id) => {
    try {
      const api = await import('../../services/api');
      const res = await api.default.patch(`/menu/${id}/toggle`);
      setMenuItems(prev => prev.map(i => i._id === id ? res.data.data : i));
    } catch (err) { toast.error('Failed to update item'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>FitBite Admin</h2>
        <nav style={styles.nav}>
          {[
            { key: 'overview', label: 'Overview', icon: FiDollarSign },
            { key: 'orders', label: 'Live Orders', icon: FiShoppingBag },
            { key: 'calls', label: 'Waiter Calls', icon: FiAlertCircle },
            { key: 'menu', label: 'Menu Items', icon: FiList },
            { key: 'reviews', label: 'Reviews', icon: FiStar },
            { key: 'qr', label: 'QR Code', icon: FiUsers }
          ].map(item => (
            <button key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{ ...styles.navBtn, ...(activeTab === item.key ? styles.navBtnActive : {}) }}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}><FiLogOut size={18} /> Logout</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'orders' && 'Live Orders'}
            {activeTab === 'calls' && 'Waiter Calls'}
            {activeTab === 'menu' && 'Menu Management'}
            {activeTab === 'reviews' && 'Customer Reviews'}
            {activeTab === 'qr' && 'QR Code'}
          </h1>
          <button onClick={fetchDashboard} style={styles.refreshBtn}><FiRefreshCw size={18} /> Refresh</button>
        </div>

        {activeTab === 'overview' && dashboard && (
          <div>
            <div style={styles.statsGrid}>
              <div style={{ ...styles.statCard, borderLeft: '4px solid #4CAF50' }}>
                <FiDollarSign size={28} color="#4CAF50" />
                <div>
                  <p style={styles.statLabel}>Daily Sales</p>
                  <h2 style={styles.statValue}>Rs. {dashboard.dailySales?.toLocaleString() || 0}</h2>
                </div>
              </div>
              <div style={{ ...styles.statCard, borderLeft: '4px solid #2196F3' }}>
                <FiUsers size={28} color="#2196F3" />
                <div>
                  <p style={styles.statLabel}>Customers Today</p>
                  <h2 style={styles.statValue}>{dashboard.dailyCustomerCount || 0}</h2>
                </div>
              </div>
              <div style={{ ...styles.statCard, borderLeft: '4px solid #ff9800' }}>
                <FiShoppingBag size={28} color="#ff9800" />
                <div>
                  <p style={styles.statLabel}>Orders Today</p>
                  <h2 style={styles.statValue}>{dashboard.totalOrdersToday || 0}</h2>
                </div>
              </div>
              <div style={{ ...styles.statCard, borderLeft: '4px solid #f44336' }}>
                <FiClock size={28} color="#f44336" />
                <div>
                  <p style={styles.statLabel}>Pending Orders</p>
                  <h2 style={styles.statValue}>{dashboard.pendingOrders || 0}</h2>
                </div>
              </div>
            </div>

            <h3 style={styles.sectionTitle}>Recent Orders</h3>
            <div style={styles.ordersList}>
              {(dashboard.todayOrders || []).slice(0, 10).map(order => (
                <div key={order._id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <strong>Table {order.tableNumber}</strong>
                    <span style={{ ...styles.badge, background: order.status === 'pending' ? '#ff9800' : order.status === 'preparing' ? '#2196F3' : order.status === 'ready' ? '#4CAF50' : '#666' }}>
                      {order.status}
                    </span>
                  </div>
                  <p style={styles.orderItems}>
                    {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </p>
                  <div style={styles.orderFooter}>
                    <span style={styles.orderTotal}>Rs. {order.totalAmount}</span>
                    <span style={styles.orderTime}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && dashboard && (
          <div style={styles.ordersList}>
            {(dashboard.todayOrders || []).map(order => (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>Table {order.tableNumber}</strong>
                    <span style={styles.orderNum}> {order.orderNumber}</span>
                  </div>
                  <span style={{ ...styles.badge, background: order.status === 'pending' ? '#ff9800' : order.status === 'preparing' ? '#2196F3' : order.status === 'ready' ? '#4CAF50' : '#666' }}>
                    {order.status}
                  </span>
                </div>
                <p style={styles.orderItemsLarge}>
                  Table {order.tableNumber} ordered: {order.items.map(i => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ')}
                </p>
                <div style={styles.orderFooter}>
                  <span style={styles.orderTotal}>Rs. {order.totalAmount}</span>
                  <div style={styles.actionBtns}>
                    {order.status === 'pending' && (
                      <button onClick={() => handleOrderStatus(order._id, 'preparing')} style={styles.prepBtn}>Start Preparing</button>
                    )}
                    {order.status === 'preparing' && (
                      <button onClick={() => handleOrderStatus(order._id, 'ready')} style={styles.readyBtn}>Mark Ready</button>
                    )}
                    {order.status === 'ready' && (
                      <button onClick={() => handleOrderStatus(order._id, 'completed')} style={styles.completeBtn}>Complete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!dashboard.todayOrders || dashboard.todayOrders.length === 0) && (
              <p style={styles.empty}>No orders today yet</p>
            )}
          </div>
        )}

        {activeTab === 'calls' && (
          <div style={styles.ordersList}>
            {waiterCalls.length === 0 && <p style={styles.empty}>No active waiter calls</p>}
            {waiterCalls.map(call => (
              <div key={call._id} style={styles.callCard}>
                <div style={styles.callInfo}>
                  <strong>Table {call.tableNumber}</strong>
                  <p style={styles.callMsg}>{call.message}</p>
                  <span style={styles.callTime}>{new Date(call.createdAt).toLocaleTimeString()}</span>
                </div>
                <button onClick={() => handleResolveCall(call._id)} style={styles.resolveBtn}>
                  <FiCheck size={16} /> Resolve
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'menu' && (
          <div style={styles.menuGrid}>
            {['food_items', 'beverages', 'coffee', 'liquors'].map(cat => (
              <div key={cat}>
                <h3 style={styles.catTitle}>{cat.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</h3>
                {menuItems.filter(i => i.category === cat).map(item => (
                  <div key={item._id} style={{ ...styles.menuItemRow, opacity: item.isAvailable ? 1 : 0.5 }}>
                    <div>
                      <strong>{item.name}</strong>
                      <span style={styles.menuPrice}> Rs. {item.price}</span>
                    </div>
                    <button onClick={() => handleToggleItem(item._id)}
                      style={{ ...styles.toggleBtn, background: item.isAvailable ? '#4CAF50' : '#f44336' }}>
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && dashboard && (
          <div style={styles.ordersList}>
            {(dashboard.recentReviews || []).length === 0 && <p style={styles.empty}>No reviews yet</p>}
            {(dashboard.recentReviews || []).map(review => (
              <div key={review._id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <strong>Table {review.tableNumber}</strong>
                  <span style={styles.reviewTime}>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={styles.reviewRatings}>
                  <span>Food: {'★'.repeat(review.foodRating)}{'☆'.repeat(5 - review.foodRating)}</span>
                  <span>Service: {'★'.repeat(review.serviceRating)}{'☆'.repeat(5 - review.serviceRating)}</span>
                </div>
                {review.comment && <p style={styles.reviewComment}>{review.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'qr' && (
          <div style={styles.qrSection}>
            <div style={styles.qrCard}>
              <h3 style={styles.qrTitle}>Common QR Code for All Tables</h3>
              <p style={styles.qrSubtext}>Print this QR code and place it on every table. Customers scan it to access the menu and order.</p>
              <div style={styles.qrCode}>
                <QRCode value={qrUrl} size={200} />
              </div>
              <p style={styles.qrUrl}>{qrUrl}</p>
              <p style={styles.qrNote}>One QR code for all tables - customers select their table number after scanning</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#667eea' },
  sidebar: {
    width: '240px', background: '#1a1a2e', color: '#fff', padding: '20px',
    display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh',
    overflowY: 'auto'
  },
  sidebarTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '30px', color: '#667eea' },
  nav: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px',
    background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer',
    borderRadius: '8px', fontSize: '14px', fontWeight: '500', textAlign: 'left'
  },
  navBtnActive: { background: '#667eea', color: '#fff' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px',
    background: 'transparent', border: '1px solid #444', color: '#aaa', cursor: 'pointer',
    borderRadius: '8px', fontSize: '14px', marginTop: '20px'
  },
  main: { flex: 1, marginLeft: '240px', padding: '20px 30px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e' },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
    background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' },
  statCard: {
    background: '#fff', borderRadius: '12px', padding: '20px', display: 'flex',
    alignItems: 'center', gap: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  statLabel: { fontSize: '13px', color: '#888', margin: '0 0 4px' },
  statValue: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#1a1a2e' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#1a1a2e' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  orderCard: {
    background: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  orderNum: { fontSize: '12px', color: '#888' },
  badge: {
    fontSize: '12px', color: '#fff', padding: '4px 12px', borderRadius: '20px',
    fontWeight: '600', textTransform: 'capitalize'
  },
  orderItems: { fontSize: '14px', color: '#555', margin: '0 0 10px' },
  orderItemsLarge: { fontSize: '15px', color: '#333', margin: '8px 0 12px', lineHeight: '1.5' },
  orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: '16px', fontWeight: '700', color: '#667eea' },
  orderTime: { fontSize: '12px', color: '#999' },
  actionBtns: { display: 'flex', gap: '8px' },
  prepBtn: { padding: '8px 16px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  readyBtn: { padding: '8px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  completeBtn: { padding: '8px 16px', background: '#666', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  callCard: {
    background: '#fff', borderRadius: '12px', padding: '18px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderLeft: '4px solid #ff6b35'
  },
  callInfo: {},
  callMsg: { fontSize: '14px', color: '#666', margin: '5px 0' },
  callTime: { fontSize: '12px', color: '#999' },
  resolveBtn: {
    display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px',
    background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  },
  empty: { textAlign: 'center', color: '#999', padding: '40px 0', fontSize: '16px' },
  menuGrid: { display: 'flex', flexDirection: 'column', gap: '25px' },
  catTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#1a1a2e', textTransform: 'capitalize' },
  menuItemRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#fff', padding: '12px 16px', borderRadius: '8px', marginBottom: '6px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  },
  menuPrice: { color: '#667eea', fontWeight: '600' },
  toggleBtn: {
    padding: '6px 14px', color: '#fff', border: 'none', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer'
  },
  reviewCard: {
    background: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  reviewTime: { fontSize: '12px', color: '#999' },
  reviewRatings: { display: 'flex', gap: '20px', fontSize: '14px', color: '#FFD700', marginBottom: '8px' },
  reviewComment: { fontSize: '14px', color: '#555', fontStyle: 'italic' },
  qrSection: { display: 'flex', justifyContent: 'center', padding: '20px' },
  qrCard: {
    background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center',
    maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  qrTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '10px' },
  qrSubtext: { fontSize: '14px', color: '#666', marginBottom: '25px' },
  qrCode: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  qrUrl: { fontSize: '14px', color: '#667eea', fontWeight: '600', wordBreak: 'break-all' },
  qrNote: { fontSize: '13px', color: '#999', marginTop: '15px', fontStyle: 'italic' }
};

export default Dashboard;
