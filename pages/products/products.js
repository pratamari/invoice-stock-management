// pages/products/products.js
const { t } = require('../../utils/i18n');
const { STORAGE_KEYS, save, load } = require('../../utils/storage');
const { createProduct, saveProducts, loadProducts } = require('../../utils/product_model');
const { apiKey, userId, baseUrl } = require('../../config/index');
Page({
  data: {
    products: []
  },

  loadProducts() {
    console.log('Debug - Loading products');
    try {
      const products = loadProducts();
      console.log('Debug - Raw storage:', products);
      
      // Format products for display
      const formattedProducts = products.map(p => ({
        ...p,
        formattedPrice: `Rp ${p.price.toLocaleString('id-ID')}`,
        formattedStock: p.stock,
        showMenu: false,
        isEditing: false
      }));
      
      this.setData({ products: formattedProducts });      
      console.log('Debug - Final products:', this.data.products);
    } catch (e) {
      console.error('Debug - Error loading products:', e);
      this.setData({ products: [] });
    }
  },

  onLoad() {
    this.setData({
      products: []
    });
    this.loadProducts();
  },

  onShow() {
    // Refresh products list when page becomes visible
    this.loadProducts();
  },

  refreshProducts() {
    // Load and standardize products
    const products = loadProducts();
    // Initialize UI state for each product
    const formattedProducts = products.map(product => ({
      ...product,
      showMenu: false,
      isEditing: false
    }));
    console.log('Debug - Formatted products:', formattedProducts);
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
    products[index].formattedStock = stock;
    this.setData({ products });
    saveProducts(products);
  },

  onPriceChange(e) {
    const index = e.target.dataset.index;
    const price = parseFloat(e.detail.value) || 0;
    const products = this.data.products;
    products[index].price = price;
    products[index].formattedPrice = `Rp ${price.toLocaleString('id-ID')}`;
    this.setData({ products });
    saveProducts(products);
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
          saveProducts(products);
          this.refreshProducts();
        }
      }
    });
  },

  menuTap() {
    // Prevent menu close when clicking inside menu
  },

  showMenu(e) {
    const index = parseInt(e.target.dataset.index);
    if (isNaN(index)) return;

    const products = [...this.data.products];
    const currentProduct = products[index];
    
    // Close all other menus first
    products.forEach((item, i) => {
      if (i !== index) item.showMenu = false;
    });
    
    // Then toggle current menu
    currentProduct.showMenu = !currentProduct.showMenu;
    
    this.setData({ products });

    // Add global click listener to close menu
    if (currentProduct.showMenu) {
      my.on('tap', this.handleGlobalTap.bind(this));
    }
  },

  handleGlobalTap(e) {
    const target = e.target || {};
    const className = target.className || '';
    
    // Don't close if clicking menu elements
    if (className.includes('dots') || 
        className.includes('menu') || 
        className.includes('action-menu')) {
      return;
    }

    // Close all menus
    const products = [...this.data.products];
    products.forEach(item => item.showMenu = false);
    this.setData({ products });

    // Remove global listener
    my.off('tap', this.handleGlobalTap);
  },

  closeAllMenus(e) {
    // Skip if the click is on menu elements
    const target = e.target || {};
    const className = target.className || '';
    
    if (className.includes('dots') || 
        className.includes('menu-wrapper') || 
        className.includes('action-menu') || 
        className.includes('menu-item') || 
        className.includes('menu-text')) {
      return;
    }

    // Close all menus
    const products = [...this.data.products];
    const hasOpenMenu = products.some(item => item.showMenu);
    
    if (hasOpenMenu) {
      products.forEach(item => item.showMenu = false);
      this.setData({ products });
    }
  },

  onScanNote() {
    my.chooseImage({
      count: 1,
      sourceType: ['camera', 'album'],
      success: (res) => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          this.uploadImage(res.tempFilePaths[0]);
        }
      },
      fail: (error) => {
        // Only show error if it's not a user cancellation
        if (error.error !== 10 && error.error !== 11) {
          my.alert({
            title: 'Error',
            content: 'Gagal mengambil gambar: ' + error.errorMessage
          });
        }
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

      if (!uploadData || !uploadData.id) {
        throw new Error('No file ID in upload response');
      }

      const fileId = uploadData.id;
      console.log('Debug - File ID:', fileId);

      // Second API - Process receipt
      my.showLoading({
        content: 'Processing receipt...'
      });

      const processRequestData = {
        inputs: {
          image: {
            transfer_method: 'local_file',
            upload_file_id: fileId,
            type: 'image'
          }
        },
        response_mode: 'blocking',
        user: user
      };

      console.log('Debug - Process Request:', processRequestData);

      const processRes = await my.request({
        url: `${baseUrl}/workflows/run`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: processRequestData
      });

      console.log('Debug - Process Response:', processRes);

      if (!processRes.data) {
        throw new Error('No data from process API');
      }

      const result = processRes.data;
      if (!result.data || !result.data.outputs || !result.data.outputs.Extracted || !result.data.outputs.Extracted.items) {
        console.error('Invalid response structure:', result);
        throw new Error('Invalid response structure from process API');
      }

      const items = result.data.outputs.Extracted.items;
      if (!Array.isArray(items)) {
        throw new Error('Items is not an array');
      }

      console.log('Debug - Extracted Items:', items);

      // Map API fields to our field names
      const mappedItems = items.map(item => ({
        name: item.name || '',
        quantity: item.qty || 0,
        price: item.price ? item.price.replace(/[.,]/g, '') : 0 // Remove dots and commas
      }));

      console.log('Debug - Mapped Items:', mappedItems);

      // Navigate to review page
      my.hideLoading();
      my.navigateTo({
        url: `/pages/review_items/review_items?items=${encodeURIComponent(JSON.stringify(mappedItems))}`,
        fail: (error) => {
          console.error('Navigation error:', error);
          my.alert({
            title: 'Error',
            content: 'Failed to open review page'
          });
        }
      });
      my.hideLoading();
      my.showToast({
        type: 'success',
        content: 'Receipt processed successfully!'
      });
      my.navigateBack();

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
