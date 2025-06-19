// Standard Product Model and Helper Functions
const { STORAGE_KEYS, save, load } = require('./storage');

/**
 * Standard Product Fields:
 * - sku: string (unique identifier)
 * - name: string (product name)
 * - category: string (product category)
 * - stock: number (current stock/quantity)
 * - price: number (product price)
 * - formattedPrice: string (formatted price with currency)
 * - showMenu: boolean (UI state)
 * - isEditing: boolean (UI state)
 */

/**
 * Creates a standardized product object
 */
function createProduct(data = {}) {
  const stock = parseFloat(data.stock || data.quantity || 0);
  const price = parseFloat(data.price || 0);
  
  return {
    sku: data.sku || generateSku(data.name || '', data.category || ''),
    name: data.name || '',
    category: data.category || '',
    stock,
    price,
    formattedPrice: formatPrice(price),
    formattedStock: stock,
    showMenu: false,
    isEditing: false
  };
}

/**
 * Formats price with currency
 */
function formatPrice(price) {
  return `Rp ${(price || 0).toLocaleString('id-ID')}`;
}

/**
 * Generates a SKU based on product name and category
 */
function generateSku(name, category) {
  const cleanName = name.replace(/\s+/g, '').toUpperCase();
  const cleanCategory = category.replace(/\s+/g, '').toUpperCase();
  const random = Math.floor(Math.random() * 10000);
  return `${cleanName}-${cleanCategory}-${random}`;
}

/**
 * Saves products to storage with standardization
 */
function saveProducts(products) {
  const standardizedProducts = products.map(product => createProduct(product));
  save(STORAGE_KEYS.PRODUCTS, standardizedProducts);
  return standardizedProducts;
}

/**
 * Loads and standardizes products from storage
 */
function loadProducts() {
  const products = load(STORAGE_KEYS.PRODUCTS) || [];
  return products.map(product => createProduct(product));
}

module.exports = {
  createProduct,
  formatPrice,
  generateSku,
  saveProducts,
  loadProducts
};
