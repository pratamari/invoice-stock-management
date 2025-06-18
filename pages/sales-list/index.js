const { t } = require('../../utils/i18n');

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
    console.log('tap');
  },

  generateDummyData() {
    this.setData({ loading: true });
    
    const dummyData = Array.from({ length: 10 }, (_, i) => {
      const price = Math.floor(Math.random() * 1000000);
      return {
        receiptNo: `${i + 1}/INV/2024`,
        totalPrice: formatCurrency(price)
      };
    });

    const totalSales = dummyData.reduce((sum, item) => 
      sum + parseInt(item.totalPrice.replace(/[.,]/g, '')), 0);

    this.setData({
      salesList: dummyData,
      totalSales: formatCurrency(totalSales),
      loading: false
    });
  },

  loadMoreSales() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({ loading: true });
    
    setTimeout(() => {
      const currentTotal = this.data.salesList.length;
      const newData = Array.from({ length: this.data.pageSize }, (_, i) => {
        const price = Math.floor(Math.random() * 1000000);
        return {
          receiptNo: `${currentTotal + i + 1}/INV/2024`,
          totalPrice: formatCurrency(price)
        };
      });
      
      this.setData({
        salesList: [...this.data.salesList, ...newData],
        loading: false,
        hasMore: (currentTotal + newData.length) < 100
      });
    }, 500);
  },

  onSalesItemTap(e) {
    const { receiptNo } = e.target.dataset;
    my.navigateTo({
      url: `/pages/sales-detail/index?id=${receiptNo.split('/')[0]}`
    });
  }
});