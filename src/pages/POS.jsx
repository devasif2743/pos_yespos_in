import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  User,
  CreditCard,
  Receipt,
  X,
  Scan,
  Phone,
  Mail,
  MessageSquare,
  History,
  Download,
  Eye,
  FileText,
  Calendar,
  Filter,
  Package
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const POS = () => {
  const { user } = useAuth();
  const { products, combos, addTransaction, addCustomer, branches, transactions } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('today');
  const [historySearch, setHistorySearch] = useState('');

  const availableItems = useMemo(() => {
    // Regular products
    const availableProducts = products.filter(product => {
      const isInBranch = product.branchIds && product.branchIds.includes(user.branchId);
      const hasStock = product.stock > 0;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.barcode && product.barcode.includes(searchTerm));
      
      return isInBranch && hasStock && matchesSearch;
    });

    // Combo packs
    const availableCombos = combos.filter(combo => {
      const isInBranch = combo.branchIds && combo.branchIds.includes(user.branchId);
      const hasStock = combo.stock > 0;
      const matchesSearch = combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          combo.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return isInBranch && hasStock && matchesSearch;
    }).map(combo => ({ ...combo, isCombo: true }));

    return [...availableProducts, ...availableCombos];
  }, [products, combos, user.branchId, searchTerm]);

  // Filter transactions for current branch
  const branchTransactions = useMemo(() => {
    let filtered = transactions.filter(t => t.branchId === user.branchId);
    
    // Apply date filter
    const now = new Date();
    if (historyFilter === 'today') {
      filtered = filtered.filter(t => 
        new Date(t.timestamp).toDateString() === now.toDateString()
      );
    } else if (historyFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.timestamp) >= weekAgo);
    } else if (historyFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.timestamp) >= monthAgo);
    }
    
    // Apply search filter
    if (historySearch) {
      filtered = filtered.filter(t => 
        t.id.includes(historySearch) ||
        (t.customer?.name && t.customer.name.toLowerCase().includes(historySearch.toLowerCase())) ||
        (t.customer?.phone && t.customer.phone.includes(historySearch))
      );
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [transactions, user.branchId, historyFilter, historySearch]);
  const cartTotal = cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id && item.isCombo === product.isCombo);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id && item.isCombo === product.isCombo
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert('Insufficient stock!');
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId, false);
    } else {
      const product = products.find(p => p.id === productId);
      if (newQuantity <= product.stock) {
        setCart(cart.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        alert('Insufficient stock!');
      }
    }
  };

  const removeFromCart = (productId, isCombo = false) => {
    setCart(cart.filter(item => !(item.id === productId && item.isCombo === isCombo)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    const newCustomer = addCustomer(customerForm);
    setCustomer(newCustomer);
    setIsCustomerModalOpen(false);
    setCustomerForm({ name: '', phone: '', email: '' });
  };

  const processPayment = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const transaction = {
      branchId: user.branchId,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.finalPrice,
        quantity: item.quantity
      })),
      total: cartTotal,
      customer: customer,
      cashier: user.name,
      paymentMethod: 'cash' // Default to cash for this demo
    };

    const savedTransaction = addTransaction(transaction);
    setLastTransaction(savedTransaction);
    setShowReceipt(true);
    
    // Clear cart and customer
    setCart([]);
    setCustomer(null);
  };

  const printReceipt = async () => {
    const receiptElement = document.getElementById('receipt');
    if (receiptElement) {
      const canvas = await html2canvas(receiptElement, {
        width: 300,
        height: receiptElement.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 120] // Thermal printer size
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 80, 120);
      pdf.save(`receipt-${lastTransaction?.id}.pdf`);
    }
  };

  const sendWhatsApp = () => {
    if (!customer?.phone || !lastTransaction) return;
    
    const message = `Receipt from ${branches.find(b => b.id === user.branchId)?.name}\n\nTransaction: #${lastTransaction.id}\nTotal: $${lastTransaction.total.toFixed(2)}\nThank you for your purchase!`;
    const url = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDetailsOpen(true);
  };

  const reprintReceipt = (transaction) => {
    setLastTransaction(transaction);
    setShowReceipt(true);
  };

  const downloadTransactionReport = () => {
    const reportData = branchTransactions.map(t => ({
      'Transaction ID': t.id,
      'Date': new Date(t.timestamp).toLocaleString(),
      'Customer': t.customer?.name || 'Walk-in Customer',
      'Phone': t.customer?.phone || '',
      'Items': t.items.map(item => `${item.name} x${item.quantity}`).join(', '),
      'Total': `$${t.total.toFixed(2)}`,
      'Cashier': t.cashier,
      'Payment Method': t.paymentMethod || 'Cash'
    }));

    // Convert to CSV
    const headers = Object.keys(reportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const branch = branches.find(b => b.id === user.branchId);

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-0">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Transaction History Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-gray-600">{branch?.name}</p>
          </div>
          <button
            onClick={() => setIsTransactionHistoryOpen(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors"
          >
            <History className="h-4 w-4 mr-2" />
            Transaction History
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
                  {availableItems.map((item) => (
                    <div
                      key={`${item.id}-${item.isCombo ? 'combo' : 'product'}`}
                      onClick={() => addToCart(item)}
                      className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group ${
                        item.isCombo 
                          ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {/* Product Image */}
                      {!item.isCombo && (
                        <div className="mb-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-16 w-full object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="h-16 w-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="h-16 w-full bg-gray-100 rounded-lg border border-gray-200 items-center justify-center hidden">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-3 relative">
                        {item.isCombo && (
                          <div className="absolute -top-2 -right-2">
                            <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              COMBO
                            </span>
                          </div>
                        )}
                        <h4 className={`font-medium group-hover:text-purple-600 transition-colors ${
                          item.isCombo ? 'text-purple-900' : 'text-gray-900'
                        }`}>
                          {item.name}
                        </h4>
                        {!item.isCombo && item.brand && (
                          <p className="text-xs text-gray-500 font-medium">{item.brand}</p>
                        )}
                        {item.isCombo ? (
                          <div>
                            <p className="text-sm text-purple-600 font-medium">
                              {item.products.length} products • Save {item.savingsPercent}%
                            </p>
                            <p className="text-xs text-gray-500">Stock: {item.stock}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Stock: {item.stock}</p>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          {item.offerPrice ? (
                            <>
                              <span className="text-lg font-bold text-green-600">
                                ${item.finalPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-400 line-through ml-2">
                                ${item.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className={`text-lg font-bold ${
                              item.isCombo ? 'text-purple-600' : 'text-gray-900'
                            }`}>
                              ${item.finalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {item.discountPercent > 0 && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            item.isCombo 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.discountPercent}% OFF
                          </span>
                        )}
                      </div>
                      {item.isCombo && (
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">Individual total: 
                            <span className="line-through ml-1">${item.totalOriginalPrice.toFixed(2)}</span>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.products.map(product => (
                              <span key={product.id} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {product.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {availableItems.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Scan className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart ({cartItemCount})
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Add products to start</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.isCombo ? 'combo' : 'product'}`} className={`flex items-center justify-between p-3 rounded-lg ${
                      item.isCombo ? 'bg-gradient-to-r from-purple-50 to-blue-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className={`font-medium ${item.isCombo ? 'text-purple-900' : 'text-gray-900'}`}>
                            {item.name}
                          </h4>
                          {item.isCombo && (
                            <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                              COMBO
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">${item.finalPrice.toFixed(2)} each</p>
                        {item.isCombo && (
                          <p className="text-xs text-purple-600">
                            Includes: {item.products.map(p => p.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.isCombo)}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, item.isCombo)}
                          className="text-red-500 hover:text-red-700 p-1 rounded ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Section */}
              <div className="border-t pt-4 mb-4">
                {customer ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-green-900">{customer.name}</p>
                        <p className="text-sm text-green-700">{customer.phone}</p>
                        {customer.email && <p className="text-sm text-green-700">{customer.email}</p>}
                      </div>
                      <button
                        onClick={() => setCustomer(null)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mb-3"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Add Customer (Optional)
                  </button>
                )}
              </div>

              {/* Total and Checkout */}
              {cart.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-purple-600">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={processPayment}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Process Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Modal */}
        {isCustomerModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Add Customer</h2>
                <button
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCustomerSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCustomerModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    Add Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction History Modal */}
        {isTransactionHistoryOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                <button
                  onClick={() => setIsTransactionHistoryOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Filters */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <select
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="today">Today</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                  <div className="flex-1 max-w-sm">
                    <div className="relative">
                      <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by ID, customer name, or phone..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={downloadTransactionReport}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {branchTransactions.length} transaction(s) found
                </div>
              </div>

              {/* Transaction List */}
              <div className="overflow-y-auto max-h-[60vh]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Items
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {branchTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          #{transaction.id.slice(-8)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>
                            <div className="font-medium">
                              {transaction.customer?.name || 'Walk-in Customer'}
                            </div>
                            {transaction.customer?.phone && (
                              <div className="text-xs text-gray-500">
                                {transaction.customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="space-y-1">
                            {transaction.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-xs">
                                {item.name} x{item.quantity}
                              </div>
                            ))}
                            {transaction.items.length > 2 && (
                              <div className="text-xs text-gray-400">
                                +{transaction.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          ${transaction.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => viewTransactionDetails(transaction)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => reprintReceipt(transaction)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Reprint Receipt"
                            >
                              <Receipt className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {branchTransactions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No transactions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Details Modal */}
        {isTransactionDetailsOpen && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Transaction Details - #{selectedTransaction.id.slice(-8)}
                </h2>
                <button
                  onClick={() => setIsTransactionDetailsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Transaction Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Transaction ID
                    </label>
                    <p className="text-lg font-mono">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Date & Time
                    </label>
                    <p>{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Cashier
                    </label>
                    <p>{selectedTransaction.cashier}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Payment Method
                    </label>
                    <p className="capitalize">{selectedTransaction.paymentMethod || 'Cash'}</p>
                  </div>
                </div>

                {/* Customer Info */}
                {selectedTransaction.customer && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Name
                        </label>
                        <p>{selectedTransaction.customer.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Phone
                        </label>
                        <p>{selectedTransaction.customer.phone}</p>
                      </div>
                      {selectedTransaction.customer.email && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Email
                          </label>
                          <p>{selectedTransaction.customer.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Items Purchased</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Item
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedTransaction.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">${item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            Total:
                          </td>
                          <td className="px-4 py-3 text-lg font-bold text-green-600">
                            ${selectedTransaction.total.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => reprintReceipt(selectedTransaction)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Reprint Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && lastTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showReceipt && selectedTransaction ? 'Reprint Receipt' : 'Transaction Complete'}
                </h2>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Receipt */}
                <div id="receipt" className="bg-white p-4 border border-gray-200 rounded-lg mb-4 text-sm">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg">{branch?.name}</h3>
                    <p className="text-xs text-gray-600">{branch?.address}</p>
                    <p className="text-xs text-gray-600">{branch?.phone}</p>
                  </div>

                  <div className="border-t border-b border-gray-300 py-2 mb-2">
                    <div className="flex justify-between text-xs">
                      <span>Transaction: #{lastTransaction.id.slice(-6)}</span>
                      <span>{new Date(lastTransaction.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-600">Cashier: {lastTransaction.cashier}</div>
                    {lastTransaction.customer && (
                      <div className="text-xs text-gray-600">
                        Customer: {lastTransaction.customer.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 mb-2">
                    {lastTransaction.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>{item.name} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between font-bold">
                      <span>TOTAL</span>
                      <span>${lastTransaction.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-center mt-4 text-xs text-gray-600">
                    Thank you for your purchase!
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={printReceipt}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Print Receipt
                  </button>
                  
                  {customer?.phone && (
                    <button
                      onClick={sendWhatsApp}
                      className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send via WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POS;