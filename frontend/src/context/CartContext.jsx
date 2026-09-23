
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;;


// Initial cart
const INITIAL_CART = [];


// Initial current orders
const INITIAL_CURRENT_ORDERS = [
  {
    id: 'CH-9482',
    items: 'Masala Dosa + Vada Pav',
    date: 'Today, 12:45 PM',
    total: 90,
    status: 'Preparing'
  },
  {
    id: 'CH-9481',
    items: 'Veg Cheese Sandwich',
    date: 'Today, 11:30 AM',
    total: 55,
    status: 'Ready for Pickup'
  }
];


// Initial order history
const INITIAL_ORDER_HISTORY = [
  {
    id: 'CH-9310',
    items: 'Masala Dosa + Vada Pav',
    date: 'Oct 22, 1:10 PM',
    total: 90,
    status: 'Delivered'
  },
  {
    id: 'CH-9254',
    items: 'Veg Fried Rice',
    date: 'Oct 20, 9:15 AM',
    total: 100,
    status: 'Delivered'
  },
  {
    id: 'CH-9189',
    items: 'Paneer Chilly',
    date: 'Oct 18, 12:30 PM',
    total: 74,
    status: 'Delivered'
  },
  {
    id: 'CH-9051',
    items: 'Manchow Noodles',
    date: 'Oct 15, 1:45 PM',
    total: 105,
    status: 'Cancelled'
  },
  {
    id: 'CH-8992',
    items: 'Pav Bhaji + Samosa Pav',
    date: 'Oct 12, 12:15 PM',
    total: 82,
    status: 'Delivered'
  }
];


export const CartProvider = ({ children }) => {



  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);


  // Fetch menu from backend
  useEffect(() => {

    const fetchMenu = async () => {

      try {

        setMenuLoading(true);
        setMenuError(null);

        const response = await fetch(
          `${API_URL}/menu`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch menu: ${response.status}`
          );
        }

        const data = await response.json();

        setMenuItems(data);

      } catch (error) {

        console.error(
          'Error loading menu:',
          error
        );

        setMenuError(
          'Unable to load menu. Please try again.'
        );

      } finally {

        setMenuLoading(false);

      }
    };

    fetchMenu();

  }, []);


  // =========================
  // CART
  // =========================

  const [cartItems, setCartItems] = useState(() => {

    const saved =
      localStorage.getItem('canteen_cart');

    return saved
      ? JSON.parse(saved)
      : INITIAL_CART;

  });


  // =========================
  // CURRENT ORDERS
  // =========================

  const [currentOrders, setCurrentOrders] = useState(() => {

    const saved =
      localStorage.getItem(
        'canteen_current_orders'
      );

    return saved
      ? JSON.parse(saved)
      : INITIAL_CURRENT_ORDERS;

  });


  // =========================
  // ORDER HISTORY
  // =========================

  const [orderHistory, setOrderHistory] = useState(() => {

    const saved =
      localStorage.getItem(
        'canteen_order_history'
      );

    return saved
      ? JSON.parse(saved)
      : INITIAL_ORDER_HISTORY;

  });


  // =========================
  // LOCAL STORAGE
  // =========================

  useEffect(() => {

    localStorage.setItem(
      'canteen_cart',
      JSON.stringify(cartItems)
    );

  }, [cartItems]);


  useEffect(() => {

    localStorage.setItem(
      'canteen_current_orders',
      JSON.stringify(currentOrders)
    );

  }, [currentOrders]);


  useEffect(() => {

    localStorage.setItem(
      'canteen_order_history',
      JSON.stringify(orderHistory)
    );

  }, [orderHistory]);


  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (item) => {

    setCartItems((prev) => {

      const existing = prev.find(
        (i) => i.id === item.id
      );

      if (existing) {

        return prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity: i.quantity + 1
              }
            : i
        );

      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1
        }
      ];

    });

  };


  // =========================
  // UPDATE QUANTITY
  // =========================

  const updateQuantity = (id, delta) => {

    setCartItems((prev) => {

      return prev
        .map((item) => {

          if (item.id === id) {

            const newQty =
              item.quantity + delta;

            return newQty > 0
              ? {
                  ...item,
                  quantity: newQty
                }
              : null;
          }

          return item;

        })
        .filter(Boolean);

    });

  };


  // =========================
  // REMOVE FROM CART
  // =========================

  const removeFromCart = (id) => {

    setCartItems((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );

  };


  // =========================
  // CLEAR CART
  // =========================

  const clearCart = () => {

    setCartItems([]);

  };


  // =========================
  // PLACE ORDER
  // =========================

  const placeOrder = (details = {}) => {

    if (cartItems.length === 0) {
      return null;
    }


    const itemsSummary = cartItems
      .map(
        (item) =>
          `${
            item.quantity > 1
              ? `${item.quantity}x `
              : ''
          }${item.name}`
      )
      .join(' + ');


    const newOrder = {

      id: `CH-${Math.floor(
        1000 + Math.random() * 9000
      )}`,

      items: itemsSummary,

      date: 'Today, Just now',

      total: totalAmount,

      status: 'Preparing',

      location:
        details.location ||
        'Main Canteen - Building A'

    };


    setCurrentOrders((prev) => [
      newOrder,
      ...prev
    ]);


    clearCart();


    return newOrder;

  };


  // =========================
  // REORDER
  // =========================

  const reorder = (order) => {

    const matching = menuItems.find(
      (menuItem) =>
        order.items
          .toLowerCase()
          .includes(
            menuItem.name.toLowerCase()
          )
    );


    if (matching) {

      addToCart(matching);

    }

  };


  // =========================
  // CART CALCULATIONS
  // =========================

  const itemCount = cartItems.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );


  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      item.price * item.quantity,
    0
  );


  const serviceFee =
    cartItems.length > 0
      ? 1.50
      : 0;


  const totalAmount =
    subtotal + serviceFee;


  // =========================
  // PROVIDER
  // =========================

  return (

    <CartContext.Provider
      value={{

        // Menu
        menuItems,
        menuLoading,
        menuError,

        // Cart
        cartItems,
        itemCount,
        subtotal,
        serviceFee,
        totalAmount,

        // Orders
        currentOrders,
        orderHistory,

        // Functions
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


// =========================
// USE CART
// =========================

export const useCart = () => {

  const context =
    useContext(CartContext);

  if (!context) {

    throw new Error(
      'useCart must be used within a CartProvider'
    );

  }

  return context;

};
