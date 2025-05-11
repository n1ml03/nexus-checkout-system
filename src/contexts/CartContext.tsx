
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  note?: string;
  category?: string;
}

interface CartContextType {
  items: CartItem[];
  savedItems: CartItem[];
  recentlyViewed: Product[];
  recommendations: Product[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSavedItem: (id: string) => void;
  addNote: (id: string, note: string) => void;
  addToRecentlyViewed: (product: Product) => void;
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  discount: number;
  applyDiscount: (code: string) => boolean;
  clearDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Main cart items
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedItems = localStorage.getItem('cart');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // Saved for later items
  const [savedItems, setSavedItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('savedItems');
    return saved ? JSON.parse(saved) : [];
  });

  // Recently viewed products
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    const viewed = localStorage.getItem('recentlyViewed');
    return viewed ? JSON.parse(viewed) : [];
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Discount amount
  const [discount, setDiscount] = useState(0);

  // Persist cart data to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Add item to cart
  const addItem = useCallback((item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        toast.success(`Updated ${item.name} quantity`);
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      toast.success(`Added ${item.name} to cart`);
      return [...prevItems, item];
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((id: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (itemToRemove) {
        toast.info(`Removed ${itemToRemove.name} from cart`);
      }
      return prevItems.filter((item) => item.id !== id);
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, [removeItem]);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
    setDiscount(0);
    toast.info("Cart cleared");
  }, []);

  // Save item for later
  const saveForLater = useCallback((id: string) => {
    setItems((prevItems) => {
      const itemToSave = prevItems.find(item => item.id === id);
      if (itemToSave) {
        setSavedItems(prev => [...prev, itemToSave]);
        toast.success(`Saved ${itemToSave.name} for later`);
      }
      return prevItems.filter(item => item.id !== id);
    });
  }, []);

  // Move saved item to cart
  const moveToCart = useCallback((id: string) => {
    setSavedItems((prevItems) => {
      const itemToMove = prevItems.find(item => item.id === id);
      if (itemToMove) {
        addItem(itemToMove);
        toast.success(`Moved ${itemToMove.name} to cart`);
      }
      return prevItems.filter(item => item.id !== id);
    });
  }, [addItem]);

  // Remove saved item
  const removeSavedItem = useCallback((id: string) => {
    setSavedItems((prevItems) => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (itemToRemove) {
        toast.info(`Removed ${itemToRemove.name} from saved items`);
      }
      return prevItems.filter(item => item.id !== id);
    });
  }, []);

