let cart = [];
let currentProduct = {};
let cardsVisible = false;
let hideTimeout;

// TODO: замени на URL своего серверless-эндпоинта Telegram
const TELEGRAM_ENDPOINT = 'https://your-serverless-endpoint.example/telegram';
const DELIVERY_PRICE = 400;

// Set logo from local file
function setLogoFromFile() {
    const eyeElement = document.getElementById('eyeElement');
    eyeElement.style.backgroundImage = "url('images/logo.jpg')";
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setLogoFromFile();
    restoreCartFromStorage();
    setupEyeClick();
    setupModalsListeners();
});

function setupModalsListeners() {
    // Cart icon click
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }

    // Close modals on outside click
    const brandModal = document.getElementById('brandModal');
    if (brandModal) {
        brandModal.addEventListener('click', function(e) {
            if (e.target === this) {
                toggleBrandModal();
            }
        });
    }

    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeProductModal();
            }
        });
    }

}

function restoreCartFromStorage() {
    const saved = localStorage.getItem('eschaton_cart');
    if (saved) {
        try {
            cart = JSON.parse(saved) || [];
        } catch (e) {
            cart = [];
        }
        updateCart();
    }
}

function setupEyeClick() {
    const eyeContainer = document.getElementById('eyeContainer');
    const cardsWrapper = document.getElementById('cardsWrapper');
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach((card) => {
    // клик по карточке — открыть модалку
    card.addEventListener('click', function() {
        const name = this.dataset.name;
        const price = Number(this.dataset.price);
        const fullName = this.dataset.full;
        const description = this.dataset.description;

        openProductModal(name, price, fullName, description);
    });

    // hover-эффект
    card.addEventListener('mouseover', function() {
        this.style.filter = 'brightness(1.05)';
        this.style.transform = `translate(var(--tx), var(--ty)) scale(1.05)`;
    });

    card.addEventListener('mouseout', function() {
        this.style.filter = 'brightness(1)';
        this.style.transform = `translate(var(--tx), var(--ty)) scale(1)`;
    });
});



    // КЛИК по контейнеру глаза - показать/скрыть карточки
    eyeContainer.addEventListener('click', function(e) {
    if (e.target.closest('.product-card')) return;

    cardsVisible = !cardsVisible;
    clearTimeout(hideTimeout);

    if (cardsVisible) {
        // Показать карточки
        cardsWrapper.style.opacity = '1';
        cardsWrapper.style.pointerEvents = 'auto';

        productCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translate(0, 0) scale(0.3)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                card.style.opacity = '1';
                card.style.transform = `translate(var(--tx), var(--ty)) scale(1)`;
            }, index * 30);
        });

        setTimeout(() => {
            productCards.forEach((card) => {
                card.style.transition = 'none';
            });
        }, 600);

        // запускаем авто-скрытие (если не навели мышь)
        scheduleHideCards();
    } else {
        hideCards();
    }
});
function hideCards() {
    cardsVisible = false;
    cardsWrapper.style.opacity = '0';
    cardsWrapper.style.pointerEvents = 'none';
    productCards.forEach((card) => {
        card.style.transition = 'all 0.3s ease-out';
        card.style.opacity = '0';
        card.style.transform = 'translate(0, 0) scale(0.3)';
    });
}

function scheduleHideCards() {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
        // если ни одна карточка не в ховере — скрываем
        const hovered = Array.from(productCards).some(card =>
            card.matches(':hover')
        );
        if (!hovered) {
            hideCards();
        }
    }, 4000); // 4 секунды
}


    // Hover эффект на карточках
    productCards.forEach((card) => {
    card.addEventListener('mouseover', function() {
        this.style.filter = 'brightness(1.05)';
        clearTimeout(hideTimeout); // пока мышь над карточками — не скрываем
    });

    card.addEventListener('mouseout', function() {
        this.style.filter = 'brightness(1)';
        if (cardsVisible) {
            scheduleHideCards(); // ушли с карточек — заново запускаем таймер
        }
    });
});

}

