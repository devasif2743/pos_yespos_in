export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const generateBarcode = () => {
  return Date.now().toString() + Math.floor(Math.random() * 1000);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/\s+/g, ''));
};

export const calculateDiscount = (originalPrice, offerPrice) => {
  if (!offerPrice || offerPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - offerPrice) / originalPrice) * 100 * 100) / 100;
};

export const getStockStatus = (stock) => {
  if (stock <= 5) return { status: 'low', color: 'red', text: 'Low Stock' };
  if (stock <= 20) return { status: 'medium', color: 'yellow', text: 'Medium Stock' };
  return { status: 'high', color: 'green', text: 'In Stock' };
};

export const exportToCSV = (data, filename) => {
  const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};