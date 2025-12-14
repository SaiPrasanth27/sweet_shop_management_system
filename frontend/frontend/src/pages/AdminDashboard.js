import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SweetForm from '../components/Sweet/SweetForm';
import QuickEditModal from '../components/Sweet/QuickEditModal';

import sweetService from '../services/sweetService';
import '../components/Sweet/Sweet.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [showQuickEdit, setShowQuickEdit] = useState(false);

  const categories = ['All', 'Chocolate', 'Gummy', 'Hard Candy', 'Cookies', 'Cakes', 'Other'];

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const response = await sweetService.getAllSweets();
      setSweets(response.sweets || []);
      setError('');
    } catch (err) {
      console.error('Error fetching sweets:', err);
      setError('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSweet = () => {
    setEditingSweet(null);
    setShowForm(true);
  };

  const handleEditSweet = (sweet) => {
    setEditingSweet(sweet);
    setShowForm(true);
  };

  const handleQuickEdit = (sweet) => {
    setEditingSweet(sweet);
    setShowQuickEdit(true);
  };

  const handleQuickEditSuccess = (updatedSweet) => {
    setSweets(sweets.map(sweet => 
      sweet && sweet._id === updatedSweet._id ? updatedSweet : sweet
    ));
    setShowQuickEdit(false);
    setEditingSweet(null);
  };

  const handleDeleteSweet = async (sweetId, sweetName) => {
    if (!sweetId) {
      console.error('No sweet ID provided');
      return;
    }

    const confirmMessage = `Are you sure you want to delete "${sweetName}"?\n\nThis action cannot be undone and will remove the sweet from all customer carts.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await sweetService.deleteSweet(sweetId);
      setSweets(sweets.filter(sweet => sweet && sweet._id !== sweetId));
      alert('Sweet deleted successfully!');
    } catch (err) {
      console.error('Error deleting sweet:', err);
      alert('Failed to delete sweet. It may be referenced in existing orders.');
    }
  };

  const handleFormSuccess = (savedSweet) => {
    if (!savedSweet) {
      console.error('No sweet data received');
      return;
    }

    if (editingSweet) {
      // Update existing sweet
      setSweets(sweets.map(sweet => 
        sweet && sweet._id === savedSweet._id ? savedSweet : sweet
      ));
    } else {
      // Add new sweet
      setSweets([...sweets, savedSweet]);
    }
    setShowForm(false);
    setEditingSweet(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSweet(null);
  };

  const handleRestock = async (sweetId, currentStock, sweetName) => {
    const quantity = prompt(`Restock "${sweetName}"\nCurrent stock: ${currentStock}\n\nEnter quantity to add:`);
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      return;
    }

    const addQuantity = parseInt(quantity);
    const newTotal = currentStock + addQuantity;
    
    if (!window.confirm(`Add ${addQuantity} units to "${sweetName}"?\nNew total will be: ${newTotal}`)) {
      return;
    }

    try {
      const response = await sweetService.restockSweet(sweetId, addQuantity);
      
      // Update the sweet's quantity in the local state
      setSweets(sweets.map(sweet => 
        sweet && sweet._id === sweetId 
          ? { ...sweet, quantity: response.newQuantity || sweet.quantity + addQuantity }
          : sweet
      ));
      
      alert(`Sweet restocked successfully!\nNew stock level: ${response.newQuantity || newTotal}`);
    } catch (err) {
      console.error('Error restocking sweet:', err);
      alert('Failed to restock sweet');
    }
  };

  const filteredSweets = sweets.filter(sweet => {
    // Skip if sweet is null or undefined
    if (!sweet || !sweet.name) {
      return false;
    }
    
    const matchesSearch = sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sweet.description && sweet.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || 
                           sweet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="container">
        <div className="error-message">
          <h3>Access Denied</h3>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2>Management Dashboard</h2>
          <p>Welcome, {user.name}! Manage your confectionery inventory and operations.</p>
          

        </div>

        {showForm ? (
          <div className="form-section">
            <SweetForm
              sweet={editingSweet}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <>
            <div className="dashboard-actions">
              <button 
                onClick={handleAddSweet}
                className="btn btn-primary"
              >
                Add New Product
              </button>
            </div>

            <div className="dashboard-filters">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="Search sweets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="filter-group">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-input"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'All' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={fetchSweets} className="btn btn-secondary">
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="loading">Loading sweets...</div>
            ) : (
              <div className="sweets-management">
                <h3>Sweet Inventory ({filteredSweets.length} items)</h3>
                
                {filteredSweets.length === 0 ? (
                  <div className="no-sweets">
                    <p>No sweets found. {searchTerm || selectedCategory ? 'Try adjusting your filters.' : 'Add your first sweet!'}</p>
                  </div>
                ) : (
                  <div className="sweets-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSweets.map(sweet => {
                          // Safety check to ensure sweet exists and has required properties
                          if (!sweet || !sweet._id || !sweet.name) {
                            return null;
                          }
                          
                          return (
                            <tr key={sweet._id}>
                              <td>
                                {sweet.imageUrl ? (
                                  <img 
                                    src={sweet.imageUrl} 
                                    alt={sweet.name}
                                    className="sweet-thumbnail"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="no-image">No Image</div>
                                )}
                              </td>
                              <td>
                                <div className="sweet-info">
                                  <strong>{sweet.name}</strong>
                                  {sweet.description && (
                                    <p className="sweet-description">
                                      {sweet.description.length > 50 
                                        ? `${sweet.description.substring(0, 50)}...`
                                        : sweet.description
                                      }
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className="category-badge">{sweet.category || 'Unknown'}</span>
                              </td>
                              <td>${(sweet.price || 0).toFixed(2)}</td>
                              <td>
                                <span className={`stock-badge ${(sweet.quantity || 0) === 0 ? 'out-of-stock' : (sweet.quantity || 0) < 10 ? 'low-stock' : 'in-stock'}`}>
                                  {sweet.quantity || 0}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    onClick={() => handleQuickEdit(sweet)}
                                    className="btn btn-sm btn-secondary"
                                    title={`Quick Edit ${sweet.name}`}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => handleRestock(sweet._id, sweet.quantity, sweet.name)}
                                    className="btn btn-sm btn-success"
                                    title={`Restock ${sweet.name} (Current: ${sweet.quantity})`}
                                  >
                                    📦 Restock
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSweet(sweet._id, sweet.name)}
                                    className="btn btn-sm btn-danger"
                                    title={`Delete ${sweet.name}`}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Quick Edit Modal */}
        <QuickEditModal
          sweet={editingSweet}
          isOpen={showQuickEdit}
          onClose={() => {
            setShowQuickEdit(false);
            setEditingSweet(null);
          }}
          onSuccess={handleQuickEditSuccess}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;