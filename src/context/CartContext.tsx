'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Product, CartItem } from '@/types';

const CART_STORAGE_KEY = 'rs-boutique-cart';

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    size: string,
    color: string,
    quantity?: number
  ) => void;
  removeFromCart: (productId: number, size: string, color: string) => void;
  updateQuantity: (
    productId: number,
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function findItemIndex(
  items: CartItem[],
  productId: number,
  size: string,
  color: string
): number {
  return items.findIndex(
    (item) =>
      item.product.id === productId &&
      item.size === size &&
      item.color === color
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // If localStorage is unavailable or data is corrupted, start fresh
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage on every change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // localStorage might be full or unavailable
      }
    }
  }, [items, isHydrated]);

  const addToCart = useCallback(
    (product: Product, size: string, color: string, quantity: number = 1) => {
      setItems((prev) => {
        const existingIndex = findItemIndex(prev, product.id, size, color);

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        return [...prev, { product, quantity, size, color }];
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: number, size: string, color: string) => {
      setItems((prev) => {
        const index = findItemIndex(prev, productId, size, color);
        if (index === -1) return prev;
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: number, size: string, color: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => {
          const index = findItemIndex(prev, productId, size, color);
          if (index === -1) return prev;
          const updated = [...prev];
          updated.splice(index, 1);
          return updated;
        });
        return;
      }

      setItems((prev) => {
        const index = findItemIndex(prev, productId, size, color);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = { ...updated[index], quantity };
        return updated;
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
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
