import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Chatbot from './pages/Chatbot';
import { CartProvider } from './context/CartContext';
import ReadyAlertModal from './components/ReadyAlertModal';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';

// Admin imports
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <CartProvider>
      <Router>
        {/* Global Meal Ready Alert Popup */}
        <ReadyAlertModal />

        <Routes>
          {/* Public Landing Route */}
          <Route path="/" element={<Landing />} />

          {/* Guest-only Auth Routes (redirects logged-in users to their dashboard) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Customer Routes (Requires Login; allows customer & admin) */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Navigate to="/home" replace />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/chatbot" element={<Chatbot />} />
            </Route>
          </Route>

          {/* Protected Admin Routes (Requires Login + 'admin' role) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/orders" element={<AdminOrders />} />
              <Route path="/admin-dashboard/menu" element={<AdminMenu />} />
              <Route path="/admin-dashboard/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>

          {/* Catch-all redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
