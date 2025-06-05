// pages/products/products.js
const { t } = require('../../utils/i18n');
const { STORAGE_KEYS, save, load } = require('../../utils/storage');

// Mock data
const mockProducts = [
  { name: 'Kopi Hitam', sku: 'KOPI01-HITAM', stock: 20 },
  { name: 'Teh Manis', sku: 'TEH01-MANIS', stock: 15 },
  { name: 'Roti Bakar Coklat', sku: 'ROTI01-CKT', stock: 10 }
];

Page({
  data: {
    products: [],
    productsLabel: '',
    addProductLabel: '',
    editProductLabel: '',
    stockLabel: ''
  },
  onLoad() {
    this.refreshProducts();
  },
  onShow() {
    this.refreshProducts();
  },
  refreshProducts() {
    const productsLabel = t('products');
    const addProductLabel = t('add_product');
    const editProductLabel = t('edit_product');
    const stockLabel = t('stock');
    let products = load(STORAGE_KEYS.PRODUCTS);
    if (!products || products.length === 0) {
      products = mockProducts;
      save(STORAGE_KEYS.PRODUCTS, products);
    }
    this.setData({ products, productsLabel, addProductLabel, editProductLabel, stockLabel });
  },
  onAddProduct() {
    my.navigateTo({ url: '/pages/products/addProduct' });
  },
  onEditProduct(e) {
    const sku = e.target.dataset.sku;
    my.navigateTo({ url: `/pages/products/editProduct?sku=${sku}` });
  }
});
