import CartService from './services/CartService.js';
import DiscountService from './services/DiscountService.js';
import ConsoleNotification from './notifications/ConsoleNotification.js';
import OrderService from './services/OrderServices.js';
import PricingService from './services/PricingService.js';
import VIPDiscount from './discounts/VIPDiscount.js';
import EmployeeDiscount from './discounts/EmployeeDiscount.js';
import NoDiscount from './discounts/NoDiscount.js';

const products = [
    { id: 1, name: 'Amber bottle', category: 'Home objects', price: 32, icon: '◒', art: '' },
    { id: 2, name: 'Stoneware cup', category: 'Kitchen', price: 18, icon: '◓', art: 'ceramic' },
    { id: 3, name: 'Daily planner', category: 'Stationery', price: 24, icon: '▤', art: 'paper' },
    { id: 4, name: 'Desk block', category: 'Workspace', price: 28, icon: '◇', art: 'cube' }
];

const cartService = new CartService();
const pricingService = new PricingService();
const discountService = new DiscountService();
const notificationService = new ConsoleNotification();
const orderService = new OrderService(cartService, pricingService, discountService, notificationService);

const strategies = { vip: new VIPDiscount(), employee: new EmployeeDiscount(), none: new NoDiscount() };
const discountRates = { vip: 0.2, employee: 0.15, none: 0 };
let selectedDiscount = 'vip';
let toastTimer;

const productGrid = document.querySelector('#productGrid');
const cartItems = document.querySelector('#cartItems');
const subtotalEl = document.querySelector('#subtotal');
const discountAmountEl = document.querySelector('#discountAmount');
const finalTotalEl = document.querySelector('#finalTotal');
const placeOrderButton = document.querySelector('#placeOrder');

const money = amount => `$${amount.toFixed(2)}`;

function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <article class="product">
            <button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart"><span aria-hidden="true">+</span></button>
            <div class="product-art"><div class="art-shape ${product.art}">${product.icon}</div></div>
            <div class="product-info"><div><p class="product-name">${product.name}</p><p class="product-meta">${product.category}</p></div><span class="product-price">${money(product.price)}</span></div>
        </article>
    `).join('');
}

function addProduct(productId) {
    const item = cartService.getItems().find(cartItem => cartItem.id === productId);
    if (item) item.quantity += 1;
    else {
        const product = products.find(candidate => candidate.id === productId);
        cartService.addItem({ ...product, quantity: 1 });
    }
    renderCart();
}

function updateQuantity(productId, change) {
    const item = cartService.getItems().find(cartItem => cartItem.id === productId);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) cartService.removeItem(productId);
    renderCart();
}

function renderCart() {
    const items = cartService.getItems();
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    document.querySelector('#headerCartCount').textContent = itemCount;
    document.querySelector('#cartTitleCount').textContent = `(${itemCount})`;
    document.querySelector('#productTotal').textContent = `${String(products.length).padStart(2, '0')} items`;
    document.querySelector('#clearCart').disabled = items.length === 0;

    cartItems.innerHTML = items.length ? items.map(item => `
        <div class="cart-row">
            <div class="mini-art">${item.icon}</div>
            <div><p class="cart-row-name">${item.name}</p><span class="cart-row-price">${money(item.price)} each</span><div class="quantity"><button type="button" data-decrease="${item.id}" aria-label="Decrease ${item.name}">−</button><span>${item.quantity}</span><button type="button" data-increase="${item.id}" aria-label="Increase ${item.name}">+</button></div></div>
            <div class="row-end"><span class="row-total">${money(item.price * item.quantity)}</span><button class="remove" type="button" data-remove="${item.id}">Remove</button></div>
        </div>
    `).join('') : '<div class="empty-cart"><div class="empty-icon">＋</div><h3>Your cart is empty</h3><p>Pick something from the catalog<br />to get started.</p></div>';

    const subtotal = pricingService.calculateSubtotal(items);
    const finalTotal = orderService.calculateTotal(strategies[selectedDiscount]);
    const discount = subtotal - finalTotal;
    subtotalEl.textContent = money(subtotal);
    discountAmountEl.textContent = `− ${money(discount)}`;
    finalTotalEl.textContent = money(finalTotal);
    placeOrderButton.disabled = items.length === 0;
}

function showToast(message) {
    document.querySelector('#toastMessage').textContent = message;
    document.querySelector('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => document.querySelector('#toast').classList.remove('show'), 3200);
}

productGrid.addEventListener('click', event => {
    const button = event.target.closest('[data-add]');
    if (!button) return;
    event.preventDefault();
    addProduct(Number(button.dataset.add));
    button.classList.add('added');
    setTimeout(() => button.classList.remove('added'), 450);
});

cartItems.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const id = Number(button.dataset.increase || button.dataset.decrease || button.dataset.remove);
    if (button.dataset.increase) updateQuantity(id, 1);
    if (button.dataset.decrease) updateQuantity(id, -1);
    if (button.dataset.remove) { cartService.removeItem(id); renderCart(); }
});

document.querySelector('#clearCart').addEventListener('click', () => { cartService.getItems().splice(0); renderCart(); });
document.querySelector('#cartJump').addEventListener('click', () => document.querySelector('#orderCard').scrollIntoView({ behavior: 'smooth', block: 'start' }));

document.querySelectorAll('.discount-option').forEach(button => button.addEventListener('click', () => {
    selectedDiscount = button.dataset.discount;
    document.querySelectorAll('.discount-option').forEach(option => option.classList.toggle('active', option === button));
    document.querySelector('#discountBadge').textContent = `${discountRates[selectedDiscount] * 100}% OFF`;
    renderCart();
}));

placeOrderButton.addEventListener('click', () => {
    const finalTotal = orderService.placeOrder(strategies[selectedDiscount]);
    showToast(`Order placed successfully! Total ${money(finalTotal)}`);
});

renderProducts();
renderCart();
