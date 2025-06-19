const { STORAGE_KEYS, save, load } = require('../../utils/storage');
const { createProduct, generateSku, saveProducts, loadProducts } = require('../../utils/product_model');

Page({
  data: {
    items: []
  },

  onLoad(query) {
    const items = JSON.parse(query.items || '[]');
    this.setData({
      items: items.map(item => ({
        name: item.name || '',
        quantity: item.quantity || 0,
        price: item.price || 0
      }))
    });
  },

  handleInput(e) {
    const { index, field } = e.target.dataset;
    const { value } = e.detail;
    const items = [...this.data.items];
    items[index][field] = value;

    // Convert to numbers for quantity and price
    if (field === 'quantity' || field === 'price') {
      items[index][field] = parseFloat(value) || 0;
    }

    this.setData({ items });
  },

  handleSubmit() {
    console.log('Debug - Current items:', this.data.items);

    const products = this.data.items.map(item => createProduct({
      sku: generateSku(item.name, 'SCAN'),
      name: item.name,
      category: 'Scan',
      stock: item.quantity,
      price: item.price
    }));

    console.log('Debug - Mapped products:', products);

    // Get existing products
    let existingProducts = [];
    try {
      existingProducts = loadProducts();
      console.log('Debug - Existing products:', existingProducts);
      
      if (!Array.isArray(existingProducts)) {
        console.warn('Debug - Products not an array, resetting');
        existingProducts = [];
      }
    } catch (e) {
      console.error('Debug - Error getting products:', e);
    }

    // Add new products
    const updatedProducts = existingProducts.concat(products);
    console.log('Debug - Updated products:', updatedProducts);

    try {
      saveProducts(updatedProducts);
      console.log('Debug - Products saved successfully');

      // Refresh the products page
      const pages = getCurrentPages();
      const productsPage = pages.find(p => p.route === 'pages/products/products');
      if (productsPage) {
        productsPage.loadProducts(); // This will refresh the products list
      }

      my.showToast({
        type: 'success',
        content: 'Products saved successfully'
      });

      // Navigate back
      my.navigateBack({
        delta: 2
      });
    } catch (e) {
      console.error('Debug - Error saving products:', e);
      my.showToast({
        type: 'fail',
        content: 'Failed to save products'
      });
    }

    // Navigate back to products page
    my.navigateBack({
      delta: 2  // Go back 2 pages (review_items -> scan -> products)
    });
  },

  handleCancel() {
    my.navigateBack();
  }
});
