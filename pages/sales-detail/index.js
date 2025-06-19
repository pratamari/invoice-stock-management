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

  formatCurrencyIDR(num) {
    if (typeof num === 'string') num = Number(num.replace(/\D/g, ''));
    if (typeof num !== 'number' || isNaN(num)) return '';
    return num.toLocaleString('id-ID');
  },

  onPrintReceipt() {
    // Ambil data produk dari detail
    const selectedProducts = this.data.products.map(item => ({
      ...item,
      displayAmount: this.formatCurrencyIDR(item.qty * Number(String(item.price).replace(/\D/g, '')))
    }));
    const totalPriceLabel = this.formatCurrencyIDR(
      this.data.products.reduce((sum, p) => sum + (p.qty * Number(String(p.price).replace(/\D/g, ''))), 0)
    );
    // Label bisa diambil dari setLabels atau hardcode jika perlu
    this.setData({
      showModal: true,
      selectedProducts,
      subtotalLabel: t('subtotal'),
      totalLabel: t('total'),
      thankYouLabel: t('thank_you'),
      printLabel: t('print'),
      downloadLabel: t('download'),
      closeLabel: t('close'),
      totalPriceLabel,
      receiptNoLabel: t('receipt_no'),
      dateLabel: t('date'),
      // Buat nomor dan tanggal kwitansi dari detail
      receiptNo: this.data.orderNo,
      receiptDate: this.data.transactionDate
    });
  },

  onBackPress() {
    my.redirectTo({
      url: '/pages/sales-list/index'
    });
    return true;
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
    // Redirect ke home page setelah modal ditutup
    my.redirectTo({ url: '/pages/home/home' });
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
