import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import sweetService from '../../services/sweetService';
import './Sweet.css';

const SweetCard = ({ sweet, onUpdate, onPurchase }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      alert('Please login to purchase sweets');
      return;
    }

    setIsLoading(true);
    try {
      const response = await sweetService.purchaseSweet(sweet._id, purchaseQuantity, purchaseNotes);
      setShowPurchaseModal(false);
      setPurchaseQuantity(1);
      setPurchaseNotes('');
      if (onPurchase) onPurchase();
      
      const orderInfo = response.order ? `Order #${response.order.orderNumber} has been placed successfully!` : 'Purchase completed successfully!';
      
      // Show success message with option to view orders
      if (window.confirm(`${orderInfo}\n\nWould you like to view your orders?`)) {
        window.location.href = '/orders';
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Purchase failed');
    } finally {
      setIsLoading(false);
    }
  };



  const handleRestock = async () => {
    const quantity = prompt(`Restock "${sweet.name}"\nCurrent stock: ${sweet.quantity}\n\nEnter quantity to add:`);
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      await sweetService.restockSweet(sweet._id, parseInt(quantity));
      if (onUpdate) onUpdate(); // Refresh the list
      alert(`Sweet restocked successfully!`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to restock sweet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${sweet.name}"? This cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await sweetService.deleteSweet(sweet._id);
      if (onUpdate) onUpdate(); // Refresh the list
      alert('Sweet deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatusClass = () => {
    if (sweet.quantity === 0) return 'out-of-stock';
    if (sweet.quantity <= 10) return 'low-stock';
    return 'in-stock';
  };

  return (
    <div className="sweet-card">
      <div className="sweet-image">
        {sweet.imageUrl ? (
          <img src={sweet.imageUrl} alt={sweet.name} />
        ) : (
          <div className="sweet-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className="sweet-content">
        <h3 className="sweet-name">{sweet.name}</h3>
        <p className="sweet-category">{sweet.category}</p>
        {sweet.description && (
          <p className="sweet-description">{sweet.description}</p>
        )}
        
        <div className="sweet-details">
          <div className="sweet-price">₹{sweet.price.toFixed(2)}</div>
          <div className={`sweet-stock ${getStockStatusClass()}`}>
            {sweet.quantity} in stock
          </div>
        </div>
        
        <div className="sweet-actions">
          {isAuthenticated && sweet.quantity > 0 && !isAdmin && (
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="btn btn-primary"
              disabled={isLoading}
            >
              Buy Now
            </button>
          )}
          
          {isAdmin && (
            <div className="admin-actions">
              <button
                onClick={handleRestock}
                className="btn btn-success"
                disabled={isLoading}
              >
                Restock
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          )}
          
          {!isAuthenticated && (
            <p className="login-prompt">Login to purchase</p>
          )}
        </div>
      </div>
      
      {showPurchaseModal && (
        <div className="modal-overlay" onClick={() => {
          setShowPurchaseModal(false);
          setPurchaseQuantity(1);
          setPurchaseNotes('');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Purchase {sweet.name}</h3>
            <div className="purchase-form">
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={sweet.quantity}
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Notes (optional):</label>
                <textarea
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  className="form-input"
                  rows="2"
                />
              </div>
              <div className="purchase-total">
                Total: ₹{(sweet.price * purchaseQuantity).toFixed(2)}
              </div>
              <div className="modal-actions">
                <button
                  onClick={handlePurchase}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm Purchase'}
                </button>
                <button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setPurchaseQuantity(1);
                    setPurchaseNotes('');
                  }}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SweetCard;