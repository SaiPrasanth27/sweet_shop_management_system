import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import sweetService from '../services/sweetService';

const TestCustomer = () => {
  const { isAuthenticated, user } = useAuth();
  const { items, totalAmount, itemCount, addToCart, loadCart } = useCart();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, time: new Date().toLocaleTimeString() }]);
  };

  const testLoadSweets = async () => {
    try {
      setLoading(true);
      addTestResult('Load Sweets', false, 'Testing...');
      const response = await sweetService.getAllSweets();
      setSweets(response.sweets || []);
      addTestResult('Load Sweets', true, `Loaded ${response.sweets?.length || 0} sweets`);
    } catch (error) {
      addTestResult('Load Sweets', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAddToCart = async () => {
    if (!isAuthenticated) {
      addTestResult('Add to Cart', false, 'Not authenticated');
      return;
    }
    
    if (sweets.length === 0) {
      addTestResult('Add to Cart', false, 'No sweets available');
      return;
    }

    try {
      addTestResult('Add to Cart', false, 'Testing...');
      const firstSweet = sweets[0];
      await addToCart(firstSweet._id, 1);
      addTestResult('Add to Cart', true, `Added ${firstSweet.name} to cart`);
    } catch (error) {
      addTestResult('Add to Cart', false, error.response?.data?.error || error.message);
    }
  };

  const testLoadCart = async () => {
    if (!isAuthenticated) {
      addTestResult('Load Cart', false, 'Not authenticated');
      return;
    }

    try {
      addTestResult('Load Cart', false, 'Testing...');
      await loadCart();
      addTestResult('Load Cart', true, `Cart loaded: ${itemCount} items, ₹${totalAmount}`);
    } catch (error) {
      addTestResult('Load Cart', false, error.message);
    }
  };

  useEffect(() => {
    testLoadSweets();
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Customer Functionality Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Authentication Status</h3>
        <p>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        {user && <p>User: {user.username} ({user.role})</p>}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Cart Status</h3>
        <p>Items: {itemCount}</p>
        <p>Total: ₹{totalAmount}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Test Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={testLoadSweets} className="btn btn-primary" disabled={loading}>
            Test Load Sweets
          </button>
          <button onClick={testAddToCart} className="btn btn-secondary">
            Test Add to Cart
          </button>
          <button onClick={testLoadCart} className="btn btn-secondary">
            Test Load Cart
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Available Sweets ({sweets.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {sweets.slice(0, 4).map(sweet => (
            <div key={sweet._id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <h4>{sweet.name}</h4>
              <p>Category: {sweet.category}</p>
              <p>Price: ₹{sweet.price}</p>
              <p>Stock: {sweet.quantity}</p>
              <button 
                onClick={() => addToCart(sweet._id, 1)} 
                className="btn btn-primary btn-sm"
                disabled={!isAuthenticated}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>Test Results</h3>
        <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #ddd', padding: '1rem' }}>
          {testResults.map((result, index) => (
            <div key={index} style={{ 
              padding: '0.5rem', 
              marginBottom: '0.5rem', 
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              borderRadius: '4px'
            }}>
              <strong>{result.test}</strong> - {result.success ? '✅' : '❌'} {result.message}
              <small style={{ display: 'block', opacity: 0.7 }}>{result.time}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestCustomer;