import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('fitbite_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [tableNumber, setTableNumber] = useState(() => {
    return localStorage.getItem('fitbite_table') || null;
  });

  useEffect(() => {
    localStorage.setItem('fitbite_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (tableNumber) localStorage.setItem('fitbite_table', tableNumber);
    else localStorage.removeItem('fitbite_table');
  }, [tableNumber]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        if (existing.quantity >= 20) return prev;
        return prev.map(i => i._id === item._id ? { ...i, quantity: Math.min(i.quantity + 1, 20) } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i._id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) return removeFromCart(itemId);
    if (quantity > 20) return;
    setCartItems(prev => prev.map(i => i._id === itemId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('fitbite_cart');
  };

  const getTotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getItemCount = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, tableNumber, setTableNumber,
      addToCart, removeFromCart, updateQuantity, clearCart,
      getTotal, getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
