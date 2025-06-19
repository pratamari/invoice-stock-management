const { t } = require('../../utils/i18n');
const { getSales, saveSales, getLastOrderId, saveLastOrderId } = require('../../utils/sales_model');
const { loadProducts } = require('../../utils/product_model');

const formatCurrency = (amount) => {
  return amount.toLocaleString('id-ID');
};

Page({
  data: {
    products: [],
    selectedProducts: [],
    availableProducts: [],
    showProductDialog: false
  },

  onLoad() {
    this.setLabels();
    this.loadAvailableProducts();
  },

  setLabels() {
    this.setData({
      pageTitle: t('sales_add_title'),
      addProductLabel: t('sales_add_product'),
      saveLabel: t('sales_add_save')
    });
  },

  loadAvailableProducts() {
    const products = loadProducts();
    this.setData({
      availableProducts: products.map(p => ({
        sku: p.sku,
        name: p.name,
        price: p.price,
        formattedPrice: formatCurrency(p.price),
        qty: 0
      }))
    });
  },

  onQtyChange(e) {
    const { sku } = e.target.dataset;
    const qty = parseInt(e.detail.value) || 0;
    
    this.updateProductQty(sku, qty);
  },

  onIncreaseQty(e) {
    const { sku } = e.target.dataset;
    const product = this.data.availableProducts.find(p => p.sku === sku);
    if (product) {
      this.updateProductQty(sku, (product.qty || 0) + 1);
    }
  },

  onDecreaseQty(e) {
    const { sku } = e.target.dataset;
    const product = this.data.availableProducts.find(p => p.sku === sku);
    if (product && product.qty > 0) {
      this.updateProductQty(sku, product.qty - 1);
    }
  },

  updateProductQty(sku, qty) {
    const availableProducts = this.data.availableProducts.map(p => {
      if (p.sku === sku) {
        return { ...p, qty: Math.max(0, qty) };
      }
      return p;
    });
    
    this.setData({ availableProducts });
  },

  onAddProduct() {
    this.setData({ showProductDialog: true });
  },

  onDialogClose() {
    this.setData({ showProductDialog: false });
  },

  onProductSelected(e) {
    const selectedProduct = e.detail;
    if (!selectedProduct) return;
    
    const existingProductIndex = this.data.products.findIndex(p => p.sku === selectedProduct.sku);
    
    if (existingProductIndex >= 0) {
      // Update existing product quantity
      const products = this.data.products.map((product, index) => {
        if (index === existingProductIndex) {
          return {
            ...product,
            qty: product.qty + 1
          };
        }
        return product;
      });
      
      this.setData({ products });
    } else {
      // Add new product with qty 1
      const newProduct = {
        sku: selectedProduct.sku,
        name: selectedProduct.name,
        price: selectedProduct.price,
        qty: 1,
        formattedPrice: formatCurrency(selectedProduct.price)
      };
      
      this.setData({
        products: [...this.data.products, newProduct]
      });
    }
    
    this.setData({ showProductDialog: false });
  },

  onRemoveProduct(e) {
    const { id } = e.target.dataset;
    const products = this.data.products.filter(p => p.id !== id);
    this.setData({ products });
  },

  onPay() {
    const selectedProducts = this.data.availableProducts.filter(p => (p.qty || 0) > 0);
    if (!selectedProducts.length) {
      my.showToast({
        content: t('select_product_first')
      });
      return;
    }

    const lastOrderId = getLastOrderId();
    const newOrderId = lastOrderId + 1;
    
    const salesData = {
      orderId: newOrderId,
      transactionDate: new Date().toISOString(),
      totalPayment: selectedProducts.reduce((sum, p) => sum + (p.price * p.qty), 0),
      totalProduct: selectedProducts.reduce((sum, p) => sum + p.qty, 0),
      products: selectedProducts
    };

    const existingSales = getSales();
    saveSales([salesData, ...existingSales]);
    saveLastOrderId(newOrderId);

    my.redirectTo({
      url: `/pages/sales-detail/index?id=${newOrderId}`
    });
  }
});
