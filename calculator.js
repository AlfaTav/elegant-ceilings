// Калькулятор стоимости натяжного потолка
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, находимся ли мы на странице с калькулятором
    if (!document.getElementById('total-price')) {
        return; // Не на странице калькулятора
    }
    
    // Элементы калькулятора
    const roomTypeSelect = document.getElementById('room-type');
    const ceilingTypeSelect = document.getElementById('ceiling-type');
    const roomAreaSlider = document.getElementById('room-area');
    const areaValue = document.getElementById('area-value');
    const cornersSlider = document.getElementById('corners');
    const cornersValue = document.getElementById('corners-value');
    const lightingCheckbox = document.getElementById('lighting');
    const installationCheckbox = document.getElementById('installation');
    const materialCheckbox = document.getElementById('material');
    const warrantyCheckbox = document.getElementById('warranty');
    const promoCodeInput = document.getElementById('promo-code');
    const applyPromoButton = document.getElementById('apply-promo');
    const totalPriceElement = document.getElementById('total-price');
    const addToCartButton = document.getElementById('add-to-cart');
    const callMasterButton = document.getElementById('call-master');
    
    // Промокоды и скидки
    const promoCodeDiscounts = {
        'POTOLOK10': 10,   // 10% скидка
        'SUMMER2023': 15,  // 15% скидка
        'NEWCLIENT': 20,   // 20% скидка для новых клиентов
        '3ROOMS': 25       // 25% скидка при заказе в 3 комнаты
    };
    
    let currentPromoCode = null;
    let currentDiscount = 0;
    
    // Инициализация значений
    updateAreaValue();
    updateCornersValue();
    calculateTotal();
    
    // Слушатели событий
    if (roomTypeSelect) roomTypeSelect.addEventListener('change', calculateTotal);
    if (ceilingTypeSelect) ceilingTypeSelect.addEventListener('change', calculateTotal);
    if (roomAreaSlider) {
        roomAreaSlider.addEventListener('input', function() {
            updateAreaValue();
            calculateTotal();
        });
    }
    if (cornersSlider) {
        cornersSlider.addEventListener('input', function() {
            updateCornersValue();
            calculateTotal();
        });
    }
    
    if (lightingCheckbox) lightingCheckbox.addEventListener('change', calculateTotal);
    if (installationCheckbox) installationCheckbox.addEventListener('change', calculateTotal);
    if (materialCheckbox) materialCheckbox.addEventListener('change', calculateTotal);
    if (warrantyCheckbox) warrantyCheckbox.addEventListener('change', calculateTotal);
    
    if (applyPromoButton) applyPromoButton.addEventListener('click', applyPromoCode);
    if (promoCodeInput) {
        promoCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });
    }
    
    if (addToCartButton) addToCartButton.addEventListener('click', addToCartFromCalculator);
    if (callMasterButton) callMasterButton.addEventListener('click', callMaster);
    
    // Функции
    function updateAreaValue() {
        if (areaValue && roomAreaSlider) {
            areaValue.textContent = `${roomAreaSlider.value} м²`;
        }
    }
    
    function updateCornersValue() {
        if (cornersValue && cornersSlider) {
            const corners = parseInt(cornersSlider.value);
            let cornersText = `${corners} углов`;
            if (corners === 1) cornersText = `${corners} угол`;
            if (corners >= 2 && corners <= 4) cornersText = `${corners} угла`;
            cornersValue.textContent = cornersText;
        }
    }
    
    function applyPromoCode() {
        if (!promoCodeInput) return;
        
        const promoCode = promoCodeInput.value.trim().toUpperCase();
        
        if (!promoCode) {
            alert('Введите промокод');
            return;
        }
        
        if (promoCodeDiscounts[promoCode]) {
            currentPromoCode = promoCode;
            currentDiscount = promoCodeDiscounts[promoCode];
            alert(`Промокод "${promoCode}" применен! Скидка ${currentDiscount}%`);
            calculateTotal();
        } else {
            currentPromoCode = null;
            currentDiscount = 0;
            alert('Неверный промокод');
        }
        
        promoCodeInput.value = '';
    }
    
    function calculateTotal() {
        // Базовые расчеты
        const roomTypeMultiplier = roomTypeSelect ? parseFloat(roomTypeSelect.value) : 1;
        const ceilingTypePrice = ceilingTypeSelect ? parseFloat(ceilingTypeSelect.value) : 500;
        const area = roomAreaSlider ? parseFloat(roomAreaSlider.value) : 20;
        const corners = cornersSlider ? parseFloat(cornersSlider.value) : 4;
        
        // Базовая стоимость потолка
        let baseCost = ceilingTypePrice * area * roomTypeMultiplier;
        
        // Надбавка за сложные углы (больше 4 углов)
        if (corners > 4) {
            const extraCorners = corners - 4;
            baseCost += extraCorners * 300; // 300 руб за каждый дополнительный угол
        }
        
        // Дополнительные опции
        let optionsCost = 0;
        const options = [];
        
        if (lightingCheckbox && lightingCheckbox.checked) {
            optionsCost += parseInt(lightingCheckbox.value);
            options.push('Встроенное освещение');
        }
        if (installationCheckbox && installationCheckbox.checked) {
            optionsCost += parseInt(installationCheckbox.value);
            options.push('Срочный монтаж');
        }
        if (materialCheckbox && materialCheckbox.checked) {
            optionsCost += parseInt(materialCheckbox.value);
            options.push('Евро-материал');
        }
        if (warrantyCheckbox && warrantyCheckbox.checked) {
            optionsCost += parseInt(warrantyCheckbox.value);
            options.push('Расширенная гарантия');
        }
        
        // Сумма до скидки
        let total = baseCost + optionsCost;
        
        // Применение скидки по промокоду
        if (currentDiscount > 0) {
            total = total * (1 - currentDiscount / 100);
        }
        
        // Форматирование и вывод результата
        if (totalPriceElement) {
            totalPriceElement.textContent = formatCurrency(total);
        }
        
        // Возвращаем данные для добавления в корзину
        return {
            total: Math.round(total),
            baseCost: Math.round(baseCost),
            optionsCost: optionsCost,
            options: options,
            area: area,
            corners: corners,
            roomTypeMultiplier: roomTypeMultiplier,
            ceilingTypePrice: ceilingTypePrice
        };
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    function addToCartFromCalculator() {
        // Получаем данные из калькулятора
        const ceilingTypeText = ceilingTypeSelect ? ceilingTypeSelect.options[ceilingTypeSelect.selectedIndex].text : 'Матовый потолок';
        const calculationData = calculateTotal();
        
        // Создаем объект товара
        const product = {
            id: 'calc-' + Date.now(),
            name: `Натяжной потолок (${ceilingTypeText.split(' (')[0]})`,
            price: calculationData.total,
            area: calculationData.area,
            corners: calculationData.corners,
            options: calculationData.options,
            roomType: roomTypeSelect ? roomTypeSelect.options[roomTypeSelect.selectedIndex].text : 'Жилое помещение',
            isFromCalculator: true
        };
        
        // Добавляем в корзину
        if (typeof window.addToCart === 'function') {
            window.addToCart(product);
            
            // Обновляем счетчик корзины
            if (typeof window.updateCartCount === 'function') {
                window.updateCartCount();
            }
            
            // Показываем подтверждение
            showNotification(`Расчет добавлен в корзину! Сумма: ${formatCurrency(product.price)}`);
        } else {
            // Если функция addToCart не загружена, сохраняем в localStorage напрямую
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push({...product, quantity: 1});
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Обновляем счетчик корзины на странице
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                cartCountElement.textContent = totalItems;
            }
            
            showNotification(`Расчет добавлен в корзину! Сумма: ${formatCurrency(product.price)}`);
        }
    }
    
    function callMaster() {
        // Собираем данные из калькулятора
        const calculationData = calculateTotal();
        const ceilingTypeText = ceilingTypeSelect ? ceilingTypeSelect.options[ceilingTypeSelect.selectedIndex].text : 'Матовый потолок';
        
        // Формируем сообщение
        let message = `Заявка на вызов замерщика\n\n`;
        message += `Тип потолка: ${ceilingTypeText.split(' (')[0]}\n`;
        message += `Площадь: ${calculationData.area} м²\n`;
        message += `Предварительная стоимость: ${formatCurrency(calculationData.total)}\n`;
        
        if (calculationData.options.length > 0) {
            message += `Дополнительные опции: ${calculationData.options.join(', ')}\n`;
        }
        
        // В реальном проекте здесь будет отправка данных на сервер
        alert(message + '\n\nСпасибо за заявку! Наш специалист свяжется с вами в течение 15 минут для согласования времени замера.');
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
});
// Добавьте в calculator.js после существующих функций

