import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const STORAGE_KEY = 'farmdirect_local_cart';

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart locally', e);
    }
  }, [items]);

  // Load from server when consumer logs in
  const fetchServerCart = useCallback(async () => {
    if (user?.role !== 'CONSUMER') return;
    setLoading(true);
    try {
      const res = await api.getCart();
      if (res.success && res.data?.items) {
        const mapped = res.data.items.map(item => ({
          productId: item.productId?._id || item.productId,
          name: item.nameSnapshot || item.productId?.name,
          price: item.priceSnapshot || item.productId?.price,
          unit: item.unitSnapshot || item.productId?.unit,
          image: item.imageSnapshot || item.productId?.images?.[0] || '',
          quantity: item.quantity,
          farmerId: item.farmerIdSnapshot || item.productId?.farmerId,
          farmerName: item.farmerNameSnapshot || item.productId?.farmerId?.name || 'Local Farm',
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch server cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'CONSUMER') {
      fetchServerCart();
    }
  }, [user, fetchServerCart]);

  const addToCart = async (product, quantity = 1) => {
    const prodId = product._id || product.id;
    const price = product.price;
    const name = product.name;
    const unit = product.unit || 'lb';
    const image = product.images?.[0] || '';
    const farmerId = product.farmerId?._id || product.farmerId || '';
    const farmerName = product.farmerProfile?.farmName || product.farmerId?.name || 'Local Farm';

    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === prodId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [...prev, { productId: prodId, name, price, unit, image, quantity, farmerId, farmerName }];
    });

    if (user?.role === 'CONSUMER') {
      try {
        const currentItem = items.find(i => i.productId === prodId);
        const newQty = (currentItem?.quantity || 0) + quantity;
        await api.addToCart(prodId, newQty);
      } catch (err) {
        console.error('Server cart add failed:', err);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));

    if (user?.role === 'CONSUMER') {
      try {
        await api.addToCart(productId, quantity);
      } catch (err) {
        console.error('Server cart update failed:', err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId));

    if (user?.role === 'CONSUMER') {
      try {
        await api.removeFromCart(productId);
      } catch (err) {
        console.error('Server cart remove failed:', err);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);

    if (user?.role === 'CONSUMER') {
      try {
        await api.clearCart();
      } catch (err) {
        console.error('Server cart clear failed:', err);
      }
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 35 || subtotal === 0 ? 0 : 4.99;
  const tax = subtotal * 0.05; // 5% agricultural sales tax
  const total = subtotal + deliveryFee + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        tax,
        total,
        cartDrawerOpen,
        setCartDrawerOpen,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchServerCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
