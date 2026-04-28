import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiStar, FiSend } from 'react-icons/fi';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [type, setType] = useState('cafe');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedbackAPI.getMy().then(res => setFeedbacks(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a rating');
    try {
      const res = await feedbackAPI.create({ rating, comment, type });
      toast.success('Feedback submitted!');
      setFeedbacks([res.data.data, ...feedbacks]);
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="page-header"><h1>Feedback</h1><p>We'd love to hear from you</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Share Your Experience</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="cafe">Cafe</option>
                <option value="gym">Gym</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rating</label>
              <div className="stars" style={{ fontSize: '2rem' }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`star ${i <= (hoverRating || rating) ? 'filled' : ''}`}
                    onClick={() => setRating(i)} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea rows="4" value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us about your experience..." />
            </div>
            <button type="submit" className="btn btn-primary"><FiSend /> Submit Feedback</button>
          </form>
        </div>
        <div>
          <h3 style={{ marginBottom: '16px' }}>Your Reviews</h3>
          {feedbacks.length === 0 ? (
            <div className="empty-state"><p>No reviews yet</p></div>
          ) : (
            feedbacks.map(f => (
              <div key={f._id} className="card" style={{ marginBottom: '12px' }}>
                <div className="flex-between">
                  <div className="stars">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={`star ${i <= f.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                  <span className="badge badge-info">{f.type}</span>
                </div>
                <p className="mt-1">{f.comment}</p>
                <p className="text-sm text-light mt-1">{new Date(f.createdAt).toLocaleDateString()}</p>
                {f.response && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                    <p className="text-sm"><strong>Response:</strong> {f.response}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
