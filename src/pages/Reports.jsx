import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';

const Reports = () => {
  const { user } = useAuth();
  const { products, transactions, categories, branches } = useData();
  const [dateRange, setDateRange] = useState('7d');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const reportData = useMemo(() => {
    let filteredTransactions = transactions;

    // Filter by branch
    if (user.role !== 'admin') {
      filteredTransactions = filteredTransactions.filter(t => t.branchId === user.branchId);
    } else if (selectedBranch !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.branchId === selectedBranch);
    }

    // Filter by date range
    const now = new Date();
    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    filteredTransactions = filteredTransactions.filter(t => 
      new Date(t.timestamp) >= startDate
    );

    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Daily revenue data
    const dailyData = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayTransactions = filteredTransactions.filter(t => 
        t.timestamp.split('T')[0] === dateStr
      );
      
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayTransactions.reduce((sum, t) => sum + t.total, 0),
        transactions: dayTransactions.length
      });
    }

    // Category performance
    const categoryPerformance = categories.map(category => {
      const categoryProducts = products.filter(p => p.categoryId === category.id);
      const categoryRevenue = filteredTransactions
        .flatMap(t => t.items)
        .filter(item => categoryProducts.find(p => p.id === item.productId))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        name: category.name,
        revenue: categoryRevenue,
        products: categoryProducts.length
      };
    });

    // Top selling products
    const productSales = {};
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            quantity: 0,
            revenue: 0,
            name: products.find(p => p.id === item.productId)?.name || 'Unknown'
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalTransactions,
      avgTransactionValue,
      dailyData,
      categoryPerformance,
      topProducts
    };
  }, [transactions, user, selectedBranch, dateRange, products, categories]);

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(20);
    pdf.text('Sales Report', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Period: Last ${dateRange}`, 20, 45);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 55);
    
    pdf.text(`Total Revenue: $${reportData.totalRevenue.toFixed(2)}`, 20, 75);
    pdf.text(`Total Transactions: ${reportData.totalTransactions}`, 20, 85);
    pdf.text(`Average Transaction: $${reportData.avgTransactionValue.toFixed(2)}`, 20, 95);
    
    pdf.text('Top Products:', 20, 115);
    reportData.topProducts.slice(0, 5).forEach((product, index) => {
      pdf.text(
        `${index + 1}. ${product.name}: $${product.revenue.toFixed(2)} (${product.quantity} sold)`,
        25, 125 + index * 10
      );
    });

    pdf.save('sales-report.pdf');
  };

  const COLORS = ['#8B5CF6', '#14B8A6', '#F59E0B', '#EF4444', '#10B981'];

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:pl-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Sales Reports
            </h1>
            <p className="text-gray-600 mt-2">Analytics and insights for your business</p>
          </div>
          <button
            onClick={exportToPDF}
            className="mt-4 sm:mt-0 flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Export PDF
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="365d">Last year</option>
              </select>
            </div>
            
            {user.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Branches</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {reportData.totalTransactions} transactions analyzed
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                <p className="text-2xl font-bold text-gray-900">${reportData.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Transactions</h3>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Avg Transaction</h3>
                <p className="text-2xl font-bold text-gray-900">${reportData.avgTransactionValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.dailyData}>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Category Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Top Selling Products
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.topProducts.map((product, index) => (
                  <tr key={product.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.topProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sales data available for the selected period.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;