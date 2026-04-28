import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderAPI } from '../../services/api';
import { FiArrowLeft, FiClock, FiCheck, FiPackage } from 'react-icons/fi';

const statusColors = {
  pending: '#ff9800',
  preparing: '#2196F3',
  ready: '#4CAF50',
  completed: '#666',
  cancelled: '#f44336'
};

const statusIcons = {
  pending: FiClock,
  preparing: FiPackage,
  ready: FiCheck,
  completed: FiCheck,
  cancelled: FiClock
};

const MyOrders = () => {
  const { tableNumber } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableNumber) { navigate('/'); return; }
    const fetchOrders = () => {
      orderAPI.getByTable(tableNumber).then(res => {
        setOrders(res.data.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [tableNumber, navigate]);

  if (loading) return <div style={styles.loading}>Loading orders...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/menu')} style={styles.backBtn}><FiArrowLeft size={20} /></button>
        <h1 style={styles.title}>My Orders</h1>
        <span style={styles.tableBadge}>Table {tableNumber}</span>
      </div>

      <div style={styles.ordersList}>
        {orders.length === 0 && <p style={styles.empty}>No orders yet today</p>}
        {orders.map(order => {
          const StatusIcon = statusIcons[order.status] || FiClock;
          return (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <span style={styles.orderNum}>{order.orderNumber}</span>
                <span style={{ ...styles.statusBadge, background: statusColors[order.status] || '#999' }}>
                  <StatusIcon size={12} /> {order.status}
                </span>
              </div>
              <div style={styles.orderItems}>
                {order.items.map((item, i) => (
                  <span key={i} style={styles.orderItem}>{item.name} x{item.quantity}</span>
                ))}
              </div>
              <div style={styles.orderFooter}>
                <span style={styles.orderTotal}>Rs. {order.totalAmount}</span>
                <span style={styles.orderTime}>
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#667eea' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 20px', background: '#fff', borderBottom: '1px solid #eee'
  },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: '8px' },
  title: { fontSize: '20px', fontWeight: '700', margin: 0 },
  tableBadge: {
    fontSize: '12px', background: '#667eea', color: '#fff', padding: '2px 10px',
    borderRadius: '20px', fontWeight: '600'
  },
  ordersList: { padding: '15px 20px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px 0', fontSize: '16px' },
  orderCard: {
    background: '#fff', borderRadius: '12px', padding: '15px', marginBottom: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  orderNum: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e' },
  statusBadge: {
    fontSize: '11px', color: '#fff', padding: '4px 10px', borderRadius: '20px',
    fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize'
  },
  orderItems: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' },
  orderItem: { background: '#f5f5f5', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', color: '#555' },
  orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '10px' },
  orderTotal: { fontSize: '16px', fontWeight: '700', color: '#667eea' },
  orderTime: { fontSize: '12px', color: '#999' }
};

export default MyOrders;
