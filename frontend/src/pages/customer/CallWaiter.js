import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { waiterAPI } from '../../services/api';
import { FiArrowLeft, FiPhone, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CallWaiter = () => {
  const { tableNumber } = useCart();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [called, setCalled] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!tableNumber) { navigate('/'); return null; }

  const handleCall = async () => {
    setLoading(true);
    try {
      await waiterAPI.call({
        tableNumber: parseInt(tableNumber),
        message: message || 'Customer needs assistance'
      });
      setCalled(true);
      toast.success('Waiter has been called!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to call waiter');
    } finally { setLoading(false); }
  };

  if (called) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}><FiCheck size={48} /></div>
          <h2 style={styles.successTitle}>Waiter Called!</h2>
          <p style={styles.successText}>Staff has been notified for Table {tableNumber}</p>
          <p style={styles.successSubtext}>Someone will be with you shortly</p>
          <button onClick={() => navigate('/menu')} style={styles.backToMenuBtn}>Back to Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}><FiArrowLeft size={20} /></button>
        <h1 style={styles.title}>Call Waiter</h1>
        <span style={styles.tableBadge}>Table {tableNumber}</span>
      </div>

      <div style={styles.content}>
        <div style={styles.iconWrap}><FiPhone size={48} color="#667eea" /></div>
        <h2 style={styles.heading}>Need Assistance?</h2>
        <p style={styles.subtext}>Tap the button below to call a waiter to your table</p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a message (optional)..."
          style={styles.textarea}
          maxLength={200}
        />

        <button onClick={handleCall} disabled={loading} style={styles.callBtn}>
          <FiPhone size={20} />
          {loading ? 'Calling...' : 'Call Waiter'}
        </button>
      </div>
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
  content: { padding: '40px 20px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' },
  iconWrap: { marginBottom: '20px' },
  heading: { fontSize: '22px', fontWeight: '700', margin: '0 0 10px' },
  subtext: { fontSize: '15px', color: '#666', marginBottom: '25px' },
  textarea: {
    width: '100%', height: '80px', border: '2px solid #e0e0e0', borderRadius: '12px',
    padding: '12px', fontSize: '14px', resize: 'none', fontFamily: 'inherit',
    marginBottom: '20px', boxSizing: 'border-box'
  },
  callBtn: {
    width: '100%', padding: '16px', background: '#ff6b35', color: '#fff', border: 'none',
    borderRadius: '12px', fontSize: '18px', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
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
  successSubtext: { fontSize: '14px', color: '#999', marginTop: '5px' },
  backToMenuBtn: {
    marginTop: '25px', padding: '12px 30px', background: '#667eea', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
  }
};

export default CallWaiter;
