import React, { useState, useEffect } from 'react';
import { gymAPI, adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiUser } from 'react-icons/fi';
import './Admin.css';

const AdminGym = () => {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('members');

  useEffect(() => {
    Promise.all([
      gymAPI.getAllMembers({}),
      adminAPI.getUsers({ role: 'gym_trainer' }),
      gymAPI.getAllAttendance({})
    ]).then(([memRes, trainerRes, attRes]) => {
      setMembers(memRes.data.data);
      setTrainers(trainerRes.data.data);
      setAttendance(attRes.data.data);
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false));
  }, []);

  const handleRenew = async (id) => {
    try {
      await gymAPI.renew(id);
      toast.success('Membership renewed');
      const res = await gymAPI.getAllMembers({});
      setMembers(res.data.data);
    } catch (error) { toast.error('Renew failed'); }
  };

  const handleAssignTrainer = async (memberId, trainerId) => {
    try {
      await gymAPI.assignTrainer(memberId, trainerId);
      toast.success('Trainer assigned');
      const res = await gymAPI.getAllMembers({});
      setMembers(res.data.data);
    } catch (error) { toast.error('Assignment failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const statusColors = { active: 'badge-success', expired: 'badge-danger', suspended: 'badge-warning', cancelled: 'badge-danger' };

  return (
    <div className="container page">
      <div className="page-header"><h1>Gym Management</h1><p>{members.length} members</p></div>

      <div className="admin-toolbar">
        <button className={`btn ${tab === 'members' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('members')}>Members</button>
        <button className={`btn ${tab === 'attendance' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('attendance')}>Attendance</button>
      </div>

      {tab === 'members' && (
        <div className="table-responsive">
          <table>
            <thead><tr><th>Member</th><th>ID</th><th>Type</th><th>Fee</th><th>Start</th><th>End</th><th>Trainer</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m._id}>
                  <td><strong>{m.user?.name || 'N/A'}</strong><br /><span className="text-sm text-light">{m.user?.email}</span></td>
                  <td>{m.memberId}</td>
                  <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{m.membershipType}</span></td>
                  <td>Rs. {m.totalFee}</td>
                  <td className="text-sm">{new Date(m.startDate).toLocaleDateString()}</td>
                  <td className="text-sm">{new Date(m.endDate).toLocaleDateString()}</td>
                  <td>
                    <select value={m.trainer?._id || ''} onChange={e => handleAssignTrainer(m._id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      <option value="">No trainer</option>
                      {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td><span className={`badge ${statusColors[m.status]}`}>{m.status}</span></td>
                  <td>
                    <div className="action-btns">
                      {['expired', 'active'].includes(m.status) && (
                        <button className="btn btn-success btn-sm" onClick={() => handleRenew(m._id)}><FiRefreshCw /> Renew</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && <div className="empty-state"><h3>No gym members</h3></div>}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="table-responsive">
          <table>
            <thead><tr><th>Member</th><th>Check In</th><th>Check Out</th><th>Duration</th></tr></thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a._id}>
                  <td><FiUser /> {a.member?.user?.name || 'N/A'}</td>
                  <td>{new Date(a.checkIn).toLocaleString()}</td>
                  <td>{a.checkOut ? new Date(a.checkOut).toLocaleString() : <span className="badge badge-success">Active</span>}</td>
                  <td>{a.duration > 0 ? `${a.duration} min` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && <div className="empty-state"><h3>No attendance records</h3></div>}
        </div>
      )}
    </div>
  );
};

export default AdminGym;
