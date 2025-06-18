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
    // For now using dummy data
    // In real app, fetch order data using orderId
    this.setData({
      orderNo: id.slice(-4), // Use last 4 digits of order ID
      products: [
        { name: 'Product 1', qty: 2, price: 50000, subtotal: 100000 },
        { name: 'Product 2', qty: 1, price: 75000, subtotal: 75000 }
      ],
      totalPrice: formatCurrency(175000)
    });
  },

  onPrintReceipt() {
    my.showToast({
      content: t('print_coming_soon')
    });
  },

  onBackPress() {
    my.redirectTo({
      url: '/pages/sales-list/index'
    });
    return true;
  }
});
