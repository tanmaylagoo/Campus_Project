import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const INITIAL_MENU_ITEMS = [
  {
    id: 'dish-1',
    name: 'Teriyaki Chicken Bowl',
    category: 'Main Course',
    description: 'Tender chicken in savory sweet glaze over warm sushi rice with greens',
    price: 9.20,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dish-2',
    name: 'Margherita Pizza',
    category: 'Main Course',
    description: 'Fresh mozzarella, san marzano tomatoes, fresh basil, and extra virgin olive oil',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dish-3',
    name: 'Caesar Salad',
    category: 'Sides',
    description: 'Crisp romaine, shaved parmesan, garlic croutons, with creamy house dressing',
    price: 7.80,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dish-4',
    name: 'Grilled Cheese Sandwich',
    category: 'Main Course',
    description: 'Melted sourdough cheese combo of sharp cheddar, swiss and provolone',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dish-5',
    name: 'Spicy Tuna Roll',
    category: 'Main Course',
    description: 'Fresh yellowfin tuna, spicy mayo, green scallions, rolled in seaweed & sesame',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dish-6',
    name: 'Iced Caramel Macchiato',
    category: 'Drinks',
    description: 'Rich espresso combined with milk and sweet vanilla syrup, with caramel drizzle',
    price: 4.75,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'
  }
];

// Initial items matching the exact mockup state:
// 1x Teriyaki Chicken Bowl ($9.20)
// 2x Iced Caramel Macchiato ($4.75 * 2 = $9.50)
// 1x Margherita Pizza ($8.50)
// Subtotal = $27.20, Service Fee = $1.50, Total = $28.70
const INITIAL_CART = [
  {
    ...INITIAL_MENU_ITEMS[0],
    quantity: 1
  },
  {
    ...INITIAL_MENU_ITEMS[5],
    quantity: 2
  },
  {
    ...INITIAL_MENU_ITEMS[1],
    quantity: 1
  }
];

const INITIAL_CURRENT_ORDERS = [
  {
    id: 'CH-9482',
    items: 'Teriyaki Chicken Bowl + Iced Tea',
    date: 'Today, 12:45 PM',
    total: 11.20,
    status: 'Preparing'
  },
  {
    id: 'CH-9481',
    items: 'Grilled Cheese Sandwich & Tomato Soup',
    date: 'Today, 11:30 AM',
    total: 8.50,
    status: 'Ready for Pickup'
  }
];

const INITIAL_ORDER_HISTORY = [
  {
    id: 'CH-9310',
    items: 'Mozzarella Margherita Pizza',
    date: 'Oct 22, 1:10 PM',
    total: 9.20,
    status: 'Delivered'
  },
  {
    id: 'CH-9254',
    items: 'Iced Caramel Macchiato + Chocolate Muffin',
    date: 'Oct 20, 9:15 AM',
    total: 7.50,
    status: 'Delivered'
  },
  {
    id: 'CH-9189',
    items: 'Caesar Salad with Grilled Chicken',
    date: 'Oct 18, 12:30 PM',
    total: 10.50,
    status: 'Delivered'
  },
  {
    id: 'CH-9051',
    items: 'Spicy Tuna Roll Sushi (6pcs)',
    date: 'Oct 15, 1:45 PM',
    total: 12.00,
    status: 'Cancelled'
  },
  {
    id: 'CH-8992',
    items: 'Double Cheeseburger & Fries',
    date: 'Oct 12, 12:15 PM',
    total: 13.40,
    status: 'Delivered'
  }
];

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('canteen_cart');
    return saved ? JSON.parse(saved) : INITIAL_CART;
  });

  const [currentOrders, setCurrentOrders] = useState(() => {
    const saved = localStorage.getItem('canteen_current_orders');
    return saved ? JSON.parse(saved) : INITIAL_CURRENT_ORDERS;
  });

  const [orderHistory, setOrderHistory] = useState(() => {
    const saved = localStorage.getItem('canteen_order_history');
    return saved ? JSON.parse(saved) : INITIAL_ORDER_HISTORY;
  });

  const [menuItems] = useState(INITIAL_MENU_ITEMS);

  useEffect(() => {
    localStorage.setItem('canteen_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('canteen_current_orders', JSON.stringify(currentOrders));
  }, [currentOrders]);

  useEffect(() => {
    localStorage.setItem('canteen_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const placeOrder = (details = {}) => {
    if (cartItems.length === 0) return null;

    const itemsSummary = cartItems
      .map(i => `${i.quantity > 1 ? `${i.quantity}x ` : ''}${i.name}`)
      .join(' + ');

    const newOrder = {
      id: `CH-${Math.floor(1000 + Math.random() * 9000)}`,
      items: itemsSummary,
      date: 'Today, Just now',
      total: totalAmount,
      status: 'Preparing',
      location: details.location || 'Main Canteen - Building A'
    };

    setCurrentOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const reorder = (order) => {
    // Add default item or find matching menu dish
    const matching = menuItems.find(m => order.items.toLowerCase().includes(m.name.toLowerCase())) || menuItems[0];
    addToCart(matching);
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = cartItems.length > 0 ? 1.50 : 0;
  const totalAmount = subtotal + serviceFee;

  return (
    <CartContext.Provider
      value={{
        menuItems,
        cartItems,
        currentOrders,
        orderHistory,
        itemCount,
        subtotal,
        serviceFee,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        reorder
      }}
    >
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
