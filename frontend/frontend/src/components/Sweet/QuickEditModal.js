import React, { useState, useEffect } from 'react';
import sweetService from '../../services/sweetService';

const QuickEditModal = ({ sweet, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Chocolate', 'Gummy', 'Hard Candy', 'Cookies', 'Cakes', 'Other'];

  useEffect(() => {
    if (sweet) {
      setFormData({
        name: sweet.name || '',
        price: sweet.price || '',
        quantity: sweet.quantity || '',
        category: sweet.category || '',
        description: sweet.description || ''
      });
    }
  }, [sweet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updatedSweet = await sweetService.updateSweet(sweet._id, {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      });
      
      onSuccess(updatedSweet);
      onClose();
    } catch (err) {
      console.error('Error updating sweet:', err);
      setError(err.response?.data?.error || 'Failed to update sweet');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quick-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Quick Edit: {sweet?.name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="quick-edit-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="form-input"
              placeholder="Optional description..."
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Sweet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickEditModal;