document.addEventListener('DOMContentLoaded', () => {
    // 1. КУРСОР
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.opacity = '1';
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    // 2. РАНДОМ ДЛЯ МЕРЧА (СКОТЧ И УМНЫЙ НАКЛОН)
    function setupMerchEffects() {
        // Рандом скотча (из 16 вариантов)
        const tapes = document.querySelectorAll('.item-tape');
        tapes.forEach(tape => {
            if (![...tape.classList].some(cls => cls.startsWith('tape-'))) {
                const randomNum = Math.floor(Math.random() * 16) + 1;
                tape.classList.add(`tape-${randomNum}`);
            }
        });

        // НАКЛОН С ПОДДЕРЖКОЙ CSS ПЕРЕМЕННЫХ
        const items = document.querySelectorAll('.merch-item');
        items.forEach(item => {
            // Генерируем угол от -7 до 7
            const randomRotate = (Math.random() * 14 - 7).toFixed(1); 
            
            // Сохраняем угол в переменную --tilt, чтобы CSS её видел
            item.style.setProperty('--tilt', `${randomRotate}deg`);
            
            // Применяем вращение через переменную
            item.style.transform = `rotate(var(--tilt))`;
        });
    }

    setupMerchEffects();

    // 3. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
    const tabs = document.querySelectorAll('.nav-side-item');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            const target = this.getAttribute('href');
            if (target.startsWith('http')) return;
            e.preventDefault();

            tabs.forEach(t => t.classList.remove('active-tab'));
            panes.forEach(p => p.classList.remove('active'));

            this.classList.add('active-tab');

            const activePane = document.querySelector(target + '-tab');
            if (activePane) {
                activePane.style.opacity = '0';
                activePane.classList.add('active');

                // Пересчитываем для новой вкладки
                setupMerchEffects();

                setTimeout(() => {
                    activePane.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                    activePane.style.opacity = '1';
                    activePane.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    });
});
