class PricingService {

    calculateSubtotal(items) {
        return items.reduce((subtotal, item) => {
            const quantity = item.quantity ?? 1;
            if(item.quantity > 0) {
                return subtotal + (item.price * item.quantity);
            }
            return subtotal;
        }, 0)
    }
}


export default PricingService;