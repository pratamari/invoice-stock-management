// pages/products/products.js
const { t } = require('../../utils/i18n');
const { STORAGE_KEYS, save, load } = require('../../utils/storage');

// Mock data
const mockProducts = [
  { name: 'Kopi Hitam', sku: 'KOPI01-HITAM', stock: 20, price: 15000 },
  { name: 'Teh Manis', sku: 'TEH01-MANIS', stock: 15, price: 12000 },
  { name: 'Roti Bakar Coklat', sku: 'ROTI01-CKT', stock: 10, price: 18000 }
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
    // Force reset storage with mock data
    save(STORAGE_KEYS.PRODUCTS, mockProducts);
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
    // Initialize showMenu property and format price for all products
    products = products.map(product => ({
      ...product,
      showMenu: false,
      formattedPrice: this.formatPrice(product.price)
    }));
    this.setData({ products, productsLabel, addProductLabel, editProductLabel, stockLabel });
  },
  onAddProduct() {
    my.navigateTo({ url: '/pages/products/addProduct' });
  },

  onScanNote() {
    my.navigateTo({ url: '/pages/products/scanNote' });
  },
  onEditProduct(e) {
    const sku = e.target.dataset.sku;
    my.navigateTo({ url: `/pages/products/editProduct?sku=${sku}` });
  },

  showMenu(e) {
    const index = e.target.dataset.index;
    const products = this.data.products;
    
    // Close any other open menus
    products.forEach((item, i) => {
      if (i !== parseInt(index) && item.showMenu) {
        item.showMenu = false;
      }
    });
    
    // Toggle menu for the clicked item
    products[index].showMenu = !products[index].showMenu;
    
    this.setData({ products });
  },

  formatPrice(price) {
    if (!price || isNaN(price)) return 'Rp 0';
    
    // Format the number with thousand separators
    const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp ${formatted}`;
  },

  onDeleteProduct(e) {
    const sku = e.target.dataset.sku;
    const products = this.data.products.filter(item => item.sku !== sku);
    
    my.confirm({
      title: t('confirm_delete'),
      content: t('confirm_delete_message'),
      confirmButtonText: t('delete'),
      cancelButtonText: t('cancel'),
      success: (result) => {
        if (result.confirm) {
          save(STORAGE_KEYS.PRODUCTS, products);
          this.refreshProducts();
        }
      }
    });
  }
});
