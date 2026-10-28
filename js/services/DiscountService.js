class DiscountService {
    calculate(subtotal, discountStrategy) {
        return discountStrategy.calculate(subtotal);
    }
}

export default DiscountService;