import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="container page">
      <div className="page-header"><h1><FiUser /> Profile</h1></div>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Personal Information</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label><FiUser /> Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label><FiMail /> Email</label>
              <input type="email" value={user?.email || ''} disabled style={{ background: 'var(--bg)' }} />
            </div>
            <div className="form-group">
              <label><FiPhone /> Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" value={user?.role?.replace(/_/g, ' ')} disabled style={{ background: 'var(--bg)', textTransform: 'capitalize' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}><FiLock /> Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-secondary">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
