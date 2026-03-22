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
        const tapes = document.querySelectorAll('.item-tape');
        tapes.forEach(tape => {
            if (![...tape.classList].some(cls => cls.startsWith('tape-'))) {
                const randomNum = Math.floor(Math.random() * 16) + 1;
                tape.classList.add(`tape-${randomNum}`);
            }
        });

        const items = document.querySelectorAll('.merch-item');
        items.forEach(item => {
            const randomRotate = (Math.random() * 14 - 7).toFixed(1); 
            item.style.setProperty('--tilt', `${randomRotate}deg`);
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

                setupMerchEffects();

                setTimeout(() => {
                    activePane.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                    activePane.style.opacity = '1';
                    activePane.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    });

    // 4. ЛОГИКА МОДАЛЬНОГО ОКНА (ИСПРАВЛЕНО ДЛЯ АВИТО)
    const modal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const closeBtn = document.querySelector('.modal-close-trigger');

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.merch-item');
        
        // Проверяем, что кликнули по карточке и НЕ по кнопке покупки
        if (card && !e.target.classList.contains('buy-btn')) {
            const title = card.querySelector('.item-name').innerText;
            const imgTag = card.querySelector('.item-img img');
            const imgContainer = card.querySelector('.item-img');

            // Безопасно подставляем заголовок
            modalTitle.innerText = title;

            // Проверяем: есть ли внутри тег img и есть ли у него путь
            if (imgTag && imgTag.getAttribute('src') !== "") {
                modalImg.src = imgTag.src;
                modalImg.style.display = 'block'; // Показываем картинку
                // Если в модалке был текст-заглушка для эмодзи, тут его можно скрыть
            } else {
                // Если картинки нет (как в Авито-заглушках), 
                // можем либо скрыть картинку в модалке, либо оставить пустое место
                modalImg.src = ""; 
                modalImg.style.display = 'none'; 
                // Можно добавить логику, чтобы в модалке рисовался эмодзи из контейнера,
                // но когда ты вставишь реальные фото в Авито, всё заработает само через блок выше.
            }
            
            if (modal) modal.style.display = 'flex';
        }
    });

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (modal && e.target === modal) modal.style.display = 'none'; };
});