function toggleBrandModal() {
    const brandModal = document.getElementById('brandModal');
    brandModal.classList.toggle('open');
}

function openProductModal(name, price, fullName, description, element) {
    currentProduct = {
        name: name,
        price: price,
        fullName: fullName,
        description: description,
        size: 'm'
    };

    document.getElementById('productName').textContent = fullName;
    document.getElementById('productDescription').textContent = description;
    document.getElementById('productPrice').textContent = '₽' + price.toLocaleString('ru-RU');
    document.getElementById('productImage').textContent = 'ESCHATON ' + name;
    document.getElementById('productSize').value = 'm';

    const productModal = document.getElementById('productModal');
    productModal.classList.add('open');
}

function closeProductModal() {
    const productModal = document.getElementById('productModal');
    productModal.classList.remove('open');
}

function addToCartFromModal() {
    if (currentProduct.name) {
        const size = document.getElementById('productSize').value;
        const cartItem = {
            name: currentProduct.name + ' (' + size.toUpperCase() + ')',
            price: currentProduct.price,
            id: Date.now()
        };
        cart.push(cartItem);
        updateCart();
        closeProductModal();

        // Animation feedback
        const cartIcon = document.getElementById('cartIcon');
        cartIcon.style.transform = 'scale(1.1)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    cartCount.textContent = cart.length;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #888; padding: 20px 0;">Корзина пуста</p>';
        cartTotal.textContent = '₽0';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div>
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="color: #999;">₽${item.price.toLocaleString('ru-RU')}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.textContent = '₽' + total.toLocaleString('ru-RU');
    }

    // Persist cart to localStorage
    localStorage.setItem('eschaton_cart', JSON.stringify(cart));
}

function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.toggle('open');
}

// CHECKOUT MODAL
function toggleCheckoutModal() {
    const checkoutModal = document.getElementById('checkoutModal');

    if (!checkoutModal.classList.contains('open') && cart.length === 0) {
        showErrorModal('Ваша корзина пуста');
        return;
    }

    checkoutModal.classList.toggle('open');
}

function showErrorModal(message) {
    const modal = document.getElementById('errorModal');
    const text = modal.querySelector('.error-modal-text');
    text.textContent = message;
    modal.classList.add('open');
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.remove('open');
}


// CHECKOUT SUBMIT — отправка в Telegram через серверless эндпоинт
async function submitCheckout(event) {
    event.preventDefault();

    if (!cart.length) {
        showErrorModal('Ваша корзина пуста');
        return;
    }

    const form = document.getElementById('checkoutForm');
    const status = document.getElementById('checkoutStatus');
    const data = new FormData(form);

    const fullName = data.get('fullName')?.trim();
    const email    = data.get('email')?.trim();
    const phone    = data.get('phone')?.trim();
    const city     = data.get('city')?.trim();
    const zip      = data.get('zip')?.trim();
    const address  = data.get('address')?.trim();

    if (!fullName) {
        showErrorModal('Введите ФИО для доставки');
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showErrorModal('Укажите корректный e‑mail');
        return;
    }

    const cleanedPhone = phone.replace(/[\s-]/g, '');
    const phonePattern = /^\+7\d{10,}$/;
    if (!phonePattern.test(cleanedPhone)) {
        showErrorModal('Телефон должен начинаться с +7 и содержать 11 цифр (можно с пробелами и дефисами)');
        return;
    }

    const total      = cart.reduce((sum, item) => sum + item.price, 0);
    const delivery   = DELIVERY_PRICE;
    const grandTotal = total + delivery;

    const payload = {
        fullName,
        email,
        phone: cleanedPhone,
        city,
        zip,
        address,
        items: cart,
        total,
        delivery,
        grandTotal,
        timestamp: new Date().toISOString()
    };

    // положим JSON в скрытое поле, чтобы StaticForms прислал его в письме
    const cartField = document.getElementById('cartJsonField');
    cartField.value = JSON.stringify(payload);

    status.textContent = 'Отправляем заказ...';
    status.style.color = '#666';

    // теперь просто отправляем форму на StaticForms
    form.submit();
}
