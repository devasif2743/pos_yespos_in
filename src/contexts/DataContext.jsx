import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [brands, setBrands] = useState([]);

  // Initialize default data
  const defaultCategories = [
    { id: '1', name: 'Electronics', description: 'Electronic items' },
    { id: '2', name: 'Clothing', description: 'Apparel and accessories' },
    { id: '3', name: 'Food & Beverages', description: 'Food and drink items' }
  ];

  const defaultProducts = [
    {
      id: '1',
      name: 'Samsung Galaxy S21',
      brand: 'Samsung',
      imageUrl: 'https://images.pexels.com/photos/5081398/pexels-photo-5081398.jpeg?auto=compress&cs=tinysrgb&w=300',
      categoryId: '1',
      stock: 10,
      price: 799.99,
      offerPrice: 699.99,
      finalPrice: 699.99,
      discountPercent: 12.5,
      branchIds: ['1'],
      barcode: '1234567890123'
    },
    {
      id: '2',
      name: 'Nike Air Max',
      brand: 'Nike',
      imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=300',
      categoryId: '2',
      stock: 15,
      price: 120.00,
      offerPrice: null,
      finalPrice: 120.00,
      discountPercent: 0,
      branchIds: ['1'],
      barcode: '1234567890124'
    },
    {
      id: '3',
      name: 'Coca Cola 500ml',
      brand: 'Coca-Cola',
      imageUrl: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=300',
      categoryId: '3',
      stock: 50,
      price: 2.50,
      offerPrice: 2.00,
      finalPrice: 2.00,
      discountPercent: 20,
      branchIds: ['1'],
      barcode: '1234567890125'
    }
  ];

  const defaultBrands = [
    { 
      id: '1', 
      name: 'Samsung', 
      description: 'South Korean multinational electronics corporation',
      logoUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    { 
      id: '2', 
      name: 'Nike', 
      description: 'American multinational corporation engaged in the design and manufacturing of footwear and apparel',
      logoUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    { 
      id: '3', 
      name: 'Coca-Cola', 
      description: 'American multinational beverage corporation',
      logoUrl: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  const defaultBranches = [
    {
      id: '1',
      name: 'Main Branch',
      address: '123 Main Street, City',
      phone: '+1234567890',
      email: 'main@pos.com',
      manager: 'Branch Manager'
    }
  ];

  useEffect(() => {
    // Initialize data if not exists
    if (!localStorage.getItem('pos_categories')) {
      localStorage.setItem('pos_categories', JSON.stringify(defaultCategories));
    }
    if (!localStorage.getItem('pos_products')) {
      localStorage.setItem('pos_products', JSON.stringify(defaultProducts));
    }
    if (!localStorage.getItem('pos_branches')) {
      localStorage.setItem('pos_branches', JSON.stringify(defaultBranches));
    }
    if (!localStorage.getItem('pos_transactions')) {
      localStorage.setItem('pos_transactions', JSON.stringify([]));
    }
    if (!localStorage.getItem('pos_customers')) {
      localStorage.setItem('pos_customers', JSON.stringify([]));
    }
    if (!localStorage.getItem('pos_combos')) {
      localStorage.setItem('pos_combos', JSON.stringify([]));
    }
    if (!localStorage.getItem('pos_brands')) {
      localStorage.setItem('pos_brands', JSON.stringify(defaultBrands));
    }
    if (!localStorage.getItem('pos_settings')) {
      const defaultSettings = {
        companyName: 'POS System',
        logoUrl: '',
        tagline: 'Modern Point of Sale Solution',
        phone: '+1 (555) 123-4567',
        email: 'admin@pos.com',
        website: 'https://pos-system.com',
        address: '123 Business Street, City, State 12345',
        businessType: 'Retail Store',
        currency: 'USD',
        taxRate: 0,
        receiptFooter: 'Thank you for your business!',
        
        // Appearance Settings
        theme: 'light',
        primaryColor: '#8B5CF6',
        fontFamily: 'Inter',
        fontSize: 'medium',
        
        // System Settings
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        
        // Integration Settings
        stripePublishableKey: '',
        stripeSecretKey: '',
        paypalClientId: '',
        emailProvider: 'smtp',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        
        // Advanced Settings
        enableNotifications: true,
        enableInventoryAlerts: true,
        autoBackup: true,
        sessionTimeout: 30,
        enableTwoFactor: false,
        allowGuestCheckout: true,
        enableLoyaltyProgram: false
      };
      localStorage.setItem('pos_settings', JSON.stringify(defaultSettings));
    }

    // Load data
    loadData();
  }, []);

  const loadData = () => {
    setCategories(JSON.parse(localStorage.getItem('pos_categories') || '[]'));
    setProducts(JSON.parse(localStorage.getItem('pos_products') || '[]'));
    setBranches(JSON.parse(localStorage.getItem('pos_branches') || '[]'));
    setTransactions(JSON.parse(localStorage.getItem('pos_transactions') || '[]'));
    setCustomers(JSON.parse(localStorage.getItem('pos_customers') || '[]'));
    setCombos(JSON.parse(localStorage.getItem('pos_combos') || '[]'));
    setSettings(JSON.parse(localStorage.getItem('pos_settings') || '{}'));
    setBrands(JSON.parse(localStorage.getItem('pos_brands') || '[]'));
  };

  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Category operations
  const addCategory = (category) => {
    const newCategory = { ...category, id: Date.now().toString() };
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveToStorage('pos_categories', updated);
    return newCategory;
  };

  const updateCategory = (id, updates) => {
    const updated = categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    );
    setCategories(updated);
    saveToStorage('pos_categories', updated);
  };

  const deleteCategory = (id) => {
    const updated = categories.filter(cat => cat.id !== id);
    setCategories(updated);
    saveToStorage('pos_categories', updated);
  };

  // Product operations
  const addProduct = (product) => {
    const finalPrice = product.offerPrice || product.price;
    const discountPercent = product.offerPrice 
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100 * 100) / 100
      : 0;

    const newProduct = { 
      ...product, 
      id: Date.now().toString(),
      finalPrice,
      discountPercent,
      barcode: product.barcode || Date.now().toString()
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveToStorage('pos_products', updated);
    return newProduct;
  };

  const updateProduct = (id, updates) => {
    const finalPrice = updates.offerPrice || updates.price;
    const discountPercent = updates.offerPrice 
      ? Math.round(((updates.price - updates.offerPrice) / updates.price) * 100 * 100) / 100
      : 0;

    const updated = products.map(prod => 
      prod.id === id 
        ? { ...prod, ...updates, finalPrice, discountPercent } 
        : prod
    );
    setProducts(updated);
    saveToStorage('pos_products', updated);
  };

  const deleteProduct = (id) => {
    const updated = products.filter(prod => prod.id !== id);
    setProducts(updated);
    saveToStorage('pos_products', updated);
  };

  // Branch operations
  const addBranch = (branch) => {
    const newBranch = { 
      ...branch, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updated = [...branches, newBranch];
    setBranches(updated);
    saveToStorage('pos_branches', updated);
    return newBranch;
  };

  const updateBranch = (id, updates) => {
    const updated = branches.map(branch => 
      branch.id === id ? { ...branch, ...updates } : branch
    );
    setBranches(updated);
    saveToStorage('pos_branches', updated);
  };

  const deleteBranch = (id) => {
    const updated = branches.filter(branch => branch.id !== id);
    setBranches(updated);
    saveToStorage('pos_branches', updated);
  };

  // Transaction operations
  const addTransaction = (transaction) => {
    const newTransaction = { 
      ...transaction, 
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    saveToStorage('pos_transactions', updated);
    return newTransaction;
  };

  // Customer operations
  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: Date.now().toString() };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    saveToStorage('pos_customers', updated);
    return newCustomer;
  };

  // Combo operations
  const addCombo = (combo) => {
    const newCombo = { 
      ...combo, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updated = [...combos, newCombo];
    setCombos(updated);
    saveToStorage('pos_combos', updated);
    return newCombo;
  };

  const updateCombo = (id, updates) => {
    const updated = combos.map(combo => 
      combo.id === id ? { ...combo, ...updates } : combo
    );
    setCombos(updated);
    saveToStorage('pos_combos', updated);
  };

  const deleteCombo = (id) => {
    const updated = combos.filter(combo => combo.id !== id);
    setCombos(updated);
    saveToStorage('pos_combos', updated);
  };

  // Brand operations
  const addBrand = (brand) => {
    const newBrand = { 
      ...brand, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updated = [...brands, newBrand];
    setBrands(updated);
    saveToStorage('pos_brands', updated);
    return newBrand;
  };

  const updateBrand = (id, updates) => {
    const updated = brands.map(brand => 
      brand.id === id ? { ...brand, ...updates } : brand
    );
    setBrands(updated);
    saveToStorage('pos_brands', updated);
  };

  const deleteBrand = (id) => {
    const updated = brands.filter(brand => brand.id !== id);
    setBrands(updated);
    saveToStorage('pos_brands', updated);
  };

  // Settings operations
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    saveToStorage('pos_settings', newSettings);
    
    // Apply settings immediately
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    document.documentElement.style.setProperty('--font-family', newSettings.fontFamily);
    document.documentElement.style.setProperty('--primary-color', newSettings.primaryColor);
    
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px', 
      'large': '18px',
      'extra-large': '20px'
    };
    document.documentElement.style.setProperty('--font-size-base', fontSizeMap[newSettings.fontSize]);
  };

  const value = {
    categories,
    products,
    branches,
    transactions,
    customers,
    combos,
    settings,
    brands,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    addBranch,
    updateBranch,
    deleteBranch,
    addTransaction,
    addCustomer,
    addCombo,
    updateCombo,
    deleteCombo,
    addBrand,
    updateBrand,
    deleteBrand,
    updateSettings,
    loadData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};