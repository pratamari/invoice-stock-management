// pages/products/addProduct.js
const { t } = require('../../utils/i18n');
const { STORAGE_KEYS, save, load } = require('../../utils/storage');
const { createProduct, generateSku, saveProducts, loadProducts } = require('../../utils/product_model');
const categories = require('./product_category.json');

Page({
  data: {
    showModal: true,
    addForm: {
      name: '',
      category: '',
      price: '',
      stock: ''
    },
    categories: [],
    filteredCategories: [],
    showCategoryDropdown: false,
    categorySearch: '',
    addProductLabel: '',
    productNameLabel: '',
    productCategoryLabel: '',
    productPriceLabel: '',
    productStokLabel: '',
    saveLabel: '',
    cancelLabel: '',
    productNamePlaceholder: '',
    productCategoryPlaceholder: '',
    productPricePlaceholder: '',
    productStokPlaceholder: ''
  },

  onLoad() {
    this.setData({
      addProductLabel: 'Tambah Produk',
      productNameLabel: 'Nama Produk',
      productCategoryLabel: 'Kategori Produk',
      productPriceLabel: 'Harga Produk',
      productStokLabel: 'Stok',
      saveLabel: 'Simpan',
      cancelLabel: 'Batal',
      productNamePlaceholder: 'Nama Produk',
      productCategoryPlaceholder: 'Pilih Kategori',
      productPricePlaceholder: 'Harga Produk',
      productStokPlaceholder: 'Stok Barang',
      categories: categories
    });
  },

  onSubmitAddProduct(e) {
    const { name, category, price, stock } = e.detail.value;
    // Validation
    if (!name || !category || !price) {
      my.alert({
        title: 'Tambah Produk',
        content: 'Mohon lengkapi semua field'
      });
      return;
    }

    // Validate category exists in the list
    if (!this.data.categories.includes(category)) {
      my.alert({
        title: 'Kategori Tidak Valid',
        content: 'Mohon pilih kategori dari daftar yang tersedia'
      });
      return;
    }

    // Create product with stock
    const product = createProduct({
      name,
      category,
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0
    });

    let products = loadProducts();
    products.unshift(product);
    saveProducts(products);
    my.navigateBack();
  },

  onCancelAddProduct() {
    my.navigateBack();
  },

  onCategoryInput(e) {
    const search = e.detail.value.toLowerCase();
    let filtered = this.data.categories;
    
    if (search.length >= 2) {
      filtered = this.data.categories.filter(cat => 
        cat.toLowerCase().startsWith(search)
      );
    }

    this.setData({
      categorySearch: search,
      'addForm.category': '', // Clear selected category when typing
      filteredCategories: filtered,
      showCategoryDropdown: true
    });
  },

  onCategoryFocus() {
    this.setData({
      showCategoryDropdown: true,
      filteredCategories: this.data.categories
    });
  },

  onCategorySelect(e) {
    const category = e.target.dataset.category;
    this.setData({
      'addForm.category': category,
      categorySearch: category,
      showCategoryDropdown: false
    });
  },

  onCategoryBlur() {
    // Delay hiding dropdown to allow click event to fire
    setTimeout(() => {
      const category = this.data.categorySearch;
      // If typed category doesn't exist in list, clear it
      if (!this.data.categories.includes(category)) {
        this.setData({
          categorySearch: '',
          'addForm.category': ''
        });
      }
      this.setData({
        showCategoryDropdown: false
      });
    }, 200);
  },

  onCategoryChange(e) {
    const { value } = e.detail;
    this.setData({
      'addForm.category': this.data.categories[value]
    });
  }
});