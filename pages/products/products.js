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
    stockLabel: '',
    showCamera: false
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
    // Initialize properties for all products
    products = products.map(product => ({
      ...product,
      showMenu: false,
      isEditing: false,
      formattedPrice: this.formatPrice(product.price)
    }));
    this.setData({ products, productsLabel, addProductLabel, editProductLabel, stockLabel });
  },
  onAddProduct() {
    my.navigateTo({ url: '/pages/products/addProduct' });
  },

  onScanNote() {
    my.chooseImage({
      count: 1,
      sourceType: ['camera'],
      success: (res) => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          const imagePath = res.tempFilePaths[0];
          console.log('Image captured:', imagePath);
          // Here you can handle the captured image
          // For example, navigate to a processing page
          my.navigateTo({
            url: `/pages/scanNote/scanNote?image=${encodeURIComponent(imagePath)}`
          });
        }
      },
      fail: (error) => {
        // Only show error if it's not just the user canceling
        if (error.error !== 11) {
          console.error('Camera error:', error);
          my.showToast({
            type: 'fail',
            content: 'Gagal mengambil foto',
            duration: 2000
          });
        }
      }
    });
  },
  toggleEdit(e) {
    const index = e.target.dataset.index;
    const products = this.data.products;
    const product = products[index];

    if (product.isEditing) {
      // Save changes
      save(STORAGE_KEYS.PRODUCTS, products);
      product.isEditing = false;
      product.showMenu = false;
    } else {
      // Start editing
      product.isEditing = true;
    }

    this.setData({ products });
  },

  onStockChange(e) {
    const index = e.target.dataset.index;
    const products = this.data.products;
    products[index].stock = parseInt(e.detail.value) || 0;
    this.setData({ products });
    // Save changes immediately
    save(STORAGE_KEYS.PRODUCTS, products);
  },

  onPriceChange(e) {
    const index = e.target.dataset.index;
    const products = this.data.products;
    const price = parseInt(e.detail.value) || 0;
    products[index].price = price;
    products[index].formattedPrice = this.formatPrice(price);
    this.setData({ products });
    // Save changes immediately
    save(STORAGE_KEYS.PRODUCTS, products);
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
