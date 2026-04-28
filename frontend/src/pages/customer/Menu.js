import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiPlus, FiMinus, FiArrowLeft, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CATEGORIES = [
  { key: 'food_items', label: 'Food Items', icon: '🍽️' },
  { key: 'beverages', label: 'Beverages', icon: '🥤' },
  { key: 'coffee', label: 'Coffee', icon: '☕' },
  { key: 'liquors', label: 'Liquors', icon: '🍷' }
];

const Menu = () => {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('food_items');
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart, updateQuantity, getItemCount, tableNumber } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!tableNumber) { navigate('/'); return; }
    menuAPI.getAll().then(res => {
      setItems(res.data.data);
      setLoading(false);
    }).catch(() => { setLoading(false); toast.error('Failed to load menu'); });
  }, [tableNumber, navigate]);

  const getCartQty = (itemId) => {
    const item = cartItems.find(i => i._id === itemId);
    return item ? item.quantity : 0;
  };

  const filteredItems = items.filter(i => i.category === activeCategory);

  if (loading) return <div style={styles.loading}>Loading menu...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}><FiArrowLeft size={20} /></button>
        <div>
          <h1 style={styles.title}>Menu</h1>
          <span style={styles.tableBadge}>Table {tableNumber}</span>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => navigate('/call-waiter')} style={styles.waiterBtn}><FiPhone size={18} /></button>
          <button onClick={() => navigate('/cart')} style={styles.cartBtn}>
            <FiShoppingCart size={20} />
            {getItemCount() > 0 && <span style={styles.cartBadge}>{getItemCount()}</span>}
          </button>
        </div>
      </div>

      <div style={styles.categoryTabs}>
        {CATEGORIES.map(cat => (
          <button key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            style={{ ...styles.catTab, ...(activeCategory === cat.key ? styles.catTabActive : {}) }}
          >
            <span style={styles.catIcon}>{cat.icon}</span>
            <span style={styles.catLabel}>{cat.label}</span>
          </button>
        ))}
      </div>

      <div style={styles.itemsList}>
        {filteredItems.length === 0 && <p style={styles.empty}>No items in this category</p>}
        {filteredItems.map(item => {
          const qty = getCartQty(item._id);
          return (
            <div key={item._id} style={{ ...styles.itemCard, ...(item.isAvailable ? {} : styles.itemUnavailable) }}>
              <div style={styles.itemInfo}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <p style={styles.itemDesc}>{item.description}</p>
                <div style={styles.itemBottom}>
                  <span style={styles.itemPrice}>Rs. {item.price}</span>
                  {!item.isAvailable && <span style={styles.outOfStock}>Out of Stock</span>}
                </div>
              </div>
              {item.isAvailable && (
                <div style={styles.itemActions}>
                  {qty > 0 ? (
                    <div style={styles.qtyControl}>
                      <button onClick={() => updateQuantity(item._id, qty - 1)} style={styles.qtyBtn}><FiMinus size={14} /></button>
                      <span style={styles.qtyText}>{qty}</span>
                      <button onClick={() => { if (qty >= 20) { toast.warning('Max 20 per item'); return; } updateQuantity(item._id, qty + 1); }} style={styles.qtyBtn}><FiPlus size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} style={styles.addBtn}><FiPlus size={16} /> Add</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {getItemCount() > 0 && (
        <div style={styles.floatingCart} onClick={() => navigate('/cart')}>
          <span>{getItemCount()} items in cart</span>
          <span style={styles.viewCart}>View Cart →</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5', paddingBottom: '80px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#667eea' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 20px', background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 10
  },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: '8px' },
  title: { fontSize: '20px', fontWeight: '700', margin: 0, color: '#1a1a2e' },
  tableBadge: {
    fontSize: '12px', background: '#667eea', color: '#fff', padding: '2px 10px',
    borderRadius: '20px', fontWeight: '600'
  },
  headerRight: { display: 'flex', gap: '8px', alignItems: 'center' },
  waiterBtn: {
    background: '#ff6b35', border: 'none', color: '#fff', borderRadius: '50%',
    width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  cartBtn: {
    position: 'relative', background: '#667eea', border: 'none', color: '#fff',
    borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  cartBadge: {
    position: 'absolute', top: '-5px', right: '-5px', background: '#ff4444', color: '#fff',
    borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
  },
  categoryTabs: {
    display: 'flex', overflowX: 'auto', gap: '8px', padding: '15px 20px',
    background: '#fff', borderBottom: '1px solid #eee'
  },
  catTab: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
    borderRadius: '25px', border: '1px solid #e0e0e0', background: '#fff',
    cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: '500', color: '#666',
    transition: 'all 0.2s'
  },
  catTabActive: { background: '#667eea', color: '#fff', borderColor: '#667eea' },
  catIcon: { fontSize: '16px' },
  catLabel: {},
  itemsList: { padding: '15px 20px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px 0' },
  itemCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#fff', borderRadius: '12px', padding: '15px', marginBottom: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  itemUnavailable: { opacity: 0.5 },
  itemInfo: { flex: 1, marginRight: '15px' },
  itemName: { fontSize: '16px', fontWeight: '600', margin: '0 0 4px', color: '#1a1a2e' },
  itemDesc: { fontSize: '13px', color: '#888', margin: '0 0 8px', lineHeight: '1.3' },
  itemBottom: { display: 'flex', alignItems: 'center', gap: '10px' },
  itemPrice: { fontSize: '16px', fontWeight: '700', color: '#667eea' },
  outOfStock: { fontSize: '11px', color: '#ff4444', fontWeight: '600', background: '#fff0f0', padding: '2px 8px', borderRadius: '4px' },
  itemActions: {},
  qtyControl: {
    display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f0ff',
    borderRadius: '8px', padding: '4px'
  },
  qtyBtn: {
    width: '30px', height: '30px', borderRadius: '8px', border: 'none',
    background: '#667eea', color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  qtyText: { fontSize: '15px', fontWeight: '700', minWidth: '20px', textAlign: 'center' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 18px',
    background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  floatingCart: {
    position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
    background: '#667eea', color: '#fff', padding: '14px 30px', borderRadius: '30px',
    display: 'flex', justifyContent: 'space-between', gap: '20px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 5px 25px rgba(102,126,234,0.4)',
    maxWidth: '400px', width: 'calc(100% - 40px)'
  },
  viewCart: { fontWeight: '700' }
};

export default Menu;
