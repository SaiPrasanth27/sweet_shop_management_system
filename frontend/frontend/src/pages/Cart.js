import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import '../components/Cart/Cart.css';

const Cart = () => {
  const { items, totalAmount, itemCount, updateCartItem, removeFromCart, clearCart, loading } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  const handleQuantityChange = async (sweetId, newQuantity) => {
    try {
      await updateCartItem(sweetId, newQuantity);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (sweetId) => {
    if (window.confirm('Remove this item from your cart?')) {
      try {
        await removeFromCart(sweetId);
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to remove item');
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to clear cart');
      }
    }
  };

  const handleCheckout = async () => {
    if (itemCount === 0) {
      alert('Your cart is empty');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await orderService.checkout(notes);
      alert('Order placed successfully!');
      navigate(`/orders/${response.order.orderNumber}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.error || 'Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="cart-page">
        <div className="cart-page-header">
          <h2>Shopping Cart ({itemCount} items)</h2>
          {itemCount > 0 && (
            <button 
              className="btn btn-outline-danger"
              onClick={handleClearCart}
              disabled={loading}
            >
              Clear Cart
            </button>
          )}
        </div>

        {itemCount === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any sweets to your cart yet.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-page-content">
            <div className="cart-page-items">
              {items.map((item) => {
                const sweet = item.sweet;
                const sweetId = sweet._id || sweet;
                
                return (
                  <div key={sweetId} className="cart-page-item">
                    <div className="cart-item-image">
                      {sweet.imageUrl ? (
                        <img src={sweet.imageUrl} alt={sweet.name} />
                      ) : (
                        <div className="cart-item-placeholder">No Image</div>
                      )}
                    </div>
                    
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{sweet.name}</h4>
                      <p className="cart-item-category">{sweet.category}</p>
                      <div className="cart-item-price">₹{item.price.toFixed(2)} each</div>
                    </div>
                    
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(sweetId, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(sweetId, item.quantity + 1)}
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="cart-item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(sweetId)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-page-summary">
              <h3 className="cart-summary-title">Order Summary</h3>
              
              <div className="cart-summary-line">
                <span>Items ({itemCount}):</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="cart-summary-line">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              
              <div className="cart-summary-total">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="form-group" style={{ margin: '1rem 0' }}>
                <label htmlFor="notes" className="form-label">Order Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input"
                  placeholder="Any special instructions..."
                  rows="3"
                  maxLength="500"
                />
                <small className="form-help">
                  {notes.length}/500 characters
                </small>
              </div>

              <div className="cart-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || itemCount === 0}
                >
                  {checkoutLoading ? 'Placing Order...' : 'Place Order'}
                </button>
                
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;