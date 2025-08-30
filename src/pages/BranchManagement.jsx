import React, { useState, useEffect } from "react";
import {
  fetchBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  // createManager,
} from "../contexts/authApi";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  Phone,
  Mail,
  User,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const [managerData, setManagerData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await fetchBranches();
      if (res.status) setBranches(res.data);
    } catch {
      toast.error("❌ Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, formData);
        toast.success("✅ Branch updated!");
      } else {
        await addBranch(formData);
        toast.success("✅ Branch added!");
      }
      await loadBranches();
      handleCloseModal();
    } catch {
      toast.error("❌ Failed to save branch");
    } finally {
      setLoading(false);
    }
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createManager({
        ...managerData,
        role: "manager",
        branch_id: selectedBranch.id,
      });

      if (res.status) {
        toast.success("✅ Manager created!");
        await loadBranches();
        setIsManagerModalOpen(false);
        setManagerData({ username: "", password: "", name: "", email: "" });
      } else {
        toast.error(res.message || "❌ Failed to create manager");
      }
    } catch {
      toast.error("❌ Error creating manager");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    setLoading(true);
    try {
      await deleteBranch(id);
      toast.success("🗑️ Branch deleted");
      await loadBranches();
    } catch {
      toast.error("❌ Failed to delete branch");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setFormData({ name: "", address: "", phone: "", email: "" });
  };

  const handleAddManager = (branch) => {
    setSelectedBranch(branch);
    setIsManagerModalOpen(true);
  };

  const filteredBranches = branches.filter(
    (b) =>
      (b?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b?.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:pl-6">
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Branch Management
            </h1>
            <p className="text-gray-600 mt-2">Manage your business locations</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Branch
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {branch.name}
                    </h3>
                    <p className="text-sm text-gray-500">ID: #{branch.id}</p>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-1 flex-shrink-0" />
                  <span className="text-sm">{branch.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{branch.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{branch.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    {branch.manager ? (
                      <span className="font-medium">{branch.manager}</span>
                    ) : (
                      <span className="text-red-500">No manager assigned</span>
                    )}
                  </span>
                </div>
              </div>

              {!branch.manager && (
                <button
                  onClick={() => handleAddManager(branch)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Add Manager
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredBranches.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No branches found</p>
            <p className="text-gray-400 text-sm">
              Create your first branch to get started
            </p>
          </div>
        )}

        {/* Branch Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingBranch ? "Edit Branch" : "Add New Branch"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Branch Name *"
                  required
                />
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Address *"
                  required
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    if (/^\d{0,10}$/.test(e.target.value)) {
                      setFormData({ ...formData, phone: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Phone (10 digits) *"
                  required
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Email *"
                  required
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingBranch ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manager Modal */}
        {isManagerModalOpen && selectedBranch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Manager for {selectedBranch.name}
                </h2>
                <button
                  onClick={() => setIsManagerModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleManagerSubmit} className="p-6 space-y-4">
                <input
                  type="text"
                  value={managerData.name}
                  onChange={(e) =>
                    setManagerData({ ...managerData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Manager Name *"
                  required
                />
                <input
                  type="text"
                  value={managerData.username}
                  onChange={(e) =>
                    setManagerData({ ...managerData, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Username *"
                  required
                />
                <input
                  type="password"
                  value={managerData.password}
                  onChange={(e) =>
                    setManagerData({ ...managerData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Password *"
                  required
                />
                <input
                  type="email"
                  value={managerData.email}
                  onChange={(e) =>
                    setManagerData({ ...managerData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Email *"
                  required
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsManagerModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    Create Manager
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

export default BranchManagement;
