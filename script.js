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

const fandomItems = document.querySelectorAll('.fandom-item');
const footerText = document.getElementById('fandom-name');

fandomItems.forEach(item => {
    // При клике
    item.addEventListener('click', () => {
        fandomItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        // Тут вызывай свою функцию фильтрации товаров
    });

    // При наведении (меняем текст внизу окна)
    item.addEventListener('mouseenter', () => {
        footerText.innerText = `Category: ${item.getAttribute('title')}`;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('nav-toggle');
    const drawer = document.getElementById('nav-drawer');
    const fanIcons = document.querySelectorAll('.fan-icon');
    const sortBtns = document.querySelectorAll('.smart-sort');

    toggle.onclick = () => drawer.classList.toggle('open');

    function updateStore() {
        // 1. Находим АКТИВНУЮ в данный момент вкладку (Мерч или Авито)
        const activePane = document.querySelector('.tab-pane.active');
        if (!activePane) return;

        const container = activePane.querySelector('.pegboard');
        const items = Array.from(activePane.querySelectorAll('.merch-item'));
        
        // 2. Берем настройки из панели фильтров
        const activeFandom = document.querySelector('.fan-icon.active').dataset.fandom;
        const priceSort = document.querySelector('.smart-sort[data-type="price"]');
        const dateSort = document.querySelector('.smart-sort[data-type="date"]');

        // 3. Фильтруем ТОЛЬКО вещи внутри этой вкладки
        items.forEach(item => {
            const fandom = item.dataset.fandom;
            item.style.display = (activeFandom === 'all' || fandom === activeFandom) ? 'block' : 'none';
        });

        let visible = items.filter(i => i.style.display !== 'none');

        // 4. Сортировка
        if (priceSort.dataset.dir !== "0") {
            visible.sort((a, b) => {
                const p1 = parseFloat(a.dataset.price) || 0;
                const p2 = parseFloat(b.dataset.price) || 0;
                return priceSort.dataset.dir === "1" ? p1 - p2 : p2 - p1;
            });
        } else if (dateSort.dataset.dir !== "0") {
            visible.sort((a, b) => {
                let d1 = new Date(a.dataset.date || 0);
                let d2 = new Date(b.dataset.date || 0);
                return dateSort.dataset.dir === "1" ? d1 - d2 : d2 - d1;
            });
        }

        // Перерисовываем
        visible.forEach(item => container.appendChild(item));
    }

    // Клик по фандомам
    fanIcons.forEach(icon => {
        icon.onclick = () => {
            fanIcons.forEach(i => i.classList.remove('active'));
            icon.classList.add('active');
            updateStore();
        };
    });

    // Умный клик по кнопкам сортировки
    sortBtns.forEach(btn => {
        btn.onclick = () => {
            let current = parseInt(btn.dataset.dir);
            let next = (current + 1) % 3;
            sortBtns.forEach(b => { 
                if(b !== btn) {
                    b.dataset.dir = "0"; 
                    b.querySelector('.sort-arrow').innerText = "↕"; 
                }
            });
            btn.dataset.dir = next;
            const arrows = ["↕", "↑", "↓"];
            btn.querySelector('.sort-arrow').innerText = arrows[next];
            updateStore();
        };
    });

    // Вызываем при переключении вкладок (добавь это в свой код переключения вкладок!)
    // Если у тебя есть функция переключения вкладок, просто добавь в её конец updateStore();
    
    updateStore(); // Запуск при загрузке
});
