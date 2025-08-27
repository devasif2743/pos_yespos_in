import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

const POSDashboard = () => {
  const { user } = useAuth();
  const { products, transactions, branches } = useData();

  const dashboardData = useMemo(() => {
    const branchProducts = products.filter(p => 
      p.branchIds && p.branchIds.includes(user.branchId)
    );
    const branchTransactions = transactions.filter(t => t.branchId === user.branchId);
    
    const todayTransactions = branchTransactions.filter(t => 
      new Date(t.timestamp).toDateString() === new Date().toDateString()
    );
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);

    return {
      availableProducts: branchProducts.length,
      todayTransactions: todayTransactions.length,
      todayRevenue,
      recentTransactions: branchTransactions.slice(-5).reverse()
    };
  }, [products, transactions, user.branchId]);

  const branch = branches.find(b => b.id === user.branchId);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'purple' }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:pl-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            POS Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user.name} | {branch?.name || 'Unknown Branch'}
          </p>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link 
            to="/pos/billing"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
          >
            <ShoppingCart className="h-6 w-6 mr-2" />
            Start New Sale
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Package}
            title="Available Products"
            value={dashboardData.availableProducts}
            color="blue"
          />
          <StatCard
            icon={ShoppingCart}
            title="Today's Sales"
            value={dashboardData.todayTransactions}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            title="Today's Revenue"
            value={`$${dashboardData.todayRevenue.toFixed(2)}`}
            color="emerald"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Transactions
              </h3>
            </div>
            <div className="p-6">
              {dashboardData.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">#{transaction.id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.customer?.name || 'Walk-in Customer'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${transaction.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{transaction.items.length} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Quick Stats
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Sales Progress Today</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData.todayTransactions} transactions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((dashboardData.todayTransactions / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Goal: 10 transactions/day</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Revenue Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${dashboardData.todayRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((dashboardData.todayRevenue / 500) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Goal: $500/day</p>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSDashboard;