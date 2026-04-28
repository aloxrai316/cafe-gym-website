import React, { useState, useEffect } from 'react';
import { tableAPI, reservationAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import QRCode from 'react-qr-code';
import './Admin.css';

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [form, setForm] = useState({ tableNumber: '', capacity: 4, location: 'indoor' });

  useEffect(() => {
    Promise.all([
      tableAPI.getAll({}),
      reservationAPI.getAll({}).catch(() => ({ data: { data: [] } }))
    ]).then(([tableRes, resRes]) => {
      setTables(tableRes.data.data);
      setReservations(resRes.data.data);
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tableAPI.create({ ...form, tableNumber: parseInt(form.tableNumber), capacity: parseInt(form.capacity) });
      toast.success('Table created');
      setShowModal(false);
      setForm({ tableNumber: '', capacity: 4, location: 'indoor' });
      const res = await tableAPI.getAll({});
      setTables(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await tableAPI.updateStatus(id, status);
      const res = await tableAPI.getAll({});
      setTables(res.data.data);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleReservationStatus = async (id, status) => {
    try {
      await reservationAPI.updateStatus(id, status);
      toast.success(`Reservation ${status}`);
      const res = await reservationAPI.getAll({});
      setReservations(res.data.data);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this table?')) return;
    try {
      await tableAPI.delete(id);
      toast.success('Table deactivated');
      const res = await tableAPI.getAll({});
      setTables(res.data.data);
    } catch (error) {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const statusColor = { available: 'badge-success', reserved: 'badge-warning', occupied: 'badge-danger' };

  return (
    <div className="container page">
      <div className="page-header flex-between">
        <div><h1>Tables & Reservations</h1><p>{tables.length} tables</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Add Table</button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Table</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Table Number</label><input type="number" value={form.tableNumber} onChange={e => setForm({...form, tableNumber: e.target.value})} required min="1" /></div>
              <div className="form-group"><label>Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} required min="1" max="20" /></div>
              <div className="form-group"><label>Location</label>
                <select value={form.location} onChange={e => setForm({...form, location: e.target.value})}>
                  <option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="vip">VIP</option>
                </select>
              </div>
              <div className="flex gap-1"><button type="submit" className="btn btn-primary">Create</button><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h2>Table {showQR.tableNumber} QR Code</h2>
            <p className="text-light mb-2">Scan to access menu</p>
            <QRCode value={`${window.location.origin}/menu?table=${showQR.tableNumber}`} size={200} />
            <p className="text-sm mt-2">{window.location.origin}/menu?table={showQR.tableNumber}</p>
            <button className="btn btn-outline mt-2" onClick={() => setShowQR(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="grid-4 mb-3">
        {tables.map(table => (
          <div key={table._id} className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Table {table.tableNumber}</h3>
            <p className="text-sm text-light">{table.capacity} seats • {table.location}</p>
            <span className={`badge ${statusColor[table.status]} mt-1`}>{table.status}</span>
            <div className="flex gap-1 mt-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowQR(table)}>QR</button>
              <select value={table.status} onChange={e => handleStatusChange(table._id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
              </select>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(table._id)}><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Reservations</h3>
        <div className="table-responsive">
          <table>
            <thead><tr><th>Customer</th><th>Table</th><th>Date</th><th>Time</th><th>Guests</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r._id}>
                  <td>{r.customer?.name || 'N/A'}</td>
                  <td>Table {r.table?.tableNumber}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.startTime} - {r.endTime}</td>
                  <td>{r.guestCount}</td>
                  <td><span className={`badge ${r.advancePayment?.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{r.advancePayment?.status}</span></td>
                  <td><span className={`badge ${r.status === 'confirmed' ? 'badge-success' : r.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span></td>
                  <td>
                    <div className="action-btns">
                      {r.status === 'pending' && <button className="btn btn-success btn-sm" onClick={() => handleReservationStatus(r._id, 'confirmed')}>Confirm</button>}
                      {['pending','confirmed'].includes(r.status) && <button className="btn btn-danger btn-sm" onClick={() => handleReservationStatus(r._id, 'cancelled')}>Cancel</button>}
                      {r.status === 'confirmed' && <button className="btn btn-primary btn-sm" onClick={() => handleReservationStatus(r._id, 'completed')}>Complete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reservations.length === 0 && <p className="text-light text-center mt-2">No reservations</p>}
      </div>
    </div>
  );
};

export default AdminTables;
