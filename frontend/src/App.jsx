import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Parties from './pages/Parties.jsx';
import Items from './pages/Items.jsx';
import CreateBill from './pages/CreateBill.jsx';
import BillHistory from './pages/BillHistory.jsx';
import BillView from './pages/BillView.jsx';
import StaffManagement from './pages/StaffManagement.jsx';
import ShopSettings from './pages/ShopSettings.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import LandingPage from './pages/LandingPage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import api from './api/axios';

function ProtectedLayout() {
  const [shopInfo, setShopInfo] = useState(null);

  useEffect(() => {
    api.get('/shop')
      .then((res) => setShopInfo(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="app-container">
      <Sidebar shopInfo={shopInfo} />
      <div className="main-wrapper">
        <Header shopInfo={shopInfo} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/parties" element={<Parties />} />
            <Route path="/items" element={<Items />} />
            <Route path="/create-bill" element={<CreateBill />} />
            <Route path="/bills" element={<BillHistory />} />
            <Route path="/bills/:id" element={<BillView />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/shop-settings" element={<ShopSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public SaaS Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected App Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
