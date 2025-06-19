// utils/storage.js
const STORAGE_KEYS = {
  PRODUCTS: 'PRODUCTS',
  STOCK_HISTORY: 'STOCK_HISTORY',
  INVOICES: 'INVOICES',
};

const SALES_STORAGE_KEY = 'sales_data';
const LAST_ORDER_ID_KEY = 'last_order_id';

function save(key, data) {
  my.setStorageSync({ key, data });
}

function load(key, defaultValue = []) {
  try {
    const res = my.getStorageSync({ key });
    return res.data || defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

const getSales = () => {
  try {
    const salesData = my.getStorageSync({ key: SALES_STORAGE_KEY }).data || '[]';
    return JSON.parse(salesData);
  } catch (e) {
    console.error('Error reading sales data:', e);
    return [];
  }
};

const getLastOrderId = () => {
  try {
    return parseInt(my.getStorageSync({ key: LAST_ORDER_ID_KEY }).data || '0');
  } catch (e) {
    return 0;
  }
};

const saveSales = (salesData) => {
  try {
    my.setStorageSync({
      key: SALES_STORAGE_KEY,
      data: JSON.stringify(salesData)
    });
  } catch (e) {
    console.error('Error saving sales data:', e);
  }
};

const saveLastOrderId = (orderId) => {
  try {
    my.setStorageSync({
      key: LAST_ORDER_ID_KEY,
      data: orderId.toString()
    });
  } catch (e) {
    console.error('Error saving order ID:', e);
  }
};

module.exports = {
  STORAGE_KEYS,
  save,
  load,
  getSales,
  saveSales,
  getLastOrderId,
  saveLastOrderId
};
