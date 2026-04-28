import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './Admin.css';

const statusColors = {
  pending: 'badge-warning', confirmed: 'badge-info', preparing: 'badge-purple',
  ready: 'badge-success', out_for_delivery: 'badge-info', delivered: 'badge-success',
  completed: 'badge-success', cancelled: 'badge-danger'
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [discountModal, setDiscountModal] = useState(null);
  const [discount, setDiscount] = useState({ amount: 0, type: 'fixed' });

  useEffect(() => { fetchOrders(); }, [filter]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await orderAPI.getAll(params);
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status);
      toast.success(`Order updated to ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDiscount = async () => {
    if (!discountModal) return;
    try {
      await orderAPI.applyDiscount(discountModal, { discount: discount.amount, discountType: discount.type });
      toast.success('Discount applied');
      setDiscountModal(null);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to apply discount');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="page-header"><h1>Manage Orders</h1><p>{orders.length} orders</p></div>
      <div className="admin-toolbar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {discountModal && (
        <div className="modal-overlay" onClick={() => setDiscountModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Apply Discount</h2>
            <div className="form-group">
              <label>Discount Type</label>
              <select value={discount.type} onChange={e => setDiscount({...discount, type: e.target.value})}>
                <option value="fixed">Fixed (Rs.)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" value={discount.amount} onChange={e => setDiscount({...discount, amount: parseFloat(e.target.value)})} min="0" />
            </div>
            <div className="flex gap-1">
              <button className="btn btn-primary" onClick={handleDiscount}>Apply</button>
              <button className="btn btn-outline" onClick={() => setDiscountModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table>
          <thead>
            <tr><th>Order #</th><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td><strong>{order.orderNumber}</strong></td>
                <td>{order.customer?.name || 'N/A'}</td>
                <td><span className="badge badge-info">{order.orderType?.replace(/_/g, ' ')}</span></td>
                <td>{order.items?.map(i => `${i.name}x${i.quantity}`).join(', ')}</td>
                <td><strong>Rs. {order.totalAmount}</strong>{order.discount > 0 && <span className="text-green text-sm"> (-{order.discount})</span>}</td>
                <td><span className={`badge ${statusColors[order.status]}`}>{order.status}</span></td>
                <td className="text-sm">{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <div className="action-btns">
                    {order.status === 'pending' && <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(order._id, 'confirmed')}>Confirm</button>}
                    {order.status === 'confirmed' && <button className="btn btn-warning btn-sm" onClick={() => handleStatusUpdate(order._id, 'preparing')}>Prepare</button>}
                    {order.status === 'preparing' && <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(order._id, 'ready')}>Ready</button>}
                    {order.status === 'ready' && <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(order._id, 'completed')}>Complete</button>}
                    {!['completed','cancelled'].includes(order.status) && (
                      <>
                        <button className="btn btn-outline btn-sm" onClick={() => { setDiscountModal(order._id); setDiscount({ amount: 0, type: 'fixed' }); }}>Discount</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(order._id, 'cancelled')}>Cancel</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && <div className="empty-state"><h3>No orders found</h3></div>}
    </div>
  );
};

export default AdminOrders;
