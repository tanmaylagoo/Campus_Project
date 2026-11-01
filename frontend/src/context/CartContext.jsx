import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';

const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return (
    sessionStorage.getItem('token') ||
    localStorage.getItem('customer_token') ||
    localStorage.getItem('token')
  );
};

const getStoredCustomer = () => {
  try {
    const s = sessionStorage.getItem('user');
    if (s) return JSON.parse(s);
    const c = localStorage.getItem('customer_user');
    if (c) return JSON.parse(c);
    const u = localStorage.getItem('user');
    if (u) return JSON.parse(u);
  } catch {
    return null;
  }
  return null;
};

export const CartProvider = ({ children }) => {
  // Clear any legacy cross-account order id leakage from localStorage
  useEffect(() => {
    localStorage.removeItem('canteen_my_order_ids');
  }, []);

  // =========================
  // MENU
  // =========================
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);

  const fetchMenu = async () => {
    try {
      setMenuLoading(true);
      setMenuError(null);
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/menu`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          setMenuLoading(false);
          return;
        }
        throw new Error(`Failed to fetch menu: ${response.status}`);
      }
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu:', error);
      setMenuError('Unable to load menu. Please try again.');
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // =========================
  // CART
  // =========================
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('canteen_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('canteen_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
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
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // =========================
  // ORDERS (Backend Integrated - Customer Isolated)
  // =========================
  const [currentOrders, setCurrentOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeReadyAlert, setActiveReadyAlert] = useState(null);
  const alertedOrderIdsRef = useRef(new Set());

  // Fetch orders from backend strictly for the authenticated user
  const fetchMyOrders = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setCurrentOrders([]);
        setOrderHistory([]);
        return;
      }
      const customer = getStoredCustomer();

      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success) {
        setCurrentOrders(data.activeOrders || []);
        setOrderHistory(data.history || []);

        // Check for orders that are READY and need alert (Customers only, never vendor)
        const isVendor = customer?.role === 'admin' || customer?.role === 'vendor';
        if (!isVendor) {
          const newlyReady = (data.activeOrders || []).find(
            (o) => o.status === 'READY' && !alertedOrderIdsRef.current.has(o.orderNumber || o.id)
          );

          if (newlyReady) {
            alertedOrderIdsRef.current.add(newlyReady.orderNumber || newlyReady.id);
            setActiveReadyAlert(newlyReady);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    }
  }, []);

  // Initial fetch and automatic live polling for time tracking & ready alerts
  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchMyOrders]);

  // Place Order (Backend Checkout)
  const placeOrder = async (details = {}) => {
    if (cartItems.length === 0) return null;

    try {
      const token = getAuthToken();
      const customer = getStoredCustomer();

      const payload = {
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
          avgPrepTimeMinutes: item.avgPrepTimeMinutes != null ? Number(item.avgPrepTimeMinutes) : 5,
          image_url: item.image_url || item.imageUrl || '',
        })),
        pickupLocation: details.location || 'Main Canteen',
        paymentMethod: details.paymentMethod || 'Online Payment',
        customerName: customer?.username || customer?.name || 'Student Eater',
        customerEmail: customer?.email || '',
        notes: details.notes || '',
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      const created = data.order;
      setCurrentOrders((prev) => [created, ...prev]);
      clearCart();
      fetchMyOrders();

      return created;
    } catch (err) {
      console.error('Error in placeOrder checkout:', err);
      throw err;
    }
  };

  // Called after successful external verification (e.g. Razorpay Online Payment)
  const onOrderCompleted = (created) => {
    if (!created) return;
    setCurrentOrders((prev) => [created, ...prev.filter((o) => (o.orderNumber || o.id) !== (created.orderNumber || created.id))]);
    clearCart();
    fetchMyOrders();
  };

  // Reorder
  const reorder = (order) => {
    if (Array.isArray(order.itemsList) && order.itemsList.length > 0) {
      order.itemsList.forEach((item) => {
        addToCart(item);
      });
      return;
    }

    const matching = menuItems.find((menuItem) =>
      order.items?.toLowerCase().includes(menuItem.name.toLowerCase())
    );
    if (matching) {
      addToCart(matching);
    }
  };

  // Dismiss Ready Alert
  const dismissReadyAlert = async (orderId) => {
    setActiveReadyAlert(null);
    try {
      const token = getAuthToken();
      await fetch(`${API_URL}/orders/${orderId}/dismiss-alert`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error dismissing alert on backend:', err);
    }
  };

  // =========================
  // CALCULATIONS
  // =========================
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const serviceFee = cartItems.length > 0 ? 2.0 : 0;
  const totalAmount = subtotal + serviceFee;

  return (
    <CartContext.Provider
      value={{
        menuItems,
        setMenuItems,
        menuLoading,
        menuError,
        refreshMenu: fetchMenu,

        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,

        currentOrders,
        orderHistory,
        ordersLoading,
        fetchMyOrders,
        placeOrder,
        onOrderCompleted,
        reorder,

        activeReadyAlert,
        dismissReadyAlert,

        itemCount,
        subtotal,
        serviceFee,
        totalAmount,
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
