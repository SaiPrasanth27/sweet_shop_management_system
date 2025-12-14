import React, { useState, useEffect } from 'react';
import SweetCard from '../components/Sweet/SweetCard';
import QuickEditModal from '../components/Sweet/QuickEditModal';
import sweetService from '../services/sweetService';
import { useAuth } from '../context/AuthContext';
import '../components/Sweet/Sweet.css';

const Home = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const { isAuthenticated, isAdmin } = useAuth();
  const [editingSweet, setEditingSweet] = useState(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);

  const loadSweets = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      let response;
      if (searchQuery.trim()) {
        response = await sweetService.searchSweets(searchQuery, params);
      } else {
        response = await sweetService.getAllSweets(params);
      }

      setSweets(response.sweets);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (err) {
      setError('Failed to load sweets. Please try again.');
      console.error('Error loading sweets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSweets();
  }, [pagination.page, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadSweets();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSweet = (sweet) => {
    setEditingSweet(sweet);
    setShowQuickEdit(true);
  };

  const handleEditSuccess = (updatedSweet) => {
    setSweets(sweets.map(sweet => 
      sweet._id === updatedSweet._id ? updatedSweet : sweet
    ));
    setShowQuickEdit(false);
    setEditingSweet(null);
  };

  const handleDeleteSweet = () => {
    // Refresh the sweets list after deletion
    loadSweets();
  };

  const handleRestockSweet = () => {
    // Refresh the sweets list after restocking
    loadSweets();
  };

  const categories = ['Chocolate', 'Gummy', 'Hard Candy', 'Cookies', 'Cakes', 'Other'];

  return (
    <div className="container">
      <div className="page-header">
        <h1>Premium Confectionery Collection</h1>
        <p>Explore our curated selection of premium sweets and confectionery products</p>
      </div>

      {/* Search and Filters */}
      <div className="search-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for sweets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="filters">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="form-input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>





          <button
            onClick={() => {
              setFilters({
                category: ''
              });
              setSearchQuery('');
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading">
          Loading delicious sweets...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          <div className="results-info">
            <p>
              {searchQuery ? `Search results for "${searchQuery}": ` : ''}
              {pagination.total} sweet{pagination.total !== 1 ? 's' : ''} found
            </p>
          </div>

          {sweets.length === 0 ? (
            <div className="no-results">
              <h3>No sweets found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <>
              <div className="sweets-grid">
                {sweets.map(sweet => (
                  <SweetCard
                    key={sweet._id}
                    sweet={sweet}
                    onPurchase={loadSweets}
                    onUpdate={isAdmin ? (sweet) => {
                      if (sweet) {
                        handleEditSweet(sweet);
                      } else {
                        handleRestockSweet();
                      }
                    } : undefined}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  
                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Quick Edit Modal for Admins */}
      {isAdmin && (
        <QuickEditModal
          sweet={editingSweet}
          isOpen={showQuickEdit}
          onClose={() => {
            setShowQuickEdit(false);
            setEditingSweet(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Login Prompt for Guests */}
      {!isAuthenticated && (
        <div className="guest-prompt">
          <h3>Want to purchase sweets?</h3>
          <p>Create an account or login to start buying your favorite treats!</p>
          <div className="guest-actions">
            <a href="/register" className="btn btn-primary">Sign Up</a>
            <a href="/login" className="btn btn-secondary">Login</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;