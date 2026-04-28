import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import './Admin.css';

const emptyItem = { itemName: '', category: 'ingredient', quantity: 0, unit: 'pcs', minStockLevel: 10, costPerUnit: 0 };

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState(0);
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => { fetchItems(); }, [showLowStock]);

  const fetchItems = async () => {
    try {
      const params = {};
      if (showLowStock) params.lowStock = 'true';
      const res = await inventoryAPI.getAll(params);
      setItems(res.data.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await inventoryAPI.update(editId, form);
        toast.success('Item updated');
      } else {
        await inventoryAPI.create(form);
        toast.success('Item added');
      }
      setShowModal(false); setEditId(null); setForm(emptyItem); fetchItems();
    } catch (error) { toast.error('Operation failed'); }
  };

  const handleRestock = async () => {
    if (!restockModal) return;
    try {
      await inventoryAPI.restock(restockModal, restockQty);
      toast.success('Restocked!');
      setRestockModal(null); setRestockQty(0); fetchItems();
    } catch (error) { toast.error('Restock failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await inventoryAPI.delete(id);
      toast.success('Deleted');
      fetchItems();
    } catch (error) { toast.error('Delete failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="page-header flex-between">
        <div><h1>Inventory Management</h1><p>{items.length} items</p></div>
        <div className="flex gap-1">
          <button className={`btn ${showLowStock ? 'btn-danger' : 'btn-outline'} btn-sm`} onClick={() => setShowLowStock(!showLowStock)}>
            <FiAlertTriangle /> {showLowStock ? 'Show All' : 'Low Stock'}
          </button>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditId(null); setForm(emptyItem); }}><FiPlus /> Add Item</button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editId ? 'Edit' : 'Add'} Inventory Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Item Name</label><input type="text" value={form.itemName} onChange={e => setForm({...form, itemName: e.target.value})} required /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="ingredient">Ingredient</option><option value="beverage">Beverage</option><option value="packaging">Packaging</option><option value="equipment">Equipment</option><option value="other">Other</option>
                </select>
              </div>
              <div className="form-group"><label>Quantity</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} min="0" /></div>
              <div className="form-group"><label>Unit</label>
                <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                  <option value="kg">kg</option><option value="g">g</option><option value="l">l</option><option value="ml">ml</option><option value="pcs">pcs</option><option value="dozen">dozen</option><option value="pack">pack</option>
                </select>
              </div>
              <div className="form-group"><label>Min Stock Level</label><input type="number" value={form.minStockLevel} onChange={e => setForm({...form, minStockLevel: parseInt(e.target.value)})} min="0" /></div>
              <div className="form-group"><label>Cost per Unit (Rs.)</label><input type="number" value={form.costPerUnit} onChange={e => setForm({...form, costPerUnit: parseFloat(e.target.value)})} min="0" /></div>
              <div className="flex gap-1"><button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add'}</button><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {restockModal && (
        <div className="modal-overlay" onClick={() => setRestockModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Restock Item</h2>
            <div className="form-group"><label>Quantity to Add</label><input type="number" value={restockQty} onChange={e => setRestockQty(parseInt(e.target.value))} min="1" /></div>
            <div className="flex gap-1"><button className="btn btn-success" onClick={handleRestock}>Restock</button><button className="btn btn-outline" onClick={() => setRestockModal(null)}>Cancel</button></div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table>
          <thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Unit</th><th>Min Level</th><th>Cost/Unit</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id} style={{ background: item.isLowStock ? '#fff5f5' : 'transparent' }}>
                <td><strong>{item.itemName}</strong></td>
                <td><span className="badge badge-info">{item.category}</span></td>
                <td><strong>{item.quantity}</strong></td>
                <td>{item.unit}</td>
                <td>{item.minStockLevel}</td>
                <td>Rs. {item.costPerUnit}</td>
                <td>{item.isLowStock ? <span className="badge badge-danger"><FiAlertTriangle /> Low</span> : <span className="badge badge-success">OK</span>}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-success btn-sm" onClick={() => { setRestockModal(item._id); setRestockQty(10); }}><FiRefreshCw /></button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditId(item._id); setForm(item); setShowModal(true); }}><FiEdit /></button>
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

export default AdminInventory;
