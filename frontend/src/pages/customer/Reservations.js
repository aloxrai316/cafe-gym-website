import React, { useState, useEffect } from 'react';
import { reservationAPI, tableAPI, paymentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiUsers, FiMapPin } from 'react-icons/fi';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    table: '', date: '', startTime: '', endTime: '', duration: 2, guestCount: 2, specialRequests: ''
  });

  useEffect(() => {
    Promise.all([
      reservationAPI.getMy(),
      tableAPI.getAll({})
    ]).then(([resRes, tableRes]) => {
      setReservations(resRes.data.data);
      setTables(tableRes.data.data);
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await reservationAPI.create(form);
      toast.success('Reservation created! Pay Rs. 500 advance to confirm.');
      setReservations([res.data.data, ...reservations]);
      setShowForm(false);
      setForm({ table: '', date: '', startTime: '', endTime: '', duration: 2, guestCount: 2, specialRequests: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reservation failed');
    }
  };

  const handlePayAdvance = async (reservation) => {
    try {
      await paymentAPI.create({
        reservationId: reservation._id,
        amount: 500,
        paymentMethod: 'online',
        paymentType: 'advance',
        paymentFor: 'reservation'
      });
      toast.success('Advance payment successful! Reservation confirmed.');
      const res = await reservationAPI.getMy();
      setReservations(res.data.data);
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await reservationAPI.cancel(id);
      toast.success('Reservation cancelled');
      const res = await reservationAPI.getMy();
      setReservations(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="page-header flex-between">
        <div><h1>Table Reservations</h1><p>Reserve your table in advance</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Reservation'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-3">
          <h3 style={{ marginBottom: '16px' }}>New Reservation</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label><FiMapPin /> Select Table</label>
                <select value={form.table} onChange={e => setForm({...form, table: e.target.value})} required>
                  <option value="">Choose a table</option>
                  {tables.filter(t => t.status === 'available').map(t => (
                    <option key={t._id} value={t._id}>Table {t.tableNumber} - {t.capacity} seats ({t.location})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label><FiCalendar /> Date</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label><FiClock /> Start Time</label>
                <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
              </div>
              <div className="form-group">
                <label><FiClock /> End Time</label>
                <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
              </div>
              <div className="form-group">
                <label><FiUsers /> Guests</label>
                <input type="number" value={form.guestCount} onChange={e => setForm({...form, guestCount: parseInt(e.target.value)})} min="1" max="20" required />
              </div>
              <div className="form-group">
                <label>Special Requests</label>
                <input type="text" value={form.specialRequests} onChange={e => setForm({...form, specialRequests: e.target.value})} placeholder="Any special requests?" />
              </div>
            </div>
            <p className="text-sm text-light mb-2">Advance payment of Rs. 500 required to confirm reservation</p>
            <button type="submit" className="btn btn-primary">Create Reservation</button>
          </form>
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="empty-state"><h3>No reservations</h3><p>Make your first table reservation</p></div>
      ) : (
        <div className="grid-2">
          {reservations.map(r => (
            <div key={r._id} className="card">
              <div className="flex-between mb-2">
                <h3>Table {r.table?.tableNumber}</h3>
                <span className={`badge ${r.status === 'confirmed' ? 'badge-success' : r.status === 'pending' ? 'badge-warning' : r.status === 'cancelled' ? 'badge-danger' : 'badge-info'}`}>
                  {r.status}
                </span>
              </div>
              <p className="text-sm"><FiCalendar /> {new Date(r.date).toLocaleDateString()}</p>
              <p className="text-sm"><FiClock /> {r.startTime} - {r.endTime}</p>
              <p className="text-sm"><FiUsers /> {r.guestCount} guests</p>
              <p className="text-sm"><FiMapPin /> {r.table?.location}</p>
              {r.specialRequests && <p className="text-sm text-light mt-1">Note: {r.specialRequests}</p>}
              <div className="flex gap-1 mt-2">
                {r.status === 'pending' && r.advancePayment?.status === 'pending' && (
                  <button className="btn btn-success btn-sm" onClick={() => handlePayAdvance(r)}>Pay Rs. 500 Advance</button>
                )}
                {['pending', 'confirmed'].includes(r.status) && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r._id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reservations;
