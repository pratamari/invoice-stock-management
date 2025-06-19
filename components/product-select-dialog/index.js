Component({
  data: {
    selectedProductId: '',
    selectedProduct: null
  },

  props: {
    show: false,
    products: [],
    onClose: () => {},
    onConfirm: () => {}
  },

  methods: {
    onProductChange(e) {
      const index = e.detail.value;
      const selectedProduct = this.props.products[index];
      this.setData({
        selectedProductId: index,
        selectedProduct: selectedProduct
      });
    },

    handleClose() {
      this.setData({
        selectedProductId: '',
        selectedProduct: null
      });
      this.props.onClose();
    },

    handleConfirm() {
      if (this.data.selectedProduct) {
        const eventDetail = { ...this.data.selectedProduct };
        const event = { detail: eventDetail };
        this.props.onConfirm(event);
      }
      this.handleClose();
    }
  }
});
