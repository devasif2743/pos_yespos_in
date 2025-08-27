import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  Users, 
  MapPin, 
  BarChart3, 
  ShoppingCart, 
  User, 
  Settings, 
  LogOut,
  Layers,
  Building2,
  Monitor,
  FileText,
  Tag
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navbar on login page
  if (location.pathname === '/login' || !user) {
    return null;
  }

  const getNavigationItems = () => {
    const baseItems = [];

    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin', icon: Home },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
        { name: 'Branches', path: '/admin/branches', icon: Building2 },
        { name: 'Brands', path: '/admin/brands', icon: Tag },
        { name: 'Staff', path: '/admin/staff', icon: Users },
        { name: 'Combo Packs', path: '/admin/combos', icon: Package },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
        { name: 'Profile', path: '/admin/profile', icon: User },
      ];
    } else if (user.role === 'manager') {
      return [
        { name: 'Dashboard', path: '/manager', icon: Home },
        { name: 'Products', path: '/manager/products', icon: Package },
        { name: 'Staff', path: '/manager/staff', icon: Users },
        { name: 'Combo Packs', path: '/manager/combos', icon: Package },
        { name: 'POS', path: '/manager/pos', icon: Monitor },
        { name: 'Reports', path: '/manager/reports', icon: BarChart3 },
        { name: 'Profile', path: '/manager/profile', icon: User },
      ];
    } else if (user.role === 'pos') {
      return [
        { name: 'Dashboard', path: '/pos', icon: Home },
        { name: 'Billing', path: '/pos/billing', icon: ShoppingCart },
        { name: 'Profile', path: '/pos/profile', icon: User },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {settings?.logoUrl && (
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="h-8 w-8 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {settings?.companyName || 'POS System'}
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="h-16 lg:hidden" />
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } overflow-y-auto`}>
        {/* Logo and branding */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700" style={{ background: `linear-gradient(to right, ${settings?.primaryColor || '#8B5CF6'}, #3B82F6)` }}>
          <div className="flex items-center space-x-3">
            {settings?.logoUrl && (
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="h-8 w-8 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <h1 className="text-xl font-bold text-white">
              {settings?.companyName || 'POS System'}
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;