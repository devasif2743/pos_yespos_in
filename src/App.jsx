import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import BranchManagerDashboard from './pages/BranchManagerDashboard';
import POSDashboard from './pages/POSDashboard';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import BranchManagement from './pages/BranchManagement';
import Reports from './pages/Reports';
import POS from './pages/POS';
import StaffManagement from './pages/StaffManagement';
import AdminProfile from './pages/AdminProfile';
import BranchManagerStaffManagement from './pages/BranchManagerStaffManagement';
import BranchManagerProfile from './pages/BranchManagerProfile';
import ComboManagement from './pages/ComboManagement';
import AdminSettings from './pages/AdminSettings';
import BrandManagement from './pages/BrandManagement';
import POSProfile from './pages/POSProfile';
import { useAuth } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <MainContent />
          </div>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

const MainContent = () => {
  const { user } = useAuth();
  const location = useLocation();

  
  // Don't apply margin on login page or when no user
  const shouldShowSidebar = user && location.pathname !== '/login';
  return (
    <div className={`${shouldShowSidebar ? 'lg:ml-64' : ''} transition-all duration-300`}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
              
        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="branches" element={<BranchManagement />} />
                <Route path="brands" element={<BrandManagement />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="combos" element={<ComboManagement />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="reports" element={<Reports />} />
              </Routes>
            </PrivateRoute>
          } 
        />
              
        {/* Branch Manager Routes */}
        <Route 
          path="/manager/*" 
          element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <Routes>
                <Route index element={<BranchManagerDashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="staff" element={<BranchManagerStaffManagement />} />
                <Route path="profile" element={<BranchManagerProfile />} />
                <Route path="combos" element={<ComboManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="pos" element={<POS />} />
              </Routes>
            </PrivateRoute>
          } 
        />
              
        {/* POS User Routes */}
        <Route 
          path="/pos/*" 
          element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'pos']}>
              <Routes>
                <Route index element={<POSDashboard />} />
                <Route path="billing" element={<POS />} />
                <Route path="profile" element={<POSProfile />} />
              </Routes>
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
};

export default App;