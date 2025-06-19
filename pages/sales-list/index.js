const { t } = require('../../utils/i18n');
const { getSales } = require('../../utils/sales_model');

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
    try {
      const salesData = getSales() || [];
      const today = new Date().toDateString();
      
      const todaysSales = salesData.reduce((sum, sale) => {
        const saleDate = new Date(sale.transactionDate).toDateString();
        return saleDate === today ? sum + sale.totalPayment : sum;
      }, 0);

      // Get first page of data
      const firstPageData = salesData.slice(0, this.data.pageSize);
      
      this.setData({
        salesList: firstPageData.map(sale => ({
          receiptNo: `${sale.orderId}/INV/2024`,
          totalPrice: formatCurrency(sale.totalPayment),
          date: new Date(sale.transactionDate).toLocaleDateString('id-ID'),
          totalItems: sale.totalProduct
        })),
        totalSales: formatCurrency(todaysSales),
        loading: false,
        hasMore: salesData.length > this.data.pageSize
      });
    } catch (e) {
      console.error('Error loading sales:', e);
      this.setData({
        salesList: [],
        totalSales: '0',
        loading: false,
        hasMore: false
      });
    }
  },

  loadMoreSales() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const salesData = getSales() || [];
      const startIndex = this.data.currentPage * this.data.pageSize;
      const newData = salesData.slice(startIndex, startIndex + this.data.pageSize);
      
      if (newData.length > 0) {
        const formattedNewData = newData.map(sale => ({
          totalPrice: formatCurrency(sale.totalPayment),
          date: new Date(sale.transactionDate).toLocaleDateString('id-ID'),
          totalItems: sale.totalProduct
        }));

        this.setData({
          salesList: [...this.data.salesList, ...formattedNewData],
          currentPage: this.data.currentPage + 1,
          hasMore: salesData.length > (startIndex + this.data.pageSize),
          loading: false
        });
      } else {
        this.setData({
          hasMore: false,
          loading: false
        });
      }
    } catch (e) {
      console.error('Error loading more sales:', e);
      this.setData({ loading: false });
    }
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