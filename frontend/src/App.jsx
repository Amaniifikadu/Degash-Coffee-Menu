import { Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import OrderTrackingPage from './pages/customer/orderTrackingPage';

import LoginPage from './pages/admin/LoginPage';
import DashboardLayout from './pages/admin/DashboardLayout';
import OrdersPage from './pages/admin/ordersPage';
import MenuManagerPage from './pages/admin/MenuManagerPage';
import CategoryManagerPage from './pages/admin/CategoryManagerPage';
import QRGeneratorPage from './pages/admin/QRGeneratorPage';

function App() {
  return (
    <SocketProvider>
      <Routes>
        {/* Customer-facing, no login required */}
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order/:orderId" element={<OrderTrackingPage />} />

        {/* Admin/staff */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="menu-items" element={<MenuManagerPage />} />
          <Route path="categories" element={<CategoryManagerPage />} />
          <Route path="qr-generator" element={<QRGeneratorPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;