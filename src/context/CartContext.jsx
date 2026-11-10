import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState(localStorage.getItem('kethaki_pincode') || '');
  const [locationInfo, setLocationInfo] = useState(null);

  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      const { data } = await API.get('/cart');
      setCart(data);
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, selectedSize = 'Free Size', quantity = 1) => {
    if (!user) return { requiresLogin: true };
    await API.post('/cart/add', { product_id: productId, selected_size: selectedSize, quantity });
    await fetchCart();
    return { success: true };
  };

  const updateQuantity = async (cartItemId, quantity) => {
    await API.put(`/cart/${cartItemId}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (cartItemId) => {
    await API.delete(`/cart/${cartItemId}`);
    await fetchCart();
  };

  const checkLocation = async (pincode) => {
    try {
      const { data } = await API.get(`/products/location/${pincode}`);
      setSelectedPincode(pincode);
      localStorage.setItem('kethaki_pincode', pincode);
      setLocationInfo(data);
      return data;
    } catch (err) {
      const msg = err.response?.data || { available: false, message: 'Location not serviceable' };
      setLocationInfo(msg);
      return msg;
    }
  };

  const clearLocation = () => {
    setSelectedPincode('');
    setLocationInfo(null);
    localStorage.removeItem('kethaki_pincode');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.discount_price || item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        cartCount,
        cartTotal,
        selectedPincode,
        locationInfo,
        checkLocation,
        clearLocation,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);