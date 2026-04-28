import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'kitchen_staff') navigate('/kitchen');
      else if (user.role === 'gym_trainer') navigate('/trainer');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-branding">
            <h1>🏋️‍♂️☕ FitBite</h1>
            <p>Your Cafe & Gym, One Platform</p>
            <div className="auth-features">
              <div className="auth-feature">
                <span>☕</span>
                <div><strong>Cafe</strong><br/>Order food, reserve tables</div>
              </div>
              <div className="auth-feature">
                <span>💪</span>
                <div><strong>Gym</strong><br/>Manage memberships</div>
              </div>
              <div className="auth-feature">
                <span>📱</span>
                <div><strong>Digital</strong><br/>QR menus, online orders</div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Welcome Back</h2>
            <p className="text-light">Sign in to your account</p>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="auth-switch">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
            <div className="demo-accounts">
              <p><strong>Demo Accounts:</strong></p>
              <button type="button" className="demo-btn" onClick={() => { setEmail('admin@cafegym.com'); setPassword('admin123'); }}>Admin</button>
              <button type="button" className="demo-btn" onClick={() => { setEmail('customer@cafegym.com'); setPassword('customer123'); }}>Customer</button>
              <button type="button" className="demo-btn" onClick={() => { setEmail('kitchen@cafegym.com'); setPassword('kitchen123'); }}>Kitchen</button>
              <button type="button" className="demo-btn" onClick={() => { setEmail('trainer@cafegym.com'); setPassword('trainer123'); }}>Trainer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
