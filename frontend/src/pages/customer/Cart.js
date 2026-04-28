import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderAPI } from '../../services/api';
import { FiArrowLeft, FiPlus, FiMinus, FiTrash2, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const TAX_RATE = 0.13;

const Cart = () => {
  const { cartItems, tableNumber, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const navigate = useNavigate();

  if (!tableNumber) { navigate('/'); return null; }

  const subtotal = getTotal();
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const handleOrder = async () => {
    if (cartItems.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const res = await orderAPI.createGuest({
        items: cartItems.map(i => ({ menuItem: i._id, quantity: i.quantity })),
        tableNumber: parseInt(tableNumber)
      });
      setOrderPlaced(res.data.data);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (orderPlaced) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}><FiCheck size={48} /></div>
          <h2 style={styles.successTitle}>Order Placed!</h2>
          <p style={styles.successText}>Order #{orderPlaced.orderNumber}</p>
          <p style={styles.successText}>Table {orderPlaced.tableNumber}</p>
          <div style={styles.successItems}>
            {orderPlaced.items.map((item, i) => (
              <span key={i} style={styles.successItem}>{item.name} x{item.quantity}</span>
            ))}
          </div>
          <p style={styles.successTotal}>Total: Rs. {orderPlaced.totalAmount}</p>
          <div style={styles.successActions}>
            <button onClick={() => navigate('/menu')} style={styles.orderMoreBtn}>Order More</button>
            <button onClick={() => navigate('/review')} style={styles.reviewBtn}>Leave Review</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/menu')} style={styles.backBtn}><FiArrowLeft size={20} /></button>
        <h1 style={styles.title}>Your Cart</h1>
        <span style={styles.tableBadge}>Table {tableNumber}</span>
      </div>

      {cartItems.length === 0 ? (
        <div style={styles.emptyCart}>
          <p style={styles.emptyText}>Your cart is empty</p>
          <button onClick={() => navigate('/menu')} style={styles.browseBtn}>Browse Menu</button>
        </div>
      ) : (
        <>
          <div style={styles.itemsList}>
            {cartItems.map(item => (
              <div key={item._id} style={styles.cartItem}>
                <div style={styles.cartItemInfo}>
                  <h3 style={styles.cartItemName}>{item.name}</h3>
                  <p style={styles.cartItemPrice}>Rs. {item.price} each</p>
                </div>
                <div style={styles.cartItemActions}>
                  <div style={styles.qtyControl}>
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={styles.qtyBtn}><FiMinus size={12} /></button>
                    <span style={styles.qtyText}>{item.quantity}</span>
                    <button onClick={() => { if (item.quantity >= 20) { toast.warning('Max 20 per item'); return; } updateQuantity(item._id, item.quantity + 1); }} style={styles.qtyBtn}><FiPlus size={12} /></button>
                  </div>
                  <span style={styles.itemTotal}>Rs. {item.price * item.quantity}</span>
                  <button onClick={() => removeFromCart(item._id)} style={styles.removeBtn}><FiTrash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <div style={styles.summaryRow}><span>Subtotal</span><span>Rs. {subtotal}</span></div>
            <div style={styles.summaryRow}><span>Tax (13%)</span><span>Rs. {tax}</span></div>
            <div style={styles.summaryTotal}><span>Total</span><span>Rs. {total}</span></div>
            <button onClick={handleOrder} disabled={loading} style={styles.placeOrderBtn}>
              {loading ? 'Placing Order...' : `Place Order - Rs. ${total}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
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
  emptyCart: { textAlign: 'center', padding: '60px 20px' },
  emptyText: { fontSize: '18px', color: '#999', marginBottom: '20px' },
  browseBtn: {
    padding: '12px 30px', background: '#667eea', color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
  },
  itemsList: { padding: '15px 20px' },
  cartItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#fff', borderRadius: '12px', padding: '15px', marginBottom: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: '15px', fontWeight: '600', margin: '0 0 4px' },
  cartItemPrice: { fontSize: '13px', color: '#888', margin: 0 },
  cartItemActions: { display: 'flex', alignItems: 'center', gap: '10px' },
  qtyControl: {
    display: 'flex', alignItems: 'center', gap: '6px', background: '#f0f0ff',
    borderRadius: '6px', padding: '3px'
  },
  qtyBtn: {
    width: '26px', height: '26px', borderRadius: '6px', border: 'none',
    background: '#667eea', color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  qtyText: { fontSize: '14px', fontWeight: '700', minWidth: '18px', textAlign: 'center' },
  itemTotal: { fontSize: '14px', fontWeight: '700', color: '#667eea', minWidth: '70px', textAlign: 'right' },
  removeBtn: { background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '4px' },
  summary: {
    position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff',
    padding: '15px 20px', borderTop: '1px solid #eee', boxShadow: '0 -5px 20px rgba(0,0,0,0.05)'
  },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#666' },
  summaryTotal: { display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '15px', paddingTop: '10px', borderTop: '1px solid #eee' },
  placeOrderBtn: {
    width: '100%', padding: '15px', background: '#667eea', color: '#fff', border: 'none',
    borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer'
  },
  successCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', padding: '40px 20px', textAlign: 'center'
  },
  successIcon: {
    width: '80px', height: '80px', borderRadius: '50%', background: '#4CAF50', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
  },
  successTitle: { fontSize: '24px', fontWeight: '700', margin: '0 0 10px' },
  successText: { fontSize: '16px', color: '#666', margin: '4px 0' },
  successItems: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', margin: '15px 0' },
  successItem: { background: '#f0f0ff', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', color: '#667eea', fontWeight: '500' },
  successTotal: { fontSize: '20px', fontWeight: '700', color: '#667eea', marginTop: '10px' },
  successActions: { display: 'flex', gap: '12px', marginTop: '25px' },
  orderMoreBtn: {
    padding: '12px 24px', background: '#667eea', color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  reviewBtn: {
    padding: '12px 24px', background: '#fff', color: '#667eea', border: '2px solid #667eea',
    borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  }
};

export default Cart;
