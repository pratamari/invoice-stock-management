// pages/products/addProduct.js
const { t } = require('../../utils/i18n');
const { STORAGE_KEYS, save, load } = require('../../utils/storage');

Page({
  data: {
    showModal: true,
    addForm: {
      name: '',
      category: '',
      price: '',
      stock: 0
    },
    addProductLabel: '',
    productNameLabel: '',
    productCategoryLabel: '',
    productPriceLabel: '',
    productStockLabel: '',
    saveLabel: '',
    cancelLabel: '',
    productNamePlaceholder: '',
    productCategoryPlaceholder: '',
    productPricePlaceholder: '',
    productStockPlaceholder: ''
  },
  onLoad() {
    this.setData({
      addProductLabel: t('add_product'),
      productNameLabel: t('product_name'),
      productCategoryLabel: t('product_category'),
      productPriceLabel: t('product_price'),
      productStockLabel: t('product_stock'),
      saveLabel: t('save'),
      cancelLabel: t('cancel'),
      productNamePlaceholder: t('product_name_placeholder'),
      productCategoryPlaceholder: t('product_category_placeholder'),
      productPricePlaceholder: t('product_price_placeholder'),
      productStockPlaceholder: t('product_stock_placeholder')
    });
  },
  onSubmitAddProduct(e) {
    const { name, category, price, stock } = e.detail.value;
    // Validation
    if (!name || !category || !price) {
      my.alert({
        title: t('add_product'),
        content: t('form_required_fields')
      });
      return;
    }
    const stockVal = Number(stock);
    if (isNaN(stockVal) || stockVal < 0) {
      my.alert({
        title: t('add_product'),
        content: t('stock_cannot_negative')
      });
      return;
    }
    // Generate SKU automatically: NAME-CAT-<RANDOM>
    const sku = `${name.replace(/\s+/g, '').toUpperCase()}-${category.replace(/\s+/g, '').toUpperCase()}-${Math.floor(Math.random()*10000)}`;
    const newProduct = {
      name,
      category,
      price: parseFloat(price),
      stock: stockVal,
      sku,
    };
    let products = load(STORAGE_KEYS.PRODUCTS);
    products.unshift(newProduct);
    save(STORAGE_KEYS.PRODUCTS, products);
    my.navigateBack();
  },
  onCancelAddProduct() {
    my.navigateBack();
  }
});
