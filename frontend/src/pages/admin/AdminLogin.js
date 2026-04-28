import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { user, token } = res.data.data;
      if (user.role !== 'admin') {
        toast.error('Admin access only');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <div style={styles.iconWrap}><FiLock size={40} /></div>
        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>FitBite Cafe Management</p>

        <div style={styles.inputGroup}>
          <FiMail style={styles.inputIcon} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address" required style={styles.input} />
        </div>

        <div style={styles.inputGroup}>
          <FiLock style={styles.inputIcon} />
          <input type={showPwd ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Password"
            required style={styles.input} />
          <button type="button" onClick={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
            {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>

        <button type="submit" disabled={loading} style={styles.loginBtn}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '20px'
  },
  card: {
    background: '#fff', borderRadius: '20px', padding: '40px 30px', maxWidth: '400px',
    width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  iconWrap: { color: '#667eea', marginBottom: '10px' },
  title: { fontSize: '24px', fontWeight: '700', margin: '0 0 5px' },
  subtitle: { fontSize: '14px', color: '#888', margin: '0 0 30px' },
  inputGroup: {
    position: 'relative', marginBottom: '15px'
  },
  inputIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' },
  input: {
    width: '100%', padding: '14px 14px 14px 42px', border: '2px solid #e0e0e0',
    borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box', outline: 'none'
  },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#999'
  },
  loginBtn: {
    width: '100%', padding: '15px', background: '#667eea', color: '#fff', border: 'none',
    borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '10px'
  }
};

export default AdminLogin;
