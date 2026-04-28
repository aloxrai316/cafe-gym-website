import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { reviewAPI } from '../../services/api';
import { FiArrowLeft, FiStar, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StarRating = ({ value, onChange, label }) => (
  <div style={starStyles.container}>
    <span style={starStyles.label}>{label}</span>
    <div style={starStyles.stars}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onClick={() => onChange(star)} style={starStyles.starBtn}>
          <FiStar size={28} fill={star <= value ? '#FFD700' : 'none'} color={star <= value ? '#FFD700' : '#ccc'} />
        </button>
      ))}
    </div>
  </div>
);

const starStyles = {
  container: { marginBottom: '20px' },
  label: { fontSize: '15px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' },
  stars: { display: 'flex', gap: '5px' },
  starBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }
};

const Review = () => {
  const { tableNumber } = useCart();
  const navigate = useNavigate();
  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!tableNumber) { navigate('/'); return null; }

  const handleSubmit = async () => {
    if (!foodRating || !serviceRating) { toast.error('Please rate both food and service'); return; }
    setLoading(true);
    try {
      await reviewAPI.create({
        tableNumber: parseInt(tableNumber),
        foodRating,
        serviceRating,
        comment
      });
      setSubmitted(true);
      toast.success('Thank you for your review!');
    } catch (err) {
      toast.error('Failed to submit review');
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}><FiCheck size={48} /></div>
          <h2 style={styles.successTitle}>Thank You!</h2>
          <p style={styles.successText}>Your feedback means a lot to us</p>
          <button onClick={() => navigate('/menu')} style={styles.backBtn2}>Back to Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}><FiArrowLeft size={20} /></button>
        <h1 style={styles.title}>Rate Your Experience</h1>
        <span style={styles.tableBadge}>Table {tableNumber}</span>
      </div>

      <div style={styles.content}>
        <StarRating value={foodRating} onChange={setFoodRating} label="Food Quality" />
        <StarRating value={serviceRating} onChange={setServiceRating} label="Service Quality" />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)..."
          style={styles.textarea}
          maxLength={500}
        />

        <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
          {loading ? 'Submitting...' : 'Submit Review'}
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
  title: { fontSize: '18px', fontWeight: '700', margin: 0 },
  tableBadge: {
    fontSize: '12px', background: '#667eea', color: '#fff', padding: '2px 10px',
    borderRadius: '20px', fontWeight: '600'
  },
  content: { padding: '30px 20px', maxWidth: '420px', margin: '0 auto' },
  textarea: {
    width: '100%', height: '100px', border: '2px solid #e0e0e0', borderRadius: '12px',
    padding: '12px', fontSize: '14px', resize: 'none', fontFamily: 'inherit',
    marginBottom: '20px', boxSizing: 'border-box'
  },
  submitBtn: {
    width: '100%', padding: '16px', background: '#667eea', color: '#fff', border: 'none',
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
  successText: { fontSize: '16px', color: '#666' },
  backBtn2: {
    marginTop: '25px', padding: '12px 30px', background: '#667eea', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
  }
};

export default Review;
