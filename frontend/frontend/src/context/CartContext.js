import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.cart?.items || [],
        totalAmount: action.payload.totalAmount || 0,
        itemCount: action.payload.itemCount || 0,
        loading: false,
        error: null
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalAmount: 0,
        itemCount: 0,
        loading: false,
        error: null
      };
    
    case 'UPDATE_ITEM_COUNT':
      return {
        ...state,
        itemCount: action.payload
      };
    
    default:
      return state;
  }
};

const initialState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
  loading: false,
  error: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated, user]);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.getCart();
      dispatch({ type: 'SET_CART', payload: response });
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (sweetId, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.addToCart(sweetId, quantity);
      dispatch({ type: 'SET_CART', payload: response });
      return response;
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to add to cart' });
      throw error;
    }
  };

  const updateCartItem = async (sweetId, quantity) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.updateCartItem(sweetId, quantity);
      dispatch({ type: 'SET_CART', payload: response });
      return response;
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to update cart' });
      throw error;
    }
  };

  const removeFromCart = async (sweetId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.removeFromCart(sweetId);
      dispatch({ type: 'SET_CART', payload: response });
      return response;
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to remove from cart' });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to clear cart' });
      throw error;
    }
  };

  const getCartItemQuantity = (sweetId) => {
    const item = state.items.find(item => 
      (item.sweet._id || item.sweet) === sweetId
    );
    return item ? item.quantity : 0;
  };

  const isInCart = (sweetId) => {
    return state.items.some(item => 
      (item.sweet._id || item.sweet) === sweetId
    );
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;