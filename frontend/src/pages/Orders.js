import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      setOrders(response.orders || []);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };



  const normalizeStatus = (status) => {
    const statusMap = {
      'pending': 'ordered',
      'confirmed': 'ordered', 
      'preparing': 'ordered',
      'ready': 'ordered',
      'completed': 'received',
      'cancelled': 'cancelled',
      'ordered': 'ordered',
      'received': 'received'
    };
    return statusMap[status] || 'ordered';
  };

  const getStatusDisplay = (status) => {
    const normalized = normalizeStatus(status);
    const displayMap = {
      'ordered': 'Ordered',
      'received': 'Received', 
      'cancelled': 'Cancelled'
    };
    return displayMap[normalized] || 'Ordered';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="orders-page">
        <div className="orders-header">
          <h2>My Orders</h2>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>





        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchOrders} className="btn btn-secondary">
              Retry
            </button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7H16V6C16 3.79 14.21 2 12 2S8 3.79 8 6V7H5C3.9 7 3 7.9 3 9V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9C21 7.9 20.1 7 19 7ZM12 4C13.1 4 14 4.9 14 6V7H10V6C10 4.9 10.9 4 12 4ZM19 19H5V9H19V19Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>No orders found</h3>
            <p>
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h4 className="order-number">Order #{order.orderNumber}</h4>
                    <p className="order-date">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${normalizeStatus(order.status)}`}>
                      {getStatusDisplay(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="order-item-details">
                        <h5>{item.name}</h5>
                        <p>Quantity: {item.quantity}</p>
                        <p>₹{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="order-item-total">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: ₹{order.totalAmount.toFixed(2)}</strong>
                  </div>

                </div>

                {order.notes && (
                  <div className="order-notes">
                    <strong>Notes:</strong> {order.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;