// pages/products/products.js
const { t } = require('../../utils/i18n');
const { STORAGE_KEYS, save, load } = require('../../utils/storage');
const { apiKey, userId, baseUrl } = require('../../config/index');
Page({
  data: {
    products: []
  },

  onLoad() {
    this.refreshProducts();
  },

  onShow() {
    this.refreshProducts();
  },

  refreshProducts() {
    const products = load(STORAGE_KEYS.PRODUCTS) || [];
    // Format price for display
    const formattedProducts = products.map(product => ({
      ...product,
      formattedPrice: `Rp ${product.price.toLocaleString('id-ID')}`,
      showMenu: false,
      isEditing: false
    }));
    this.setData({ products: formattedProducts });
  },

  onAddProduct() {
    my.navigateTo({
      url: '/pages/products/addProduct'
    });
  },

  toggleEdit(e) {
    const index = e.target.dataset.index;
    const products = this.data.products;
    products[index].isEditing = !products[index].isEditing;
    products[index].showMenu = false;
    this.setData({ products });
  },

  onStockChange(e) {
    const index = e.target.dataset.index;
    const stock = parseInt(e.detail.value) || 0;
    const products = this.data.products;
    products[index].stock = stock;
    this.setData({ products });
    save(STORAGE_KEYS.PRODUCTS, products);
  },

  onPriceChange(e) {
    const index = e.target.dataset.index;
    const price = parseFloat(e.detail.value) || 0;
    const products = this.data.products;
    products[index].price = price;
    products[index].formattedPrice = `Rp ${price.toLocaleString('id-ID')}`;
    this.setData({ products });
    save(STORAGE_KEYS.PRODUCTS, products);
  },

  onDeleteProduct(e) {
    const sku = e.target.dataset.sku;
    const index = this.data.products.findIndex(item => item.sku === sku);
    const product = this.data.products[index];
    const products = this.data.products.filter(item => item.sku !== sku);
    
    // Close menu immediately
    if (index !== -1) {
      this.data.products[index].showMenu = false;
      this.setData({ products: this.data.products });
    }

    my.confirm({
      title: t('Hapus Produk'),
      content: `Apakah anda yakin ingin menghapus produk ${product.name}?`,
      confirmButtonText: t('Ya, hapus!'),
      confirmColor: '#ef4444',
      cancelButtonText: t('Batal'),
      success: (result) => {
        if (result.confirm) {
          save(STORAGE_KEYS.PRODUCTS, products);
          this.refreshProducts();
        }
      }
    });
  },

  showMenu(e) {
    const index = e.target.dataset.index;
    const products = this.data.products;
    
    products.forEach((item, i) => {
      if (i !== parseInt(index)) {
        item.showMenu = false;
      }
    });
    
    products[index].showMenu = !products[index].showMenu;
    
    this.setData({ products });
  },

  closeAllMenus(e) {
    if (e && (e.target.className === 'dots' || e.target.dataset.menuItem)) {
      return;
    }

    const products = this.data.products;
    let hasChanges = false;

    products.forEach(item => {
      if (item.showMenu) {
        item.showMenu = false;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.setData({ products });
    }
  },

  onScanNote() {
    my.chooseImage({
      count: 1,
      sourceType: ['camera', 'album'],
      success: (res) => {
        this.uploadImage(res.tempFilePaths[0]);
      },
      fail: (error) => {
        my.alert({
          title: 'Error',
          content: 'Gagal mengambil gambar: ' + error.errorMessage
        });
      }
    });
  },

  async uploadImage(tempFilePath) {
    try {
      const token = apiKey;
      const user = userId;

      // First API - Upload file
      my.showLoading({
        content: 'Uploading image...'
      });

      // Debug logs
      console.log('Debug - Config:', {
        baseUrl,
        token,
        user
      });

      console.log('Debug - File:', {
        tempFilePath
      });

      // Match curl format exactly
      const uploadRes = await my.uploadFile({
        url: `${baseUrl}/files/upload`,
        fileType: 'image',
        fileName: 'file',  // Match the form field name in curl
        filePath: tempFilePath,
        header: {
          'Authorization': `Bearer ${token}`
        },
        formData: {
          'user': `"${user}"` // Match the quoted format in curl
        }
      });

      console.log('Debug - Request:', {
        url: `${baseUrl}/files/upload`,
        token,
        filePath: tempFilePath,
        user: `"${user}"`
      });

      // Log the complete response for debugging
      console.log('Debug - Complete Response:', {
        data: uploadRes.data,
        status: uploadRes.status,
        headers: uploadRes.headers,
        error: uploadRes.error,
        complete: uploadRes
      });

      // Debug logs
      console.log('Debug - Upload Response:', {
        status: uploadRes.status,
        headers: uploadRes.headers,
        data: uploadRes.data,
        error: uploadRes.error
      });

      if (uploadRes.error || uploadRes.status === 400) {
        throw new Error(`Upload failed: ${JSON.stringify(uploadRes.data)}`);
      }

      if (!uploadRes || !uploadRes.data) {
        throw new Error('No response from upload API');
      }

      let uploadData;
      try {
        uploadData = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data;
        console.log('Debug - Parsed Upload Data:', uploadData);
      } catch (e) {
        console.error('Debug - Parse Error:', e);
        throw new Error('Failed to parse upload response');
      }

      // For now, just show success message
      my.hideLoading();
      my.showToast({
        type: 'success',
        content: 'Upload successful!'
      });

      // Comment out second API for now
      /*
      // Second API code here...
      */

    } catch (error) {
      console.error('Error details:', error);
      my.hideLoading();
      my.showToast({
        type: 'fail',
        content: `Error: ${error.message}`
      });
    } finally {
      my.hideLoading();
    }
  }
});
