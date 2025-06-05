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
    },
    addProductLabel: '',
    productNameLabel: '',
    productCategoryLabel: '',
    productPriceLabel: '',
    saveLabel: '',
    cancelLabel: '',
    productNamePlaceholder: '',
    productCategoryPlaceholder: '',
    productPricePlaceholder: ''
  },
  onLoad() {
    this.setData({
      addProductLabel: t('add_product'),
      productNameLabel: t('product_name'),
      productCategoryLabel: t('product_category'),
      productPriceLabel: t('product_price'),
      saveLabel: t('save'),
      cancelLabel: t('cancel'),
      productNamePlaceholder: t('product_name_placeholder'),
      productCategoryPlaceholder: t('product_category_placeholder'),
      productPricePlaceholder: t('product_price_placeholder')
    });
  },
  onSubmitAddProduct(e) {
    const { name, category, price } = e.detail.value;
    // Validation
    if (!name || !category || !price) {
      my.alert({
        title: t('add_product'),
        content: t('form_required_fields')
      });
      return;
    }
    // Generate SKU automatically: NAME-CAT-<RANDOM>
    const sku = `${name.replace(/\s+/g, '').toUpperCase()}-${category.replace(/\s+/g, '').toUpperCase()}-${Math.floor(Math.random()*10000)}`;
    const newProduct = {
      name,
      category,
      price: parseFloat(price),
      sku,
      stock: 0
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
