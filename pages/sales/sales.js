// pages/sales/sales.js
const { t } = require('../../utils/i18n');
const { STORAGE_KEYS, load, save } = require('../../utils/storage');

function generateReceiptNo() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateStr = dd + mm + yyyy;
  let invoices = load(STORAGE_KEYS.INVOICES, []);
  const todayInvoices = invoices.filter(inv => inv.date === dateStr);
  const no = String(todayInvoices.length + 1).padStart(3, '0');
  return `${no}/${dateStr}`;
}

Page({
  data: {
    products: [],
    salesLabel: '',
    stockLabel: '',
    priceLabel: '',
    confirmLabel: '',
    receiptLabel: '',
    receiptNoLabel: '',
    totalLabel: '',
    totalItemsLabel: '',
    totalPriceLabel: '',
    printLabel: '',
    downloadPDFLabel: '',
    closeLabel: '',
    showModal: false,
    selectedProducts: [],
    receiptNo: '',
    totalItems: 0,
    totalPrice: 0
  },
  onShow() {
    this.initLabels();
    this.loadProducts();
  },
  initLabels() {
    this.setData({
      salesLabel: t('sales'),
      stockLabel: t('stock'),
      priceLabel: t('product_price'),
      confirmLabel: t('confirm'),
      receiptLabel: t('receipt'),
      receiptNoLabel: t('receipt_no'),
      totalLabel: t('total'),
      totalItemsLabel: t('total_items'),
      totalPriceLabel: t('total_price'),
      printLabel: t('print'),
      downloadPDFLabel: t('download_pdf'),
      closeLabel: t('close')
    });
  },
  loadProducts() {
    let products = load(STORAGE_KEYS.PRODUCTS, []);
    products = products.filter(p => p.stock > 0).map(p => ({ ...p, qty: 0 }));
    this.setData({ products });
  },
  incrementQty(e) {
    const sku = e.target.dataset.sku;
    const products = this.data.products.map(p => {
      if (p.sku === sku && p.qty < p.stock) p.qty += 1;
      return p;
    });
    this.setData({ products });
  },
  decrementQty(e) {
    const sku = e.target.dataset.sku;
    const products = this.data.products.map(p => {
      if (p.sku === sku && p.qty > 0) p.qty -= 1;
      return p;
    });
    this.setData({ products });
  },
  onConfirm() {
    const selectedProducts = this.data.products.filter(p => p.qty > 0);
    if (selectedProducts.length === 0) {
      my.alert({ title: t('confirm'), content: t('select_product_first') });
      return;
    }
    const totalItems = selectedProducts.reduce((sum, p) => sum + p.qty, 0);
    const totalPrice = selectedProducts.reduce((sum, p) => sum + p.qty * p.price, 0);
    const receiptNo = generateReceiptNo();
    this.setData({
      showModal: true,
      selectedProducts,
      totalItems,
      totalPrice,
      receiptNo
    });
    // Simpan ke invoice history
    let invoices = load(STORAGE_KEYS.INVOICES, []);
    invoices.push({
      receiptNo,
      date: receiptNo.split('/')[1],
      items: selectedProducts,
      totalItems,
      totalPrice
    });
    save(STORAGE_KEYS.INVOICES, invoices);
    // Kurangi stok produk
    let products = load(STORAGE_KEYS.PRODUCTS, []);
    selectedProducts.forEach(sel => {
      const idx = products.findIndex(p => p.sku === sel.sku);
      if (idx !== -1) products[idx].stock -= sel.qty;
    });
    save(STORAGE_KEYS.PRODUCTS, products);
  },
  onCloseModal() {
    this.setData({ showModal: false });
    this.loadProducts(); // reset list
  },
  onPrint() {
    my.alert({ title: t('print'), content: t('print_coming_soon') });
  },
  onDownloadPDF() {
    my.alert({ title: t('download_pdf'), content: t('pdf_coming_soon') });
  }
});