// Расчет стоимости доставки
function calculateDeliveryCost() {
    // Эти значения должны браться из формы доставки
    // Для упрощения используем фиксированные значения
    const deliveryZone = document.getElementById('delivery-zone') ? 
        document.getElementById('delivery-zone').value : '0';
    const distance = document.getElementById('distance') ? 
        parseInt(document.getElementById('distance').value) : 0;
    const floor = document.getElementById('floor') ? 
        parseInt(document.getElementById('floor').value) : 1;
    
    let deliveryCost = 0;
    
    // Расчет по зонам
    if (deliveryZone === '30') {
        deliveryCost = distance * 30;
    } else {
        deliveryCost = parseInt(deliveryZone);
    }
    
    // Подъем на этаж (без лифта)
    if (floor > 1) {
        deliveryCost += (floor - 1) * 200;
    }
    
    // Дополнительные услуги
    const urgent = document.getElementById('urgent-delivery')?.checked ? 500 : 0;
    const evening = document.getElementById('evening-delivery')?.checked ? 300 : 0;
    const weekend = document.getElementById('weekend-delivery')?.checked ? 400 : 0;
    
    deliveryCost += urgent + evening + weekend;
    
    // Минимальная стоимость
    deliveryCost = Math.max(deliveryCost, 500);
    
    return deliveryCost;
}

