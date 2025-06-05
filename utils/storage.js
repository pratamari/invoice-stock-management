// utils/storage.js
const STORAGE_KEYS = {
  PRODUCTS: 'PRODUCTS',
  STOCK_HISTORY: 'STOCK_HISTORY',
  INVOICES: 'INVOICES',
};

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

module.exports = { STORAGE_KEYS, save, load };
