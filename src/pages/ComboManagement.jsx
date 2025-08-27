import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Save,
  Search,
  ShoppingBag,
  Percent,
  DollarSign
} from 'lucide-react';

const ComboManagement = () => {
  const { user } = useAuth();
  const { products, combos, addCombo, updateCombo, deleteCombo, branches } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productIds: [],
    price: 0,
    offerPrice: '',
    branchIds: user.role === 'admin' ? [] : [user.branchId]
  });

  // Get available products for current user
  const availableProducts = useMemo(() => {
    if (user.role === 'admin') return products;
    return products.filter(p => p.branchIds && p.branchIds.includes(user.branchId));
  }, [products, user.role, user.branchId]);

  // Filter combos based on user role and search
  const filteredCombos = useMemo(() => {
    let filtered = combos;

    // Filter by branch for non-admin users
    if (user.role !== 'admin' && user.branchId) {
      filtered = filtered.filter(c => c.branchIds && c.branchIds.includes(user.branchId));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [combos, searchTerm, user.role, user.branchId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.productIds.length < 2 || formData.productIds.length > 3) {
      alert('Please select 2-3 products for the combo pack');
      return;
    }

    const selectedProducts = availableProducts.filter(p => 
      formData.productIds.includes(p.id)
    );
    
    const totalOriginalPrice = selectedProducts.reduce((sum, p) => sum + p.finalPrice, 0);
    const finalPrice = formData.offerPrice || formData.price;
    const discountPercent = formData.offerPrice 
      ? Math.round(((formData.price - formData.offerPrice) / formData.price) * 100 * 100) / 100
      : 0;
    const savingsPercent = Math.round(((totalOriginalPrice - finalPrice) / totalOriginalPrice) * 100 * 100) / 100;

    const comboData = {
      ...formData,
      products: selectedProducts,
      totalOriginalPrice,
      finalPrice,
      discountPercent,
      savingsPercent,
      stock: Math.min(...selectedProducts.map(p => p.stock)) // Stock limited by lowest stock product
    };

    if (editingCombo) {
      updateCombo(editingCombo.id, comboData);
    } else {
      addCombo(comboData);
    }

    handleCloseModal();
  };

  const handleEdit = (combo) => {
    setEditingCombo(combo);
    setFormData({
      name: combo.name,
      description: combo.description,
      productIds: combo.productIds,
      price: combo.price,
      offerPrice: combo.offerPrice || '',
      branchIds: combo.branchIds || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = (comboId) => {
    if (window.confirm('Are you sure you want to delete this combo pack?')) {
      deleteCombo(comboId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCombo(null);
    setFormData({
      name: '',
      description: '',
      productIds: [],
      price: 0,
      offerPrice: '',
      branchIds: user.role === 'admin' ? [] : [user.branchId]
    });
  };

  const toggleProduct = (productId) => {
    const newProductIds = formData.productIds.includes(productId)
      ? formData.productIds.filter(id => id !== productId)
      : [...formData.productIds, productId];
    
    if (newProductIds.length <= 3) {
      setFormData({ ...formData, productIds: newProductIds });
    }
  };

  const getBranchNames = (branchIds) => {
    if (!branchIds || branchIds.length === 0) return 'No branches';
    const branchNames = branchIds.map(id => {
      const branch = branches.find(b => b.id === id);
      return branch ? branch.name : 'Unknown';
    });
    return branchNames.join(', ');
  };

  const calculatePreview = () => {
    const selectedProducts = availableProducts.filter(p => 
      formData.productIds.includes(p.id)
    );
    const totalOriginalPrice = selectedProducts.reduce((sum, p) => sum + p.finalPrice, 0);
    const finalPrice = formData.offerPrice || formData.price;
    const savings = totalOriginalPrice - finalPrice;
    const savingsPercent = totalOriginalPrice > 0 
      ? Math.round((savings / totalOriginalPrice) * 100 * 100) / 100 
      : 0;

    return { selectedProducts, totalOriginalPrice, finalPrice, savings, savingsPercent };
  };

  const preview = calculatePreview();

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:pl-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Combo Pack Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage product combo packs with special pricing</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Combo Pack
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search combo packs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Combo Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCombos.map((combo) => (
            <div key={combo.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg mr-3">
                    <ShoppingBag className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{combo.name}</h3>
                    <p className="text-sm text-gray-500">{combo.products.length} products</p>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(combo)}
                    className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(combo.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">{combo.description}</p>
                
                {/* Products in combo */}
                <div className="space-y-1 mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">Includes:</p>
                  {combo.products.map((product, index) => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{product.name}</span>
                      <span className="text-gray-500">${product.finalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Individual total:</span>
                    <span className="text-sm text-gray-400 line-through">
                      ${combo.totalOriginalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">Combo Price:</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-600">
                        ${combo.finalPrice.toFixed(2)}
                      </span>
                      {combo.savingsPercent > 0 && (
                        <div className="text-xs text-green-600 font-medium">
                          Save {combo.savingsPercent}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Stock Available:</span>
                    <span className={`text-sm font-medium ${
                      combo.stock <= 5 ? 'text-red-600' : combo.stock <= 20 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {combo.stock}
                    </span>
                  </div>
                </div>
              </div>

              {user.role === 'admin' && (
                <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
                  <strong>Branches:</strong> {getBranchNames(combo.branchIds)}
                </div>
              )}

              {combo.savingsPercent > 0 && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Percent className="h-3 w-3 mr-1" />
                    {combo.savingsPercent}% Savings
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCombos.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No combo packs found</p>
            <p className="text-gray-400 text-sm">Create your first combo pack to offer bundled deals</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCombo ? 'Edit Combo Pack' : 'Create New Combo Pack'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Combo Pack Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Summer Special Combo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Describe the combo pack benefits..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Combo Price *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Offer Price (Optional)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.offerPrice}
                          onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Special price"
                        />
                      </div>
                    </div>

                    {user.role === 'admin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assign to Branches
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                          {branches.map(branch => (
                            <label key={branch.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.branchIds.includes(branch.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      branchIds: [...formData.branchIds, branch.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      branchIds: formData.branchIds.filter(id => id !== branch.id)
                                    });
                                  }
                                }}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{branch.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Product Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Products (2-3 products) *
                      </label>
                      <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                        {availableProducts.map(product => (
                          <label key={product.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              checked={formData.productIds.includes(product.id)}
                              onChange={() => toggleProduct(product.id)}
                              disabled={!formData.productIds.includes(product.id) && formData.productIds.length >= 3}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                <span className="text-sm text-gray-600">${product.finalPrice.toFixed(2)}</span>
                              </div>
                              <div className="text-xs text-gray-500">Stock: {product.stock}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Selected: {formData.productIds.length}/3 products
                      </p>
                    </div>

                    {/* Preview */}
                    {formData.productIds.length > 0 && (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pricing Preview
                        </h4>
                        <div className="space-y-2 text-sm">
                          {preview.selectedProducts.map(product => (
                            <div key={product.id} className="flex justify-between">
                              <span className="text-gray-700">{product.name}</span>
                              <span className="text-gray-600">${product.finalPrice.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between text-gray-600">
                              <span>Individual Total:</span>
                              <span>${preview.totalOriginalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-900">
                              <span>Combo Price:</span>
                              <span className="text-green-600">${preview.finalPrice.toFixed(2)}</span>
                            </div>
                            {preview.savings > 0 && (
                              <div className="flex justify-between text-green-600 font-medium">
                                <span>Customer Saves:</span>
                                <span>${preview.savings.toFixed(2)} ({preview.savingsPercent}%)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formData.productIds.length < 2 || formData.productIds.length > 3}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingCombo ? 'Update' : 'Create'} Combo Pack
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboManagement;