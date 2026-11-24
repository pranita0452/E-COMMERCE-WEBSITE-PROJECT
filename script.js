/* ---------- Mobile navbar ---------- */
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

/* ---------- Cart (saved in localStorage) ---------- */
const CART_KEY = 'ecom_cart';

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function parsePrice(text) {
    return parseFloat(String(text).replace(/[^0-9.]/g, '')) || 0;
}

function money(n) {
    return '$' + (Math.round(n * 100) / 100).toFixed(n % 1 === 0 ? 0 : 2);
}

function showToast(msg) {
    let t = document.querySelector('.toast');
    if (!t) {
        t = document.createElement('div');
        t.className = 'toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
}

function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(p => p.name === item.name && p.size === item.size && p.img === item.img);
    if (existing) existing.qty += item.qty;
    else cart.push(item);
    saveCart(cart);
    showToast('Added to cart');
}

function updateCartCount() {
    const total = getCart().reduce((sum, p) => sum + p.qty, 0);
    document.querySelectorAll('#lg-bag a, #mobile > a').forEach(a => {
        let badge = a.querySelector('.cart-count');
        if (total > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-count';
                a.appendChild(badge);
            }
            badge.textContent = total;
        } else if (badge) {
            badge.remove();
        }
    });
}

/* cart icons on product cards (home, shop, sproduct "featured") */
document.querySelectorAll('.pro .cart').forEach(icon => {
    icon.closest('a').addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation(); // card itself links to sproduct.html
        const card = icon.closest('.pro');
        addToCart({
            img: card.querySelector('img').getAttribute('src'),
            name: card.querySelector('h5').textContent.trim(),
            price: parsePrice(card.querySelector('h4').textContent),
            size: '',
            qty: 1
        });
    });
});

/* "Add To Cart" button on the single product page */
const proDetails = document.getElementById('prodetails');
if (proDetails) {
    const addBtn = proDetails.querySelector('.single-pro-details button');
    addBtn.addEventListener('click', () => {
        const d = proDetails.querySelector('.single-pro-details');
        const sizeSel = d.querySelector('select');
        const qty = Math.max(1, parseInt(d.querySelector('input').value, 10) || 1);
        if (sizeSel.selectedIndex === 0) {
            showToast('Please select a size');
            return;
        }
        addToCart({
            img: document.getElementById('MainImg').getAttribute('src'),
            name: d.querySelector('h4').textContent.trim(),
            price: parsePrice(d.querySelector('h2').textContent),
            size: sizeSel.value,
            qty: qty
        });
    });
}

/* ---------- Cart page ---------- */
const cartBody = document.getElementById('cart-body');
let discountRate = 0;

function renderCart() {
    const cart = getCart();
    cartBody.innerHTML = '';
    document.getElementById('cart-empty').style.display = cart.length ? 'none' : 'block';

    let subtotal = 0;
    cart.forEach((p, i) => {
        subtotal += p.price * p.qty;
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td><i class="far fa-times-circle" data-remove="' + i + '"></i></td>' +
            '<td><img src="' + p.img + '" alt=""></td>' +
            '<td>' + p.name + (p.size ? '<small>Size: ' + p.size + '</small>' : '') + '</td>' +
            '<td>' + money(p.price) + '</td>' +
            '<td><input type="number" min="1" value="' + p.qty + '" data-qty="' + i + '"></td>' +
            '<td>' + money(p.price * p.qty) + '</td>';
        cartBody.appendChild(tr);
    });

    const discount = subtotal * discountRate;
    document.getElementById('t-sub').textContent = money(subtotal);
    document.getElementById('t-disc').textContent = '-' + money(discount);
    document.getElementById('t-total').textContent = money(subtotal - discount);
}

if (cartBody) {
    renderCart();

    cartBody.addEventListener('click', e => {
        const idx = e.target.getAttribute('data-remove');
        if (idx !== null) {
            const cart = getCart();
            cart.splice(Number(idx), 1);
            saveCart(cart);
            renderCart();
        }
    });

    cartBody.addEventListener('change', e => {
        const idx = e.target.getAttribute('data-qty');
        if (idx !== null) {
            const cart = getCart();
            cart[Number(idx)].qty = Math.max(1, parseInt(e.target.value, 10) || 1);
            saveCart(cart);
            renderCart();
        }
    });

    const coupons = { SAVE10: 0.10, WELCOME20: 0.20 };
    document.getElementById('coupon-btn').addEventListener('click', () => {
        const code = document.getElementById('coupon-input').value.trim().toUpperCase();
        const msg = document.getElementById('coupon-msg');
        if (coupons[code]) {
            discountRate = coupons[code];
            msg.style.color = '#088178';
            msg.textContent = 'Coupon applied: ' + (discountRate * 100) + '% off';
        } else {
            discountRate = 0;
            msg.style.color = '#c0392b';
            msg.textContent = 'Invalid coupon code';
        }
        renderCart();
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (!getCart().length) { showToast('Your cart is empty'); return; }
        alert('Demo project: checkout is not connected to a payment gateway.');
    });
}

/* ---------- Contact form (demo) ---------- */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('form-msg').textContent = 'Thanks! Your message has been received.';
        contactForm.reset();
    });
}

/* ---------- Newsletter (demo) ---------- */
document.querySelectorAll('#newsletter .form button').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        if (input.value.includes('@')) {
            showToast('Subscribed!');
            input.value = '';
        } else {
            showToast('Enter a valid email');
        }
    });
});

updateCartCount();
