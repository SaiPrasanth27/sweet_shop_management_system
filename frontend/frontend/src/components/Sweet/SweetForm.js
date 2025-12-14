import React, { useState, useEffect } from 'react';
import sweetService from '../../services/sweetService';
import './Sweet.css';

const SweetForm = ({ sweet, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Chocolate',
    price: '',
    quantity: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = ['Chocolate', 'Gummy', 'Hard Candy', 'Cookies', 'Cakes', 'Other'];

  useEffect(() => {
    if (sweet) {
      setFormData({
        name: sweet.name || '',
        category: sweet.category || 'Chocolate',
        price: sweet.price?.toString() || '',
        quantity: sweet.quantity?.toString() || '',
        description: sweet.description || ''
      });
      
      // Set image preview if sweet has an image
      if (sweet.imageUrl) {
        setImagePreview(sweet.imageUrl);
      }
    }
  }, [sweet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file (JPEG, JPG, PNG, GIF, WebP)'
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image file size must be less than 5MB'
        }));
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous image errors
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Sweet name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Sweet name must be at least 2 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a non-negative integer';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('quantity', parseInt(formData.quantity));
      if (formData.description) {
        formDataToSend.append('description', formData.description.trim());
      }
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      let response;
      if (sweet) {
        // Update existing sweet
        response = await sweetService.updateSweetWithImage(sweet._id, formDataToSend);
      } else {
        // Create new sweet
        response = await sweetService.createSweetWithImage(formDataToSend);
      }

      if (onSuccess) {
        onSuccess(response.sweet);
      }

      // Reset form if creating new sweet
      if (!sweet) {
        setFormData({
          name: '',
          category: 'Chocolate',
          price: '',
          quantity: '',
          description: ''
        });
        setSelectedImage(null);
        setImagePreview(null);
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) {
          fileInput.value = '';
        }
      }

      alert(sweet ? 'Sweet updated successfully!' : 'Sweet created successfully!');
    } catch (error) {
      console.error('Error saving sweet:', error);
      
      // Handle different types of errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors with details
        if (errorData.details && Array.isArray(errorData.details)) {
          const newErrors = {};
          errorData.details.forEach(detail => {
            // Map backend field names to frontend field names
            const field = detail.path || detail.param;
            if (field) {
              newErrors[field] = detail.msg;
            }
          });
          setErrors(newErrors);
          alert('Please fix the validation errors and try again.');
        }
        // Handle duplicate name error
        else if (errorData.error && errorData.error.includes('already exists')) {
          setErrors({ name: 'A sweet with this name already exists. Please choose a different name.' });
          alert('A sweet with this name already exists. Please choose a different name.');
        }
        // Handle other specific errors
        else {
          alert(errorData.error || 'Failed to save sweet');
        }
      } else {
        alert('Failed to save sweet. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sweet-form">
      <h3>{sweet ? 'Edit Sweet' : 'Add New Sweet'}</h3>
      
      {/* Display general errors */}
      {Object.keys(errors).length > 0 && (
        <div className="form-errors">
          <h4>Please fix the following errors:</h4>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {message}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Sweet Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter sweet name"
              disabled={isLoading}
              required
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
              disabled={isLoading}
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <div className="error">{errors.category}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price" className="form-label">Price (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isLoading}
              required
            />
            {errors.price && <div className="error">{errors.price}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="quantity" className="form-label">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="form-input"
              placeholder="0"
              min="0"
              disabled={isLoading}
              required
            />
            {errors.quantity && <div className="error">{errors.quantity}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter sweet description (optional)"
            rows="3"
            maxLength="500"
            disabled={isLoading}
          />
          <small className="form-help">
            {formData.description.length}/500 characters
          </small>
          {errors.description && <div className="error">{errors.description}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">Sweet Image (Optional)</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="form-input"
            disabled={isLoading}
          />
          <small className="form-help">
            Supported formats: JPEG, JPG, PNG, GIF, WebP (Max size: 5MB)
          </small>
          {errors.image && <div className="error">{errors.image}</div>}
          
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" className="preview-image" />
              <button
                type="button"
                onClick={removeImage}
                className="btn btn-secondary btn-small"
                disabled={isLoading}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (sweet ? 'Update Sweet' : 'Add Sweet')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SweetForm;