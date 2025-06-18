const { t } = require('../../utils/i18n');

const formatCurrency = (amount) => {
  return amount.toLocaleString('id-ID');
};

Page({
  data: {
    orderNo: '',
    products: [],
    totalPrice: 0
  },

  onLoad(query) {
    const { id } = query;
    this.setLabels();
    this.loadSalesDetail(id);
  },

  onShow() {
    this.setLabels();
  },

  setLabels() {
    this.setData({
      orderPrefix: t('sales_detail_order'),
      totalLabel: t('sales_detail_total'),
      printLabel: t('sales_detail_print')
    });
  },

  loadSalesDetail(id) {
    // Dummy data for demonstration
    const products = [
      { name: 'Product 1', qty: 2, price: 50000, subtotal: 100000 },
      { name: 'Product 2', qty: 1, price: 75000, subtotal: 75000 }
    ];

    this.setData({
      orderNo: id,
      products: products.map(item => ({
        ...item,
        price: formatCurrency(item.price),
        subtotal: formatCurrency(item.subtotal)
      })),
      totalPrice: formatCurrency(products.reduce((sum, item) => sum + item.subtotal, 0))
    });
  },

  onPrintReceipt() {
    my.showToast({
      content: t('print_coming_soon')
    });
  }
});
