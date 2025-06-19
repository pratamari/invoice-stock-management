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
      console.log('Debug - Existing products:', existingProducts);
      
      if (!Array.isArray(existingProducts)) {
        console.warn('Debug - Products not an array, resetting');
        existingProducts = [];
      }
    } catch (e) {
      console.error('Debug - Error getting products:', e);
      existingProducts = [];
    }

    const newProducts = [];
    const updatedProducts = [...existingProducts];

    // Process each item
    this.data.items.forEach(item => {
      // Find existing product by name
      const existingIndex = existingProducts.findIndex(
        p => p.name.toLowerCase() === item.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Update existing product quantity
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          stock: (updatedProducts[existingIndex].stock || 0) + item.quantity
        };
      } else {
        // Create new product
        newProducts.push(createProduct({
          sku: generateSku(item.name, 'SCAN'),
          name: item.name,
          category: 'Scan',
          stock: item.quantity,
          price: item.price
        }));
      }
    });

    // Add new products to updated list
    updatedProducts.push(...newProducts);
    console.log('Debug - Updated products:', updatedProducts);

    try {
      saveProducts(updatedProducts);
      console.log('Debug - Products saved successfully');

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
  },

  handleCancel() {
    my.navigateBack();
  }
});