  // Add note to cart item
  const addNote = useCallback((id: string, note: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, note } : item))
    );
    toast.success("Note added to item");
  }, []);

  // Add product to recently viewed
  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id);
      // Add to beginning of array and limit to 8 items
      return [product, ...filtered].slice(0, 8);
    });
  }, []);

  // Apply discount code
  const applyDiscount = useCallback((code: string) => {
    // Mock discount codes
    const discountCodes = {
      'WELCOME10': 0.1,
      'SAVE20': 0.2,
      'SPECIAL50': 0.5
    };

    const discountRate = discountCodes[code as keyof typeof discountCodes];

    if (discountRate) {
      // Calculate the current subtotal directly here to avoid circular dependency
      const currentSubtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
      setDiscount(currentSubtotal * discountRate);
      toast.success(`Discount code ${code} applied!`);
      return true;
    } else {
      toast.error('Invalid discount code');
      return false;
    }
  }, [items]);

  // Clear discount
  const clearDiscount = useCallback(() => {
    setDiscount(0);
  }, []);

  // Memoize expensive calculations to prevent unnecessary recalculations
  const itemCount = useMemo(() =>
    items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(() =>
    items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  // Generate product recommendations based on cart items
  const recommendations = useMemo(() => {
    // Enhanced recommendation algorithm
    // In a real app, this would be an API call to a recommendation service

    // Define a larger pool of potential recommendations
    const recommendationPool: Product[] = [
      {
        id: 'rec1',
        name: 'Premium Headphones',
        price: 129.99,
        description: 'High-quality wireless headphones with noise cancellation',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        category: 'Electronics',
        barcode: '123456789012',
        sku: 'HDPH-001',
        stock: 25
      },
      {
        id: 'rec2',
        name: 'Smart Watch',
        price: 199.99,
        description: 'Fitness tracker with heart rate monitor and GPS',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        category: 'Electronics',
        barcode: '123456789013',
        sku: 'SWTCH-001',
        stock: 15
      },
      {
        id: 'rec3',
        name: 'Wireless Charger',
        price: 29.99,
        description: 'Fast wireless charging pad for smartphones',
        image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90',
        category: 'Electronics',
        barcode: '123456789014',
        sku: 'CHRG-001',
        stock: 50
      },
      {
        id: 'rec4',
        name: 'Bluetooth Speaker',
        price: 79.99,
        description: 'Portable waterproof Bluetooth speaker with 20-hour battery life',
        image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1',
        category: 'Electronics',
        barcode: '123456789015',
        sku: 'SPKR-001',
        stock: 30
      },
      {
        id: 'rec5',
        name: 'Phone Case',
        price: 19.99,
        description: 'Protective case with shock absorption technology',
        image_url: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7',
        category: 'Accessories',
        barcode: '123456789016',
        sku: 'CASE-001',
        stock: 100
      },
      {
        id: 'rec6',
        name: 'Laptop Backpack',
        price: 59.99,
        description: 'Water-resistant backpack with laptop compartment and USB charging port',
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
        category: 'Accessories',
        barcode: '123456789017',
        sku: 'BKPK-001',
        stock: 45
      },
      {
        id: 'rec7',
        name: 'Wireless Mouse',
        price: 24.99,
        description: 'Ergonomic wireless mouse with adjustable DPI',
        image_url: 'https://images.unsplash.com/photo-1605773527852-c546a8584ea3',
        category: 'Electronics',
        barcode: '123456789018',
        sku: 'MOUS-001',
        stock: 60
      },
      {
        id: 'rec8',
        name: 'USB-C Hub',
        price: 39.99,
        description: 'Multi-port adapter with HDMI, USB, and SD card slots',
        image_url: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9',
        category: 'Electronics',
        barcode: '123456789019',
        sku: 'USBC-001',
        stock: 35
      }
    ];

    if (items.length === 0) {
      // If cart is empty, return popular items
      return recommendationPool.slice(0, 4);
    }

    // Extract categories from cart items (assuming we have this info)
    const cartCategories = new Set<string>();
    const cartPriceRange = {
      min: Number.MAX_VALUE,
      max: 0,
      avg: 0
    };

    // Calculate price ranges and collect categories
    let totalPrice = 0;
    items.forEach(item => {
      // For demo purposes, we'll assign random categories if not available
      const itemCategory = item.category || ['Electronics', 'Accessories', 'Gadgets'][Math.floor(Math.random() * 3)];
      cartCategories.add(itemCategory);

      if (item.price < cartPriceRange.min) cartPriceRange.min = item.price;
      if (item.price > cartPriceRange.max) cartPriceRange.max = item.price;
      totalPrice += item.price;
    });

    cartPriceRange.avg = totalPrice / items.length;

    // Score each potential recommendation
    const scoredRecommendations = recommendationPool.map(product => {
      let score = 0;

      // Category match
      if (cartCategories.has(product.category)) {
        score += 5;
      }

      // Price match (within 30% of average cart price)
      const priceRatio = product.price / cartPriceRange.avg;
      if (priceRatio >= 0.7 && priceRatio <= 1.3) {
        score += 3;
      }

      // Avoid recommending items already in cart
      if (items.some(item => item.id === product.id)) {
        score = -100; // Strongly penalize
      }

      return { product, score };
    });

    // Sort by score and take top 4
    return scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.product);
  }, [items]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    items,
    savedItems,
    recentlyViewed,
    recommendations,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    saveForLater,
    moveToCart,
    removeSavedItem,
    addNote,
    addToRecentlyViewed,
    isLoading,
    itemCount,
    subtotal,
    discount,
    applyDiscount,
    clearDiscount,
  }), [
    items,
    savedItems,
    recentlyViewed,
    recommendations,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    saveForLater,
    moveToCart,
    removeSavedItem,
    addNote,
    addToRecentlyViewed,
    isLoading,
    itemCount,
    subtotal,
    discount,
    applyDiscount,
    clearDiscount
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
