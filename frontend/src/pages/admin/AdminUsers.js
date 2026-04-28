import React, { useState, useEffect } from 'react';
import { adminAPI, authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUserPlus, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'kitchen_staff' });

  useEffect(() => { fetchUsers(); }, [roleFilter, search]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await authAPI.createStaff(form);
      toast.success('Staff created');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', phone: '', role: 'kitchen_staff' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      fetchUsers();
    } catch (error) {
      toast.error('Toggle failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const roleColors = { admin: 'badge-danger', customer: 'badge-info', kitchen_staff: 'badge-warning', gym_trainer: 'badge-purple' };

  return (
    <div className="container page">
      <div className="page-header flex-between">
        <div><h1>User Management</h1><p>{users.length} users</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiUserPlus /> Add Staff</button>
      </div>

      <div className="admin-toolbar">
        <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="kitchen_staff">Kitchen Staff</option>
          <option value="gym_trainer">Gym Trainer</option>
        </select>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create Staff Account</h2>
            <form onSubmit={handleCreateStaff}>
              <div className="form-group"><label>Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
              <div className="form-group"><label>Phone</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="form-group"><label>Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="kitchen_staff">Kitchen Staff</option>
                  <option value="gym_trainer">Gym Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-1"><button type="submit" className="btn btn-primary">Create</button><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td><strong>{user.name}</strong></td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td><span className={`badge ${roleColors[user.role]}`}>{user.role?.replace(/_/g, ' ')}</span></td>
                <td><span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleToggle(user._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: user.isActive ? 'var(--green)' : '#e53e3e' }}>
                    {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
