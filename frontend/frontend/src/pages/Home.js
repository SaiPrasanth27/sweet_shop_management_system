import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SweetCard from '../components/Sweet/SweetCard';
import sweetService from '../services/sweetService';
import { useAuth } from '../context/AuthContext';
import { testConnection } from '../utils/connectionTest';
import '../components/Sweet/Sweet.css';

const Home = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  const loadSweets = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        setError(`Connection Error: ${connectionTest.error}`);
        return;
      }
      
      const response = await sweetService.getAllSweets({ limit: 8 });
      setSweets(response.sweets || []);
    } catch (err) {
      console.error('Error loading sweets:', err);
      if (err.code === 'ECONNREFUSED') {
        setError('Backend server is not running. Please start the backend server on port 5002.');
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Please check the backend routes.');
      } else {
        setError(`Failed to load sweets: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSweets();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1>Babai Bakery</h1>
          <p>Discover our amazing collection of premium sweets and bakery items</p>
          {!isAuthenticated && (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-outline">Login</Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="welcome-message">
              <h3>Welcome back, {user?.username}! 👋</h3>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container main-content">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading delicious sweets...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={loadSweets} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && (
          <>
            <div className="section-header">
              <h2>Featured Sweets</h2>
              <p>Handpicked favorites from our collection</p>
            </div>

            {sweets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No sweets available yet</h3>
                <p>Check back soon for delicious treats!</p>
              </div>
            ) : (
              <div className="sweets-grid">
                {sweets.map(sweet => (
                  <SweetCard
                    key={sweet._id}
                    sweet={sweet}
                    onPurchase={loadSweets}
                    onUpdate={loadSweets}
                  />
                ))}
              </div>
            )}

            {/* Call to Action */}
            {!isAuthenticated && (
              <div className="cta-section">
                <h3>Ready to start shopping?</h3>
                <p>Join thousands of happy customers enjoying our premium sweets</p>
                <div className="cta-actions">
                  <Link to="/register" className="btn btn-primary">Create Account</Link>
                  <Link to="/login" className="btn btn-secondary">Login</Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;