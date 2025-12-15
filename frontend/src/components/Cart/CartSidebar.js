import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const CartSidebar = ({ isOpen, onClose }) => {
  const { items, totalAmount, itemCount, updateCartItem, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (sweetId, newQuantity) => {
    try {
      await updateCartItem(sweetId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert(error.response?.data?.error || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (sweetId) => {
    try {
      await removeFromCart(sweetId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/');
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Shopping Cart ({itemCount})</h3>
          <button className="cart-close" onClick={onClose}>×</button>
        </div>

        <div className="cart-content">
          {loading ? (
            <div className="cart-empty">
              <div>Loading cart...</div>
            </div>
          ) : itemCount === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h4>Your cart is empty</h4>
              <p>Add some delicious sweets to get started!</p>
            </div>
          ) : (
            <div className="cart-items">
              {items.map((item) => {
                const sweet = item.sweet;
                const sweetId = sweet._id || sweet;
                
                return (
                  <div key={sweetId} className="cart-item">
                    <div className="cart-item-image">
                      {sweet.imageUrl ? (
                        <img src={sweet.imageUrl} alt={sweet.name} />
                      ) : (
                        <div className="cart-item-placeholder">No Image</div>
                      )}
                    </div>
                    
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{sweet.name}</h4>
                      <div className="cart-item-price">₹{item.price.toFixed(2)} each</div>
                      
                      <div className="cart-item-controls">
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
                        
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveItem(sweetId)}
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="cart-item-total">
                        Total: ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {itemCount > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total: ₹{totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="cart-actions">
              <button className="btn btn-primary" onClick={handleCheckout}>
                View Cart & Checkout
              </button>
              <button className="btn btn-secondary" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;