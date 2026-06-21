import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@workspace/api-client-react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  businessId: number | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tiligo-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tiligo-cart', JSON.stringify(items));
  }, [items]);

  const businessId = items.length > 0 ? items[0].product.business_id : null;

  const addItem = (product: Product, quantity = 1) => {
    setItems(current => {
      // If adding from a different business, clear cart first
      if (current.length > 0 && current[0].product.business_id !== product.business_id) {
        if (!window.confirm("Kjo do të fshijë shportën tuaj aktuale sepse është nga një biznes tjetër. Dëshironi të vazhdoni?")) {
          return current;
        }
        return [{ product, quantity }];
      }

      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        return current.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { product, quantity }];
    });
  };

  const removeItem = (productId: number) => {
    setItems(current => current.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(current => 
      current.map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, businessId, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}