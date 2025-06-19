const { t } = require('../../utils/i18n');
const { getSales } = require('../../utils/storage');

const formatCurrency = (amount) => {
  return amount.toLocaleString('id-ID');
};

Page({
  data: {
    salesList: [],
    totalSales: '0',
    loading: false,
    pageSize: 10,
    currentPage: 1,
    hasMore: true
  },

  onLoad() {
    this.setLabels();
    this.loadInitialData();
  },

  onShow() {
    this.setLabels();
    this.loadInitialData(); // Add this line to reload data
  },

  setLabels() {
    this.setData({
      salesListTitle: t('sales_list_title'),
      totalLabel: t('sales_list_total'),
      orderPrefix: t('sales_list_order_prefix'),
      addButtonLabel: t('sales_list_add'),
      loadingText: t('sales_list_loading')
    });
  },

  loadInitialData() {
    this.generateDummyData();
  },

  onAddSales() {
    my.navigateTo({ url: '/pages/sales/sales' });
  },

  generateDummyData() {
    this.setData({ loading: true });
    const salesData = getSales();
    const today = new Date().toDateString();
    
    const todaysSales = salesData.reduce((sum, sale) => {
      const saleDate = new Date(sale.transactionDate).toDateString();
      return saleDate === today ? sum + sale.totalPayment : sum;
    }, 0);

    this.setData({
      salesList: salesData.map(sale => {
        const date = new Date(sale.transactionDate);
        return {
          receiptNo: `${sale.orderId}/INV/2024`,
          totalPrice: formatCurrency(sale.totalPayment),
          date: `${date.toLocaleDateString('id-ID')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
          totalItems: sale.totalProduct
        };
      }),
      totalSales: formatCurrency(todaysSales),
      loading: false,
      hasMore: false
    });
  },

  onSalesItemTap(e) {
    const { receiptNo } = e.target.dataset;
    my.navigateTo({
      url: `/pages/sales-detail/index?id=${receiptNo.split('/')[0]}`
    });
  },

  onAddSales() {
    my.navigateTo({
      url: '/pages/sales-add/index'
    });
  }
});