import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); const interval = setInterval(fetchOrders, 15000); return () => clearInterval(interval); }, []);

  const fetchOrders = async () => {
    try {
      const res = await staffAPI.getKitchenOrders();
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await staffAPI.updateOrderStatus(id, status);
      toast.success(`Order updated to ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const statusColors = { pending: '#ffc107', confirmed: '#0ea5e9', preparing: '#8b5cf6', ready: '#00c897' };
  const statusBg = { pending: '#fffff0', confirmed: '#f0f9ff', preparing: '#f5f3ff', ready: '#f0fff4' };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="page-header flex-between">
        <div><h1>Kitchen Dashboard</h1><p>{orders.length} active orders</p></div>
        <button className="btn btn-outline btn-sm" onClick={fetchOrders}><FiRefreshCw /> Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state"><h3>No pending orders</h3><p>All caught up!</p></div>
      ) : (
        <div className="grid-3">
          {orders.map(order => (
            <div key={order._id} className="card" style={{ borderTop: `4px solid ${statusColors[order.status]}`, background: statusBg[order.status] }}>
              <div className="flex-between mb-2">
                <h3>{order.orderNumber}</h3>
                <span className={`badge ${order.status === 'ready' ? 'badge-success' : order.status === 'preparing' ? 'badge-purple' : 'badge-warning'}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-light"><FiClock /> {new Date(order.createdAt).toLocaleTimeString()}</p>
              {order.table && <p className="text-sm"><strong>Table {order.table.tableNumber}</strong></p>}
              {order.customer && <p className="text-sm">Customer: {order.customer.name}</p>}
              <div style={{ margin: '12px 0', padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex-between" style={{ padding: '6px 0', borderBottom: idx < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span><strong>{item.quantity}x</strong> {item.name}</span>
                    {item.specialInstructions && <span className="text-sm text-light">({item.specialInstructions})</span>}
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {order.status === 'pending' && <button className="btn btn-warning btn-sm" style={{ flex: 1 }} onClick={() => handleStatus(order._id, 'preparing')}>Start Preparing</button>}
                {order.status === 'preparing' && <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => handleStatus(order._id, 'ready')}><FiCheckCircle /> Mark Ready</button>}
                {order.status === 'ready' && <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleStatus(order._id, 'completed')}>Complete</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Kitchen;
