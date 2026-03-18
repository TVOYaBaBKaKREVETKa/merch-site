document.addEventListener('DOMContentLoaded', () => {
    // 1. КУРСОР (Твой стандартный)
    const cursor = document.getElementById('custom-cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.opacity = '1';
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // 2. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
    const tabs = document.querySelectorAll('.nav-side-item');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            const target = this.getAttribute('href');

            // Если это внешняя ссылка (ТГ), не переключаем вкладки
            if (target.startsWith('http')) return;

            e.preventDefault();

            // Убираем активный класс у всех кнопок и панелей
            tabs.forEach(t => t.classList.remove('active-tab'));
            panes.forEach(p => p.classList.remove('active'));

            // Добавляем активный класс нажатой кнопке
            this.classList.add('active-tab');

            // Показываем нужную панель (добавляем -tab к ID из ссылки)
                     // Показываем нужную панель
            const activePane = document.querySelector(target + '-tab');
            if (activePane) {
                // Сначала делаем панель невидимой
                activePane.style.opacity = '0';
                activePane.classList.add('active');

                // Через микро-паузу включаем анимацию появления
                setTimeout(() => {
                    activePane.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                    activePane.style.opacity = '1';
                    activePane.style.transform = 'translateY(0)';
                }, 10);
            }

        });
    });
});
