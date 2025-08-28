import React, { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Tag,
  Percent,
} from "lucide-react";

const ProductManagement = () => {
  const {
    products,
    brands,
    categories,
    branches,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
    fetchBrands,
    fetchCategories,
    fetchBranches,
  } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    stock: 0,
    price: "",
    offer_price: "",
    branch_ids: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load required refs
  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
    fetchBranches();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand?.name &&
        p.brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("brand_id", formData.brand_id);
    data.append("category_id", formData.category_id);
    data.append("stock", formData.stock);
    data.append("price", formData.price);
    if (formData.offer_price) data.append("offer_price", formData.offer_price);
    formData.branch_ids.forEach((bid) => data.append("branch_ids[]", bid));
    if (imageFile) data.append("image", imageFile);

    if (editingProduct) {
      await updateProduct(editingProduct.id, data, true);
    } else {
      await addProduct(data, true);
    }
    handleCloseModal();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand_id: product.brand_id,
      category_id: product.category_id,
      stock: product.stock,
      price: product.price,
      offer_price: product.offer_price || "",
      branch_ids: product.branch_ids || [],
    });
    setPreviewUrl(product.image_url || null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      brand_id: "",
      category_id: "",
      stock: 0,
      price: "",
      offer_price: "",
      branch_ids: [],
    });
    setImageFile(null);
    setPreviewUrl(null);
  };

  // Calculate discount % for UI preview (Laravel still recalculates server-side)
  const discountPercent = formData.offer_price
    ? (((formData.price - formData.offer_price) / formData.price) * 100).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:pl-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Product Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your products, pricing, stock, and discounts
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-12 w-12 object-contain mr-3"
                      />
                    ) : (
                      <Tag className="h-8 w-8 text-green-600 mr-3" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {p.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {p.brand?.name} • {p.category?.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 font-medium">
                    ${p.final_price}{" "}
                    {p.discount_percent > 0 && (
                      <span className="text-sm text-red-500 line-through ml-2">
                        ${p.price}
                      </span>
                    )}
                  </p>
                  {p.discount_percent > 0 && (
                    <span className="inline-flex items-center text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full mt-1">
                      <Percent className="h-3 w-3 mr-1" />{" "}
                      {p.discount_percent}% off
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Stock: {p.stock} • Branches:{" "}
                    {(p.branch_ids || []).join(", ")}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(p)}
                  className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 text-sm">
              Create your first product to get started
            </p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <input
                  type="text"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />

                {/* Brand & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.brand_id}
                    onChange={(e) =>
                      setFormData({ ...formData, brand_id: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price + Offer */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    className="px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Offer Price"
                    value={formData.offer_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        offer_price: Number(e.target.value),
                      })
                    }
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Stock */}
                <input
                  type="number"
                  placeholder="Stock"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />

                {/* Branch multi-select */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Branches
                  </label>
                  <select
                    multiple
                    value={formData.branch_ids}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branch_ids: Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value
                        ),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {branches.map((br) => (
                      <option key={br.id} value={br.id}>
                        {br.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product Image {editingProduct ? "" : "*"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required={!editingProduct}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-3 h-20 object-contain"
                    />
                  )}
                </div>

                {/* Discount Preview */}
                {formData.offer_price && (
                  <p className="text-sm text-gray-500 flex items-center">
                    <Percent className="h-4 w-4 mr-1 text-red-500" />
                    Discount: {discountPercent} %
                  </p>
                )}

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingProduct ? "Update" : "Create"} Product
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

export default ProductManagement;
