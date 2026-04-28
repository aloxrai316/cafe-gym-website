import React, { useState, useEffect } from 'react';
import { gymAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUsers, FiActivity, FiCalendar } from 'react-icons/fi';

const Trainer = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('members');

  useEffect(() => {
    Promise.all([
      gymAPI.getTrainerMembers(),
      gymAPI.getAllAttendance({})
    ]).then(([memRes, attRes]) => {
      setMembers(memRes.data.data);
      setAttendance(attRes.data.data);
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="page-header"><h1><FiActivity /> Trainer Dashboard</h1><p>{members.length} assigned members</p></div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button className={`btn ${tab === 'members' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('members')}><FiUsers /> My Members</button>
        <button className={`btn ${tab === 'attendance' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('attendance')}><FiCalendar /> Attendance</button>
      </div>

      {tab === 'members' && (
        members.length === 0 ? (
          <div className="empty-state"><h3>No members assigned</h3></div>
        ) : (
          <div className="grid-3">
            {members.map(m => (
              <div key={m._id} className="card">
                <h3><FiUsers /> {m.user?.name || 'N/A'}</h3>
                <p className="text-sm text-light">{m.user?.email}</p>
                <p className="text-sm text-light">{m.user?.phone}</p>
                <div className="mt-2">
                  <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{m.membershipType}</span>
                  <span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: '8px' }}>{m.status}</span>
                </div>
                <p className="text-sm mt-1">ID: {m.memberId}</p>
                <p className="text-sm">Valid: {new Date(m.startDate).toLocaleDateString()} - {new Date(m.endDate).toLocaleDateString()}</p>
                {m.healthInfo && (
                  <div className="mt-1 text-sm">
                    {m.healthInfo.height && <span>Height: {m.healthInfo.height}cm </span>}
                    {m.healthInfo.weight && <span>Weight: {m.healthInfo.weight}kg </span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'attendance' && (
        <div className="table-responsive card">
          <table>
            <thead><tr><th>Member</th><th>Check In</th><th>Check Out</th><th>Duration</th></tr></thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a._id}>
                  <td>{a.member?.user?.name || 'N/A'}</td>
                  <td>{new Date(a.checkIn).toLocaleString()}</td>
                  <td>{a.checkOut ? new Date(a.checkOut).toLocaleString() : <span className="badge badge-success">Active</span>}</td>
                  <td>{a.duration > 0 ? `${a.duration} min` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && <p className="text-light text-center mt-2">No records</p>}
        </div>
      )}
    </div>
  );
};

export default Trainer;
