import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  Package, 
  FolderOpen, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  Users,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const { products, categories, branches, transactions } = useData();

  const dashboardStats = useMemo(() => {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const todayTransactions = transactions.filter(t => 
      new Date(t.timestamp).toDateString() === new Date().toDateString()
    );
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const lowStockProducts = products.filter(p => p.stock <= 5);

    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalBranches: branches.length,
      totalRevenue,
      todayRevenue,
      todayTransactions: todayTransactions.length,
      lowStockProducts: lowStockProducts.length
    };
  }, [products, categories, branches, transactions]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => 
        t.timestamp.split('T')[0] === date
      );
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayTransactions.reduce((sum, t) => sum + t.total, 0),
        transactions: dayTransactions.length
      };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    return categories.map(category => {
      const categoryProducts = products.filter(p => p.categoryId === category.id);
      const categoryRevenue = transactions
        .flatMap(t => t.items)
        .filter(item => categoryProducts.find(p => p.id === item.productId))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        name: category.name,
        products: categoryProducts.length,
        revenue: categoryRevenue
      };
    });
  }, [categories, products, transactions]);

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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage your POS system from here</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Package}
            title="Total Products"
            value={dashboardStats.totalProducts}
            color="blue"
          />
          <StatCard
            icon={FolderOpen}
            title="Categories"
            value={dashboardStats.totalCategories}
            color="green"
          />
          <StatCard
            icon={MapPin}
            title="Branches"
            value={dashboardStats.totalBranches}
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${dashboardStats.totalRevenue.toFixed(2)}`}
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={TrendingUp}
            title="Today's Revenue"
            value={`$${dashboardStats.todayRevenue.toFixed(2)}`}
            subtitle={`${dashboardStats.todayTransactions} transactions`}
            color="green"
          />
          <StatCard
            icon={ShoppingCart}
            title="Total Transactions"
            value={transactions.length}
            color="blue"
          />
          <StatCard
            icon={AlertTriangle}
            title="Low Stock Alert"
            value={dashboardStats.lowStockProducts}
            subtitle="Products with stock ≤ 5"
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(-10).reverse().map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.customer?.name || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${transaction.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;