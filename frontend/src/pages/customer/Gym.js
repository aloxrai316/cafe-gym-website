import React, { useState, useEffect } from 'react';
import { gymAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiActivity, FiCalendar, FiClock, FiUser, FiCheck } from 'react-icons/fi';

const plans = [
  { type: 'basic', name: 'Basic', price: 2000, features: ['Weight Training', 'Locker Access', 'Basic Equipment'], color: '#4a5568' },
  { type: 'cardio', name: 'Cardio', price: 3000, features: ['All Basic Features', 'Cardio Machines', 'Treadmill & Cycling'], color: 'var(--primary)', popular: true },
  { type: 'premium', name: 'Premium', price: 5000, features: ['All Cardio Features', 'Personal Trainer', 'Nutrition Plan', 'Sauna Access'], color: 'var(--secondary)' }
];

const Gym = () => {
  const [membership, setMembership] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      gymAPI.getMyMembership().catch(() => ({ data: { data: null } })),
      gymAPI.getMyAttendance().catch(() => ({ data: { data: [] } }))
    ]).then(([memRes, attRes]) => {
      setMembership(memRes.data.data);
      setAttendance(attRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleRegister = async (type) => {
    try {
      const res = await gymAPI.register({ membershipType: type, startDate: new Date() });
      setMembership(res.data.data);
      toast.success(`${type} membership registered!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleCheckIn = async () => {
    try {
      await gymAPI.checkIn();
      toast.success('Checked in successfully!');
      const res = await gymAPI.getMyAttendance();
      setAttendance(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await gymAPI.checkOut();
      toast.success('Checked out!');
      const res = await gymAPI.getMyAttendance();
      setAttendance(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="page-header"><h1><FiActivity /> Gym Membership</h1><p>Choose your fitness plan</p></div>

      {membership && membership.status === 'active' ? (
        <>
          <div className="card mb-3" style={{ background: 'linear-gradient(135deg, var(--dark), var(--dark-light))', color: 'white' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '8px' }}>Active</span>
                <h2 style={{ textTransform: 'capitalize' }}>{membership.membershipType} Membership</h2>
                <p style={{ opacity: 0.7 }}>Member ID: {membership.memberId}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p><FiCalendar /> {new Date(membership.startDate).toLocaleDateString()} - {new Date(membership.endDate).toLocaleDateString()}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', marginTop: '8px' }}>Rs. {membership.totalFee}/mo</p>
              </div>
            </div>
            {membership.trainer && (
              <p className="mt-2"><FiUser /> Trainer: {membership.trainer.name}</p>
            )}
            <div className="flex gap-2 mt-3">
              <button className="btn btn-success" onClick={handleCheckIn}>Check In</button>
              <button className="btn btn-warning" onClick={handleCheckOut}>Check Out</button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}><FiClock /> Recent Attendance</h3>
            {attendance.length === 0 ? (
              <p className="text-light">No attendance records yet</p>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map(a => (
                      <tr key={a._id}>
                        <td>{new Date(a.checkIn).toLocaleDateString()}</td>
                        <td>{new Date(a.checkIn).toLocaleTimeString()}</td>
                        <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : <span className="badge badge-success">Active</span>}</td>
                        <td>{a.duration > 0 ? `${a.duration} min` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="grid-3">
          {plans.map(plan => (
            <div key={plan.type} className="card" style={{ border: plan.popular ? `2px solid ${plan.color}` : '2px solid transparent', position: 'relative', textAlign: 'center', padding: '40px 24px' }}>
              {plan.popular && <span className="special-badge" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>Most Popular</span>}
              <h3 style={{ fontSize: '1.3rem', color: plan.color }}>{plan.name}</h3>
              <div style={{ margin: '20px 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: plan.color }}>Rs. {plan.price}</span>
                <span className="text-light"> /month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px', textAlign: 'left' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCheck style={{ color: 'var(--green)' }} /> {f}
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary btn-lg" style={{ width: '100%', background: plan.color }} onClick={() => handleRegister(plan.type)}>
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gym;
