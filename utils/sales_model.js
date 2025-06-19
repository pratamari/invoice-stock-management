const { STORAGE_KEYS, save, load } = require('./storage');

const SALES_STORAGE_KEY = 'sales_data';
const LAST_ORDER_ID_KEY = 'last_order_id';

const getSales = () => {
  try {
    const salesData = load(SALES_STORAGE_KEY, '[]');
    return JSON.parse(salesData);
  } catch (e) {
    console.error('Error reading sales data:', e);
    return [];
  }
};

const saveSales = (salesData) => {
  try {
    save(SALES_STORAGE_KEY, JSON.stringify(salesData));
  } catch (e) {
    console.error('Error saving sales data:', e);
  }
};

const getLastOrderId = () => {
  try {
    return parseInt(load(LAST_ORDER_ID_KEY, '0'));
  } catch (e) {
    return 0;
  }
};

const saveLastOrderId = (orderId) => {
  try {
    save(LAST_ORDER_ID_KEY, orderId.toString());
  } catch (e) {
    console.error('Error saving order ID:', e);
  }
};

module.exports = {
  getSales,
  saveSales,
  getLastOrderId,
  saveLastOrderId
};
