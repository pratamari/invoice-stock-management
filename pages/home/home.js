const { STORAGE_KEYS, load } = require('../../utils/storage');

Page({
  data: {
    isLoading: true,
    totalSales: 0,
    totalProducts: 0,
    showFallback: false,
    fallbackText: '',
  },
  onLoad() {
    this.t = getApp().t;
    // Pisahkan label tombol menjadi dua baris
    let mp = this.t('manage_products');
    let ms = this.t('manage_sales');
    let manageProductsLabelLine1 = mp;
    let manageProductsLabelLine2 = '';
    let manageSalesLabelLine1 = ms;
    let manageSalesLabelLine2 = '';
    if (mp.includes(' ')) {
      const idx = mp.indexOf(' ');
      manageProductsLabelLine1 = mp.substring(0, idx);
      manageProductsLabelLine2 = mp.substring(idx + 1);
    }
    if (ms.includes(' ')) {
      const idx = ms.indexOf(' ');
      manageSalesLabelLine1 = ms.substring(0, idx);
      manageSalesLabelLine2 = ms.substring(idx + 1);
    }
    this.setData({
      helloLabel: this.t('hello'),
      totalSalesLabel: this.t('total_sales'),
      totalProductsLabel: this.t('total_products'),
      manageProductsLabelLine1,
      manageProductsLabelLine2,
      manageSalesLabelLine1,
      manageSalesLabelLine2
    });
    this.loadDashboard();
  },
  loadDashboard() {
    this.setData({ isLoading: true });
    // Load sales
    const invoices = load(STORAGE_KEYS.INVOICES, []);
    let totalSales = 0;
    invoices.forEach(inv => { totalSales += Number(inv.totalPrice || 0); });
    // Load products
    const products = load(STORAGE_KEYS.PRODUCTS, []);
    let totalProducts = 0;
    products.forEach(p => { totalProducts += Number(p.stock || 0); });
    // Fallback
    let showFallback = false;
    let fallbackText = '';
    if (invoices.length === 0 && products.length === 0) {
      showFallback = true;
      fallbackText = this.t('no_data');
    } else if (invoices.length === 0) {
      showFallback = true;
      fallbackText = this.t('no_sales');
    } else if (products.length === 0) {
      showFallback = true;
      fallbackText = this.t('no_products');
    }
    this.setData({
      totalSales: totalSales === 0 ? 'Rp 0' : 'Rp ' + totalSales.toLocaleString('id-ID'),
      totalProducts,
      isLoading: false,
      showFallback,
      fallbackText
    });
  },
  goToProducts() {
    my.navigateTo({ url: '/pages/products/products' });
  },
  goToSales() {
    my.navigateTo({ url: '/pages/sales/sales' });
  },
});
