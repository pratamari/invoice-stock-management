// pages/products/addProduct.js
const { t } = require('../../utils/i18n');
const { STORAGE_KEYS, save, load } = require('../../utils/storage');
const categories = require('./product_category.json');

Page({
  data: {
    showModal: true,
    addForm: {
      name: '',
      category: '',
      price: '',
    },
    categories: [],
    filteredCategories: [],
    showCategoryDropdown: false,
    categorySearch: '',
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
      addProductLabel: 'Tambah Produk',
      productNameLabel: 'Nama Produk',
      productCategoryLabel: 'Kategori Produk',
      productPriceLabel: 'Harga Produk',
      saveLabel: 'Simpan',
      cancelLabel: 'Batal',
      productNamePlaceholder: 'Nama Produk',
      productCategoryPlaceholder: 'Pilih Kategori',
      productPricePlaceholder: 'Harga Produk',
      categories: categories
    });
  },

  onSubmitAddProduct(e) {
    const { name, category, price } = e.detail.value;
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

    // Generate SKU automatically: NAME-CAT-<RANDOM>
    const sku = `${name.replace(/\s+/g, '').toUpperCase()}-${category.replace(/\s+/g, '').toUpperCase()}-${Math.floor(Math.random()*10000)}`;
    const newProduct = {
      name,
      category,
      price: parseFloat(price),
      sku,
      stock: 0
    };

    let products = load(STORAGE_KEYS.PRODUCTS) || [];
    products.unshift(newProduct);
    save(STORAGE_KEYS.PRODUCTS, products);
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
  },

  async onScanReceipt() {
    const token = 'app-5ufQEDL5OidiFMdQCNkNBubS';
    const user = 'abc-123';

    try {
      const imageRes = await new Promise((resolve, reject) => {
        my.chooseImage({
          count: 1,
          sourceType: ['camera', 'album'],
          success: resolve,
          fail: reject
        });
      });

      if (!imageRes.apFilePaths || !imageRes.apFilePaths.length) {
        throw new Error('No image selected');
      }

      my.showLoading({
        content: 'Uploading image...'
      });

      // First API call - Upload file
      const uploadRes = await my.uploadFile({
        url: 'https://hermes-flow.platform.danaventures.id/v1/files/upload',
        fileType: 'image',
        fileName: 'receipt.jpg',
        filePath: imageRes.apFilePaths[0],
        header: {
          'Authorization': `Bearer ${token}`
        },
        formData: {
          user: user
        }
      });

      const uploadData = JSON.parse(uploadRes.data);
      const fileId = uploadData.id;

      // Navigate to scan result page with the file ID
      my.navigateTo({
        url: `/pages/scan_result/scan_result`,
        success: () => {
          getApp().globalData = getApp().globalData || {};
          getApp().globalData.uploadedFileId = fileId;
        }
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      my.alert({
        title: 'Error',
        content: 'Failed to upload image: ' + (error.message || 'Unknown error')
      });
    } finally {
      my.hideLoading();
    }
  }
});
