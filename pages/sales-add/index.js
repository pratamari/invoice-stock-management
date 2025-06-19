const { t } = require('../../utils/i18n');
const { getSales, saveSales, getLastOrderId, saveLastOrderId } = require('../../utils/storage');

const formatCurrency = (amount) => {
  return amount.toLocaleString('id-ID');
};

Page({
  data: {
    products: [],
    showProductDialog: false,
    availableProducts: [
      { id: 1, name: 'Product 1', price: 50000 },
      { id: 2, name: 'Product 2', price: 75000 },
      { id: 3, name: 'Product 3', price: 60000 }
    ]
  },

  onLoad() {
    this.setLabels();
  },

  setLabels() {
    this.setData({
      pageTitle: t('sales_add_title'),
      addProductLabel: t('sales_add_product'),
      payLabel: t('sales_add_pay'),
      qtyPlaceholder: t('sales_add_qty_placeholder')
    });
  },

  onQtyChange(e) {
    const { id } = e.target.dataset;
    const qty = parseInt(e.detail.value) || 0;
    
    const products = this.data.products.map(product => {
      if (product.id === id) {
        return { ...product, qty };
      }
      return product;
    });

    this.setData({ products });
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
    
    const existingProductIndex = this.data.products.findIndex(p => p.id === selectedProduct.id);
    
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
        id: selectedProduct.id,
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
    if (!this.data.products.length) {
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
      totalPayment: this.data.products.reduce((sum, p) => sum + (p.price * p.qty), 0),
      totalProduct: this.data.products.reduce((sum, p) => sum + p.qty, 0),
      products: this.data.products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        qty: p.qty
      }))
    };

    const existingSales = getSales();
    saveSales([salesData, ...existingSales]);
    saveLastOrderId(newOrderId);

    my.redirectTo({
      url: `/pages/sales-detail/index?id=${newOrderId}`
    });
  }
});
