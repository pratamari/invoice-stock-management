// pages/products/editProduct.js
const { t } = require('../../utils/i18n');
const { STORAGE_KEYS, save, load } = require('../../utils/storage');

Page({
  data: {
    showModal: true,
    editForm: {
      stock: '',
      price: ''
    },
    editProductLabel: '',
    productStockLabel: '',
    productPriceLabel: '',
    saveLabel: '',
    cancelLabel: '',
    productStockPlaceholder: '',
    productPricePlaceholder: '',
    sku: ''
  },
  onLoad(query) {
    // Get product SKU from query
    const sku = query && query.sku ? query.sku : '';
    let products = load(STORAGE_KEYS.PRODUCTS);
    const product = products.find(p => p.sku === sku) || {};
    this.setData({
      sku,
      editForm: {
        stock: product.stock || 0,
        price: product.price || 0
      },
      editProductLabel: t('edit_product'),
      productStockLabel: t('product_stock'),
      productPriceLabel: t('product_price'),
      saveLabel: t('save'),
      cancelLabel: t('cancel'),
      productStockPlaceholder: t('product_stock_placeholder'),
      productPricePlaceholder: t('product_price_placeholder')
    });
  },
  onSubmitEditProduct(e) {
    const { stock, price } = e.detail.value;
    if (stock === '' || price === '') {
      my.alert({
        title: t('edit_product'),
        content: t('form_required_fields')
      });
      return;
    }
    let products = load(STORAGE_KEYS.PRODUCTS);
    const idx = products.findIndex(p => p.sku === this.data.sku);
    if (idx !== -1) {
      products[idx].stock = parseInt(stock, 10);
      products[idx].price = parseFloat(price);
      save(STORAGE_KEYS.PRODUCTS, products);
    }
    my.navigateBack();
  },
  onCancelEditProduct() {
    my.navigateBack();
  }
});