// Обновленная функция добавления в корзину с учетом доставки
function addToCartFromCalculator() {
    // Получаем данные из калькулятора
    const ceilingTypeText = ceilingTypeSelect ? ceilingTypeSelect.options[ceilingTypeSelect.selectedIndex].text : 'Матовый потолок';
    const calculationData = calculateTotal();
    const deliveryCost = calculateDeliveryCost();
    
    // Создаем объект товара
    const product = {
        id: 'calc-' + Date.now(),
        name: `Натяжной потолок (${ceilingTypeText.split(' (')[0]})`,
        price: calculationData.total,
        area: calculationData.area,
        corners: calculationData.corners,
        options: calculationData.options,
        roomType: roomTypeSelect ? roomTypeSelect.options[roomTypeSelect.selectedIndex].text : 'Жилое помещение',
        delivery: deliveryCost,
        isFromCalculator: true
    };
    
    // Добавляем в корзину
    if (typeof window.addToCart === 'function') {
        window.addToCart(product);
        
        // Если есть стоимость доставки, добавляем ее отдельным товаром
        if (deliveryCost > 0) {
            const deliveryProduct = {
                id: 'delivery-' + Date.now(),
                name: 'Доставка материалов',
                price: deliveryCost,
                isDelivery: true
            };
            window.addToCart(deliveryProduct);
        }
        
        // Обновляем счетчик корзины
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
        
        // Показываем подтверждение
        const totalWithDelivery = calculationData.total + (deliveryCost > 0 ? deliveryCost : 0);
        showNotification(`Расчет добавлен в корзину! Сумма: ${formatCurrency(totalWithDelivery)}`);
    } else {
        // Если функция addToCart не загружена, сохраняем в localStorage напрямую
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push({...product, quantity: 1});
        
        if (deliveryCost > 0) {
            cart.push({
                id: 'delivery-' + Date.now(),
                name: 'Доставка материалов',
                price: deliveryCost,
                quantity: 1,
                isDelivery: true
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Обновляем счетчик корзины на странице
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
        
        const totalWithDelivery = calculationData.total + (deliveryCost > 0 ? deliveryCost : 0);
        showNotification(`Расчет добавлен в корзину! Сумма: ${formatCurrency(totalWithDelivery)}`);
    }
}