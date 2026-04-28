import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiCoffee } from 'react-icons/fi';

const Welcome = () => {
  const [selectedTable, setSelectedTable] = useState('');
  const { setTableNumber } = useCart();
  const navigate = useNavigate();
  const tables = Array.from({ length: 15 }, (_, i) => i + 1);

  const handleStart = () => {
    if (!selectedTable) return;
    setTableNumber(selectedTable);
    navigate('/menu');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}><FiCoffee size={48} /></div>
        <h1 style={styles.title}>FitBite Cafe</h1>
        <p style={styles.subtitle}>Welcome! Please select your table to start ordering</p>

        <div style={styles.tableGrid}>
          {tables.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTable(String(t))}
              style={{
                ...styles.tableBtn,
                ...(selectedTable === String(t) ? styles.tableBtnActive : {})
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={handleStart}
          disabled={!selectedTable}
          style={{
            ...styles.startBtn,
            ...(selectedTable ? {} : styles.startBtnDisabled)
          }}
        >
          {selectedTable ? `Start Ordering - Table ${selectedTable}` : 'Select a Table'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px'
  },
  card: {
    background: '#fff', borderRadius: '20px', padding: '40px 30px', maxWidth: '420px',
    width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
  },
  logo: { color: '#667eea', marginBottom: '10px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px' },
  subtitle: { fontSize: '15px', color: '#666', margin: '0 0 30px', lineHeight: '1.5' },
  tableGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '25px'
  },
  tableBtn: {
    width: '100%', padding: '14px 0', border: '2px solid #e0e0e0', borderRadius: '12px',
    background: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
    color: '#333', transition: 'all 0.2s'
  },
  tableBtnActive: {
    background: '#667eea', color: '#fff', borderColor: '#667eea', transform: 'scale(1.05)'
  },
  startBtn: {
    width: '100%', padding: '16px', border: 'none', borderRadius: '12px',
    background: '#667eea', color: '#fff', fontSize: '16px', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.2s'
  },
  startBtnDisabled: { background: '#ccc', cursor: 'not-allowed' }
};

export default Welcome;
