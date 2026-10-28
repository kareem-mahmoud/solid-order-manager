class CartService {

    constructor(items = []) {
        this.items = items;
    }

    addItem(product) {
        this.items.push(product);
    }

    removeItem(productId) {
        const index = this.items.findIndex(item => item.id === productId);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    }

    getItems() {
        return this.items;
    }

}

export default CartService;