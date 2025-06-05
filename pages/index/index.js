const { t } = require('../../utils/i18n');

Page({
  data: {
    productListLabel: '',
    salesLabel: '',
    productDesc: '',
    salesDesc: ''
  },
  onLoad(query) {
    // Page load
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  onReady() {
    // Page loading is complete
  },
  onShow() {
    this.setData({
      productListLabel: t('product_list'),
      salesLabel: t('sales_menu'),
      productDesc: t('homepage_product_desc'),
      salesDesc: t('homepage_sales_desc')
    });
  },
  goToProducts() {
    my.navigateTo({ url: '/pages/products/products' });
  },
  goToSales() {
    my.navigateTo({ url: '/pages/sales/sales' });
  },
  onHide() {
    // Page hidden
  },
  onUnload() {
    // Page is closed
  },
  onTitleClick() {
    // Title clicked
  },
  onPullDownRefresh() {
    // Page is pulled down
  },
  onReachBottom() {
    // Page is pulled to the bottom
  },
  onShareAppMessage() {
    // Back to custom sharing information
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
});
