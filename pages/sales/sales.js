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
    dateLabel: '',
    subtotalLabel: '',
    totalLabel: '',
    thankYouLabel: '',
    printLabel: '',
    downloadLabel: '',
    closeLabel: '',
    showModal: false,
    selectedProducts: [],
    receiptNo: '',
    receiptDate: '',
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
      dateLabel: t('date'),
      subtotalLabel: t('subtotal'),
      totalLabel: t('total'),
      thankYouLabel: t('thank_you'),
      printLabel: t('print'),
      downloadLabel: t('download'),
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
  formatCurrencyIDR(num) {
    if (typeof num !== 'number') num = Number(num);
    return num.toLocaleString('id-ID');
  },

  onConfirm() {
    const selectedProducts = this.data.products.filter(p => p.qty > 0).map(item => ({
      ...item,
      displayAmount: this.formatCurrencyIDR(item.qty * item.price)
    }));
    if (selectedProducts.length === 0) {
      my.alert({ title: t('confirm'), content: t('select_product_first') });
      return;
    }
    const totalItems = selectedProducts.reduce((sum, p) => sum + p.qty, 0);
    const totalPrice = selectedProducts.reduce((sum, p) => sum + p.qty * p.price, 0);
    const totalPriceLabel = this.formatCurrencyIDR(totalPrice);
    const receiptNo = generateReceiptNo();
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const receiptDate = `${day}-${month}-${year} ${hour}:${minute}:${second}`;
    this.setData({
      showModal: true,
      selectedProducts,
      totalItems,
      totalPrice,
      totalPriceLabel,
      receiptNo,
      receiptDate
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
    // Pastikan label total reset juga
    this.setData({ totalPriceLabel: this.formatCurrencyIDR(0) });
  },
  // Print ke printer BLE
  async onPrint() {
    const t = this.data.t || getApp().t;
    try {
      await my.openBluetoothAdapter();
      my.getBluetoothDevices({
        success: (res) => {
          if (!res.devices || res.devices.length === 0) {
            my.showToast({ type: 'fail', content: t('printer_not_found') });
            return;
          }
          // Pilih printer pertama (atau bisa tampilkan pilihan)
          const deviceId = res.devices[0].deviceId;
          my.createBLEConnection({
            deviceId,
            success: () => {
              // Render receipt ke canvas, convert ke image, kirim ke printer
              my.createSelectorQuery().select('.receipt-content').node().exec(res2 => {
                const node = res2[0].node;
                my.canvasToTempFilePath({
                  canvasId: node.id,
                  success: (imgRes) => {
                    // Kirim image ke printer BLE (umumnya ESC/POS printer BLE menerima bitmap)
                    // Perlu konversi ke format yang printer dukung (implementasi tergantung printer)
                    // Di sini pseudo-code, implementasi detail tergantung SDK printer
                    my.writeBLECharacteristicValue({
                      deviceId,
                      serviceId: 'printer-service-id', // Ganti sesuai printer
                      characteristicId: 'printer-char-id', // Ganti sesuai printer
                      value: imgRes.tempFilePath, // Atau convert ke ArrayBuffer jika perlu
                      success: () => {
                        my.showToast({ type: 'success', content: t('print_success') });
                      },
                      fail: () => {
                        my.showToast({ type: 'fail', content: t('print_failed') });
                      }
                    });
                  },
                  fail: () => {
                    my.showToast({ type: 'fail', content: t('print_failed') });
                  }
                }, this);
              });
            },
            fail: () => {
              my.showToast({ type: 'fail', content: t('printer_connect_failed') });
            }
          });
        },
        fail: () => {
          my.showToast({ type: 'fail', content: t('printer_not_found') });
        }
      });
    } catch (e) {
      my.showToast({ type: 'fail', content: t('printer_not_found') });
    }
  },
  // Download receipt sebagai image
  onDownload() {
    const t = this.data.t || getApp().t;
    my.createSelectorQuery().select('.receipt-content').boundingClientRect().exec(rects => {
      if (!rects[0]) {
        my.showToast({ type: 'fail', content: t('download_failed') });
        return;
      }
      my.createSelectorQuery().select('.receipt-content').node().exec(res => {
        const node = res[0].node;
        my.canvasToTempFilePath({
          canvasId: node.id,
          success: (res) => {
            my.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                my.showToast({ type: 'success', content: t('download_success') });
              },
              fail: () => {
                my.showToast({ type: 'fail', content: t('download_failed') });
              }
            });
          },
          fail: () => {
            my.showToast({ type: 'fail', content: t('download_failed') });
          }
        }, this);
      });
    });
  },
});
