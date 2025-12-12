// Корзина заказов
document.addEventListener('DOMContentLoaded', function() {
    // Элементы корзины
    const cartModal = document.querySelector('.cart-modal');
    const cartLink = document.querySelector('.cart-link');
    const closeCartButtons = document.querySelectorAll('.close-cart');
    const cartCountElement = document.querySelector('.cart-count');
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.querySelector('.total-price');
    const checkoutButton = document.querySelector('.checkout-btn');
    
    // Инициализация корзины из localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartDisplay();
    
    // Слушатели событий
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            openCart();
        });
    }
    
    if (closeCartButtons) {
        closeCartButtons.forEach(button => {
            button.addEventListener('click', closeCart);
        });
    }
    
    // Закрытие корзины при клике вне ее
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                closeCart();
            }
        });
    }
    
    // Оформление заказа
    if (checkoutButton) {
        checkoutButton.addEventListener('click', checkout);
    }
    
    // Добавление товаров в корзину (обработчик для кнопок "В корзину")
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const button = e.target;
            const product = {
                id: button.getAttribute('data-id'),
                name: button.getAttribute('data-name'),
                price: parseInt(button.getAttribute('data-price')),
                quantity: 1
            };
            
            addToCart(product);
            updateCartDisplay();
            
            // Показать уведомление
            showNotification(`Товар "${product.name}" добавлен в корзину!`);
        }
    });
    
    // Управление количеством товаров и удаление
    document.addEventListener('click', function(e) {
        // Проверяем, что клик был по кнопке удаления
        if (e.target.closest('.remove-item')) {
            const itemElement = e.target.closest('.cart-item');
            if (itemElement) {
                const itemId = itemElement.getAttribute('data-id');
                removeFromCart(itemId);
            }
        }
        
        // Проверяем, что клик был по кнопке уменьшения количества
        if (e.target.classList.contains('decrease-quantity') || 
            e.target.closest('.decrease-quantity')) {
            const itemElement = e.target.closest('.cart-item');
            if (itemElement) {
                const itemId = itemElement.getAttribute('data-id');
                updateQuantity(itemId, -1);
            }
        }
        
        // Проверяем, что клик был по кнопке увеличения количества
        if (e.target.classList.contains('increase-quantity') || 
            e.target.closest('.increase-quantity')) {
            const itemElement = e.target.closest('.cart-item');
            if (itemElement) {
                const itemId = itemElement.getAttribute('data-id');
                updateQuantity(itemId, 1);
            }
        }
    });
    
    // Функции корзины
    function addToCart(product) {
        // Проверяем, есть ли товар уже в корзине
        const existingItemIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex !== -1) {
            // Увеличиваем количество существующего товара
            cart[existingItemIndex].quantity += product.quantity || 1;
        } else {
            // Добавляем новый товар
            cart.push({
                ...product,
                quantity: product.quantity || 1
            });
        }
        
        // Сохраняем корзину в localStorage
        saveCartToStorage();
    }
    
    function updateQuantity(itemId, change) {
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            cart[itemIndex].quantity += change;
            
            // Если количество стало 0 или меньше, удаляем товар
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            
            saveCartToStorage();
            updateCartDisplay();
        }
    }
    
    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        saveCartToStorage();
        updateCartDisplay();
    }
    
    function saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    function updateCartDisplay() {
        // Обновляем количество товаров в корзине
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
        
        // Обновляем содержимое корзины в модальном окне
        renderCartItems();
        
        // Обновляем общую стоимость
        updateTotalPrice();
    }
    
    // Обновленная функция отображения товаров в корзине
function renderCartItems() {
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        return;
    }
    
    // Разделяем товары и доставку
    const regularItems = cart.filter(item => !item.isDelivery);
    const deliveryItems = cart.filter(item => item.isDelivery);
    
    let html = '';
    
    // Обычные товары
    regularItems.forEach(item => {
        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    ${item.area ? `<p>Площадь: ${item.area} м²</p>` : ''}
                    ${item.options && item.options.length > 0 ? 
                        `<p>Опции: ${item.options.join(', ')}</p>` : ''}
                </div>
                <div class="cart-item-price">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-quantity">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase-quantity">+</button>
                    </div>
                    <button class="remove-item" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    // Доставка (нельзя менять количество)
    deliveryItems.forEach(item => {
        html += `
            <div class="cart-item delivery-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <h4><i class="fas fa-truck"></i> ${item.name}</h4>
                    <p style="color: #7f8c8d; font-size: 14px;">Доставка материалов на объект</p>
                </div>
                <div class="cart-item-price">
                    ${formatCurrency(item.price)}
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
}
    function updateTotalPrice() {
        if (!totalPriceElement) return;
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPriceElement.textContent = formatCurrency(total);
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    function openCart() {
        if (!cartModal) return;
        
        cartModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
    }
    
    function closeCart() {
        if (!cartModal) return;
        
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Восстанавливаем скролл страницы
    }
    
    function checkout() {
        if (cart.length === 0) {
            alert('Корзина пуста. Добавьте товары перед оформлением заказа.');
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // В реальном проекте здесь будет перенаправление на страницу оформления заказа
        // или открытие формы оформления
        alert(`Заказ оформлен! Общая сумма: ${formatCurrency(total)}\n\nНаш менеджер свяжется с вами для уточнения деталей.`);
        
        // Очищаем корзину после оформления заказа
        cart = [];
        saveCartToStorage();
        updateCartDisplay();
        closeCart();
    }
    
    function showNotification(message) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #2ecc71;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Добавляем стили для анимации уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Экспортируем функции для использования в других файлах
    window.addToCart = addToCart;
    window.updateCartCount = updateCartDisplay;
});
renderCartItems