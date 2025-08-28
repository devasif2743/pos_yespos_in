import React, { useState, useMemo } from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  ShoppingBag,
  Percent,
} from "lucide-react";

const ComboManagement = () => {
  const { user } = useAuth();
  const { products, combos, addCombo, updateCombo, deleteCombo, branches } =
    useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productIds: [],
    price: 0,
    offerPrice: null, // ✅ use null instead of ""
    branchIds: user.role === "admin" ? [] : [user.branchId],
  });

  // Products available to current user
  const availableProducts = useMemo(() => {
    if (user.role === "admin") return products || [];
    return (products || []).filter(
      (p) => p.branchIds && p.branchIds.includes(user.branchId)
    );
  }, [products, user.role, user.branchId]);

  // Filter combos by role + search
  const filteredCombos = useMemo(() => {
    let filtered = combos || [];

    if (user.role !== "admin" && user.branchId) {
      filtered = filtered.filter(
        (c) => c.branchIds && c.branchIds.includes(user.branchId)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [combos, searchTerm, user.role, user.branchId]);

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.productIds.length < 2 || formData.productIds.length > 3) {
      alert("Please select 2-3 products for the combo pack");
      return;
    }

    const selectedProducts = availableProducts.filter((p) =>
      formData.productIds.includes(p.id)
    );

    const totalOriginalPrice = selectedProducts.reduce(
      (sum, p) => sum + (Number(p.finalPrice) || 0),
      0
    );

    const finalPrice =
      formData.offerPrice !== null ? formData.offerPrice : formData.price;

    const discountPercent =
      formData.offerPrice !== null && formData.price > 0
        ? Math.round(
            ((formData.price - formData.offerPrice) / formData.price) * 10000
          ) / 100
        : 0;

    const savingsPercent =
      totalOriginalPrice > 0
        ? Math.round(
            ((totalOriginalPrice - finalPrice) / totalOriginalPrice) * 10000
          ) / 100
        : 0;

    const comboData = {
      ...formData,
      products: selectedProducts,
      totalOriginalPrice,
      finalPrice,
      discountPercent,
      savingsPercent,
      stock: Math.min(...selectedProducts.map((p) => p.stock || 0)),
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
      productIds: combo.productIds || [],
      price: combo.price,
      offerPrice: combo.offerPrice ?? null,
      branchIds: combo.branchIds || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (comboId) => {
    if (window.confirm("Are you sure you want to delete this combo pack?")) {
      deleteCombo(comboId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCombo(null);
    setFormData({
      name: "",
      description: "",
      productIds: [],
      price: 0,
      offerPrice: null,
      branchIds: user.role === "admin" ? [] : [user.branchId],
    });
  };

  const toggleProduct = (productId) => {
    const newProductIds = formData.productIds.includes(productId)
      ? formData.productIds.filter((id) => id !== productId)
      : [...formData.productIds, productId];

    if (newProductIds.length <= 3) {
      setFormData({ ...formData, productIds: newProductIds });
    }
  };

  const getBranchNames = (branchIds) => {
    if (!branchIds || branchIds.length === 0) return "No branches";
    return branchIds
      .map((id) => {
        const branch = branches.find((b) => b.id === id);
        return branch ? branch.name : "Unknown";
      })
      .join(", ");
  };

  const calculatePreview = () => {
    const selectedProducts = availableProducts
      .filter((p) => formData.productIds.includes(p.id))
      .map((p) => ({
        ...p,
        finalPrice: Number(p.finalPrice || p.offer_price || p.price || 0),
      }));

    const totalOriginalPrice = selectedProducts.reduce(
      (sum, p) => sum + (Number(p.finalPrice) || 0),
      0
    );

    const finalPrice =
      formData.offerPrice !== null ? formData.offerPrice : formData.price;

    const savings = totalOriginalPrice - finalPrice;

    const savingsPercent =
      totalOriginalPrice > 0
        ? Math.round((savings / totalOriginalPrice) * 10000) / 100
        : 0;

    return {
      selectedProducts,
      totalOriginalPrice,
      finalPrice,
      savings,
      savingsPercent,
    };
  };

  const preview = calculatePreview();

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:pl-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Combo Pack Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage product combo packs with special pricing
            </p>
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
          {(filteredCombos || []).map((combo) => (
            <div
              key={combo.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg mr-3">
                    <ShoppingBag className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {combo.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(combo.products && combo.products.length) || 0} products
                    </p>
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

              {/* Products */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">{combo.description}</p>
                <div className="space-y-1 mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Includes:
                  </p>
                  {Array.isArray(combo.products) && combo.products.length > 0 ? (
                    combo.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-700">{product.name}</span>
                        <span className="text-gray-500">
                          ${Number(product.finalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No products linked</p>
                  )}
                </div>

                {/* Pricing */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                      Individual total:
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ${Number(combo.totalOriginalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      Combo Price:
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-600">
                        ${Number(combo.finalPrice || 0).toFixed(2)}
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
                    <span
                      className={`text-sm font-medium ${
                        combo.stock <= 5
                          ? "text-red-600"
                          : combo.stock <= 20
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {combo.stock || 0}
                    </span>
                  </div>
                </div>
              </div>

              {user.role === "admin" && (
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCombo ? "Edit Combo Pack" : "Create New Combo Pack"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Combo Pack Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Combo Price *
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Offer Price (Optional)
                        </label>
                        <input
                          type="number"
                          value={formData.offerPrice ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              offerPrice:
                                e.target.value === ""
                                  ? null
                                  : parseFloat(e.target.value) || null,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right column - products */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Products (2–3)
                    </label>
                    <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                      {availableProducts.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.productIds.includes(product.id)}
                            onChange={() => toggleProduct(product.id)}
                          />
                          <span className="ml-2">{product.name}</span>
                        </label>
                      ))}
                    </div>

                    {/* Preview */}
                    {formData.productIds.length > 0 && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Pricing Preview</h4>
                        <div className="space-y-2 text-sm">
                          {preview.selectedProducts.map((p) => (
                            <div key={p.id} className="flex justify-between">
                              <span>{p.name}</span>
                              <span>
                                ${Number(p.finalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}

                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span>Original Total</span>
                              <span>
                                ${Number(preview.totalOriginalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Combo Price</span>
                              <span className="text-green-600">
                                ${Number(preview.finalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                            {preview.savings > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Customer Saves</span>
                                <span>
                                  ${Number(preview.savings || 0).toFixed(2)} (
                                  {preview.savingsPercent}%)
                                </span>
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
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      formData.productIds.length < 2 ||
                      formData.productIds.length > 3
                    }
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingCombo ? "Update" : "Create"} Combo
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
