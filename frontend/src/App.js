import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './context/CartContext';

import Welcome from './pages/customer/Welcome';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import CallWaiter from './pages/customer/CallWaiter';
import Review from './pages/customer/Review';
import MyOrders from './pages/customer/MyOrders';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Customer - No login required */}
          <Route path="/" element={<Welcome />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/call-waiter" element={<CallWaiter />} />
          <Route path="/review" element={<Review />} />
          <Route path="/my-orders" element={<MyOrders />} />

          {/* Admin - Login required */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Navigate to="/admin/login" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
      </CartProvider>
    </Router>
  );
}

export default App;
