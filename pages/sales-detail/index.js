const { t } = require('../../utils/i18n');
const { getSales } = require('../../utils/sales_model');

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
    try {
      const salesData = getSales();
      const sale = salesData.find(s => s.orderId === parseInt(id));
      
      if (sale) {
        const date = new Date(sale.transactionDate);
        this.setData({
          orderNo: sale.orderId,
          transactionDate: `${date.toLocaleDateString('id-ID')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
          products: sale.products.map(p => ({
            name: p.name,
            qty: p.qty,
            price: formatCurrency(p.price),
            subtotal: formatCurrency(p.price * p.qty)
          })),
          totalPrice: formatCurrency(sale.totalPayment)
        });
      }
    } catch (e) {
      console.error('Error loading sale details:', e);
    }
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
