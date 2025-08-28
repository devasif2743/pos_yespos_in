import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "./authApi";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};

export const DataProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  const didInit = useRef(false);

  // ================= BRANDS =================
  const fetchBrands = async () => {
    try {
      const res = await api.get("/admin/list-brand");
      if (res.data.status) setBrands(res.data.data);
    } catch (err) {
      console.error("Error fetching brands:", err.response?.data || err);
    }
  };

  const addBrand = async (formData, isFile = false) => {
    try {
      const config = isFile ? { headers: { "Content-Type": "multipart/form-data" } } : {};
      const res = await api.post("/admin/add-brand", formData, config);
      if (res.data.status) setBrands((prev) => [...prev, res.data.data]);
    } catch (err) {
      console.error("Error adding brand:", err.response?.data || err);
    }
  };

  const updateBrand = async (id, formData, isFile = false) => {
    try {
      const config = isFile ? { headers: { "Content-Type": "multipart/form-data" } } : {};
      const res = await api.post(`/admin/update-brand/${id}`, formData, config);
      if (res.data.status) {
        setBrands((prev) => prev.map((b) => (b.id === id ? res.data.data : b)));
      }
    } catch (err) {
      console.error("Error updating brand:", err.response?.data || err);
    }
  };

  const deleteBrand = async (id) => {
    try {
      await api.delete(`/admin/delete-brand/${id}`);
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Error deleting brand:", err.response?.data || err);
    }
  };

  // ================= CATEGORIES =================
  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/list-category");
      if (res.data.status) setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err.response?.data || err);
    }
  };

  const addCategory = async (data) => {
    try {
      const res = await api.post("/admin/add-category", data);
      if (res.data.status) setCategories((prev) => [...prev, res.data.data]);
    } catch (err) {
      console.error("Error adding category:", err.response?.data || err);
    }
  };

  const updateCategory = async (id, data) => {
    try {
      const res = await api.post(`/admin/update-category/${id}`, data);
      if (res.data.status) {
        setCategories((prev) => prev.map((c) => (c.id === id ? res.data.data : c)));
      }
    } catch (err) {
      console.error("Error updating category:", err.response?.data || err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/admin/delete-category/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err.response?.data || err);
    }
  };

  // ================= BRANCHES =================
  const fetchBranches = async () => {
    try {
      const res = await api.get("/admin/list-branch");
      if (res.data.status) setBranches(res.data.data);
    } catch (err) {
      console.error("Error fetching branches:", err.response?.data || err);
    }
  };

  const addBranch = async (data) => {
    try {
      const res = await api.post("/admin/add-branch", data);
      if (res.data.status) setBranches((prev) => [...prev, res.data.data]);
    } catch (err) {
      console.error("Error adding branch:", err.response?.data || err);
    }
  };

  const updateBranch = async (id, data) => {
    try {
      const res = await api.post(`/admin/update-branch/${id}`, data);
      if (res.data.status) {
        setBranches((prev) => prev.map((b) => (b.id === id ? res.data.data : b)));
      }
    } catch (err) {
      console.error("Error updating branch:", err.response?.data || err);
    }
  };

  const deleteBranch = async (id) => {
    try {
      await api.delete(`/admin/delete-branch/${id}`);
      setBranches((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Error deleting branch:", err.response?.data || err);
    }
  };

  // ================= PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/list-product");
      if (res.data.status) {
        const normalized = res.data.data.map((p) => ({
          ...p,
          price: Number(p.price || 0),
          offer_price: Number(p.offer_price || 0),
          finalPrice: Number(p.finalPrice || p.offer_price || p.price || 0),
          stock: Number(p.stock || 0),
        }));
        setProducts(normalized);
      }
    } catch (err) {
      console.error("Error fetching products:", err.response?.data || err);
    }
  };

  const addProduct = async (formData, isFile = false) => {
    try {
      const config = isFile ? { headers: { "Content-Type": "multipart/form-data" } } : {};
      const res = await api.post("/admin/add-product", formData, config);
      if (res.data.status) setProducts((prev) => [...prev, res.data.data]);
    } catch (err) {
      console.error("Error adding product:", err.response?.data || err);
    }
  };

  const updateProduct = async (id, formData, isFile = false) => {
    try {
      const config = isFile ? { headers: { "Content-Type": "multipart/form-data" } } : {};
      const res = await api.post(`/admin/update-product/${id}`, formData, config);
      if (res.data.status) {
        setProducts((prev) => prev.map((p) => (p.id === id ? res.data.data : p)));
      }
    } catch (err) {
      console.error("Error updating product:", err.response?.data || err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/admin/delete-product/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err.response?.data || err);
    }
  };

  // ================= COMBOS =================
  const fetchCombos = async () => {
    try {
      const res = await api.get("/admin/list-combo");
      if (res.data.status) {
        setCombos(
          res.data.data.map((c) => ({
            ...c,
            price: Number(c.price || 0),
            offerPrice: Number(c.offerPrice || 0),
            finalPrice: Number(c.finalPrice || c.offerPrice || c.price || 0),
            totalOriginalPrice: Number(c.totalOriginalPrice || 0),
            stock: Number(c.stock || 0),
            products: (c.products || []).map((p) => ({
              ...p,
              finalPrice: Number(p.finalPrice || p.offer_price || p.price || 0),
            })),
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching combos:", err.response?.data || err);
    }
  };

  const addCombo = async (data) => {
    try {
      const res = await api.post("/admin/add-combo", data);
      if (res.data.status) setCombos((prev) => [...prev, res.data.data]);
    } catch (err) {
      console.error("Error adding combo:", err.response?.data || err);
    }
  };

  const updateCombo = async (id, data) => {
    try {
      const res = await api.post(`/admin/update-combo/${id}`, data);
      if (res.data.status) {
        setCombos((prev) => prev.map((c) => (c.id === id ? res.data.data : c)));
      }
    } catch (err) {
      console.error("Error updating combo:", err.response?.data || err);
    }
  };

  const deleteCombo = async (id) => {
    try {
      await api.delete(`/admin/delete-combo/${id}`);
      setCombos((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting combo:", err.response?.data || err);
    }
  };

  // ================= INIT FETCH =================
useEffect(() => {
  let isMounted = true;
  (async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBrands(),
        fetchCategories(),
        fetchBranches(),
        fetchProducts(),
        fetchCombos(),
      ]);
    } finally {
      if (isMounted) setLoading(false);
    }
  })();
  return () => {
    isMounted = false;
  };
}, []); // empty dependency => only runs once



  return (
    <DataContext.Provider
      value={{
        categories,
        products,
        branches,
        brands,
        combos,
        loading,

        fetchBrands,
        addBrand,
        updateBrand,
        deleteBrand,

        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,

        fetchBranches,
        addBranch,
        updateBranch,
        deleteBranch,

        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,

        fetchCombos,
        addCombo,
        updateCombo,
        deleteCombo,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
