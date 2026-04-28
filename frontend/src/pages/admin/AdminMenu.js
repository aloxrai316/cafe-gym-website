import React, { useState, useEffect } from 'react';
import { menuAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import './Admin.css';

const emptyItem = { name: '', description: '', price: '', category: 'food', subCategory: '', preparationTime: 15, isVeg: false, isSpecial: false };

const AdminMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyItem);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await menuAPI.getAll({});
      setItems(res.data.data);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await menuAPI.update(editId, { ...form, price: parseFloat(form.price) });
        toast.success('Item updated');
      } else {
        await menuAPI.create({ ...form, price: parseFloat(form.price) });
        toast.success('Item created');
      }
      setShowModal(false);
      setEditId(null);
      setForm(emptyItem);
      fetchItems();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({ name: item.name, description: item.description, price: item.price, category: item.category, subCategory: item.subCategory || '', preparationTime: item.preparationTime, isVeg: item.isVeg, isSpecial: item.isSpecial });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await menuAPI.delete(id);
      toast.success('Item deleted');
      fetchItems();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await menuAPI.toggle(id);
      fetchItems();
    } catch (error) {
      toast.error('Toggle failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="page-header flex-between">
        <div><h1>Manage Menu</h1><p>{items.length} items</p></div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditId(null); setForm(emptyItem); }}>
          <FiPlus /> Add Item
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editId ? 'Edit' : 'Add'} Menu Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Description</label><textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-group"><label>Price (Rs.)</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="0" /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="food">Food</option><option value="drinks">Drinks</option>
                </select>
              </div>
              <div className="form-group"><label>Sub-category</label><input type="text" value={form.subCategory} onChange={e => setForm({...form, subCategory: e.target.value})} placeholder="e.g. appetizer, coffee" /></div>
              <div className="form-group"><label>Prep Time (min)</label><input type="number" value={form.preparationTime} onChange={e => setForm({...form, preparationTime: parseInt(e.target.value)})} min="1" /></div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={form.isVeg} onChange={e => setForm({...form, isVeg: e.target.checked})} /> Vegetarian
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={form.isSpecial} onChange={e => setForm({...form, isSpecial: e.target.checked})} /> Special
                </label>
              </div>
              <div className="flex gap-1">
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Prep Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td><strong>{item.name}</strong>{item.isSpecial && <span className="badge badge-purple" style={{ marginLeft: '8px' }}>Special</span>}</td>
                <td><span className="badge badge-info">{item.category}</span></td>
                <td>Rs. {item.price}</td>
                <td>{item.preparationTime} min</td>
                <td><span className={`badge ${item.isVeg ? 'badge-success' : 'badge-danger'}`}>{item.isVeg ? 'Veg' : 'Non-Veg'}</span></td>
                <td>
                  <button onClick={() => handleToggle(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: item.isAvailable ? 'var(--green)' : '#e53e3e' }}>
                    {item.isAvailable ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(item)}><FiEdit /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMenu;
