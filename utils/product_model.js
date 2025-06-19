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
function createProduct({
  sku,
  name,
  category,
  stock = 0,
  price = 0,
  showMenu = false,
  isEditing = false
}) {
  return {
    sku,
    name,
    category,
    stock: parseFloat(stock) || 0,
    price: parseFloat(price) || 0,
    formattedPrice: formatPrice(parseFloat(price) || 0),
    showMenu,
    isEditing
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
