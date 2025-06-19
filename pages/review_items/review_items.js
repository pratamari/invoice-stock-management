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

    // Get existing products
    let existingProducts = [];
    try {
      existingProducts = loadProducts();
      if (!Array.isArray(existingProducts)) {
        console.warn('Debug - Products not an array, resetting');
        existingProducts = [];
      }
    } catch (e) {
      console.error('Debug - Error getting products:', e);
      existingProducts = [];
    }

    // Process each scanned item
    const updatedProducts = [...existingProducts];
    const newProducts = [];

    this.data.items.forEach(item => {
      // Try to find existing product by name (case-insensitive)
      const existingProduct = updatedProducts.find(
        p => p.name.toLowerCase() === item.name.toLowerCase()
      );

      if (existingProduct) {
        // Update existing product quantity
        existingProduct.stock = (parseFloat(existingProduct.stock) || 0) + (parseFloat(item.quantity) || 0);
        console.log(`Debug - Updated existing product ${existingProduct.name}, new stock: ${existingProduct.stock}`);
      } else {
        // Create new product
        const newProduct = createProduct({
          sku: generateSku(item.name, 'SCAN'),
          name: item.name,
          category: 'Scan',
          stock: item.quantity,
          price: item.price
        });
        newProducts.push(newProduct);
        updatedProducts.push(newProduct);
        console.log(`Debug - Created new product: ${newProduct.name}`);
      }
    });

    try {
      // Save all products
      saveProducts(updatedProducts);
      console.log('Debug - Products saved successfully');

      // Show success message with summary
      const message = newProducts.length > 0 ?
        `Added ${newProducts.length} new products and updated ${this.data.items.length - newProducts.length} existing products` :
        `Updated ${this.data.items.length} existing products`;

      my.showToast({
        type: 'success',
        content: message
      });

      // Refresh products page if it exists
      const pages = getCurrentPages();
      const productsPage = pages.find(p => p.route === 'pages/products/products');
      if (productsPage) {
        productsPage.loadProducts();
      }

      // Navigate back to products page
      const currentPages = getCurrentPages();
      const productsPageIndex = currentPages.findIndex(p => p.route === 'pages/products/products');
      
      if (productsPageIndex >= 0) {
        // Calculate how many pages to go back to reach products page
        const delta = currentPages.length - productsPageIndex - 1;
        my.navigateBack({ delta });
      } else {
        // If products page not found in stack, redirect to it
        my.redirectTo({
          url: '/pages/products/products'
        });
      }
    } catch (e) {
      console.error('Debug - Error saving products:', e);
      my.showToast({
        type: 'fail',
        content: 'Failed to save products'
      });
    }
  },

  handleCancel() {
    my.navigateBack();
  }
});
