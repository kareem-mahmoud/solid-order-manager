class OrderService {
    constructor (
        cartService, 
        pricingService, 
        discountService,
        notificationService
    ) {
        this.cartService = cartService;
        this.pricingService = pricingService;
        this.discountService = discountService;
        this.notificationService = notificationService;
    }

    calculateTotal(discountStrategy) {
        const items = this.cartService.getItems();
        const subtotal = this.pricingService.calculateSubtotal(items);
        const finalTotal = this.discountService.calculate(subtotal, discountStrategy);
        return finalTotal;
    }

    placeOrder(discountStrategy) {
        const finalTotal = this.calculateTotal(discountStrategy);
        this.notificationService.send("Order placed successfully!");
        return finalTotal;
    }
}

export default OrderService;